const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const middleware = require('../auth/middlewares');
var db = require('../db/MySql/utama');

// ═══════════════════════════════════════════════
// GET /api/v1/profile — Ambil data profil user
// ═══════════════════════════════════════════════
router.get('/', middleware.isLoggedIn, (req, res) => {
  const userId = req.user._id

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User tidak terautentikasi' })
  }

  const sql = `SELECT id, username, nama, hp, email FROM users WHERE id = ?`

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('❌ GET PROFILE DB ERROR:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' })
    }

    const user = rows[0]

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        hp: user.hp,
        email: user.email
      }
    })
  })
})

// ═══════════════════════════════════════════════
// PUT /api/v1/profile — Update data profil user
// ═══════════════════════════════════════════════
router.put('/', middleware.isLoggedIn, (req, res) => {
  const userId = req.user._id

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User tidak terautentikasi' })
  }

  const { username, nama, hp, email } = req.body

  // Validasi dasar
  if (!username || !nama || !hp || !email) {
    return res.status(422).json({
      success: false,
      message: 'Semua field (username, nama, hp, email) wajib diisi'
    })
  }

  if (username.length < 3) {
    return res.status(422).json({ success: false, message: 'Username minimal 3 karakter' })
  }

  if (nama.length < 3) {
    return res.status(422).json({ success: false, message: 'Nama minimal 3 karakter' })
  }

  if (hp.length < 8) {
    return res.status(422).json({ success: false, message: 'Nomor HP minimal 8 digit' })
  }

  // Cek apakah username atau email sudah dipakai user lain
  const checkSql = `SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?`

  db.query(checkSql, [username, email, userId], (err, rows) => {
    if (err) {
      console.error('❌ CHECK DUPLICATE DB ERROR:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }

    if (rows && rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username atau email sudah digunakan oleh akun lain'
      })
    }

    // Update data
    const updateSql = `
      UPDATE users 
      SET username = ?, nama = ?, hp = ?, email = ?
      WHERE id = ?
    `

    db.query(updateSql, [username, nama, hp, email, userId], (err, result) => {
      if (err) {
        console.error('❌ UPDATE PROFILE DB ERROR:', err)
        return res.status(500).json({ success: false, message: 'Gagal menyimpan profil' })
      }

      console.log('✅ PROFILE UPDATED:', username)

      return res.json({
        success: true,
        message: 'Profil berhasil diperbarui',
        data: { username, nama, hp, email }
      })
    })
  })
})

// ═══════════════════════════════════════════════
// PUT /api/v1/profile/password — Ganti password
// ═══════════════════════════════════════════════
router.put('/password', middleware.isLoggedIn, (req, res) => {
  const userId = req.user._id

  if (!userId) {
    return res.status(401).json({ success: false, message: 'User tidak terautentikasi' })
  }

  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(422).json({
      success: false,
      message: 'Password lama dan password baru wajib diisi'
    })
  }

  if (newPassword.length < 6) {
    return res.status(422).json({ success: false, message: 'Password baru minimal 6 karakter' })
  }

  // Ambil password lama dari DB
  const sql = `SELECT password FROM users WHERE id = ?`

  db.query(sql, [userId], async (err, rows) => {
    if (err) {
      console.error('❌ GET PASSWORD DB ERROR:', err)
      return res.status(500).json({ success: false, message: 'Database error' })
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' })
    }

    try {
      const match = await bcrypt.compare(currentPassword, rows[0].password)
      if (!match) {
        return res.status(422).json({ success: false, message: 'Password lama salah' })
      }

      const hashed = await bcrypt.hash(newPassword, 12)

      const updateSql = `UPDATE users SET password = ? WHERE id = ?`

      db.query(updateSql, [hashed, userId], (err, result) => {
        if (err) {
          console.error('❌ UPDATE PASSWORD DB ERROR:', err)
          return res.status(500).json({ success: false, message: 'Gagal mengubah password' })
        }

        console.log('✅ PASSWORD CHANGED for user:', userId)

        return res.json({
          success: true,
          message: 'Password berhasil diubah'
        })
      })
    } catch (e) {
      console.error('❌ BCRYPT ERROR:', e)
      return res.status(500).json({ success: false, message: 'Error processing password' })
    }
  })
})

module.exports = router;
