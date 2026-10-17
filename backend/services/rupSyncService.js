const https = require('https');
const cron = require('node-cron');
const db = require('../db/MySql/utama');

const INAPROC_HOST = 'data.inaproc.id';
const INSTANSI_KONSEL = process.env.INAPROC_INSTANSI || 'D438';
const JENIS_KLPD = process.env.INAPROC_JENIS_KLPD || '4'; // Kabupaten

let activeCronTask = null;
let isSyncing = false;

/**
 * Helper request ke web data.inaproc.id dengan dynamic signature headers
 */
function fetchInaprocWeb(endpoint, queryParams) {
  return new Promise((resolve, reject) => {
    const now = Date.now().toString();
    const secret = Buffer.from(now.split('').reverse().join('')).toString('base64');
    const qs = new URLSearchParams(queryParams).toString();
    const apiPath = endpoint.startsWith('/')
      ? `/dashboard-api${endpoint}`
      : `/dashboard-api/rup/${endpoint}`;

    const options = {
      hostname: INAPROC_HOST,
      path: `${apiPath}?${qs}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'x-request-time': now,
        'x-secret': secret,
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://data.inaproc.id/rup',
      },
      timeout: 30000,
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
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout ke data.inaproc.id'));
    });
    req.end();
  });
}

/**
 * Membangun ekspresi cron berdasarkan tipe frekuensi:
 * - 'daily': Setiap hari jam HH:mm
 * - 'interval_days': Setiap N hari sekali jam HH:mm (misal tiap 2 hari, tiap 3 hari, tiap 5 hari)
 * - 'weekly': Setiap minggu pada hari tertentu (0=Minggu, 1=Senin, 5=Jumat, dst.) jam HH:mm
 * - 'monthly': Setiap bulan pada tanggal tertentu (1 s/d 28) jam HH:mm
 * - 'custom': Memakai cron_expression kustom
 */
function buildCronExpression({ frequency_type = 'daily', schedule_time = '02:00', frequency_value = 1, cron_expression }) {
  if (frequency_type === 'custom' && cron_expression) {
    return cron_expression.trim();
  }

  const parts = (schedule_time || '02:00').trim().split(':');
  let hour = 2;
  let minute = 0;
  if (parts.length === 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && h >= 0 && h <= 23) hour = h;
    if (!isNaN(m) && m >= 0 && m <= 59) minute = m;
  }

  switch (frequency_type) {
    case 'interval_days': {
      const days = Math.max(1, parseInt(frequency_value, 10) || 2);
      return `${minute} ${hour} */${days} * *`;
    }
    case 'weekly': {
      const dow = parseInt(frequency_value, 10);
      const safeDow = (!isNaN(dow) && dow >= 0 && dow <= 6) ? dow : 1; // Default 1 = Senin
      return `${minute} ${hour} * * ${safeDow}`;
    }
    case 'monthly': {
      const dom = parseInt(frequency_value, 10);
      const safeDom = (!isNaN(dom) && dom >= 1 && dom <= 28) ? dom : 1; // Default 1 = Tgl 1
      return `${minute} ${hour} ${safeDom} * *`;
    }
    case 'daily':
    default:
      return `${minute} ${hour} * * *`;
  }
}

function timeToCron(timeStr) {
  return buildCronExpression({ frequency_type: 'daily', schedule_time: timeStr });
}

/**
 * Membersihkan nama satker/dinas agar tidak mengandung kode satker lagi
 * Contoh: "DINAS PENDIDIKAN DAN KEBUDAYAAN - 1.01.2.22.0.00.01.0000"
 * Menjadi: "DINAS PENDIDIKAN DAN KEBUDAYAAN"
 */
function cleanSatkerName(rawName, kode) {
  if (!rawName) return '';
  let cleaned = String(rawName).trim();
  if (kode) {
    const escaped = String(kode).trim().replace(/\./g, '\\.');
    cleaned = cleaned.replace(new RegExp(`\\s*-\\s*${escaped}$`, 'i'), '');
  }
  // Fallback pembersihan format "- [angka.angka]" di akhir nama
  cleaned = cleaned.replace(/\s*-\s*[0-9\.]+$/, '');
  return cleaned.trim();
}

/**
 * Ekstrak kode satker dari raw data paket INAPROC
 */
function extractSatkerCode(rawNamaSatker, rawKdSatker) {
  if (rawKdSatker && String(rawKdSatker).trim()) {
    return String(rawKdSatker).trim();
  }
  if (!rawNamaSatker) return '';
  const match = String(rawNamaSatker).match(/\s*-\s*([0-9\.]+)$/);
  return match ? match[1].trim() : '';
}

/**
 * Sinkronisasi data Satker/OPD
 */
async function syncSatker(tahun) {
  console.log(`[RUP SYNC] Menarik daftar satker untuk tahun ${tahun}...`);
  const result = await fetchInaprocWeb('/profil-pengadaan/satker', {
    tahun,
    jenis: JENIS_KLPD,
    instansi: INSTANSI_KONSEL,
  });

  if (result.status !== 200 || !Array.isArray(result.data?.items)) {
    throw new Error('Gagal mengambil data Satker dari INAPROC: ' + (result.error || `HTTP ${result.status}`));
  }

  const satkers = result.data.items;
  if (satkers.length === 0) return 0;

  const values = satkers.map((s) => {
    const kode = String(s.kode || s.kd_satker || '').trim();
    const rawNama = String(s.nama || s.nama_satker || '').trim();
    const namaBersih = cleanSatkerName(rawNama, kode);
    return [kode, namaBersih];
  }).filter((s) => s[0] && s[1]);

  if (values.length === 0) return 0;

  const sql = `
    INSERT INTO rup_satker (kode, nama)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      nama = VALUES(nama),
      updated_at = NOW()
  `;

  await db.promise().query(sql, [values]);
  console.log(`[RUP SYNC] Sukses menyimpan ${values.length} satker master (nama bersih tanpa kode).`);
  return values.length;
}

/**
 * Sinkronisasi seluruh paket RUP per batch 100 paket
 */
async function syncPaket(tahun, onProgress) {
  console.log(`[RUP SYNC] Memulai penarikan paket RUP tahun ${tahun}...`);
  const limit = 100;
  let page = 1;
  let totalRows = 0;
  let totalPagu = 0;
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const queryParams = {
      tahun: String(tahun),
      jenis_klpd: JENIS_KLPD,
      instansi: INSTANSI_KONSEL,
      limit: String(limit),
    };

    if (cursor) {
      queryParams.cursor = cursor;
    }

    const res = await fetchInaprocWeb('table', queryParams);
    if (res.status !== 200 || !res.data || !Array.isArray(res.data.tableRows)) {
      throw new Error(`Gagal fetch page ${page}: ${res.error || `HTTP ${res.status}`}`);
    }

    const rows = res.data.tableRows;
    const reportedTotal = res.data.tableTotalRows || 0;

    if (rows.length === 0) {
      hasMore = false;
      break;
    }

    const values = rows.map((r) => {
      const kodeSatker = extractSatkerCode(r.nama_satker || r.nama_instansi, r.kd_satker || r.kode_satker);
      return [
        String(r.kode_rup || '').trim(),
        String(r.nama_paket || '').trim(),
        kodeSatker,
        String(r.metode_pengadaan || r.cara_pengadaan_label || '').trim(),
        String(r.cara_pengadaan || '').trim(),
        String(r.jenis_pengadaan || '').trim(),
        parseFloat(r.total_nilai || 0) || 0,
        String(r.sumber_dana || 'APBD').trim(),
        String(r.tahun_anggaran || tahun).trim(),
        String(r.produk_dalam_negeri || 'Ya').trim(),
        'Aktif',
      ];
    }).filter((r) => r[0]); // Harus ada kode_rup

    if (values.length > 0) {
      const sql = `
        INSERT INTO rup_paket (
          kode_rup, nama_paket, kode_satker,
          metode, cara_pengadaan, jenis, pagu,
          sumber_dana, tahun, pdn, status
        )
        VALUES ?
        ON DUPLICATE KEY UPDATE
          nama_paket = VALUES(nama_paket),
          kode_satker = VALUES(kode_satker),
          metode = VALUES(metode),
          cara_pengadaan = VALUES(cara_pengadaan),
          jenis = VALUES(jenis),
          pagu = VALUES(pagu),
          sumber_dana = VALUES(sumber_dana),
          tahun = VALUES(tahun),
          pdn = VALUES(pdn),
          status = VALUES(status),
          updated_at = NOW()
      `;

      await db.promise().query(sql, [values]);

      for (const v of values) {
        totalPagu += v[6]; // Index pagu adalah 6
      }
      totalRows += values.length;
    }


    if (typeof onProgress === 'function') {
      onProgress({ page, currentCount: totalRows, totalExpected: reportedTotal });
    }

    console.log(`[RUP SYNC] Batch ${page} selesai (${totalRows}/${reportedTotal} paket)`);

    const nextCursor = res.data.tablePagination?.nextCursor;
    const canContinue = res.data.tablePagination?.hasMore;

    if (canContinue && nextCursor && nextCursor !== cursor) {
      cursor = nextCursor;
      page++;
      // Jeda singkat 100ms agar server INAPROC tidak terbebani
      await new Promise((r) => setTimeout(r, 100));
    } else {
      hasMore = false;
    }
  }

  return { totalPaket: totalRows, totalPagu };
}

/**
 * Jalankan proses sinkronisasi RUP secara menyeluruh
 */
async function runSync({ tahun, triggeredBy = 'manual' } = {}) {
  if (isSyncing) {
    throw new Error('Proses sinkronisasi sedang berjalan. Harap tunggu hingga selesai.');
  }

  isSyncing = true;
  const syncYear = tahun || new Date().getFullYear().toString();
  const startTime = new Date();

  // Catat log awal
  const [logInsert] = await db.promise().query(`
    INSERT INTO rup_sync_logs (sync_year, started_at, status, triggered_by, message)
    VALUES (?, NOW(), 'running', ?, 'Sinkronisasi dimulai...')
  `, [syncYear, triggeredBy]);

  const logId = logInsert.insertId;

  // Update status config ke 'running'
  await db.promise().query(`
    UPDATE rup_sync_config
    SET last_status = 'running', last_message = 'Sinkronisasi sedang berlangsung...'
    WHERE id = 1
  `);

  try {
    // 1. Sinkronisasi Satker
    const totalSatker = await syncSatker(syncYear);

    // 2. Sinkronisasi Paket
    const { totalPaket, totalPagu } = await syncPaket(syncYear);

    const message = `Sukses menyinkronkan ${totalSatker} Satker dan ${totalPaket} Paket RUP (Total Pagu: Rp ${totalPagu.toLocaleString('id-ID')}).`;

    // Update log sukses
    await db.promise().query(`
      UPDATE rup_sync_logs
      SET finished_at = NOW(),
          status = 'success',
          total_paket = ?,
          total_pagu = ?,
          message = ?
      WHERE id = ?
    `, [totalPaket, totalPagu, message, logId]);

    // Update config
    await db.promise().query(`
      UPDATE rup_sync_config
      SET last_sync_at = NOW(),
          last_status = 'success',
          last_message = ?,
          total_paket_synced = ?,
          total_pagu_synced = ?
      WHERE id = 1
    `, [message, totalPaket, totalPagu]);

    isSyncing = false;
    return {
      success: true,
      tahun: syncYear,
      totalSatker,
      totalPaket,
      totalPagu,
      startedAt: startTime,
      finishedAt: new Date(),
      message,
    };
  } catch (err) {
    isSyncing = false;
    console.error('[RUP SYNC ERROR]', err);

    const errMessage = err.message || 'Terjadi kesalahan saat sinkronisasi';

    // Update log failed
    await db.promise().query(`
      UPDATE rup_sync_logs
      SET finished_at = NOW(),
          status = 'failed',
          message = ?
      WHERE id = ?
    `, [errMessage, logId]);

    // Update config status failed
    await db.promise().query(`
      UPDATE rup_sync_config
      SET last_status = 'failed',
          last_message = ?
      WHERE id = 1
    `, [errMessage]);

    throw err;
  }
}

/**
 * Dapatkan konfigurasi sync saat ini
 */
async function getConfig() {
  const [rows] = await db.promise().query('SELECT * FROM rup_sync_config WHERE id = 1 LIMIT 1');
  if (rows.length === 0) {
    // Default config jika belum ada
    return {
      id: 1,
      is_active: 1,
      schedule_time: '02:00',
      cron_expression: '0 2 * * *',
      sync_year: new Date().getFullYear().toString(),
      last_sync_at: null,
      last_status: 'idle',
      last_message: null,
      total_paket_synced: 0,
      total_pagu_synced: 0,
      is_running: isSyncing,
    };
  }
  return {
    ...rows[0],
    is_active: Boolean(rows[0].is_active),
    is_running: isSyncing,
  };
}

/**
 * Simpan konfigurasi sync dan perbarui jadwal cronjob secara real-time
 */
/**
 * Simpan konfigurasi sync dan perbarui jadwal cronjob secara real-time
 */
async function updateConfig({ is_active, schedule_time, cron_expression, sync_year, frequency_type, frequency_value }) {
  const current = await getConfig();

  const newIsActive = is_active !== undefined ? (is_active ? 1 : 0) : (current.is_active ? 1 : 0);
  const newScheduleTime = schedule_time ? schedule_time.trim() : (current.schedule_time || '02:00');
  const newYear = sync_year ? String(sync_year).trim() : (current.sync_year || new Date().getFullYear().toString());
  const newFreqType = frequency_type || current.frequency_type || 'daily';
  const newFreqVal = frequency_value !== undefined ? parseInt(frequency_value, 10) : (current.frequency_value || 1);

  // Hitung cron expression dinamis
  let newCronExpr = buildCronExpression({
    frequency_type: newFreqType,
    schedule_time: newScheduleTime,
    frequency_value: newFreqVal,
    cron_expression,
  });

  if (!cron.validate(newCronExpr)) {
    newCronExpr = timeToCron(newScheduleTime);
    if (!cron.validate(newCronExpr)) {
      throw new Error(`Format waktu atau cron expression tidak valid: '${newCronExpr}'`);
    }
  }

  await db.promise().query(`
    UPDATE rup_sync_config
    SET is_active = ?,
        schedule_time = ?,
        cron_expression = ?,
        frequency_type = ?,
        frequency_value = ?,
        sync_year = ?,
        updated_at = NOW()
    WHERE id = 1
  `, [newIsActive, newScheduleTime, newCronExpr, newFreqType, newFreqVal, newYear]);

  // Restart / reschedule scheduler
  reschedule();

  return await getConfig();
}

/**
 * Ambil riwayat log sinkronisasi
 */
async function getLogs(limit = 20) {
  const [rows] = await db.promise().query(`
    SELECT * FROM rup_sync_logs
    ORDER BY id DESC
    LIMIT ?
  `, [parseInt(limit, 10) || 20]);
  return rows;
}

/**
 * Reschedule cron task berdasarkan config di database
 */
async function reschedule() {
  try {
    if (activeCronTask) {
      activeCronTask.stop();
      activeCronTask = null;
      console.log('[RUP CRON] Tugas cronjob RUP sebelumnya dihentikan.');
    }

    const config = await getConfig();

    if (!config.is_active) {
      console.log('[RUP CRON] Penjadwalan RUP dimatikan (OFF).');
      return;
    }

    const cronExpr = config.cron_expression || timeToCron(config.schedule_time);
    if (!cron.validate(cronExpr)) {
      console.warn(`[RUP CRON] Cron expression tidak valid: ${cronExpr}`);
      return;
    }

    console.log(`[RUP CRON] Menjadwalkan cronjob RUP dengan ekspresi: '${cronExpr}' (Waktu: ${config.schedule_time || 'Kustom'})...`);

    activeCronTask = cron.schedule(cronExpr, async () => {
      console.log(`[RUP CRON TRIGGER] Menjalankan sinkronisasi otomatis RUP pada ${new Date().toISOString()} (WITA)`);
      try {
        await runSync({ tahun: config.sync_year, triggeredBy: 'cron' });
      } catch (err) {
        console.error('[RUP CRON ERROR] Gagal saat eksekusi otomatis:', err.message);
      }
    }, {
      timezone: 'Asia/Makassar',
    });

    console.log('[RUP CRON] Cronjob RUP berhasil aktif.');
  } catch (err) {
    console.error('[RUP CRON INIT ERROR]', err.message);
  }
}

/**
 * Inisialisasi scheduler saat server pertama kali start
 */
function initScheduler() {
  reschedule();
}

module.exports = {
  fetchInaprocWeb,
  syncSatker,
  syncPaket,
  runSync,
  getConfig,
  updateConfig,
  getLogs,
  initScheduler,
  isCurrentlySyncing: () => isSyncing,
};
