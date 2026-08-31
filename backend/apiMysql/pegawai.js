const express = require('express');
const router = express.Router();
const db = require('../db/MySql/utama');
const uniqid = require('uniqid');
const middleware = require('../auth/middlewares');

// Helper to format full name cleanly without stray dashes
function formatNamaLengkap(row) {
  const gDepan = row.gelar_depan && row.gelar_depan.trim() !== '' && row.gelar_depan.trim() !== '-' 
    ? `${row.gelar_depan.trim()} ` 
    : '';
  const gBelakang = row.gelar_belakang && row.gelar_belakang.trim() !== '' && row.gelar_belakang.trim() !== '-' 
    ? `, ${row.gelar_belakang.trim()}` 
    : '';
  const rawNama = (row.nama || row.egov_username || '').replace(/^[-,\s]+|[-,\s]+$/g, '');
  return `${gDepan}${rawNama}${gBelakang}`.trim();
}

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/pegawai/instansi — Daftar Instansi / OPD (READ-ONLY)
// ═══════════════════════════════════════════════════════════════
router.get('/instansi', middleware.isLoggedIn, (req, res) => {
  const sql = `SELECT id, instansi FROM simpeg.instansi ORDER BY instansi ASC`;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows || [] });
  });
});

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/pegawai/unit_kerja — Daftar Unit Kerja berdasarkan Instansi (READ-ONLY)
// ═══════════════════════════════════════════════════════════════
router.get('/unit_kerja', middleware.isLoggedIn, (req, res) => {
  const instansiId = req.query.instansi_id;
  let sql = `SELECT id, unit_kerja, instansi FROM simpeg.unit_kerja`;
  let params = [];

  if (instansiId && instansiId !== 'all') {
    sql += ` WHERE instansi = ?`;
    params.push(instansiId);
  }
  sql += ` ORDER BY unit_kerja ASC`;

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: rows || [] });
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/pegawai/directory — Direktori Pegawai Lengkap dengan Status Hak Akses & Nama Jabatan
// ═══════════════════════════════════════════════════════════════
router.post('/directory', middleware.isLoggedIn, (req, res) => {
  if (Number(req.user?.menu_klp) !== 1) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }

  const page = Number(req.body.page) || 1;
  const limit = Number(req.body.limit) || 15;
  const offset = (page - 1) * limit;

  const instansiId = req.body.instansi_id && req.body.instansi_id !== 'all' ? req.body.instansi_id : null;
  const unitKerjaId = req.body.unit_kerja_id && req.body.unit_kerja_id !== 'all' ? req.body.unit_kerja_id : null;
  const cari = req.body.cari_value ? req.body.cari_value.trim() : '';
  const filterAkses = req.body.filter_akses || 'all'; // 'all', 'granted', 'ungranted'

  let whereClauses = ['1=1'];
  let params = [];

  if (instansiId) {
    whereClauses.push('simpeg.instansi.id = ?');
    params.push(instansiId);
  }

  if (unitKerjaId) {
    whereClauses.push('simpeg.unit_kerja.id = ?');
    params.push(unitKerjaId);
  }

  if (cari) {
    whereClauses.push('(egov.users.username LIKE ? OR simpeg.biodata.nip LIKE ? OR simpeg.biodata.nama LIKE ?)');
    params.push(`%${cari}%`, `%${cari}%`, `%${cari}%`);
  }

  if (filterAkses === 'granted') {
    whereClauses.push('konsel_setara.pegawai_akses.id IS NOT NULL AND konsel_setara.pegawai_akses.is_active = 1');
  } else if (filterAkses === 'ungranted') {
    whereClauses.push('(konsel_setara.pegawai_akses.id IS NULL OR konsel_setara.pegawai_akses.is_active = 0)');
  }

  const whereStr = whereClauses.join(' AND ');

  const countSql = `
    SELECT COUNT(DISTINCT egov.users.id) AS total
    FROM egov.users
    LEFT JOIN simpeg.biodata ON egov.users.nama_nip = simpeg.biodata.nip
    LEFT JOIN simpeg.unit_kerja ON egov.users.unit_kerja = simpeg.unit_kerja.id
    LEFT JOIN simpeg.instansi ON simpeg.instansi.id = simpeg.unit_kerja.instansi
    LEFT JOIN konsel_setara.pegawai_akses ON (konsel_setara.pegawai_akses.nip = simpeg.biodata.nip OR konsel_setara.pegawai_akses.nip = egov.users.username)
    WHERE ${whereStr}
  `;

  const dataSql = `
    SELECT 
      egov.users.id AS egov_id,
      egov.users.username AS egov_username,
      simpeg.biodata.nip AS nip,
      simpeg.biodata.nama AS nama,
      simpeg.biodata.gelar_depan AS gelar_depan,
      simpeg.biodata.gelar_belakang AS gelar_belakang,
      COALESCE(simpeg.jabatan.jabatan, simpeg.biodata.jenis_jabatan, 'Pegawai') AS jabatan_nama,
      simpeg.unit_kerja.id AS unit_kerja_id,
      simpeg.unit_kerja.unit_kerja AS unit_kerja,
      simpeg.instansi.id AS instansi_id,
      simpeg.instansi.instansi AS opd,
      konsel_setara.pegawai_akses.id AS akses_id,
      konsel_setara.pegawai_akses.menu_klp AS role_akses,
      konsel_setara.pegawai_akses.is_active AS is_active,
      konsel_setara.pegawai_akses.createdAt AS granted_at
    FROM egov.users
    LEFT JOIN simpeg.biodata ON egov.users.nama_nip = simpeg.biodata.nip
    LEFT JOIN simpeg.jabatan ON simpeg.biodata.jabatan = simpeg.jabatan._id
    LEFT JOIN simpeg.unit_kerja ON egov.users.unit_kerja = simpeg.unit_kerja.id
    LEFT JOIN simpeg.instansi ON simpeg.instansi.id = simpeg.unit_kerja.instansi
    LEFT JOIN konsel_setara.pegawai_akses ON (konsel_setara.pegawai_akses.nip = simpeg.biodata.nip OR konsel_setara.pegawai_akses.nip = egov.users.username)
    WHERE ${whereStr}
    GROUP BY egov.users.id
    ORDER BY (konsel_setara.pegawai_akses.is_active = 1) DESC, simpeg.biodata.nama ASC
    LIMIT ${offset}, ${limit}
  `;

  db.query(countSql, params, (err, countRes) => {
    if (err) {
      console.error('Directory count error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }

    const total = countRes[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    db.query(dataSql, params, (err2, rows) => {
      if (err2) {
        console.error('Directory data error:', err2);
        return res.status(500).json({ success: false, message: err2.message });
      }

      const formatted = (rows || []).map(r => {
        return {
          egov_id: r.egov_id,
          username: r.egov_username,
          nip: r.nip || r.egov_username,
          nama: formatNamaLengkap(r),
          jabatan: r.jabatan_nama || 'Pegawai',
          opd: r.opd || r.unit_kerja || 'OPD Konawe Selatan',
          unit_kerja: r.unit_kerja || '-',
          instansi_id: r.instansi_id,
          unit_kerja_id: r.unit_kerja_id,
          akses_id: r.akses_id,
          role_akses: r.is_active === 1 ? Number(r.role_akses || 2) : 0, // 0 = Belum Diberi Akses, 1 = Admin, 2 = Admin OPD
          is_active: r.is_active === 1,
          granted_at: r.granted_at,
        };
      });

      res.json({
        success: true,
        data: formatted,
        total,
        totalPages,
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/pegawai/lookup — Cari Pegawai di E-Gov / Simpeg (READ-ONLY)
// ═══════════════════════════════════════════════════════════════
router.post('/lookup', middleware.isLoggedIn, (req, res) => {
  if (Number(req.user?.menu_klp) !== 1) {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang dapat mencari data pegawai' });
  }

  const cari = req.body.cari_value ? req.body.cari_value.trim() : '';
  if (!cari || cari.length < 3) {
    return res.json({ data: [] });
  }

  const sql = `
    SELECT 
      egov.users.id AS egov_id,
      egov.users.username AS egov_username,
      simpeg.biodata.nip AS nip,
      simpeg.biodata.nama AS nama,
      simpeg.biodata.gelar_depan AS gelar_depan,
      simpeg.biodata.gelar_belakang AS gelar_belakang,
      COALESCE(simpeg.jabatan.jabatan, simpeg.biodata.jenis_jabatan, 'Pegawai') AS jabatan_nama,
      simpeg.unit_kerja.unit_kerja AS unit_kerja,
      simpeg.instansi.instansi AS opd
    FROM egov.users
    LEFT JOIN simpeg.biodata ON egov.users.nama_nip = simpeg.biodata.nip
    LEFT JOIN simpeg.jabatan ON simpeg.biodata.jabatan = simpeg.jabatan._id
    LEFT JOIN simpeg.unit_kerja ON egov.users.unit_kerja = simpeg.unit_kerja.id
    LEFT JOIN simpeg.instansi ON simpeg.instansi.id = simpeg.unit_kerja.instansi
    WHERE 
      egov.users.username LIKE ? 
      OR simpeg.biodata.nip LIKE ? 
      OR simpeg.biodata.nama LIKE ? 
      OR simpeg.instansi.instansi LIKE ?
    LIMIT 20;
  `;

  const params = [`%${cari}%`, `%${cari}%`, `%${cari}%`, `%${cari}%`];

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('Pegawai lookup error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }

    const formatted = (rows || []).map(r => {
      return {
        egov_id: r.egov_id,
        username: r.egov_username,
        nip: r.nip || r.egov_username,
        nama: formatNamaLengkap(r),
        jabatan: r.jabatan_nama || 'Pegawai',
        opd: r.opd || r.unit_kerja || 'Pemerintah Kabupaten Konawe Selatan',
      };
    });

    res.json({ success: true, data: formatted });
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/pegawai/set_role — Edit / Beri Hak Akses Pegawai
// ═══════════════════════════════════════════════════════════════
router.post('/set_role', middleware.isLoggedIn, (req, res) => {
  if (Number(req.user?.menu_klp) !== 1) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }

  const { nip, nama, opd, role } = req.body;
  const targetRole = Number(role); // 1 = Super Administrator, 2 = Admin OPD, 0 = Cabut Akses

  if (!nip) {
    return res.status(400).json({ success: false, message: 'NIP pegawai wajib diisi' });
  }

  if (targetRole === 0) {
    // Cabut Hak Akses
    const deleteSql = `DELETE FROM pegawai_akses WHERE nip = ?`;
    db.query(deleteSql, [nip], (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      return res.json({ success: true, message: `Hak akses untuk ${nama || nip} berhasil dicabut` });
    });
  } else {
    // Beri atau Ubah Hak Akses (Role 1 atau 2)
    const checkSql = `SELECT id FROM pegawai_akses WHERE nip = ?`;
    db.query(checkSql, [nip], (errCheck, rowsCheck) => {
      if (errCheck) return res.status(500).json({ success: false, message: errCheck.message });

      const roleName = targetRole === 1 ? 'Super Administrator' : 'Admin OPD';

      if (rowsCheck && rowsCheck.length > 0) {
        const updateSql = `
          UPDATE pegawai_akses 
          SET menu_klp = ?, is_active = 1, nama = ?, opd = ? 
          WHERE nip = ?
        `;
        db.query(updateSql, [targetRole, nama || 'Pegawai', opd || 'OPD Konawe Selatan', nip], (errUp) => {
          if (errUp) return res.status(500).json({ success: false, message: errUp.message });
          res.json({ success: true, message: `Hak akses berhasil diubah menjadi ${roleName}` });
        });
      } else {
        const id = uniqid();
        const createdBy = req.user?.nama || 'Super Admin';
        const insertSql = `
          INSERT INTO pegawai_akses (id, nip, nama, opd, menu_klp, is_active, createdBy)
          VALUES (?, ?, ?, ?, ?, 1, ?)
        `;
        db.query(insertSql, [id, nip, nama || 'Pegawai', opd || 'OPD Konawe Selatan', targetRole, createdBy], (errIns) => {
          if (errIns) return res.status(500).json({ success: false, message: errIns.message });
          res.json({ success: true, message: `Hak akses berhasil diberikan sebagai ${roleName}` });
        });
      }
    });
  }
});

module.exports = router;
