const express = require('express');
const router = express.Router();
const db = require('../db/MySql/utama');
const bcrypt = require('bcryptjs');
const uniqid = require('uniqid');
const middleware = require('../auth/middlewares');

// ═══════════════════════════════════════════════
// POST /api/v1/users/view — List Users
// ═══════════════════════════════════════════════
router.post('/view', middleware.isLoggedIn, (req, res) => {
  const role = Number(req.user?.menu_klp);
  if (role !== 1 && role !== 2) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

  const data_batas = Number(req.body.page_limit) || 10;
  const page_first = Number(req.body.data_ke) || 1;
  const data_star = (page_first - 1) * data_batas;
  const cari = req.body.cari_value || '';

  let whereClause = '';
  let params = [];
  if (cari) {
    whereClause = ` WHERE nama LIKE ? OR username LIKE ? OR email LIKE ? OR hp LIKE ?`;
    params = [`%${cari}%`, `%${cari}%`, `%${cari}%`, `%${cari}%`];
  }

  const countSql = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
  const dataSql = `
    SELECT id, username, nama, email, hp, menu_klp, createdAt 
    FROM users 
    ${whereClause} 
    ORDER BY createdAt DESC 
    LIMIT ${data_star}, ${data_batas}
  `;

  db.query(countSql, params, (err, countRes) => {
    if (err) return res.status(500).json({ error: err.message });

    const totalData = countRes[0].total;
    let totalHalaman = Math.ceil(totalData / data_batas) || 1;

    db.query(dataSql, params, (err2, dataRes) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({
        data: dataRes,
        jml_data: totalHalaman,
        total: totalData
      });
    });
  });
});

// ═══════════════════════════════════════════════
// POST /api/v1/users/add — Tambah User Baru
// ═══════════════════════════════════════════════
router.post('/add', middleware.isLoggedIn, async (req, res) => {
  if (req.user.menu_klp != 1) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

  const { username, nama, email, hp, password, menu_klp } = req.body;
  if (!username || !password || !nama) {
    return res.status(422).json({ success: false, message: 'Username, Nama, dan Password wajib diisi' });
  }

  try {
    const hashed = await bcrypt.hash(password, 12);
    const id = uniqid();

    const sql = `
      INSERT INTO users (id, username, nama, email, hp, password, menu_klp, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(sql, [id, username, nama, email || '', hp || '', hashed, menu_klp || 3], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ success: false, message: 'Username atau email sudah digunakan' });
        }
        return res.status(500).json({ success: false, message: 'Gagal menambah user: ' + err.message });
      }
      return res.json({ success: true, message: 'User berhasil ditambahkan', id });
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Error hashing password' });
  }
});

// ═══════════════════════════════════════════════
// POST /api/v1/users/edit — Update User
// ═══════════════════════════════════════════════
router.post('/edit', middleware.isLoggedIn, async (req, res) => {
  if (req.user.menu_klp != 1) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

  const { id, nama, email, hp, menu_klp, password } = req.body;
  if (!id) return res.status(422).json({ success: false, message: 'ID user wajib diisi' });

  if (password && password.trim() !== '') {
    try {
      const hashed = await bcrypt.hash(password, 12);
      const sql = `UPDATE users SET nama = ?, email = ?, hp = ?, menu_klp = ?, password = ? WHERE id = ?`;
      db.query(sql, [nama, email || '', hp || '', menu_klp || 3, hashed, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Gagal update user: ' + err.message });
        return res.json({ success: true, message: 'Data dan password user berhasil diperbarui' });
      });
    } catch (e) {
      return res.status(500).json({ success: false, message: 'Error hashing password' });
    }
  } else {
    const sql = `UPDATE users SET nama = ?, email = ?, hp = ?, menu_klp = ? WHERE id = ?`;
    db.query(sql, [nama, email || '', hp || '', menu_klp || 3, id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Gagal update user: ' + err.message });
      return res.json({ success: true, message: 'Data user berhasil diperbarui' });
    });
  }
});

// ═══════════════════════════════════════════════
// POST /api/v1/users/remove — Hapus User
// ═══════════════════════════════════════════════
router.post('/remove', middleware.isLoggedIn, (req, res) => {
  if (req.user.menu_klp != 1) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

  const { id } = req.body;
  if (!id) return res.status(422).json({ success: false, message: 'ID user wajib diisi' });

  // Cegah menghapus akun sendiri
  if (req.user._id === id || req.user.id === id) {
    return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun yang sedang digunakan' });
  }

  const sql = `DELETE FROM users WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus user: ' + err.message });
    return res.json({ success: true, message: 'User berhasil dihapus' });
  });
});

module.exports = router;
