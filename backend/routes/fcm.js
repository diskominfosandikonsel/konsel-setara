const express = require('express')
const router = express.Router()
const db = require('../db/MySql/utama') // adjust path if needed

// ⚠️ REMOVE req.user dependency for now
// (or ensure auth middleware is properly installed)

router.post('/save-token', (req, res) => {
  const { userId, token, device } = req.body

  if (!userId || !token) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  // 🔥 UPSERT STYLE (safe for duplicates)
  // Jika token sudah ada (HP yang sama), update user_id ke user yang baru login
  const sql = `
    INSERT INTO users_fcm_tokens (user_id, token, device)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      user_id = VALUES(user_id),
      device = VALUES(device)
  `

  db.query(sql, [userId, token, device || 'android'], (err) => {
    if (err) {
      console.error('DB ERROR:', err)
      return res.status(500).json(err)
    }

    res.json({
      success: true,
      message: 'Token saved/updated'
    })
  })
})

router.post('/remove-token', (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const sql = `DELETE FROM users_fcm_tokens WHERE token = ?`

  db.query(sql, [token], (err) => {
    if (err) {
      console.error('DB ERROR:', err)
      return res.status(500).json(err)
    }

    res.json({
      success: true,
      message: 'Token removed'
    })
  })
})

module.exports = router