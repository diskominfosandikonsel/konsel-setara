const express = require('express');
const router = express.Router();
const https = require('https');

const INAPROC_HOST = 'data.inaproc.id';
const INSTANSI_KONSEL = process.env.INAPROC_INSTANSI || 'D438';
const JENIS_KLPD = process.env.INAPROC_JENIS_KLPD || '4'; // Kabupaten

/**
 * Fetch data langsung dari web data.inaproc.id (Dashboard API internal Next.js)
 * Tanpa memerlukan API Gateway Key atau akun terdaftar.
 */
function fetchInaprocWeb(endpoint, queryParams) {
  return new Promise((resolve, reject) => {
    const now = Date.now().toString();
    const secret = Buffer.from(now.split('').reverse().join('')).toString('base64');
    const qs = new URLSearchParams(queryParams).toString();

    const options = {
      hostname: INAPROC_HOST,
      path: `/dashboard-api/rup/${endpoint}?${qs}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'x-request-time': now,
        'x-secret': secret,
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://data.inaproc.id/rup',
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, error: err.message, raw: data.substring(0, 200) });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout ke data.inaproc.id')); });
    req.end();
  });
}

/**
 * GET /api/v1/rup/summary
 * Ringkasan jumlah paket RUP dan total pagu anggaran Konawe Selatan
 */
router.get('/summary', async (req, res) => {
  try {
    const tahun = req.query.tahun || new Date().getFullYear().toString();
    const result = await fetchInaprocWeb('summary', {
      tahun,
      jenis_klpd: JENIS_KLPD,
      instansi: INSTANSI_KONSEL,
    });

    if (result.status === 200 && result.data?.summary) {
      return res.json({
        success: true,
        source: 'inaproc-live',
        tahun,
        summary: result.data.summary,
      });
    }

    return res.status(result.status || 500).json({
      success: false,
      error: 'Gagal mengambil ringkasan RUP dari web INAPROC',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/rup/paket-penyedia
 * Daftar paket RUP Konawe Selatan diambil langsung dari web data.inaproc.id
 */
router.get('/paket-penyedia', async (req, res) => {
  try {
    const tahun = req.query.tahun || new Date().getFullYear().toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const cara = req.query.cara || '';       // 'Penyedia' | 'Swakelola' | ''
    const metode = req.query.metode || '';   // 'Tender' | 'Pengadaan Langsung' | ...
    const jenis = req.query.jenis || '';     // 'Barang' | 'Pekerjaan Konstruksi' | ...
    const search = req.query.search || req.query.q || '';

    const queryParams = {
      tahun,
      jenis_klpd: JENIS_KLPD,
      instansi: INSTANSI_KONSEL,
      page: String(page),
      limit: String(limit),
    };

    // sumber = cara pengadaan (Penyedia / Swakelola)
    if (cara && cara !== 'Semua') {
      queryParams.sumber = cara;
    }

    // filter_metode hanya berlaku untuk Penyedia
    if (metode && metode !== 'Semua' && cara !== 'Swakelola') {
      queryParams.filter_metode = metode;
    }

    // filter jenis pengadaan
    if (jenis && jenis !== 'Semua') {
      queryParams.filter_jenis = jenis;
    }

    if (search) {
      queryParams.search_paket = search;
    }

    const result = await fetchInaprocWeb('table', queryParams);

    if (result.status === 200 && result.data && Array.isArray(result.data.tableRows)) {
      const rows = result.data.tableRows;
      const total = result.data.tableTotalRows || rows.length;

      return res.json({
        success: true,
        source: 'inaproc-live',
        tahun,
        total,
        page,
        limit,
        pagination: result.data.tablePagination || null,
        data: rows.map((item, idx) => ({
          id: item.kode_rup || `${page}-${idx + 1}`,
          kode_rup: item.kode_rup || '',
          nama_paket: item.nama_paket || '',
          opd: item.nama_satker || item.nama_instansi || '',
          metode: item.metode_pengadaan || item.cara_pengadaan_label || '',
          pagu: parseFloat(item.total_nilai || 0),
          sumber_dana: item.sumber_dana || 'APBD',
          tahun: String(item.tahun_anggaran || tahun),
          jenis: item.jenis_pengadaan || '',
          cara_pengadaan: item.cara_pengadaan || '',
          pdn: item.produk_dalam_negeri || 'Ya',
          status: 'Aktif',
        })),
      });
    }

    return res.status(result.status || 502).json({
      success: false,
      statusCode: result.status,
      error: result.error || 'Respon tidak valid dari data.inaproc.id',
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      error: err.message,
      message: 'Gagal mengambil data dari web inaproc',
    });
  }
});

/**
 * GET /api/v1/rup/ping
 * Pengecekan status koneksi live ke web data.inaproc.id
 */
router.get('/ping', async (req, res) => {
  try {
    const tahun = new Date().getFullYear().toString();
    const result = await fetchInaprocWeb('summary', {
      tahun,
      jenis_klpd: JENIS_KLPD,
      instansi: INSTANSI_KONSEL,
    });

    const isConnected = result.status === 200 && !!result.data?.summary;
    return res.json({
      connected: isConnected,
      source: 'web-inaproc-direct',
      statusCode: result.status,
      total_rup: result.data?.summary?.jumlah_rup || 0,
      total_pagu: result.data?.summary?.total_pagu || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.json({
      connected: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
