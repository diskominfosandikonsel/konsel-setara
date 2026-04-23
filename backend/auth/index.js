const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const nodemailer = require('nodemailer');

const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com', // Ubah jika menggunakan mail.konaweselatankab.go.id
  port: process.env.EMAIL_PORT || 465, // Port SMTP (biasanya 465 atau 587)
  secure: process.env.EMAIL_PORT == 465, // True untuk port 465, false untuk port lainnya
  auth: {
    user: process.env.EMAIL_USER || 'emailanda@gmail.com',
    pass: process.env.EMAIL_PASS || 'password_email_anda'
  }
});

var db = require('../db/MySql/utama');
var dbErida = require('../db/MySql/erida');

const router = express.Router();

const loginSchema = Joi.object().keys({
  username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(20).required(),
  password: Joi.string().min(6).required()
});

const schema = Joi.object().keys({
  username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(20).required(),
  password: Joi.string().min(6).required(),
  nama: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  hp: Joi.string().min(8).required()
});

function respondError422(res, text) {
  return res.status(422).json({
    success: false,
    message: text
  });
}

router.post('/login', (req, res) => {

  const result = loginSchema.validate(req.body)

  if (result.error) {
    return respondError422(res, "Gagal Login, periksa username/password")
  }

  const sql = `
    SELECT * FROM users 
    WHERE username = ?
  `

  db.query(sql, [req.body.username], async (err, rows) => {

    if (err) {
      console.error(err)
      return res.status(500).json({ message: 'Database error' })
    }

    if (!rows || rows.length === 0) {
      return respondError422(res, "Username Salah")
    }

    const user = rows[0]

    try {

      const match = await bcrypt.compare(req.body.password, user.password)

      if (!match) {
        return respondError422(res, "Password salah")
      }

      const payload = {
        _id: user.id,
        username: user.username,
        nama: user.nama,
        hp: user.hp,
        email: user.email,
        menu_klp: user.menu_klp,
        profile: {
          menu_klp: user.menu_klp
        }
      }

      jwt.sign(payload, process.env.TOKEN_SECRET, {}, (err, token) => {
        if (err) {
          console.error(err)
          return respondError422(res, "Gagal membuat token")
        }

        return res.json({
          token,
          user: payload
        })
      })

    } catch (e) {
      console.error(e)
      return res.status(500).json({ message: 'Auth error' })
    }

  })
})

router.post('/register', async (req, res) => {

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
          console.error(err)
          return res.status(500).json({ message: 'Insert gagal (umum)' })
        }

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
            console.error(err2)
            return res.json({
              success: true,
              message: 'Registrasi berhasil (umum), gagal sync erida'
            })
          }

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

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return respondError422(res, "E-mail wajib diisi");
  }

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], async (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!rows || rows.length === 0) {
      return respondError422(res, "E-mail tidak terdaftar.");
    }

    const otp = generateOTP();
    // Beri batas waktu 5 menit (300000 ms)
    otpStore.set(email, { otp, expiresAt: Date.now() + 300000 });

    const mailOptions = {
      from: `"APP KONSEL SETARA" <${transporter.options.auth.user}>`,
      to: email,
      subject: 'Kode Reset Password - Konsel Setara',
      text: `Kode OTP Anda adalah: ${otp}\nJangan bagikan kode ini ke siapapun. Kode ini berlaku selama 5 menit.`,
      html: `<h3>Kode OTP Anda: <b style="font-size:24px; color:#1976D2;">${otp}</b></h3><p>Jangan bagikan kode ini ke siapapun. Kode ini berlaku selama 5 menit.</p>`
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.json({ success: true, message: 'Kode OTP berhasil dikirim' });
    } catch (sendErr) {
      console.error('Error sendMail:', sendErr);
      return res.status(500).json({ message: 'Gagal mengirim email OTP. Silahkan coba lagi.' });
    }
  });
});

router.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return respondError422(res, "Email, Kode OTP, dan Password Baru wajib diisi");
  }

  if (newPassword.length < 8) {
    return respondError422(res, "Password minimal 8 karakter");
  }

  // Cek OTP di memory
  const storedOtpData = otpStore.get(email);
  if (!storedOtpData) {
    return respondError422(res, "Sesi OTP sudah kedaluwarsa atau belum meminta OTP.");
  }

  if (Date.now() > storedOtpData.expiresAt) {
    otpStore.delete(email); // hapus jika kadaluarsa
    return respondError422(res, "Kode OTP sudah kedaluwarsa, silakan minta kode baru.");
  }

  if (storedOtpData.otp !== code) {
    return respondError422(res, "Kode OTP salah.");
  }

  // Jika OTP Cocok:
  db.query(`SELECT * FROM users WHERE email = ?`, [email], async (err, rows) => {
    if (err || rows.length === 0) return res.status(500).json({ message: 'User tidak ditemukan' });

    try {
      const hashed = await bcrypt.hash(newPassword, 12);
      const userId = rows[0].id;

      // Update tabel utama
      const updateUtama = `UPDATE users SET password = ? WHERE id = ?`;
      db.query(updateUtama, [hashed, userId], (errUpdate1) => {
        if (errUpdate1) {
          console.error(errUpdate1);
          return res.status(500).json({ message: 'Gagal update password' });
        }

        // Update tabel erida (karena auth login sinkron dengan keduanya)
        const updateErida = `UPDATE user SET password = ? WHERE id = ?`;
        dbErida.query(updateErida, [hashed, userId], () => {
          otpStore.delete(email); // Hapus sesi OTP karena sudah berhasil reset
          return res.json({ success: true, message: 'Password berhasil diperbarui' });
        });
      });
    } catch (errHash) {
      console.error(errHash);
      return res.status(500).json({ message: 'Gagal memproses password' });
    }
  });
});

module.exports = router;