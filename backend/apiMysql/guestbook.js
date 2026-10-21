const crypto = require('crypto');
const express = require('express');
const db = require('../db/MySql/utama');
const middleware = require('../auth/middlewares');
const { queryAsync, requirePermission } = require('../auth/accessControl');

const router = express.Router();

const VISITOR_TYPES = new Set(['internal', 'external_employee', 'external_general']);
const publicSubmissions = new Map();
let initializationPromise;

function withTransaction(work) {
  return new Promise((resolve, reject) => {
    db.getConnection((connectionError, connection) => {
      if (connectionError) return reject(connectionError);
      const transactionQuery = (sql, params = []) => new Promise((queryResolve, queryReject) => {
        connection.query(sql, params, (error, rows) => error ? queryReject(error) : queryResolve(rows));
      });

      connection.beginTransaction(async (beginError) => {
        if (beginError) {
          connection.release();
          return reject(beginError);
        }
        try {
          const result = await work(transactionQuery);
          connection.commit((commitError) => {
            if (commitError) {
              return connection.rollback(() => {
                connection.release();
                reject(commitError);
              });
            }
            connection.release();
            resolve(result);
          });
        } catch (error) {
          connection.rollback(() => {
            connection.release();
            reject(error);
          });
        }
      });
    });
  });
}

function cleanText(value, maxLength = 255) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function formatNamaLengkap(row) {
  const gelarDepan = cleanText(row.gelar_depan, 50);
  const gelarBelakang = cleanText(row.gelar_belakang, 50);
  const nama = cleanText(row.nama, 200).replace(/^[-,\s]+|[-,\s]+$/g, '');
  return `${gelarDepan && gelarDepan !== '-' ? `${gelarDepan} ` : ''}${nama}${gelarBelakang && gelarBelakang !== '-' ? `, ${gelarBelakang}` : ''}`.trim();
}

function normalizeGender(value) {
  const normalized = cleanText(value, 30).toUpperCase().replace(/[_\s]+/g, ' ');
  if (['M', 'L', 'LAKI-LAKI', 'LAKI LAKI', 'MALE'].includes(normalized)) return 'L';
  if (['F', 'P', 'PEREMPUAN', 'FEMALE'].includes(normalized)) return 'P';
  return null;
}

function ensureGuestbookTables() {
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    await queryAsync(`
      CREATE TABLE IF NOT EXISTS guestbook_locations (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        token VARCHAR(96) NOT NULL,
        opd_id VARCHAR(64) NOT NULL,
        opd_name VARCHAR(255) NOT NULL,
        label VARCHAR(120) NOT NULL DEFAULT 'Meja Resepsionis',
        wifi_ssid VARCHAR(120) DEFAULT NULL,
        wifi_password VARCHAR(120) DEFAULT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_by VARCHAR(100) DEFAULT NULL,
        created_by_name VARCHAR(200) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_guestbook_location_token (token),
        KEY idx_guestbook_location_opd (opd_id, is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const locationColumns = await queryAsync(`
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'guestbook_locations'
    `);
    const locationColumnNames = new Set(locationColumns.map((column) => column.COLUMN_NAME));
    if (!locationColumnNames.has('wifi_ssid')) {
      await queryAsync('ALTER TABLE guestbook_locations ADD COLUMN wifi_ssid VARCHAR(120) DEFAULT NULL AFTER label');
    }
    if (!locationColumnNames.has('wifi_password')) {
      await queryAsync('ALTER TABLE guestbook_locations ADD COLUMN wifi_password VARCHAR(120) DEFAULT NULL AFTER wifi_ssid');
    }

    await queryAsync(`
      CREATE TABLE IF NOT EXISTS guestbook_visits (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        location_id BIGINT UNSIGNED NOT NULL,
        opd_id VARCHAR(64) NOT NULL,
        opd_name VARCHAR(255) NOT NULL,
        visitor_type ENUM('internal', 'external_employee', 'external_general') NOT NULL,
        visitor_name VARCHAR(200) NOT NULL,
        gender ENUM('L', 'P') DEFAULT NULL,
        nip VARCHAR(40) DEFAULT NULL,
        origin_institution VARCHAR(255) DEFAULT NULL,
        position_name VARCHAR(180) DEFAULT NULL,
        office_name VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(30) DEFAULT NULL,
        purpose TEXT NOT NULL,
        checked_in_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        source_ip VARCHAR(64) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_guestbook_visit_opd_date (opd_id, checked_in_at),
        KEY idx_guestbook_visit_location (location_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  })().catch((error) => {
    initializationPromise = null;
    throw error;
  });

  return initializationPromise;
}

async function findOpd(opdId, opdName = '') {
  let rows = [];
  if (opdId) {
    rows = await queryAsync('SELECT id, instansi FROM simpeg.instansi WHERE id = ? LIMIT 1', [String(opdId)]);
  }
  if (!rows.length && opdName) {
    rows = await queryAsync('SELECT id, instansi FROM simpeg.instansi WHERE LOWER(TRIM(instansi)) = LOWER(TRIM(?)) LIMIT 1', [opdName]);
  }
  return rows.length ? { id: String(rows[0].id), name: rows[0].instansi } : null;
}

async function resolveScope(req, requestedOpdId, requestedOpdName) {
  if (Number(req.user?.menu_klp) === 1) {
    if (!requestedOpdId && !requestedOpdName) return null;
    const requestedScope = await findOpd(requestedOpdId, requestedOpdName);
    if (!requestedScope) {
      const error = new Error('OPD yang dipilih tidak ditemukan pada data SIMPEG.');
      error.status = 422;
      throw error;
    }
    return requestedScope;
  }

  const scope = await findOpd(req.user?.opd_id, req.user?.opd);
  if (!scope) {
    const error = new Error('OPD akun belum terhubung dengan data SIMPEG. Atur ulang role pegawai melalui menu Hak Akses Pegawai.');
    error.status = 422;
    throw error;
  }
  return scope;
}

async function getPublicLocation(token) {
  await ensureGuestbookTables();
  const rows = await queryAsync(`
    SELECT id, token, opd_id, opd_name, label, wifi_ssid, wifi_password
    FROM guestbook_locations
    WHERE token = ? AND is_active = 1
    LIMIT 1
  `, [token]);
  return rows[0] || null;
}

function publicRateLimit(req, res, next) {
  const key = `${req.ip || req.socket?.remoteAddress || 'unknown'}:${req.params.token}`;
  const now = Date.now();
  if (publicSubmissions.size > 1000) {
    for (const [storedKey, timestamps] of publicSubmissions.entries()) {
      const active = timestamps.filter((timestamp) => now - timestamp < 10 * 60 * 1000);
      if (active.length) publicSubmissions.set(storedKey, active);
      else publicSubmissions.delete(storedKey);
    }
  }
  const recent = (publicSubmissions.get(key) || []).filter((timestamp) => now - timestamp < 10 * 60 * 1000);
  if (recent.length >= 60) {
    return res.status(429).json({ success: false, message: 'Terlalu banyak kiriman. Silakan tunggu beberapa menit lalu coba kembali.' });
  }
  recent.push(now);
  publicSubmissions.set(key, recent);
  next();
}

// Public endpoints opened from the printed QR code.
router.get('/public/:token', async (req, res) => {
  try {
    const location = await getPublicLocation(cleanText(req.params.token, 96));
    if (!location) return res.status(404).json({ success: false, message: 'QR Buku Tamu tidak aktif atau tidak ditemukan.' });
    return res.json({ success: true, data: location, server_time: new Date().toISOString() });
  } catch (error) {
    console.error('[GUESTBOOK] public location:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal membuka Buku Tamu.' });
  }
});

router.get('/public/:token/employee-filters', async (req, res) => {
  try {
    const location = await getPublicLocation(cleanText(req.params.token, 96));
    if (!location) return res.status(404).json({ success: false, message: 'QR Buku Tamu tidak aktif.' });

    const [units, subUnits] = await Promise.all([
      queryAsync(`
        SELECT DISTINCT i.id, i.instansi AS name
        FROM simpeg.biodata b
        INNER JOIN simpeg.unit_kerja uk ON b.unit_kerja = uk.id
        INNER JOIN simpeg.instansi i ON i.id = uk.instansi
        WHERE b.nama IS NOT NULL AND b.nama != ''
          AND i.instansi IS NOT NULL AND i.instansi != ''
        ORDER BY i.instansi ASC
      `),
      queryAsync(`
        SELECT DISTINCT uk.id, uk.unit_kerja AS name, uk.instansi AS unit_id
        FROM simpeg.biodata b
        INNER JOIN simpeg.unit_kerja uk ON b.unit_kerja = uk.id
        WHERE b.nama IS NOT NULL AND b.nama != ''
          AND uk.unit_kerja IS NOT NULL AND uk.unit_kerja != ''
        ORDER BY uk.unit_kerja ASC
      `),
    ]);

    return res.json({ success: true, data: { units, sub_units: subUnits } });
  } catch (error) {
    console.error('[GUESTBOOK] employee filters:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal memuat pilihan unit kerja.' });
  }
});

router.get('/public/:token/employees', async (req, res) => {
  try {
    const location = await getPublicLocation(cleanText(req.params.token, 96));
    if (!location) return res.status(404).json({ success: false, message: 'QR Buku Tamu tidak aktif.' });

    const search = cleanText(req.query.q, 100);
    if (search.length < 3) return res.json({ success: true, data: [] });

    const unitId = cleanText(req.query.unit_id, 64);
    const subUnitId = cleanText(req.query.sub_unit_id, 64);
    const filters = ["b.nama IS NOT NULL", "b.nama != ''", '(b.nama LIKE ? OR b.nip LIKE ?)'];
    const params = [`%${search}%`, `%${search}%`];
    if (unitId) {
      filters.push('i.id = ?');
      params.push(unitId);
    }
    if (subUnitId) {
      filters.push('uk.id = ?');
      params.push(subUnitId);
    }

    const rows = await queryAsync(`
      SELECT
        b.nip, b.nama, b.gelar_depan, b.gelar_belakang,
        COALESCE(j.jabatan, b.jenis_jabatan, 'Pegawai') AS jabatan,
        COALESCE(i.instansi, uk.unit_kerja, 'Pemerintah Kabupaten Konawe Selatan') AS opd,
        i.id AS unit_id, uk.id AS sub_unit_id, uk.unit_kerja AS sub_unit_kerja
      FROM simpeg.biodata b
      LEFT JOIN simpeg.jabatan j ON b.jabatan = j._id
      LEFT JOIN simpeg.unit_kerja uk ON b.unit_kerja = uk.id
      LEFT JOIN simpeg.instansi i ON i.id = uk.instansi
      WHERE ${filters.join(' AND ')}
      ORDER BY b.nama ASC
      LIMIT 12
    `, params);

    return res.json({
      success: true,
      data: rows.map((row) => ({
        nip: row.nip,
        nama: formatNamaLengkap(row),
        jabatan: row.jabatan,
        opd: row.opd,
        unit_id: row.unit_id,
        sub_unit_id: row.sub_unit_id,
        sub_unit_kerja: row.sub_unit_kerja,
      })),
    });
  } catch (error) {
    console.error('[GUESTBOOK] employee search:', error.message);
    return res.status(500).json({ success: false, message: 'Gagal mencari data pegawai.' });
  }
});

router.post('/public/:token/visits', publicRateLimit, async (req, res) => {
  try {
    const location = await getPublicLocation(cleanText(req.params.token, 96));
    if (!location) return res.status(404).json({ success: false, message: 'QR Buku Tamu tidak aktif.' });

    const visitorType = cleanText(req.body.visitor_type, 30);
    const purpose = cleanText(req.body.purpose, 1000);
    if (!VISITOR_TYPES.has(visitorType) || purpose.length < 3) {
      return res.status(422).json({ success: false, message: 'Jenis tamu dan urusan wajib diisi dengan benar.' });
    }

    let visitor = {
      name: '', gender: null, nip: null, institution: null,
      position: null, office: null, phone: null,
    };

    if (visitorType === 'internal') {
      const nip = cleanText(req.body.nip, 40);
      const rows = await queryAsync(`
        SELECT
          b.nip, b.nama, b.gelar_depan, b.gelar_belakang,
          b.kontak AS phone, b.jenis_kelamin AS gender,
          COALESCE(j.jabatan, b.jenis_jabatan, 'Pegawai') AS jabatan,
          COALESCE(i.instansi, uk.unit_kerja, 'Pemerintah Kabupaten Konawe Selatan') AS opd
        FROM simpeg.biodata b
        LEFT JOIN simpeg.jabatan j ON b.jabatan = j._id
        LEFT JOIN simpeg.unit_kerja uk ON b.unit_kerja = uk.id
        LEFT JOIN simpeg.instansi i ON i.id = uk.instansi
        WHERE b.nip = ? LIMIT 1
      `, [nip]);
      if (!rows.length) return res.status(422).json({ success: false, message: 'Pilih nama pegawai dari hasil pencarian.' });
      visitor = {
        ...visitor,
        name: formatNamaLengkap(rows[0]),
        gender: normalizeGender(rows[0].gender),
        nip: rows[0].nip,
        institution: rows[0].opd,
        position: rows[0].jabatan,
        office: rows[0].opd,
        phone: cleanText(rows[0].phone, 30) || null,
      };
    } else {
      visitor = {
        ...visitor,
        name: cleanText(req.body.name, 200),
        gender: cleanText(req.body.gender, 1),
        institution: cleanText(req.body.institution, 255),
        position: cleanText(req.body.position, 180),
        office: cleanText(req.body.office_name || req.body.institution, 255),
        phone: cleanText(req.body.phone, 30),
      };
      if (visitor.name.length < 3 || !['L', 'P'].includes(visitor.gender) || visitor.institution.length < 2 || visitor.position.length < 2 || visitor.office.length < 2 || !/^[0-9+()\-\s]{8,30}$/.test(visitor.phone)) {
        return res.status(422).json({ success: false, message: 'Lengkapi nama, jenis kelamin, instansi atau asal, jabatan, dan nomor HP yang valid.' });
      }
    }

    const result = await queryAsync(`
      INSERT INTO guestbook_visits
        (location_id, opd_id, opd_name, visitor_type, visitor_name, gender, nip,
         origin_institution, position_name, office_name, phone, purpose, source_ip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      location.id, location.opd_id, location.opd_name, visitorType, visitor.name,
      visitor.gender, visitor.nip, visitor.institution, visitor.position,
      visitor.office, visitor.phone, purpose, cleanText(req.ip || req.socket?.remoteAddress, 64),
    ]);

    return res.status(201).json({
      success: true,
      message: `Terima kasih, ${visitor.name}. Kunjungan Anda telah tercatat.`,
      data: { id: result.insertId, visitor_name: visitor.name, opd_name: location.opd_name },
    });
  } catch (error) {
    console.error('[GUESTBOOK] create visit:', error.message);
    return res.status(500).json({ success: false, message: 'Kunjungan belum berhasil disimpan. Silakan coba lagi.' });
  }
});

// Protected administration endpoints.
router.use(middleware.isLoggedIn);

router.get('/summary', requirePermission('guestbook_dashboard', 'read'), async (req, res) => {
  try {
    await ensureGuestbookTables();
    const scope = await resolveScope(req, req.query.opd_id, req.query.opd_name);
    const where = scope ? 'WHERE opd_id = ?' : '';
    const params = scope ? [scope.id] : [];

    const totals = await queryAsync(`
      SELECT
        COUNT(*) AS total,
        SUM(DATE(checked_in_at) = CURDATE()) AS today,
        SUM(YEAR(checked_in_at) = YEAR(CURDATE()) AND MONTH(checked_in_at) = MONTH(CURDATE())) AS this_month,
        SUM(visitor_type = 'internal') AS internal_total,
        SUM(visitor_type != 'internal') AS external_total
      FROM guestbook_visits ${where}
    `, params);

    const trendWhere = scope ? 'AND opd_id = ?' : '';
    const trend = await queryAsync(`
      SELECT DATE(checked_in_at) AS visit_date, COUNT(*) AS total
      FROM guestbook_visits
      WHERE checked_in_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) ${trendWhere}
      GROUP BY DATE(checked_in_at)
      ORDER BY visit_date ASC
    `, params);

    const recentWhere = scope
      ? 'WHERE opd_id = ? AND DATE(checked_in_at) = CURDATE()'
      : 'WHERE DATE(checked_in_at) = CURDATE()';
    const recent = await queryAsync(`
      SELECT id, visitor_name, visitor_type, origin_institution, purpose, opd_name, checked_in_at
      FROM guestbook_visits ${recentWhere}
      ORDER BY checked_in_at DESC LIMIT 8
    `, params);

    return res.json({
      success: true,
      data: {
        totals: {
          total: Number(totals[0]?.total || 0),
          today: Number(totals[0]?.today || 0),
          this_month: Number(totals[0]?.this_month || 0),
          internal_total: Number(totals[0]?.internal_total || 0),
          external_total: Number(totals[0]?.external_total || 0),
        },
        trend: trend.map((item) => ({ date: item.visit_date, total: Number(item.total) })),
        recent,
        scope,
      },
    });
  } catch (error) {
    console.error('[GUESTBOOK] summary:', error.message);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal memuat rekap Buku Tamu.' });
  }
});

router.get('/report', requirePermission('guestbook_dashboard', 'read'), async (req, res) => {
  try {
    await ensureGuestbookTables();
    const scope = await resolveScope(req, req.query.opd_id, req.query.opd_name);
    if (!scope) {
      return res.status(422).json({ success: false, message: 'Pilih satu OPD sebelum mencetak laporan Buku Tamu.' });
    }
    const dateFrom = cleanText(req.query.date_from, 10);
    const dateTo = cleanText(req.query.date_to, 10);
    const validDate = (value) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const parsed = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
    };

    if (!validDate(dateFrom) || !validDate(dateTo)) {
      return res.status(422).json({ success: false, message: 'Periode laporan tidak valid.' });
    }

    const rangeDays = Math.round((Date.parse(`${dateTo}T00:00:00Z`) - Date.parse(`${dateFrom}T00:00:00Z`)) / 86400000);
    if (rangeDays < 0 || rangeDays > 30) {
      return res.status(422).json({ success: false, message: 'Periode laporan maksimal 31 hari dan tanggal akhir tidak boleh mendahului tanggal awal.' });
    }

    const conditions = ['DATE(checked_in_at) >= ?', 'DATE(checked_in_at) <= ?'];
    const params = [dateFrom, dateTo];
    conditions.push('opd_id = ?');
    params.push(scope.id);

    const rows = await queryAsync(`
      SELECT id, opd_id, opd_name, visitor_type, visitor_name,
        COALESCE(
          NULLIF(gender, ''),
          CASE WHEN visitor_type = 'internal' THEN (
            SELECT CASE
              WHEN UPPER(TRIM(b.jenis_kelamin)) IN ('M', 'L', 'LAKI-LAKI', 'LAKI LAKI', 'MALE') THEN 'L'
              WHEN UPPER(TRIM(b.jenis_kelamin)) IN ('F', 'P', 'PEREMPUAN', 'FEMALE') THEN 'P'
              ELSE NULL
            END
            FROM simpeg.biodata b
            WHERE b.nip = guestbook_visits.nip
            LIMIT 1
          ) ELSE NULL END
        ) AS gender,
        nip, origin_institution, position_name, office_name,
        COALESCE(
          NULLIF(phone, ''),
          CASE WHEN visitor_type = 'internal' THEN (
            SELECT b.kontak
            FROM simpeg.biodata b
            WHERE b.nip = guestbook_visits.nip
            LIMIT 1
          ) ELSE NULL END
        ) AS phone,
        purpose, checked_in_at
      FROM guestbook_visits
      WHERE ${conditions.join(' AND ')}
      ORDER BY checked_in_at ASC, id ASC
    `, params);

    return res.json({
      success: true,
      data: rows,
      period: { date_from: dateFrom, date_to: dateTo },
      scope,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[GUESTBOOK] report:', error.message);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal menyiapkan laporan Buku Tamu.' });
  }
});

router.get('/visits', requirePermission('guestbook_monitoring', 'read'), async (req, res) => {
  try {
    await ensureGuestbookTables();
    const scope = await resolveScope(req, req.query.opd_id, req.query.opd_name);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(10, Number(req.query.limit) || 15));
    const offset = (page - 1) * limit;
    const search = cleanText(req.query.search, 100);
    const visitorType = cleanText(req.query.visitor_type, 30);
    const dateFrom = cleanText(req.query.date_from, 10);
    const dateTo = cleanText(req.query.date_to, 10);
    const conditions = [];
    const params = [];

    if (scope) { conditions.push('opd_id = ?'); params.push(scope.id); }
    if (search) {
      conditions.push('(visitor_name LIKE ? OR nip LIKE ? OR origin_institution LIKE ? OR purpose LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (VISITOR_TYPES.has(visitorType)) { conditions.push('visitor_type = ?'); params.push(visitorType); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) { conditions.push('DATE(checked_in_at) >= ?'); params.push(dateFrom); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) { conditions.push('DATE(checked_in_at) <= ?'); params.push(dateTo); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRows = await queryAsync(`SELECT COUNT(*) AS total FROM guestbook_visits ${where}`, params);
    const rows = await queryAsync(`
      SELECT id, opd_id, opd_name, visitor_type, visitor_name,
        COALESCE(
          NULLIF(gender, ''),
          CASE WHEN visitor_type = 'internal' THEN (
            SELECT CASE
              WHEN UPPER(TRIM(b.jenis_kelamin)) IN ('M', 'L', 'LAKI-LAKI', 'LAKI LAKI', 'MALE') THEN 'L'
              WHEN UPPER(TRIM(b.jenis_kelamin)) IN ('F', 'P', 'PEREMPUAN', 'FEMALE') THEN 'P'
              ELSE NULL
            END
            FROM simpeg.biodata b
            WHERE b.nip = guestbook_visits.nip
            LIMIT 1
          ) ELSE NULL END
        ) AS gender,
        nip,
        origin_institution, position_name, office_name,
        COALESCE(
          NULLIF(phone, ''),
          CASE WHEN visitor_type = 'internal' THEN (
            SELECT b.kontak
            FROM simpeg.biodata b
            WHERE b.nip = guestbook_visits.nip
            LIMIT 1
          ) ELSE NULL END
        ) AS phone,
        purpose, checked_in_at
      FROM guestbook_visits ${where}
      ORDER BY checked_in_at DESC
      LIMIT ${offset}, ${limit}
    `, params);
    const total = Number(countRows[0]?.total || 0);

    return res.json({ success: true, data: rows, total, total_pages: Math.max(1, Math.ceil(total / limit)), page, scope });
  } catch (error) {
    console.error('[GUESTBOOK] visits:', error.message);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal memuat monitoring tamu.' });
  }
});

router.put('/visits/:id', requirePermission('guestbook_monitoring', 'update'), async (req, res) => {
  try {
    await ensureGuestbookTables();
    const scope = await resolveScope(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(422).json({ success: false, message: 'Data kunjungan tidak valid.' });
    }

    const conditions = ['id = ?'];
    const params = [id];
    if (scope) { conditions.push('opd_id = ?'); params.push(scope.id); }

    const visits = await queryAsync(`
      SELECT id, visitor_type
      FROM guestbook_visits
      WHERE ${conditions.join(' AND ')}
      LIMIT 1
    `, params);
    if (!visits.length) return res.status(404).json({ success: false, message: 'Kunjungan tidak ditemukan pada OPD Anda.' });

    const visitorType = visits[0].visitor_type;
    const visitorName = cleanText(req.body.visitor_name, 200);
    const purpose = cleanText(req.body.purpose, 1000);
    const gender = normalizeGender(req.body.gender);
    const nip = visitorType === 'internal' ? (cleanText(req.body.nip, 40) || null) : null;
    const institution = cleanText(req.body.institution, 255);
    const position = cleanText(req.body.position, 180);
    const phone = cleanText(req.body.phone, 30);

    if (visitorName.length < 3 || purpose.length < 3) {
      return res.status(422).json({ success: false, message: 'Nama dan urusan wajib diisi dengan benar.' });
    }
    if (visitorType !== 'internal' && (!gender || institution.length < 2 || position.length < 2 || !/^[0-9+()\-\s]{8,30}$/.test(phone))) {
      return res.status(422).json({ success: false, message: 'Lengkapi jenis kelamin, instansi atau asal, jabatan, dan nomor HP yang valid.' });
    }

    await queryAsync(`
      UPDATE guestbook_visits
      SET visitor_name = ?, gender = ?, nip = ?, origin_institution = ?,
          position_name = ?, office_name = ?, phone = ?, purpose = ?
      WHERE ${conditions.join(' AND ')}
    `, [visitorName, gender, nip, institution || null, position || null, institution || null, phone || null, purpose, ...params]);

    return res.json({ success: true, message: 'Data kunjungan berhasil diperbarui.' });
  } catch (error) {
    console.error('[GUESTBOOK] update visit:', error.message);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal memperbarui data kunjungan.' });
  }
});

router.delete('/visits/:id', requirePermission('guestbook_monitoring', 'delete'), async (req, res) => {
  try {
    await ensureGuestbookTables();
    const scope = await resolveScope(req);
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(422).json({ success: false, message: 'Data kunjungan tidak valid.' });
    }

    const conditions = ['id = ?'];
    const params = [id];
    if (scope) { conditions.push('opd_id = ?'); params.push(scope.id); }
    const result = await queryAsync(`DELETE FROM guestbook_visits WHERE ${conditions.join(' AND ')}`, params);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Kunjungan tidak ditemukan pada OPD Anda.' });
    return res.json({ success: true, message: 'Data kunjungan berhasil dihapus.' });
  } catch (error) {
    console.error('[GUESTBOOK] delete visit:', error.message);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal menghapus data kunjungan.' });
  }
});

router.get('/qr', requirePermission('guestbook_qr', 'read'), async (req, res) => {
  try {
    await ensureGuestbookTables();
    const scope = await resolveScope(req, req.query.opd_id, req.query.opd_name);
    if (!scope) return res.json({ success: true, data: null, scope: null });
    const rows = await queryAsync(`
      SELECT id, token, opd_id, opd_name, label, wifi_ssid, wifi_password,
        is_active, created_by_name, created_at
      FROM guestbook_locations
      WHERE opd_id = ? AND is_active = 1
      ORDER BY id DESC LIMIT 1
    `, [scope.id]);
    return res.json({ success: true, data: rows[0] || null, scope });
  } catch (error) {
    console.error('[GUESTBOOK] current QR:', error.message);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal memuat QR Buku Tamu.' });
  }
});

router.post('/qr', requirePermission('guestbook_qr', 'create'), async (req, res) => {
  try {
    await ensureGuestbookTables();
    const scope = await resolveScope(req, req.body.opd_id, req.body.opd_name);
    if (!scope) return res.status(422).json({ success: false, message: 'Pilih OPD yang akan dibuatkan QR Buku Tamu.' });
    const label = cleanText(req.body.label, 120) || 'Meja Resepsionis';
    const wifiSsid = cleanText(req.body.wifi_ssid, 120) || null;
    const wifiPassword = wifiSsid ? (cleanText(req.body.wifi_password, 120) || 'FREE') : null;
    const token = crypto.randomBytes(32).toString('hex');

    const result = await withTransaction(async (transactionQuery) => {
      await transactionQuery('UPDATE guestbook_locations SET is_active = 0 WHERE opd_id = ? AND is_active = 1', [scope.id]);
      return transactionQuery(`
        INSERT INTO guestbook_locations
          (token, opd_id, opd_name, label, wifi_ssid, wifi_password, created_by, created_by_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [token, scope.id, scope.name, label, wifiSsid, wifiPassword, cleanText(req.user?.nip || req.user?._id, 100), cleanText(req.user?.nama, 200)]);
    });

    return res.status(201).json({
      success: true,
      message: 'QR Buku Tamu berhasil dibuat. QR sebelumnya untuk OPD ini otomatis dinonaktifkan.',
      data: {
        id: result.insertId,
        token,
        opd_id: scope.id,
        opd_name: scope.name,
        label,
        wifi_ssid: wifiSsid,
        wifi_password: wifiPassword,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[GUESTBOOK] generate QR:', error.message);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal membuat QR Buku Tamu.' });
  }
});

module.exports = router;
module.exports.ensureGuestbookTables = ensureGuestbookTables;
