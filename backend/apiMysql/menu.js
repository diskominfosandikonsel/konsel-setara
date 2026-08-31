const express = require('express');
const router = express.Router();
const db = require('../db/MySql/utama');
const uniqid = require('uniqid');
const middleware = require('../auth/middlewares');

// Inisialisasi tabel jika belum ada
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(100) DEFAULT '',
    img VARCHAR(255) DEFAULT '',
    route VARCHAR(255) DEFAULT '',
    urutan INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(createTableQuery, (err) => {
  if (err) {
    console.error('❌ Gagal inisialisasi tabel menu_items:', err.message);
  } else {
    // Cek apakah tabel kosong, jika kosong isi dengan default menu items
    db.query('SELECT COUNT(*) as count FROM menu_items', (errCount, resCount) => {
      if (!errCount && resCount[0].count === 0) {
        const defaultMenus = [
          { label: 'Sippadu', icon: 'description', img: 'icons/sippadu.png', route: 'sippadu', urutan: 1 },
          { label: 'Sapa Konsel', icon: 'support_agent', img: 'icons/sapakonsel.png', route: 'sapa_dashboard', urutan: 2 },
          { label: 'Firetap', icon: 'local_fire_department', img: 'icons/firetap.png', route: 'firetap', urutan: 3 },
          { label: 'Konsel Smart', icon: 'smart_toy', img: 'icons/konsel_smart.png', route: 'konsel_smart', urutan: 4 },
          { label: 'SKM', icon: 'reviews', img: 'icons/skm.png', route: 'skm', urutan: 5 },
          { label: 'Hibah', icon: 'volunteer_activism', img: 'icons/hibah.png', route: 'hibah', urutan: 6 },
          { label: 'CSR', icon: 'handshake', img: 'icons/csr.png', route: 'csr', urutan: 7 },
          { label: 'Lainnya', icon: 'apps', img: '', route: 'lainnya', urutan: 8 }
        ];

        defaultMenus.forEach((m) => {
          db.query(
            `INSERT INTO menu_items (id, label, icon, img, route, urutan, is_active, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
            [uniqid(), m.label, m.icon, m.img, m.route, m.urutan]
          );
        });
        console.log('✅ Default menu items berhasil diinisialisasi');
      }
    });
  }
});

// ═══════════════════════════════════════════════
// GET /api/v1/menu/list — List menu aktif untuk Mobile App
// ═══════════════════════════════════════════════
router.get('/list', (req, res) => {
  const sql = `SELECT * FROM menu_items WHERE is_active = 1 ORDER BY urutan ASC, createdAt ASC`;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    return res.json({ success: true, data: rows });
  });
});

// ═══════════════════════════════════════════════
// POST /api/v1/menu/view — List semua menu untuk Admin
// ═══════════════════════════════════════════════
router.post('/view', (req, res) => {
  const data_batas = Number(req.body.page_limit) || 20;
  const page_first = Number(req.body.data_ke) || 1;
  const data_star = (page_first - 1) * data_batas;
  const cari = req.body.cari_value || '';

  let whereClause = '';
  let params = [];
  if (cari) {
    whereClause = ` WHERE label LIKE ? OR route LIKE ?`;
    params = [`%${cari}%`, `%${cari}%`];
  }

  const countSql = `SELECT COUNT(*) AS total FROM menu_items ${whereClause}`;
  const dataSql = `SELECT * FROM menu_items ${whereClause} ORDER BY urutan ASC, createdAt ASC LIMIT ${data_star}, ${data_batas}`;

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
// POST /api/v1/menu/add — Tambah Menu Baru
// ═══════════════════════════════════════════════
router.post('/add', middleware.isLoggedIn, (req, res) => {
  if (req.user.menu_klp != 1) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

  const { label, icon, img, route, urutan, is_active } = req.body;
  const id = uniqid();

  const sql = `INSERT INTO menu_items (id, label, icon, img, route, urutan, is_active, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
  db.query(sql, [id, label, icon || '', img || '', route || '', urutan || 0, is_active !== undefined ? is_active : 1], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal menambah menu: ' + err.message });
    return res.json({ success: true, message: 'Menu berhasil ditambahkan', id });
  });
});

// ═══════════════════════════════════════════════
// POST /api/v1/menu/edit — Update Menu
// ═══════════════════════════════════════════════
router.post('/edit', middleware.isLoggedIn, (req, res) => {
  if (req.user.menu_klp != 1) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

  const { id, label, icon, img, route, urutan, is_active } = req.body;
  if (!id) return res.status(422).json({ success: false, message: 'ID menu wajib disertakan' });

  const sql = `UPDATE menu_items SET label = ?, icon = ?, img = ?, route = ?, urutan = ?, is_active = ? WHERE id = ?`;
  db.query(sql, [label, icon || '', img || '', route || '', urutan || 0, is_active !== undefined ? is_active : 1, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal update menu: ' + err.message });
    return res.json({ success: true, message: 'Menu berhasil diperbarui' });
  });
});

// ═══════════════════════════════════════════════
// POST /api/v1/menu/remove — Hapus Menu
// ═══════════════════════════════════════════════
router.post('/remove', middleware.isLoggedIn, (req, res) => {
  if (req.user.menu_klp != 1) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

  const { id } = req.body;
  if (!id) return res.status(422).json({ success: false, message: 'ID menu wajib disertakan' });

  const sql = `DELETE FROM menu_items WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus menu: ' + err.message });
    return res.json({ success: true, message: 'Menu berhasil dihapus' });
  });
});

// ═══════════════════════════════════════════════
// POST /api/v1/menu/reorder — Reorder Urutan Menu
// ═══════════════════════════════════════════════
router.post('/reorder', middleware.isLoggedIn, (req, res) => {
  if (req.user.menu_klp != 1) return res.status(403).json({ success: false, message: 'Akses ditolak.' });

  const { orders } = req.body;
  if (!Array.isArray(orders)) return res.status(422).json({ success: false, message: 'Invalid data' });

  let completed = 0;
  let hasError = false;

  if (orders.length === 0) return res.json({ success: true, message: 'No items' });

  orders.forEach((item) => {
    db.query('UPDATE menu_items SET urutan = ? WHERE id = ?', [item.urutan, item.id], (err) => {
      if (err) hasError = true;
      completed++;
      if (completed === orders.length) {
        if (hasError) return res.status(500).json({ success: false, message: 'Gagal update urutan' });
        return res.json({ success: true, message: 'Urutan berhasil disimpan' });
      }
    });
  });
});

module.exports = router;
