const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid')

var db = require('../db/MySql/utama');
var dbErida = require('../db/MySql/erida');

const router = express.Router();

const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(20).required(),
    password: Joi.string().min(6).required(),
    nama: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    hp: Joi.string().min(8).required()
});

function respondError422(res, text){
  return res.status(422).json({
    success: false,
    message: text
  });
}

router.post('/login', (req, res) => {

  console.log('===== LOGIN REQUEST =====')
  console.log('BODY:', req.body)

  const result = schema.validate(req.body)

  if (result.error) {
    console.log('❌ VALIDATION ERROR:', result.error.details)
    return respondError422(res, "Gagal Login, periksa username/password")
  }

  const sql = `
    SELECT * FROM users 
    WHERE username = ?
  `

  console.log('➡️ QUERY:', sql)
  console.log('➡️ PARAM:', req.body.username)

  db.query(sql, [req.body.username], async (err, rows) => {

    if (err) {
      console.error('❌ DB ERROR:', err)
      return res.status(500).json({ message: 'Database error' })
    }

    console.log('✅ DB RESULT:', rows)

    if (!rows || rows.length === 0) {
      console.log('❌ USER NOT FOUND')
      return respondError422(res, "Username Salah")
    }

    const user = rows[0]
    console.log('👤 USER FOUND:', user.username)

    try {
      console.log('🔐 CHECKING PASSWORD...')

      const match = await bcrypt.compare(req.body.password, user.password)

      console.log('🔐 PASSWORD MATCH:', match)

      if (!match) {
        console.log('❌ WRONG PASSWORD')
        return respondError422(res, "Password salah")
      }

      const payload = {
        _id: user.id,
        username: user.username,
        profile: {
          username: user.username,
          nama: user.nama,
          hp: user.hp,
          email: user.email,
          menu_klp: user.menu_klp
        }
      }

      console.log('📦 PAYLOAD:', payload)

      jwt.sign(payload, process.env.TOKEN_SECRET, {}, (err, token) => {
        if (err) {
          console.error('❌ JWT ERROR:', err)
          return respondError422(res, "Gagal membuat token")
        }

        console.log('✅ LOGIN SUCCESS')
        console.log('🔑 TOKEN:', token)

        return res.json({
          token,
          profile: payload
        })
      })

    } catch (e) {
      console.error('❌ BCRYPT ERROR:', e)
      return res.status(500).json({ message: 'Auth error' })
    }

  })
})

router.post('/register', async (req, res) => {

  console.log('REGISTER BODY:', req.body)

  const result = schema.validate(req.body)

  if (result.error) {
    return respondError422(res, "Validasi gagal")
  }

  const checkSql = `
    SELECT * FROM users
    WHERE username = ? OR email = ?
  `

  db.query(checkSql, [req.body.username, req.body.email], async (err, rows) => {

    if (err) {
      console.error(err)
      return res.status(500).json({ message: 'DB error' })
    }

    if (rows.length > 0) {
      return res.status(409).json({
        message: 'Username atau email sudah digunakan'
      })
    }

    try {
      const hashed = await bcrypt.hash(req.body.password, 12)
      const userId = uniqid()

      const insertUtama = `
        INSERT INTO users 
        (id, username, nama, hp, email, password, menu_klp, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `

      db.query(insertUtama, [
        userId,
        req.body.username,
        req.body.nama,
        req.body.hp,
        req.body.email,
        hashed,
        3
      ], (err, result) => {

        if (err) {
          console.error('❌ UMUM INSERT ERROR:', err)
          return res.status(500).json({ message: 'Insert gagal (umum)' })
        }

        console.log('✅ INSERT UMUM SUCCESS')

        // ✅ INSERT TO ERIDA
        const insertErida = `
          INSERT INTO user 
          (id, username, nama, hp, email, password, id_pengguna, createAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `

        dbErida.query(insertErida, [
          userId,
          req.body.username,
          req.body.nama,
          req.body.hp,
          req.body.email,
          hashed,
          3
        ], (err2, result2) => {

          if (err2) {
            console.error('❌ ERIDA INSERT ERROR:', err2)

            // ⚠️ OPTIONAL: still return success
            return res.json({
              success: true,
              message: 'Registrasi berhasil (umum), gagal sync erida'
            })
          }

          console.log('✅ INSERT ERIDA SUCCESS')

          return res.json({
            success: true,
            message: 'Registrasi berhasil (sync semua database)'
          })
        })

      })

    } catch (e) {
      console.error(e)
      res.status(500).json({ message: 'Hash error' })
    }

  })
})

module.exports = router;