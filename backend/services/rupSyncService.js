const https = require('https');
const cron = require('node-cron');
const db = require('../db/MySql/utama');

const INAPROC_HOST = 'data.inaproc.id';
const INSTANSI_KONSEL = process.env.INAPROC_INSTANSI || 'D438';
const JENIS_KLPD = process.env.INAPROC_JENIS_KLPD || '4'; // Kabupaten

let activeCronTask = null;
let isSyncing = false;
let isSyncingDetails = false;
let detailColumnsEnsured = false;
const detailInFlight = new Map();

/**
 * Memastikan tabel rup_sumber_dana dan kolom-kolom detail pelengkap tersedia di tabel rup_paket.
 * HANYA menambahkan atribut detail yang belum ada di rup_paket/rup_satker/rup_sumber_dana agar TIDAK ADA data double.
 */
async function ensureDetailColumns() {
  if (detailColumnsEnsured) return;

  try {
    // 1. Pastikan tabel relasi rup_sumber_dana tersedia (default sumber_dana = '-')
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS rup_sumber_dana (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kode_rup VARCHAR(30) NOT NULL,
        mak VARCHAR(255) NOT NULL DEFAULT '-',
        pagu DECIMAL(18, 2) NOT NULL DEFAULT 0,
        sumber_dana VARCHAR(50) NOT NULL DEFAULT '-',
        INDEX idx_kode_rup (kode_rup),
        INDEX idx_mak (mak)
      )
    `);

    // 2. Pastikan kolom detail pelengkap pada rup_paket tersedia (tanpa mak & sumber_dana_json karena sudah di rup_sumber_dana)
    const [cols] = await db.promise().query('SHOW COLUMNS FROM rup_paket');
    const existing = new Set((cols || []).map((c) => c.Field));

    const requiredColumns = [
      ['uraian_pekerjaan', 'TEXT NULL'],
      ['spesifikasi_pekerjaan', 'TEXT NULL'],
      ['volume_pekerjaan', 'VARCHAR(255) NULL'],
      ['usaha_kecil', 'VARCHAR(20) NULL'],
      ['pra_dipa', 'VARCHAR(20) NULL'],
      ['aspek_ekonomi', 'VARCHAR(20) NULL'],
      ['aspek_sosial', 'VARCHAR(20) NULL'],
      ['aspek_lingkungan', 'VARCHAR(20) NULL'],
      ['jadwal_pemilihan_mulai', 'VARCHAR(100) NULL'],
      ['jadwal_pemilihan_akhir', 'VARCHAR(100) NULL'],
      ['jadwal_kontrak_mulai', 'VARCHAR(100) NULL'],
      ['jadwal_kontrak_akhir', 'VARCHAR(100) NULL'],
      ['pemanfaatan_mulai', 'VARCHAR(100) NULL'],
      ['pemanfaatan_akhir', 'VARCHAR(100) NULL'],
      ['tipe_swakelola', 'VARCHAR(50) NULL'],
      ['penyelenggara_swakelola', 'VARCHAR(255) NULL'],
      ['tanggal_umumkan', 'VARCHAR(100) NULL'],
    ];

    const addClauses = requiredColumns
      .filter(([colName]) => !existing.has(colName))
      .map(([colName, colDef]) => `ADD COLUMN ${colName} ${colDef}`);

    const dropClauses = ['detail_synced_at', 'created_at', 'mak', 'sumber_dana_json', 'lokasi_json']
      .filter((colName) => existing.has(colName))
      .map((colName) => `DROP COLUMN ${colName}`);

    const alterClauses = [...addClauses, ...dropClauses];
    if (alterClauses.length > 0) {
      await db.promise().query(`ALTER TABLE rup_paket ${alterClauses.join(', ')}`);
      console.log(`[RUP SCHEMA] Berhasil memperbarui skema tabel rup_paket (${alterClauses.join(', ')}).`);
    }

    detailColumnsEnsured = true;
  } catch (err) {
    console.warn('[RUP SCHEMA] Peringatan saat cek skema detail RUP:', err.message);
  }
}

/**
 * Ekstrak hanya atribut detail pelengkap dari response INAPROC detail
 * tanpa menduplikasi kolom yang sudah ada di rup_paket / rup_satker / rup_sumber_dana.
 */
function extractComplementaryDetailFields(detailData = {}) {
  const main = detailData.main || {};
  const sumberDana = Array.isArray(detailData.sumberDana) ? detailData.sumberDana : [];

  const cleanStr = (val) => {
    if (val === undefined || val === null) return null;
    const s = String(val).replace(/\r\n/g, '\n').trim();
    return s.length > 0 ? s : null;
  };

  // Format baris untuk tabel rup_sumber_dana (jika sumber_dana/mak tidak ditemukan, isi '-')
  const sumberDanaRows = sumberDana.map((item) => ({
    mak: cleanStr(item?.mak) || '-',
    pagu: parseFloat(item?.pagu || 0) || 0,
    sumber_dana: cleanStr(item?.sumber_dana) || '-',
  }));

  return {
    uraian_pekerjaan: cleanStr(main.uraian_pekerjaan),
    spesifikasi_pekerjaan: cleanStr(main.spesifikasi_pekerjaan),
    volume_pekerjaan: cleanStr(main.volume_pekerjaan),
    usaha_kecil: cleanStr(main.usaha_kecil_koperasi),
    pra_dipa: cleanStr(main.pra_dipa_dpa),
    aspek_ekonomi: cleanStr(main.aspek_ekonomi),
    aspek_sosial: cleanStr(main.aspek_sosial),
    aspek_lingkungan: cleanStr(main.aspek_lingkungan),
    jadwal_pemilihan_mulai: cleanStr(main.jadwal_pemilihan_penyedia_mulai),
    jadwal_pemilihan_akhir: cleanStr(main.jadwal_pemilihan_penyedia_akhir),
    jadwal_kontrak_mulai: cleanStr(main.jadwal_pelaksanaan_kontrak_mulai),
    jadwal_kontrak_akhir: cleanStr(main.jadwal_pelaksanaan_kontrak_akhir),
    pemanfaatan_mulai: cleanStr(main.pemanfaatan_barang_jasa_mulai),
    pemanfaatan_akhir: cleanStr(main.pemanfaatan_barang_jasa_akhir),
    tipe_swakelola: cleanStr(main.tipe_swakelola),
    penyelenggara_swakelola: cleanStr(main.penyelenggara_swakelola),
    tanggal_umumkan: cleanStr(main.tanggal_umumkan_paket),
    sumber_dana_rows: sumberDanaRows,
  };
}

/**
 * Menggabungkan kolom utama rup_paket + relasi rup_satker + relasi rup_sumber_dana
 * menjadi objek paket & detail RUP yang utuh untuk Frontend Mobile dan Web Admin.
 */
function formatPaketRowWithDetail(item, fallbackTahun = '', sdRows = []) {
  const tahunStr = String(item.tahun || fallbackTahun || new Date().getFullYear());
  const paguNum = parseFloat(item.pagu || 0) || 0;
  const sumberDanaUtama = item.sumber_dana || '-';
  const opdName = item.opd || item.nama_satker || item.penyelenggara_swakelola || '';

  let sumberDanaList = [];
  if (Array.isArray(sdRows) && sdRows.length > 0) {
    sumberDanaList = sdRows.map((s) => ({
      klpd: 'Kab. Konawe Selatan',
      mak: s.mak || '-',
      pagu: parseFloat(s.pagu || 0) || 0,
      sumber_dana: s.sumber_dana || '-',
      tahun_anggaran: tahunStr,
    }));
  } else {
    sumberDanaList = [
      {
        klpd: 'Kab. Konawe Selatan',
        mak: item.mak || '-',
        pagu: paguNum,
        sumber_dana: sumberDanaUtama,
        tahun_anggaran: tahunStr,
      },
    ];
  }

  const makJoined = [...new Set(
    sumberDanaList
      .map((s) => s.mak)
      .filter((m) => m && m !== '-')
  )].join(', ');

  return {
    id: item.kode_rup || '',
    kode_rup: String(item.kode_rup || ''),
    nama_paket: item.nama_paket || '',
    kode_satker: item.kode_satker || '',
    opd: opdName,
    satuan_kerja: opdName,
    nama_klpd: 'KAB. KONAWE SELATAN',
    metode: item.metode || item.cara_pengadaan || '',
    metode_pemilihan: item.metode || item.cara_pengadaan || '',
    pagu: paguNum,
    total_pagu: paguNum,
    sumber_dana: sumberDanaUtama,
    tahun: tahunStr,
    tahun_anggaran: tahunStr,
    jenis: item.jenis || '',
    jenis_pengadaan: item.jenis || '',
    cara_pengadaan: item.cara_pengadaan || '',
    pdn: item.pdn || 'Ya',
    produk_dalam_negeri: item.pdn || 'Ya',
    status: item.status || 'Aktif',
    uraian_pekerjaan: item.uraian_pekerjaan || '',
    spesifikasi_pekerjaan: item.spesifikasi_pekerjaan || '',
    volume_pekerjaan: item.volume_pekerjaan || '',
    usaha_kecil: item.usaha_kecil || 'Tidak',
    usaha_kecil_koperasi: item.usaha_kecil || 'Tidak',
    pra_dipa: item.pra_dipa || 'Tidak',
    pra_dipa_dpa: item.pra_dipa || 'Tidak',
    aspek_ekonomi: item.aspek_ekonomi || 'Tidak',
    aspek_sosial: item.aspek_sosial || 'Tidak',
    aspek_lingkungan: item.aspek_lingkungan || 'Tidak',
    jadwal_pemilihan_mulai: item.jadwal_pemilihan_mulai || '',
    jadwal_pemilihan_akhir: item.jadwal_pemilihan_akhir || '',
    jadwal_kontrak_mulai: item.jadwal_kontrak_mulai || '',
    jadwal_kontrak_akhir: item.jadwal_kontrak_akhir || '',
    pemanfaatan_mulai: item.pemanfaatan_mulai || '',
    pemanfaatan_akhir: item.pemanfaatan_akhir || '',
    mak: makJoined || '',
    tipe_swakelola: item.tipe_swakelola || '',
    penyelenggara_swakelola: item.penyelenggara_swakelola || '',
    tanggal_umumkan: item.tanggal_umumkan || '',
    sumber_dana_list: sumberDanaList,
    detail_synced: Boolean(item.uraian_pekerjaan || item.volume_pekerjaan || item.jadwal_kontrak_mulai),
  };
}

/**
 * Helper request ke web data.inaproc.id dengan dynamic signature headers
 * Dilengkapi auto-retry & cooldown jika terkena rate-limit Cloudflare (HTTP 429 / 1015)
 */
async function fetchInaprocWeb(endpoint, queryParams, retryCount = 0) {
  const result = await new Promise((resolve, reject) => {
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

  // Jika terkena rate-limit Cloudflare (HTTP 429) atau gangguan sementara (502/503), tunggu dan ulangi otomatis
  if ((result.status === 429 || result.status === 502 || result.status === 503) && retryCount < 4) {
    const waitMs = result.status === 429 ? (retryCount + 1) * 15000 : 3000;
    console.warn(`[INAPROC RATE LIMIT] HTTP ${result.status} pada ${endpoint}, menunggu ${waitMs / 1000} detik sebelum mencoba ulang (percobaan ${retryCount + 1}/4)...`);
    await new Promise((r) => setTimeout(r, waitMs));
    return fetchInaprocWeb(endpoint, queryParams, retryCount + 1);
  }

  return result;
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
  try {
    const result = await fetchInaprocWeb('/profil-pengadaan/satker', {
      tahun,
      jenis: JENIS_KLPD,
      instansi: INSTANSI_KONSEL,
    });

    if (result.status === 200 && Array.isArray(result.data?.items)) {
      const satkers = result.data.items;
      if (satkers.length > 0) {
        const values = satkers.map((s) => {
          const kode = String(s.kode || s.kd_satker || '').trim();
          const rawNama = String(s.nama || s.nama_satker || '').trim();
          const namaBersih = cleanSatkerName(rawNama, kode);
          return [kode, namaBersih];
        }).filter((s) => s[0] && s[1]);

        if (values.length > 0) {
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
      }
    }

    console.warn(`[RUP SYNC] Endpoint master satker INAPROC tidak tersedia (HTTP ${result?.status || 'Unknown'}). Satker akan dikoleksi otomatis dari paket.`);
    return 0;
  } catch (err) {
    console.warn(`[RUP SYNC] Peringatan: Gagal menarik satker dari endpoint INAPROC (${err.message}). Satker akan dikoleksi otomatis dari paket.`);
    return 0;
  }
}

/**
 * Sinkronisasi seluruh paket RUP per batch 100 paket
 */
async function syncPaket(tahun, onProgress) {
  await ensureDetailColumns();
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

    // Ekstrak satker dari setiap paket untuk memastikan rup_satker selalu lengkap
    const satkerBatchMap = new Map();
    rows.forEach((r) => {
      const rawNama = String(r.nama_satker || r.nama_instansi || '').trim();
      const rawKd = r.kd_satker || r.kode_satker;
      const kodeSatker = extractSatkerCode(rawNama, rawKd);
      if (kodeSatker) {
        const namaBersih = cleanSatkerName(rawNama, kodeSatker);
        if (namaBersih && !satkerBatchMap.has(kodeSatker)) {
          satkerBatchMap.set(kodeSatker, namaBersih);
        }
      }
    });

    if (satkerBatchMap.size > 0) {
      const satkerValues = Array.from(satkerBatchMap.entries()).map(([k, n]) => [k, n]);
      const satkerSql = `
        INSERT INTO rup_satker (kode, nama)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          nama = VALUES(nama),
          updated_at = NOW()
      `;
      try {
        await db.promise().query(satkerSql, [satkerValues]);
      } catch (errSatker) {
        console.warn('[RUP SYNC] Gagal upsert satker dari paket:', errSatker.message);
      }
    }

    const values = rows.map((r) => {
      const kodeSatker = extractSatkerCode(r.nama_satker || r.nama_instansi, r.kd_satker || r.kode_satker);
      const statusUmk = r.status_umk ? String(r.status_umk).trim() : null;
      return [
        String(r.kode_rup || '').trim(),
        String(r.nama_paket || '').trim(),
        kodeSatker,
        String(r.metode_pengadaan || r.cara_pengadaan_label || '').trim(),
        String(r.cara_pengadaan || '').trim(),
        String(r.jenis_pengadaan || '').trim(),
        parseFloat(r.total_nilai || 0) || 0,
        String(r.sumber_dana || '-').trim() || '-',
        String(r.tahun_anggaran || tahun).trim(),
        String(r.produk_dalam_negeri || 'Ya').trim(),
        statusUmk,
        'Aktif',
      ];
    }).filter((r) => r[0]); // Harus ada kode_rup

    if (values.length > 0) {
      const sql = `
        INSERT INTO rup_paket (
          kode_rup, nama_paket, kode_satker,
          metode, cara_pengadaan, jenis, pagu,
          sumber_dana, tahun, pdn, usaha_kecil, status
        )
        VALUES ?
        ON DUPLICATE KEY UPDATE
          uraian_pekerjaan = CASE
            WHEN pagu <> VALUES(pagu) OR nama_paket <> VALUES(nama_paket) OR metode <> VALUES(metode)
            THEN NULL
            ELSE uraian_pekerjaan
          END,
          volume_pekerjaan = CASE
            WHEN pagu <> VALUES(pagu) OR nama_paket <> VALUES(nama_paket) OR metode <> VALUES(metode)
            THEN NULL
            ELSE volume_pekerjaan
          END,
          jadwal_kontrak_mulai = CASE
            WHEN pagu <> VALUES(pagu) OR nama_paket <> VALUES(nama_paket) OR metode <> VALUES(metode)
            THEN NULL
            ELSE jadwal_kontrak_mulai
          END,
          nama_paket = VALUES(nama_paket),
          kode_satker = VALUES(kode_satker),
          metode = VALUES(metode),
          cara_pengadaan = VALUES(cara_pengadaan),
          jenis = VALUES(jenis),
          pagu = VALUES(pagu),
          sumber_dana = VALUES(sumber_dana),
          tahun = VALUES(tahun),
          pdn = VALUES(pdn),
          usaha_kecil = COALESCE(VALUES(usaha_kecil), usaha_kecil),
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
 * Mengambil dan menyimpan detail 1 paket RUP berdasarkan kode_rup (On-Demand & Persist).
 * Mengirimkan parameter kind ('Penyedia' | 'Swakelola') sesuai cara_pengadaan di rup_paket
 * agar kode_rup Swakelola tidak pernah tertukar dengan ID Paket Penyedia milik kabupaten lain di INAPROC.
 */
async function getOrSyncPaketDetail(kodeRup, { forceRefresh = false, caraPengadaan = '', skipReadBack = false } = {}) {
  const cleanKode = String(kodeRup || '').trim();
  if (!cleanKode) {
    throw new Error('Kode RUP wajib diisi.');
  }

  await ensureDetailColumns();

  // 1. Ambil baris paket dari database lokal jika caraPengadaan belum diberikan atau bukan mode batch skipReadBack
  let existingRow = null;
  if (!skipReadBack || !caraPengadaan) {
    const [existingRows] = await db.promise().query(
      `SELECT p.*, COALESCE(s.nama, '') as nama_satker, COALESCE(s.nama, '') as opd
       FROM rup_paket p
       LEFT JOIN rup_satker s ON p.kode_satker = s.kode
       WHERE p.kode_rup = ?
       LIMIT 1`,
      [cleanKode]
    );
    existingRow = existingRows[0] || null;
    const hasSyncedDetail = Boolean(
      existingRow && (existingRow.uraian_pekerjaan || existingRow.volume_pekerjaan || existingRow.jadwal_kontrak_mulai)
    );
    if (!forceRefresh && hasSyncedDetail) {
      const [sdRows] = await db.promise().query(
        'SELECT mak, pagu, sumber_dana FROM rup_sumber_dana WHERE kode_rup = ? ORDER BY id ASC',
        [cleanKode]
      );
      return {
        success: true,
        source: 'database-local',
        data: formatPaketRowWithDetail(existingRow, '', sdRows),
      };
    }
  }

  const resolvedKind = (caraPengadaan || existingRow?.cara_pengadaan || 'Penyedia').trim();
  const flightKey = `${cleanKode}:${resolvedKind}`;

  if (detailInFlight.has(flightKey)) {
    return detailInFlight.get(flightKey);
  }

  const job = (async () => {
    let res = await fetchInaprocWeb('detail', { kode: cleanKode, kind: resolvedKind });

    // Validasi nama_klpd: jika karena alasan tertentu nama_klpd bukan Konawe Selatan, coba kind sebaliknya
    const returnedKlpd = String(res.data?.main?.nama_klpd || '').toUpperCase();
    if (res.status === 200 && res.data?.main && returnedKlpd && !returnedKlpd.includes('KONAWE SELATAN')) {
      const altKind = resolvedKind.toLowerCase() === 'swakelola' ? 'Penyedia' : 'Swakelola';
      const altRes = await fetchInaprocWeb('detail', { kode: cleanKode, kind: altKind });
      const altKlpd = String(altRes.data?.main?.nama_klpd || '').toUpperCase();
      if (altRes.status === 200 && altRes.data?.main && altKlpd.includes('KONAWE SELATAN')) {
        res = altRes;
      }
    }

    if (res.status !== 200 || !res.data || !res.data.main) {
      if (existingRow) {
        const [sdRows] = await db.promise().query(
          'SELECT mak, pagu, sumber_dana FROM rup_sumber_dana WHERE kode_rup = ? ORDER BY id ASC',
          [cleanKode]
        );
        return {
          success: true,
          source: 'database-partial',
          data: formatPaketRowWithDetail(existingRow, '', sdRows),
        };
      }
      throw new Error(res.error || `Detail RUP ${cleanKode} tidak ditemukan di INAPROC (HTTP ${res.status})`);
    }

    // Proteksi keras: jangan pernah menyimpan detail jika nama_klpd dari INAPROC bukan Konawe Selatan
    const finalKlpd = String(res.data.main.nama_klpd || '').toUpperCase();
    if (finalKlpd && !finalKlpd.includes('KONAWE SELATAN')) {
      if (existingRow) {
        const [sdRows] = await db.promise().query(
          'SELECT mak, pagu, sumber_dana FROM rup_sumber_dana WHERE kode_rup = ? ORDER BY id ASC',
          [cleanKode]
        );
        return {
          success: true,
          source: 'database-partial',
          data: formatPaketRowWithDetail(existingRow, '', sdRows),
        };
      }
      throw new Error(`Kode RUP ${cleanKode} bukan milik Kab. Konawe Selatan (${res.data.main.nama_klpd})`);
    }

    const detailFields = extractComplementaryDetailFields(res.data);

    // Simpan rincian Sumber Dana & MAK ke tabel relasi rup_sumber_dana (hapus rincian lama kode_rup ini agar tidak double)
    await db.promise().query('DELETE FROM rup_sumber_dana WHERE kode_rup = ?', [cleanKode]);
    if (detailFields.sumber_dana_rows.length > 0) {
      const sdValues = detailFields.sumber_dana_rows.map((s) => [
        cleanKode,
        s.mak || '-',
        s.pagu || 0,
        s.sumber_dana || '-',
      ]);
      await db.promise().query(
        'INSERT INTO rup_sumber_dana (kode_rup, mak, pagu, sumber_dana) VALUES ?',
        [sdValues]
      );
    }

    const [updateResult] = await db.promise().query(
      `UPDATE rup_paket
       SET uraian_pekerjaan = ?,
           spesifikasi_pekerjaan = ?,
           volume_pekerjaan = ?,
           usaha_kecil = COALESCE(?, usaha_kecil),
           pra_dipa = ?,
           aspek_ekonomi = ?,
           aspek_sosial = ?,
           aspek_lingkungan = ?,
           jadwal_pemilihan_mulai = ?,
           jadwal_pemilihan_akhir = ?,
           jadwal_kontrak_mulai = ?,
           jadwal_kontrak_akhir = ?,
           pemanfaatan_mulai = ?,
           pemanfaatan_akhir = ?,
           tipe_swakelola = ?,
           penyelenggara_swakelola = ?,
           tanggal_umumkan = ?,
           updated_at = NOW()
       WHERE kode_rup = ?`,
      [
        detailFields.uraian_pekerjaan,
        detailFields.spesifikasi_pekerjaan,
        detailFields.volume_pekerjaan,
        detailFields.usaha_kecil,
        detailFields.pra_dipa,
        detailFields.aspek_ekonomi,
        detailFields.aspek_sosial,
        detailFields.aspek_lingkungan,
        detailFields.jadwal_pemilihan_mulai,
        detailFields.jadwal_pemilihan_akhir,
        detailFields.jadwal_kontrak_mulai,
        detailFields.jadwal_kontrak_akhir,
        detailFields.pemanfaatan_mulai,
        detailFields.pemanfaatan_akhir,
        detailFields.tipe_swakelola,
        detailFields.penyelenggara_swakelola,
        detailFields.tanggal_umumkan,
        cleanKode,
      ]
    );

    if (updateResult.affectedRows > 0) {
      if (skipReadBack) {
        return { success: true, source: 'database-synced' };
      }
      const [updatedRows] = await db.promise().query(
        `SELECT p.*, COALESCE(s.nama, '') as nama_satker, COALESCE(s.nama, '') as opd
         FROM rup_paket p
         LEFT JOIN rup_satker s ON p.kode_satker = s.kode
         WHERE p.kode_rup = ?
         LIMIT 1`,
        [cleanKode]
      );
      if (updatedRows.length > 0) {
        return {
          success: true,
          source: 'database-synced',
          data: formatPaketRowWithDetail(updatedRows[0], '', detailFields.sumber_dana_rows),
        };
      }
    }

    const main = res.data.main || {};
    const sumberDana = Array.isArray(res.data.sumberDana) ? res.data.sumberDana : [];
    const caraPengadaanRes = String(res.data.kind || '').toLowerCase().includes('swakelola') ? 'Swakelola' : 'Penyedia';
    return {
      success: true,
      source: 'inaproc-live',
      data: formatPaketRowWithDetail({
        kode_rup: cleanKode,
        nama_paket: main.nama_paket || '',
        opd: main.satuan_kerja || main.penyelenggara_swakelola || '',
        metode: main.metode_pemilihan || caraPengadaanRes,
        cara_pengadaan: caraPengadaanRes,
        jenis: main.jenis_pengadaan || '',
        pagu: main.total_pagu || 0,
        sumber_dana: sumberDana[0]?.sumber_dana || '-',
        tahun: String(main.tahun_anggaran || new Date().getFullYear()),
        pdn: main.produk_dalam_negeri || 'Ya',
        status: 'Aktif',
        ...detailFields,
      }, '', detailFields.sumber_dana_rows),
    };
  })();

  detailInFlight.set(flightKey, job);
  try {
    return await job;
  } finally {
    detailInFlight.delete(flightKey);
  }
}

/**
 * Worker Background Batch Sync Detail RUP (Opsi B).
 * Hanya menarik paket Aktif yang kolom detailnya masih NULL di tabel rup_paket (diurutkan dari Pagu terbesar)
 * agar tidak pernah memproses atau menyimpan data ganda.
 */
async function syncMissingDetailsInBackground(tahun, { concurrency = 5 } = {}) {
  if (isSyncingDetails) {
    return { started: false, message: 'Sinkronisasi detail RUP sedang berjalan.' };
  }

  isSyncingDetails = true;
  const targetYear = String(tahun || new Date().getFullYear()).trim();

  try {
    await ensureDetailColumns();

    const [missingRows] = await db.promise().query(
      `SELECT kode_rup, cara_pengadaan
       FROM rup_paket
       WHERE tahun = ?
         AND status = 'Aktif'
         AND uraian_pekerjaan IS NULL
         AND volume_pekerjaan IS NULL
         AND jadwal_kontrak_mulai IS NULL
       ORDER BY pagu DESC`,
      [targetYear]
    );

    const totalMissing = missingRows.length;
    if (totalMissing === 0) {
      isSyncingDetails = false;
      return { started: true, tahun: targetYear, totalMissing: 0, synced: 0 };
    }

    console.log(`[RUP DETAIL SYNC] Memulai pengisian detail untuk ${totalMissing} paket RUP T.A. ${targetYear} di background...`);

    let processed = 0;
    let succeeded = 0;
    // Batasi maksimal 5 request paralel dengan jeda 350ms (~7 req/detik) agar aman dari rate-limit Cloudflare INAPROC (250 req / 30 detik)
    const safeConcurrency = Math.max(1, Math.min(5, parseInt(concurrency, 10) || 4));

    for (let i = 0; i < totalMissing; i += safeConcurrency) {
      const chunk = missingRows.slice(i, i + safeConcurrency);
      const results = await Promise.allSettled(
        chunk.map((row) =>
          getOrSyncPaketDetail(row.kode_rup, {
            caraPengadaan: row.cara_pengadaan,
            skipReadBack: true,
          })
        )
      );

      for (const r of results) {
        processed++;
        if (r.status === 'fulfilled' && (r.value?.source === 'database-synced' || r.value?.source === 'database-local')) {
          succeeded++;
        }
      }

      if (processed % 250 === 0 || processed === totalMissing) {
        console.log(`[RUP DETAIL SYNC] Progres detail T.A. ${targetYear}: ${succeeded}/${totalMissing} paket tersimpan.`);
      }

      if (i + safeConcurrency < totalMissing) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }

    console.log(`[RUP DETAIL SYNC] Selesai! ${succeeded}/${totalMissing} detail paket RUP T.A. ${targetYear} berhasil dilengkapi di database.`);
    return { started: true, tahun: targetYear, totalMissing, synced: succeeded };
  } catch (err) {
    console.error('[RUP DETAIL SYNC ERROR]', err.message);
    return { started: false, error: err.message };
  } finally {
    isSyncingDetails = false;
  }
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
    await ensureDetailColumns();

    // 1. Sinkronisasi Satker (Fallback graceful)
    let totalSatker = 0;
    try {
      totalSatker = await syncSatker(syncYear);
    } catch (errSatker) {
      console.warn('[RUP SYNC] Lewati syncSatker:', errSatker.message);
    }

    // 2. Sinkronisasi Paket
    const { totalPaket, totalPagu } = await syncPaket(syncYear);

    // Tandai paket yang sudah tidak ada / dibatalkan di INAPROC tahun berjalan sebagai 'Dibatalkan'
    try {
      await db.promise().query(`
        UPDATE rup_paket 
        SET status = 'Dibatalkan' 
        WHERE tahun = ? AND updated_at < ? AND status = 'Aktif'
      `, [syncYear, startTime]);
    } catch (errCancel) {
      console.warn('[RUP SYNC] Gagal menandai paket lama:', errCancel.message);
    }

    // Hitung total satker di database
    try {
      const [satkerCount] = await db.promise().query('SELECT COUNT(*) as cnt FROM rup_satker');
      if (satkerCount[0]?.cnt) totalSatker = satkerCount[0].cnt;
    } catch (_) { }

    const message = `Sukses menyinkronkan ${totalSatker} Satker dan ${totalPaket} Paket RUP (Total Pagu: Rp ${totalPagu.toLocaleString('id-ID')}). Detail paket disinkronkan otomatis di background.`;

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

    // 3. Jalankan pengisian detail untuk paket Aktif yang detail_synced_at IS NULL secara non-blocking di background
    syncMissingDetailsInBackground(syncYear).catch((detailErr) => {
      console.warn('[RUP DETAIL SYNC] Background warning:', detailErr.message);
    });

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
 * Dapatkan konfigurasi sync saat ini beserta progres sinkronisasi detail
 */
async function getConfig() {
  await ensureDetailColumns();
  const [rows] = await db.promise().query('SELECT * FROM rup_sync_config WHERE id = 1 LIMIT 1');
  const syncYear = rows[0]?.sync_year || new Date().getFullYear().toString();

  let totalDetailSynced = 0;
  try {
    const [detailCountRows] = await db.promise().query(
      "SELECT COUNT(*) as cnt FROM rup_paket WHERE tahun = ? AND status = 'Aktif' AND (uraian_pekerjaan IS NOT NULL OR volume_pekerjaan IS NOT NULL OR jadwal_kontrak_mulai IS NOT NULL)",
      [syncYear]
    );
    totalDetailSynced = parseInt(detailCountRows[0]?.cnt || 0, 10);
  } catch {
    totalDetailSynced = 0;
  }

  if (rows.length === 0) {
    // Default config jika belum ada
    return {
      id: 1,
      is_active: 1,
      schedule_time: '02:00',
      cron_expression: '0 2 * * *',
      sync_year: syncYear,
      last_sync_at: null,
      last_status: 'idle',
      last_message: null,
      total_paket_synced: 0,
      total_pagu_synced: 0,
      total_detail_synced: totalDetailSynced,
      is_running: isSyncing,
      is_detail_syncing: isSyncingDetails,
    };
  }
  return {
    ...rows[0],
    is_active: Boolean(rows[0].is_active),
    total_detail_synced: totalDetailSynced,
    is_running: isSyncing,
    is_detail_syncing: isSyncingDetails,
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
 * Menyinkronkan detail untuk seluruh Tahun Anggaran yang masih memiliki paket belum lengkap secara bertahap
 */
async function syncAllYearsMissingDetails() {
  await ensureDetailColumns();
  const [yearRows] = await db.promise().query(`
    SELECT DISTINCT tahun
    FROM rup_paket
    WHERE status = 'Aktif'
      AND uraian_pekerjaan IS NULL
      AND volume_pekerjaan IS NULL
      AND jadwal_kontrak_mulai IS NULL
    ORDER BY tahun DESC
  `);

  const results = [];
  for (const yr of yearRows) {
    if (!yr.tahun) continue;
    const res = await syncMissingDetailsInBackground(yr.tahun, { concurrency: 4 });
    results.push(res);
  }
  return results;
}

/**
 * Inisialisasi scheduler saat server pertama kali start
 * Sekaligus melanjutkan pengisian detail RUP yang belum tersinkron di background
 */
function initScheduler() {
  reschedule();

  setTimeout(async () => {
    try {
      if (!isSyncing && !isSyncingDetails) {
        syncAllYearsMissingDetails().catch(() => { });
      }
    } catch {
      // Abaikan jika DB belum siap saat cold boot
    }
  }, 4000);
}

module.exports = {
  fetchInaprocWeb,
  ensureDetailColumns,
  extractComplementaryDetailFields,
  formatPaketRowWithDetail,
  getOrSyncPaketDetail,
  syncMissingDetailsInBackground,
  syncAllYearsMissingDetails,
  syncSatker,
  syncPaket,
  runSync,
  getConfig,
  updateConfig,
  getLogs,
  initScheduler,
  isCurrentlySyncing: () => isSyncing,
  isCurrentlySyncingDetails: () => isSyncingDetails,
};
