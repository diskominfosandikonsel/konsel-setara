const express = require('express');
const router = express.Router();
const db = require('../db/MySql/utama');
const rupSyncService = require('../services/rupSyncService');
const middleware = require('../auth/middlewares');
const { requirePermission } = require('../auth/accessControl');

const INAPROC_HOST = 'data.inaproc.id';
const INSTANSI_KONSEL = 'D438';
const JENIS_KLPD = '4'; // Kabupaten

// ═════════════════════════════════════════════════════════════════
// ENDPOINT ADMIN / SINKRONISASI & CRONJOB
// ═════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/rup/sync/config
 * Mengambil konfigurasi cronjob & status sinkronisasi saat ini
 */
router.get('/sync/config', middleware.isLoggedIn, requirePermission('rup', 'read'), async (req, res) => {
  try {
    const config = await rupSyncService.getConfig();
    return res.json({
      success: true,
      data: config,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/rup/sync/config
 * Mengubah status on/off cronjob dan waktu sinkronisasi manual/cron expression
 * Body: { is_active: boolean, schedule_time: '02:00', cron_expression?: string, sync_year?: string }
 */
router.post('/sync/config', middleware.isLoggedIn, requirePermission('rup', 'update'), async (req, res) => {
  try {
    const { is_active, schedule_time, cron_expression, sync_year, frequency_type, frequency_value } = req.body;
    const updated = await rupSyncService.updateConfig({
      is_active,
      schedule_time,
      cron_expression,
      sync_year,
      frequency_type,
      frequency_value,
    });
    return res.json({
      success: true,
      message: 'Konfigurasi penjadwalan sinkronisasi RUP berhasil disimpan.',
      data: updated,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/rup/sync/trigger
 * Memicu sinkronisasi data RUP dari web INAPROC ke database secara manual
 * Body: { tahun?: string }
 */
router.post('/sync/trigger', middleware.isLoggedIn, requirePermission('rup', 'update'), async (req, res) => {
  try {
    if (rupSyncService.isCurrentlySyncing()) {
      return res.status(409).json({
        success: false,
        message: 'Proses sinkronisasi sedang berlangsung. Harap tunggu proses selesai.',
      });
    }

    const tahun = req.body?.tahun || new Date().getFullYear().toString();

    // Jalankan secara asynchronous di background
    rupSyncService.runSync({ tahun, triggeredBy: 'manual_admin' })
      .then((result) => {
        console.log('[RUP MANUAL SYNC SUCCESS]', result.message);
      })
      .catch((err) => {
        console.error('[RUP MANUAL SYNC ERROR]', err.message);
      });

    return res.json({
      success: true,
      message: `Proses sinkronisasi RUP untuk tahun anggaran ${tahun} telah dimulai di background.`,
      status: 'running',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/rup/sync/logs
 * Mengambil riwayat log sinkronisasi
 */
router.get('/sync/logs', middleware.isLoggedIn, requirePermission('rup', 'read'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const logs = await rupSyncService.getLogs(limit);
    return res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═════════════════════════════════════════════════════════════════
// ENDPOINT PUBLIK / DATA RUP (MEMBACA DARI DATABASE DENGAN FALLBACK)
// ═════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/rup/summary
 * Ringkasan jumlah paket RUP dan total pagu anggaran Konawe Selatan
 */
router.get('/summary', async (req, res) => {
  try {
    const tahun = req.query.tahun || new Date().getFullYear().toString();

    // Cek apakah ada data di database lokal
    const [dbRows] = await db.promise().query(`
      SELECT 
        COUNT(*) as jumlah_rup,
        COALESCE(SUM(pagu), 0) as total_pagu
      FROM rup_paket 
      WHERE tahun = ?
    `, [tahun]);

    if (dbRows.length > 0 && dbRows[0].jumlah_rup > 0) {
      return res.json({
        success: true,
        source: 'database-local',
        tahun,
        summary: {
          jumlah_rup: parseInt(dbRows[0].jumlah_rup, 10),
          total_pagu: parseFloat(dbRows[0].total_pagu),
        },
      });
    }

    // Fallback: Jika data belum ada di database, ambil live dari INAPROC
    const result = await rupSyncService.fetchInaprocWeb('summary', {
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
      error: 'Gagal mengambil ringkasan RUP',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/rup/paket-penyedia
 * Daftar paket RUP Konawe Selatan
 */
router.get('/paket-penyedia', async (req, res) => {
  try {
    const tahun = req.query.tahun || new Date().getFullYear().toString();
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const cara = req.query.cara || '';       // 'Penyedia' | 'Swakelola' | ''
    const metode = req.query.metode || '';   // 'Tender' | 'Pengadaan Langsung' | ...
    const jenis = req.query.jenis || '';     // 'Barang' | 'Pekerjaan Konstruksi' | ...
    const search = req.query.search || req.query.q || '';
    const satker = req.query.satker || '';

    // Cek apakah ada data di database untuk tahun ini
    const [countCheck] = await db.promise().query(
      'SELECT COUNT(*) as cnt FROM rup_paket WHERE tahun = ?',
      [tahun]
    );

    if (countCheck[0].cnt > 0) {
      // Query dari Database Lokal dengan Relasi rup_satker
      let whereClauses = ['p.tahun = ?'];
      let params = [tahun];

      if (cara && cara !== 'Semua') {
        whereClauses.push('p.cara_pengadaan = ?');
        params.push(cara);
      }

      if (metode && metode !== 'Semua' && cara !== 'Swakelola') {
        whereClauses.push('p.metode = ?');
        params.push(metode);
      }

      if (jenis && jenis !== 'Semua') {
        whereClauses.push('p.jenis = ?');
        params.push(jenis);
      }

      if (satker && satker !== 'Semua' && satker !== 'Semua OPD') {
        // Filter via kode_satker atau pencarian nama OPD
        whereClauses.push('(p.kode_satker = ? OR s.nama LIKE ?)');
        params.push(satker, `%${satker}%`);
      }

      if (search) {
        whereClauses.push('(p.kode_rup LIKE ? OR p.nama_paket LIKE ? OR s.nama LIKE ?)');
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Hitung total matching
      const [totalCountRows] = await db.promise().query(
        `SELECT COUNT(*) as total 
         FROM rup_paket p
         LEFT JOIN rup_satker s ON p.kode_satker = s.kode
         ${whereSql}`,
        params
      );
      const total = totalCountRows[0].total;

      // Ambil data halaman ini beserta nama OPD dari relasi rup_satker
      const [rows] = await db.promise().query(
        `SELECT 
           p.*, 
           COALESCE(s.nama, '') as nama_satker, 
           COALESCE(s.nama, '') as opd
         FROM rup_paket p
         LEFT JOIN rup_satker s ON p.kode_satker = s.kode
         ${whereSql}
         ORDER BY p.pagu DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return res.json({
        success: true,
        source: 'database-local',
        tahun,
        total,
        page,
        limit,
        pagination: {
          current_page: page,
          total_page: Math.ceil(total / limit) || 1,
          limit,
          total,
        },
        data: rows.map((item, idx) => ({
          id: item.kode_rup || `${page}-${idx + 1}`,
          kode_rup: item.kode_rup || '',
          nama_paket: item.nama_paket || '',
          kode_satker: item.kode_satker || '',
          opd: item.opd || item.nama_satker || '',
          metode: item.metode || item.cara_pengadaan || '',
          pagu: parseFloat(item.pagu || 0),
          sumber_dana: item.sumber_dana || 'APBD',
          tahun: String(item.tahun || tahun),
          jenis: item.jenis || '',
          cara_pengadaan: item.cara_pengadaan || '',
          pdn: item.pdn || 'Ya',
          status: item.status || 'Aktif',
        })),
      });
    }

    // Fallback ke INAPROC live jika database lokal belum memiliki data
    const queryParams = {
      tahun,
      jenis_klpd: JENIS_KLPD,
      instansi: INSTANSI_KONSEL,
      page: String(page),
      limit: String(limit),
    };

    if (cara && cara !== 'Semua') queryParams.sumber = cara;
    if (metode && metode !== 'Semua' && cara !== 'Swakelola') queryParams.filter_metode = metode;
    if (jenis && jenis !== 'Semua') queryParams.filter_jenis = jenis;
    if (satker && satker !== 'Semua' && satker !== 'Semua OPD') queryParams.satker = satker;

    const querySearch = search ? String(search).trim() : '';
    if (querySearch) {
      if (/^\d+$/.test(querySearch)) queryParams.search_rup = querySearch;
      else queryParams.search_paket = querySearch;
    }

    const result = await rupSyncService.fetchInaprocWeb('table', queryParams);

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
      message: 'Gagal mengambil data RUP',
    });
  }
});

/**
 * GET /api/v1/rup/satker
 * Ambil daftar lengkap unit kerja / Satker resmi Konawe Selatan
 */
router.get('/satker', async (req, res) => {
  try {
    const tahun = req.query.tahun || new Date().getFullYear().toString();

    // Cek di database lokal dulu (Master Satker independen)
    const [dbSatkers] = await db.promise().query(
      'SELECT kode, nama, kode as kd_satker, nama as nama_satker FROM rup_satker ORDER BY nama ASC'
    );

    if (dbSatkers.length > 0) {
      return res.json({
        success: true,
        source: 'database-local',
        tahun,
        items: dbSatkers,
      });
    }

    // Fallback ke web INAPROC
    const result = await rupSyncService.fetchInaprocWeb('/profil-pengadaan/satker', {
      tahun,
      jenis: JENIS_KLPD,
      instansi: INSTANSI_KONSEL,
    });

    if (result.status === 200 && Array.isArray(result.data?.items)) {
      return res.json({
        success: true,
        source: 'inaproc-live',
        tahun,
        items: result.data.items,
      });
    }

    return res.status(result.status || 500).json({
      success: false,
      error: 'Gagal mengambil data Satker',
      items: [],
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, items: [] });
  }
});

/**
 * GET /api/v1/rup/ping
 * Pengecekan status koneksi live ke web data.inaproc.id
 */
router.get('/ping', async (req, res) => {
  try {
    const tahun = new Date().getFullYear().toString();
    const result = await rupSyncService.fetchInaprocWeb('summary', {
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
