const express = require('express');
const router = express.Router();
const db = require('../db/MySql/utama');
const uniqid = require('uniqid');
const middleware = require('../auth/middlewares');

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/realisasi/view — List Program Realisasi
// ═══════════════════════════════════════════════════════════════
router.post('/view', (req, res) => {
  const data_batas = Number(req.body.page_limit) || 10;
  const page_first = Number(req.body.data_ke) || 1;
  const data_star = (page_first - 1) * data_batas;
  const cari = req.body.cari_value || '';
  const tahun = req.body.tahun ? Number(req.body.tahun) : null;
  const opd = req.body.opd ? req.body.opd.trim() : '';

  let conditions = [];
  let params = [];

  if (tahun) {
    conditions.push('tahun = ?');
    params.push(tahun);
  }

  if (opd && opd !== 'all') {
    conditions.push('opd = ?');
    params.push(opd);
  }

  if (cari && cari.trim() !== '') {
    conditions.push('(nama_program LIKE ? OR opd LIKE ?)');
    params.push(`%${cari}%`, `%${cari}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) AS total FROM realisasi_setara ${whereClause}`;
  const dataSql = `
    SELECT 
      id,
      tahun,
      nama_program,
      realisasi_anggaran,
      volume,
      satuan,
      opd,
      createdBy,
      creatorName,
      createdAt
    FROM realisasi_setara
    ${whereClause}
    ORDER BY tahun DESC, id DESC
    LIMIT ${data_star}, ${data_batas}
  `;

  db.query(countSql, params, (err, countRes) => {
    if (err) {
      console.error('realisasi count error:', err);
      return res.status(500).json({ error: err.message });
    }

    const totalData = countRes[0] ? countRes[0].total : 0;
    let totalHalaman = Math.ceil(totalData / data_batas) || 1;

    db.query(dataSql, params, (err2, dataRes) => {
      if (err2) {
        console.error('realisasi data error:', err2);
        return res.status(500).json({ error: err2.message });
      }

      res.json({
        data: dataRes || [],
        jml_data: totalHalaman,
        total: totalData,
      });
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/realisasi/summary — Ringkasan Total
// ═══════════════════════════════════════════════════════════════
router.get('/summary', (req, res) => {
  const tahun = req.query.tahun ? Number(req.query.tahun) : null;
  const opd = req.query.opd ? req.query.opd.trim() : null;

  let conditions = [];
  let params = [];

  if (tahun) {
    conditions.push('tahun = ?');
    params.push(tahun);
  }

  if (opd && opd !== 'all') {
    conditions.push('opd = ?');
    params.push(opd);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const summarySql = `
    SELECT 
      COUNT(*) AS total_program,
      COALESCE(SUM(realisasi_anggaran), 0) AS total_realisasi
    FROM realisasi_setara
    ${whereClause}
  `;

  db.query(summarySql, params, (err, sumRes) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      total_program: sumRes[0]?.total_program || 0,
      total_realisasi: sumRes[0]?.total_realisasi || 0,
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/realisasi/years — Daftar Tahun Tersedia
// ═══════════════════════════════════════════════════════════════
router.get('/years', (req, res) => {
  const sql = `SELECT DISTINCT tahun FROM realisasi_setara ORDER BY tahun DESC`;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const years = rows.map(r => r.tahun);
    const currentYear = new Date().getFullYear();
    if (!years.includes(currentYear)) {
      years.unshift(currentYear);
    }
    res.json({ years });
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/realisasi/add — Tambah Program Realisasi (Auto Assign OPD)
// ═══════════════════════════════════════════════════════════════
router.post('/add', middleware.isLoggedIn, (req, res) => {
  const { tahun, nama_program, realisasi_anggaran, volume, satuan, opd } = req.body;

  if (!nama_program || !tahun) {
    return res.status(400).json({ success: false, message: 'Tahun dan Nama program wajib diisi' });
  }

  const userRole = Number(req.user?.menu_klp);
  const userOpd = req.user?.opd || req.user?.profile?.opd || 'OPD Konawe Selatan';
  const assignedOpd = userRole === 1 && opd ? opd.trim() : userOpd;
  const createdBy = req.user?.nip || req.user?.username || 'Admin';
  const creatorName = req.user?.nama || 'Admin';

  const id = uniqid();
  const sql = `
    INSERT INTO realisasi_setara 
    (id, tahun, nama_program, realisasi_anggaran, volume, satuan, opd, createdBy, creatorName)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      id,
      Number(tahun),
      nama_program,
      Number(realisasi_anggaran) || 0,
      Number(volume) || 0,
      satuan || 'Paket',
      assignedOpd,
      createdBy,
      creatorName,
    ],
    (err) => {
      if (err) {
        console.error('Insert realisasi error:', err);
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, message: 'Program berhasil ditambahkan', id, opd: assignedOpd });
    }
  );
});

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/realisasi/edit — Edit Program Realisasi (OPD Protection)
// ═══════════════════════════════════════════════════════════════
router.post('/edit', middleware.isLoggedIn, (req, res) => {
  const { id, tahun, nama_program, realisasi_anggaran, volume, satuan, opd } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: 'ID data wajib disertakan' });
  }

  const userRole = Number(req.user?.menu_klp);
  const userOpd = (req.user?.opd || req.user?.profile?.opd || '').trim().toLowerCase();
  const updatedBy = req.user?.nama || req.user?.username || 'Admin';

  // 1. Cek kepemilikan data sebelum edit
  db.query('SELECT * FROM realisasi_setara WHERE id = ?', [id], (errCheck, rowsCheck) => {
    if (errCheck) return res.status(500).json({ success: false, message: errCheck.message });
    if (!rowsCheck || rowsCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Data program tidak ditemukan' });
    }

    const existing = rowsCheck[0];
    const existingOpd = (existing.opd || '').trim().toLowerCase();

    // Jika bukan Super Admin (role !== 1), pastikan OPD-nya cocok
    if (userRole !== 1 && existingOpd && userOpd && existingOpd !== userOpd) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda hanya dapat mengubah program milik instansi Anda (${req.user?.opd}). Program ini adalah milik ${existing.opd}.`,
      });
    }

    const newOpd = userRole === 1 && opd ? opd.trim() : (existing.opd || req.user?.opd || 'OPD Konawe Selatan');

    const sql = `
      UPDATE realisasi_setara 
      SET 
        tahun = ?,
        nama_program = ?,
        realisasi_anggaran = ?,
        volume = ?,
        satuan = ?,
        opd = ?,
        updatedBy = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        Number(tahun),
        nama_program,
        Number(realisasi_anggaran) || 0,
        Number(volume) || 0,
        satuan || 'Paket',
        newOpd,
        updatedBy,
        id,
      ],
      (err, result) => {
        if (err) {
          console.error('Update realisasi error:', err);
          return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: 'Data berhasil diperbarui' });
      }
    );
  });
});

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/realisasi/remove — Hapus Program Realisasi (OPD Protection)
// ═══════════════════════════════════════════════════════════════
router.post('/remove', middleware.isLoggedIn, (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ success: false, message: 'ID data wajib disertakan' });

  const userRole = Number(req.user?.menu_klp);
  const userOpd = (req.user?.opd || req.user?.profile?.opd || '').trim().toLowerCase();

  // 1. Cek kepemilikan data sebelum hapus
  db.query('SELECT * FROM realisasi_setara WHERE id = ?', [id], (errCheck, rowsCheck) => {
    if (errCheck) return res.status(500).json({ success: false, message: errCheck.message });
    if (!rowsCheck || rowsCheck.length === 0) {
      return res.status(404).json({ success: false, message: 'Data program tidak ditemukan' });
    }

    const existing = rowsCheck[0];
    const existingOpd = (existing.opd || '').trim().toLowerCase();

    // Jika bukan Super Admin (role !== 1), pastikan OPD-nya cocok
    if (userRole !== 1 && existingOpd && userOpd && existingOpd !== userOpd) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda hanya dapat menghapus program milik instansi Anda (${req.user?.opd}). Program ini adalah milik ${existing.opd}.`,
      });
    }

    const sql = `DELETE FROM realisasi_setara WHERE id = ?`;
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: 'Data program berhasil dihapus' });
    });
  });
});

module.exports = router;
