const express = require('express')
const router = express.Router()
const admin = require('../firebase')

const API_KEY = process.env.NOTIF_API_KEY

router.post('/send', async (req, res) => {
  const key = req.headers['x-api-key']

  // 🔐 Validate API Key
  if (key !== API_KEY) {
    return res.status(403).json({ message: 'Forbidden' })
  }

  try {
    const { token, tokens, title, body, data } = req.body

    let response

    // ✅ Single device
    if (token) {
      const message = {
        token,
        notification: { title, body },
        data: data || {}
      }

      response = await admin.messaging().send(message)
    }

    // ✅ Multiple devices
    else if (tokens && tokens.length > 0) {
      const message = {
        tokens,
        notification: { title, body },
        data: data || {}
      }

      response = await admin.messaging().sendMulticast(message)
    }

    else {
      return res.status(400).json({ message: 'No token provided' })
    }

    res.json({
      success: true,
      response
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
})

module.exports = router