const express = require('express')
const router = express.Router()

router.post('/save-token', (req, res) => {
  const userId = req.user._id
  const { token, device } = req.body

  if (!token) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  db.query(
    'SELECT * FROM users_fcm_tokens WHERE token = ?',
    [token],
    (err, rows) => {
      if (rows.length > 0) {
        return res.json({ message: 'Token already exists' })
      }

      db.query(
        'INSERT INTO users_fcm_tokens (user_id, token, device) VALUES (?, ?, ?)',
        [userId, token, device || 'android'],
        (err) => {
          if (err) return res.status(500).json(err)

          res.json({ success: true })
        }
      )
    }
  )
})

module.exports = router