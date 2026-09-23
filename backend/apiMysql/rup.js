const express = require('express');
const router = express.Router();
const https = require('https');

const INAPROC_BASE_URL = process.env.INAPROC_BASE_URL || 'data.inaproc.id';
const INAPROC_API_KEY = process.env.INAPROC_API_KEY || 'inprc4862802c8c3848cc865ec5158e523dd5';
const INSTANSI_KONSEL = process.env.INAPROC_INSTANSI || 'D438';
const JENIS_KLPD = process.env.INAPROC_JENIS_KLPD || '4'; // Kabupaten

/**
 * Membuat HTTP request ke inaproc API
 */
function inaprocRequest(path, queryParams) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams(queryParams).toString();
    const fullPath = `/api/legacy/rup/${path}?${params}`;

    const options = {
      hostname: INAPROC_BASE_URL,
      path: fullPath,
      method: 'GET',
      headers: {
        'Authorization': `Key ${INAPROC_API_KEY}`,
        'Accept': 'application/json',
        'User-Agent': 'KonselSetara/1.0',
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
        } catch {
          resolve({ status: res.statusCode, data: null, raw: data.substring(0, 200) });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.end();
  });
}

/**
 * GET /api/v1/rup/paket-penyedia
 * Daftar paket penyedia RUP Konawe Selatan
 */
router.get('/paket-penyedia', async (req, res) => {
  try {
    const tahun = req.query.tahun || new Date().getFullYear().toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await inaprocRequest('paket-penyedia-lokasi', {
      kd_klpd: INSTANSI_KONSEL,
      jenis_klpd: JENIS_KLPD,
      tahun: tahun,
    });

    if (result.status === 200 && result.data) {
      const allData = Array.isArray(result.data) ? result.data : (result.data.data || result.data.records || []);
      const total = allData.length;
      const start = (page - 1) * limit;
      const paged = allData.slice(start, start + limit);

      return res.json({
        success: true,
        source: 'inaproc',
        tahun,
        total,
        page,
        limit,
        data: paged.map(item => ({
          kode_rup: item.kode_rup || item.kodeRup || '',
          nama_paket: item.nama_paket || item.namaPaket || '',
          opd: item.nama_satker || item.satker || item.nama_klpd || '',
          metode: item.metode_pemilihan || item.metodePemilihan || item.cara_pengadaan || '',
          pagu: parseFloat(item.pagu || item.nilai_pagu || 0),
          sumber_dana: item.sumber_dana || item.sumberDana || 'APBD',
          tahun: item.tahun_anggaran || item.tahun || tahun,
          jenis: item.jenis_pengadaan || item.jenisPengadaan || '',
          status: item.status_aktif || 'Aktif',
        }))
      });
    } else {
      // API inaproc tidak tersedia, kembalikan status untuk fallback
      return res.status(result.status || 503).json({
        success: false,
        source: 'inaproc',
        statusCode: result.status,
        error: result.data?.error || 'API inaproc tidak tersedia',
        message: 'Menggunakan data lokal sebagai fallback'
      });
    }
  } catch (err) {
    return res.status(503).json({
      success: false,
      error: err.message,
      message: 'Gagal menghubungi API inaproc'
    });
  }
});

/**
 * GET /api/v1/rup/paket-swakelola
 * Daftar paket swakelola RUP Konawe Selatan
 */
router.get('/paket-swakelola', async (req, res) => {
  try {
    const tahun = req.query.tahun || new Date().getFullYear().toString();

    const result = await inaprocRequest('paket-swakelola-lokasi', {
      kd_klpd: INSTANSI_KONSEL,
      jenis_klpd: JENIS_KLPD,
      tahun: tahun,
    });

    if (result.status === 200 && result.data) {
      const allData = Array.isArray(result.data) ? result.data : (result.data.data || []);
      return res.json({
        success: true,
        source: 'inaproc',
        tahun,
        total: allData.length,
        data: allData.map(item => ({
          kode_rup: item.kode_rup || '',
          nama_paket: item.nama_paket || '',
          opd: item.nama_satker || item.satker || '',
          metode: 'Swakelola',
          pagu: parseFloat(item.pagu || 0),
          sumber_dana: item.sumber_dana || 'APBD',
          tahun: item.tahun_anggaran || tahun,
        }))
      });
    } else {
      return res.status(result.status || 503).json({
        success: false,
        error: result.data?.error || 'API inaproc tidak tersedia',
      });
    }
  } catch (err) {
    return res.status(503).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/rup/struktur-anggaran
 * Rekapitulasi struktur anggaran per OPD
 */
router.get('/struktur-anggaran', async (req, res) => {
  try {
    const tahun = req.query.tahun || new Date().getFullYear().toString();

    const result = await inaprocRequest('struktur-anggaran-pd', {
      kd_klpd: INSTANSI_KONSEL,
      jenis_klpd: JENIS_KLPD,
      tahun: tahun,
    });

    if (result.status === 200 && result.data) {
      return res.json({
        success: true,
        source: 'inaproc',
        tahun,
        data: result.data
      });
    } else {
      return res.status(result.status || 503).json({
        success: false,
        error: result.data?.error || 'API tidak tersedia'
      });
    }
  } catch (err) {
    return res.status(503).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/rup/ping
 * Pengecekan status koneksi ke API inaproc
 */
router.get('/ping', async (req, res) => {
  try {
    const tahun = new Date().getFullYear().toString();
    const result = await inaprocRequest('struktur-anggaran-pd', {
      kd_klpd: INSTANSI_KONSEL,
      tahun,
    });
    return res.json({
      connected: result.status === 200,
      statusCode: result.status,
      message: result.status === 200 ? 'API inaproc OK' : (result.data?.error || 'Error'),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.json({ connected: false, error: err.message, timestamp: new Date().toISOString() });
  }
});

module.exports = router;
