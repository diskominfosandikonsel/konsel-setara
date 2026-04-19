const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db/MySql/utama');
const upload = require('../db/multer/image');
const middleware = require('../auth/middlewares');

// ═══════════════════════════════════════════════
// GET /api/v1/slider — Ambil semua data slider
// ═══════════════════════════════════════════════
router.get('/', (req, res) => {
  const sql = `SELECT * FROM slider ORDER BY createdAt DESC`
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ GET SLIDER DB ERROR:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }

    return res.json({
      success: true,
      data: rows
    })
  })
})

// ═══════════════════════════════════════════════
// POST /api/v1/slider — Tambah data slider (Admin Only)
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// POST /api/v1/slider — Tambah slider (Admin Only)
// ═══════════════════════════════════════════════
router.post('/',
  middleware.isLoggedIn,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return res.status(422).json({ success: false, message: 'Gagal upload: ' + err.message });
      next();
    });
  },
  (req, res) => {
    if (req.user.menu_klp != 1) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const { link } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(422).json({ success: false, message: 'File gambar wajib diunggah' });
    }

    const sql = `INSERT INTO slider (img, link, createdAt) VALUES (?, ?, NOW())`;
    db.query(sql, [file.filename, link || ''], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Gagal menyimpan data slider' });
      }

      return res.json({
        success: true,
        message: 'slider berhasil ditambahkan',
        data: {
          id: result.insertId,
          img: file.filename,
          link: link
        }
      });
    });
  }
);

// ═══════════════════════════════════════════════
// DELETE /api/v1/slider/:id — Hapus slider (Admin Only)
// ═══════════════════════════════════════════════
router.delete('/:id', middleware.isLoggedIn, (req, res) => {
  if (req.user.menu_klp != 1) {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin yang boleh menghapus slider.' })
  }

  const { id } = req.params

  // 1. Cari data slider dulu untuk mendapatkan nama file gambarnya
  db.query('SELECT img FROM slider WHERE id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Gagal mencari data' })
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' })

    const fileName = rows[0].img

    // 2. Hapus file fisik jika ada
    if (fileName) {
      const filePath = path.join(__dirname, '../uploads', fileName)
      fs.unlink(filePath, (err) => {
        if (err) console.log('⚠️ Gagal menghapus file fisik atau file tidak ditemukan:', err.message)
        else console.log('✅ File fisik berhasil dihapus:', fileName)
      })
    }

    // 3. Hapus data dari database
    db.query('DELETE FROM slider WHERE id = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Gagal menghapus data di database' })
      return res.json({ success: true, message: 'Slider dan file gambar berhasil dihapus' })
    })
  })
})

// ═══════════════════════════════════════════════
// PUT /api/v1/slider/:id — Update data slider (Admin Only)
// ═══════════════════════════════════════════════
router.put('/:id', middleware.isLoggedIn,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.log('❌ Multer PUT error:', err.message)
        return res.status(422).json({ success: false, message: err.message })
      }
      next()
    })
  },
  (req, res) => {
    if (req.user.menu_klp != 1) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' })
    }

    const { id } = req.params
    const { link } = req.body
    const file = req.file

    if (file) {
      // Jika ada file baru:
      // 1. Cari & hapus file lama untuk menghemat storage
      db.query('SELECT img FROM slider WHERE id = ?', [id], (err, rows) => {
        if (!err && rows.length > 0 && rows[0].img) {
          const oldFile = rows[0].img
          const oldPath = path.join(__dirname, '../uploads', oldFile)
          fs.unlink(oldPath, (err) => {
            if (err) console.log('⚠️ Gagal menghapus file lama:', err.message)
          })
        }

        // 2. Update dengan nama file baru
        const imagePath = file.filename
        const sql = `UPDATE slider SET img = ?, link = ? WHERE id = ?`
        db.query(sql, [imagePath, link || '', id], (err, result) => {
          if (err) {
            console.error('❌ PUT SLIDER (img+link) ERROR:', err)
            return res.status(500).json({ success: false, message: 'Gagal update slider' })
          }
          return res.json({ success: true, message: 'Slider & gambar berhasil diperbarui' })
        })
      })
    } else {
      // Jika tidak ada file baru, hanya update link
      const sql = `UPDATE slider SET link = ? WHERE id = ?`
      db.query(sql, [link || '', id], (err, result) => {
        if (err) {
          console.error('❌ PUT SLIDER (link) ERROR:', err)
          return res.status(500).json({ success: false, message: 'Gagal update link slider' })
        }
        return res.json({ success: true, message: 'Link slider berhasil diperbarui' })
      })
    }
  }
)

module.exports = router;
