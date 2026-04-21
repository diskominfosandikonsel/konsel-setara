const express = require('express')
const router = express.Router()
const admin = require('../firebase')
const db = require('../db/MySql/utama') // adjust path if needed

const API_KEY = process.env.NOTIF_API_KEY

router.post('/send', (req, res) => {
  const key = req.headers['x-api-key']

  // 🔐 AUTH CHECK
  if (key !== API_KEY) {
    return res.status(403).json({ message: 'Forbidden' })
  }

  const { userId, title, body, data } = req.body

  if (!userId || !title || !body) {
    return res.status(400).json({ message: 'Missing fields' })
  }

  // 🔥 GET TOKENS FROM DATABASE
  db.query(
    'SELECT token FROM users_fcm_tokens WHERE user_id = ?',
    [userId],
    async (err, rows) => {
      if (err) {
        console.error('DB ERROR:', err)
        return res.status(500).json({ success: false, error: err })
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: 'No FCM tokens found' })
      }

      console.log('TOKENS FOUND:', rows)

      const tokens = rows.map(r => r.token)

      try {
        let response

        const pushData = Object.assign({}, data);
        if (title) pushData.title = String(title);
        if (body) pushData.body = String(body);

        // 🚀 SINGLE DEVICE
        if (tokens.length === 1) {
          response = await admin.messaging().send({
            token: tokens[0],
            notification: {
              title,
              body
            },
            data: pushData,
            android: {
              priority: 'high',
              notification: { channelId: 'default' }
            }
          })
        }

        // 🚀 MULTI DEVICE
        else {
          response = await admin.messaging().sendEachForMulticast({
            tokens,
            notification: {
              title,
              body
            },
            data: pushData,
            android: {
              priority: 'high',
              notification: { channelId: 'default' }
            }
          })
        }

        console.log('🔥 FCM RESPONSE:', response)

        return res.json({
          success: true,
          tokensCount: tokens.length,
          response
        })

      } catch (error) {
        console.error('FCM ERROR:', error)
        return res.status(500).json({
          success: false,
          error: error.message
        })
      }
    }
  )
})

module.exports = router