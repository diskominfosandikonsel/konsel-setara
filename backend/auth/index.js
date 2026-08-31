const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const nodemailer = require('nodemailer');
const { syncToPerak } = require('../helpers/syncHelper');

const db = require('../db/MySql/utama');
const dbErida = require('../db/MySql/erida');

const router = express.Router();
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: process.env.EMAIL_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER || 'emailanda@gmail.com',
    pass: process.env.EMAIL_PASS || 'password_email_anda'
  }
});

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
  res.status(422).json({
    success: false,
    message: text
  });
}

function queryAsync(database, sql, params = []) {
  return new Promise((resolve, reject) => {
    database.query(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// POST /auth/login — Login Multi-Database (E-Gov SSO, Utama, CSR)
// ═══════════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  const result = loginSchema.validate(req.body);
  if (result.error) {
    respondError422(res, "Gagal Login, periksa username/password");
    return;
  }

  const cleanUsername = req.body.username ? req.body.username.trim() : '';
  const inputPassword = req.body.password;

  try {
    // 1. Coba Autentikasi ke Database E-GOV (READ-ONLY)
    const sqlEgov = `
      SELECT 
        egov.users.id AS egov_id,
        egov.users.username AS egov_username,
        egov.users.password AS egov_password,
        simpeg.biodata.nip AS bio_nip,
        simpeg.biodata.nama AS bio_nama,
        simpeg.biodata.gelar_depan AS bio_gelar_depan,
        simpeg.biodata.gelar_belakang AS bio_gelar_belakang,
        simpeg.biodata.jabatan AS bio_jabatan,
        simpeg.unit_kerja.unit_kerja AS unit_kerja_nama,
        simpeg.instansi.instansi AS instansi_nama
      FROM egov.users
      LEFT JOIN simpeg.biodata ON egov.users.nama_nip = simpeg.biodata.nip
      LEFT JOIN simpeg.unit_kerja ON egov.users.unit_kerja = simpeg.unit_kerja.id
      LEFT JOIN simpeg.instansi ON simpeg.instansi.id = simpeg.unit_kerja.instansi
      WHERE egov.users.username = ? OR simpeg.biodata.nip = ?
      LIMIT 1;
    `;

    const rowsEgov = await queryAsync(db, sqlEgov, [cleanUsername, cleanUsername]);
    if (rowsEgov && rowsEgov.length > 0) {
      const egovUser = rowsEgov[0];
      const matchEgov = await bcrypt.compare(inputPassword, egovUser.egov_password);

      if (matchEgov) {
        const nipPegawai = egovUser.bio_nip || egovUser.egov_username;
        const sqlCheckAkses = `SELECT * FROM pegawai_akses WHERE (nip = ? OR nip = ?) AND is_active = 1 LIMIT 1`;
        const rowsAkses = await queryAsync(db, sqlCheckAkses, [nipPegawai, cleanUsername]);
        const aksesData = rowsAkses && rowsAkses.length > 0 ? rowsAkses[0] : null;

        const rowsLoc = await queryAsync(db, `SELECT menu_klp FROM users WHERE username = ? LIMIT 1`, [cleanUsername]);
        const localRole = rowsLoc && rowsLoc.length > 0 ? Number(rowsLoc[0].menu_klp) : 0;
        const userRole = aksesData ? Number(aksesData.menu_klp || 2) : (localRole === 1 ? 1 : 0);

        if (userRole === 0) {
          res.status(403).json({
            success: false,
            message: 'Akun E-Gov Anda valid, namun belum diverifikasi / diberikan hak akses oleh Administrator Konsel Setara. Silakan hubungi admin.'
          });
          return;
        }

        const gDepan = egovUser.bio_gelar_depan && egovUser.bio_gelar_depan.trim() !== '' && egovUser.bio_gelar_depan.trim() !== '-'
          ? `${egovUser.bio_gelar_depan.trim()} `
          : '';
        const gBelakang = egovUser.bio_gelar_belakang && egovUser.bio_gelar_belakang.trim() !== '' && egovUser.bio_gelar_belakang.trim() !== '-'
          ? `, ${egovUser.bio_gelar_belakang.trim()}`
          : '';
        const rawNama = (egovUser.bio_nama || egovUser.egov_username || '').replace(/^[-,\s]+|[-,\s]+$/g, '');
        const namaLengkap = aksesData?.nama || `${gDepan}${rawNama}${gBelakang}`.trim();
        const opdName = aksesData?.opd || egovUser.instansi_nama || egovUser.unit_kerja_nama || 'OPD Konawe Selatan';

        const payload = {
          _id: String(egovUser.egov_id),
          username: egovUser.egov_username,
          nip: nipPegawai,
          nama: namaLengkap,
          opd: opdName,
          menu_klp: userRole,
          role: userRole === 1 ? 'superadmin' : 'pegawai_opd',
          profile: {
            nama: namaLengkap,
            menu_klp: userRole,
            opd: opdName,
          }
        };

        const token = jwt.sign(payload, process.env.TOKEN_SECRET, {});
        res.json({ token, user: payload });
        return;
      }
    }

    // 2. Coba Autentikasi ke Database Utama (konsel_setara.users)
    const rowsLocal = await queryAsync(db, `SELECT * FROM users WHERE username = ? LIMIT 1`, [cleanUsername]);
    if (rowsLocal && rowsLocal.length > 0) {
      const userLoc = rowsLocal[0];
      const matchLoc = await bcrypt.compare(inputPassword, userLoc.password);

      if (matchLoc) {
        const payload = {
          _id: String(userLoc.id),
          username: userLoc.username,
          nama: userLoc.nama,
          hp: userLoc.hp,
          email: userLoc.email,
          menu_klp: Number(userLoc.menu_klp),
          profile: {
            nama: userLoc.nama,
            menu_klp: Number(userLoc.menu_klp)
          }
        };

        const token = jwt.sign(payload, process.env.TOKEN_SECRET, {});
        res.json({ token, user: payload });
        return;
      }
    }

    // 3. Coba Autentikasi ke Database CSR (db_csrkonsel.users)
    const rowsCsr = await queryAsync(db, `SELECT * FROM \`db_csrkonsel\`.\`users\` WHERE \`username\` = ? LIMIT 1`, [cleanUsername]);
    if (rowsCsr && rowsCsr.length > 0) {
      const userCsr = rowsCsr[0];
      const matchCsr = await bcrypt.compare(inputPassword, userCsr.password);

      if (matchCsr) {
        const payload = {
          _id: String(userCsr.id),
          username: userCsr.username,
          nama: userCsr.nama,
          hp: userCsr.hp,
          email: userCsr.email,
          menu_klp: Number(userCsr.db_csrkonsel || 4),
          db_csrkonsel: Number(userCsr.db_csrkonsel || 4),
          profile: {
            nama: userCsr.nama,
            menu_klp: Number(userCsr.db_csrkonsel || 4),
            db_csrkonsel: Number(userCsr.db_csrkonsel || 4)
          }
        };

        const token = jwt.sign(payload, process.env.TOKEN_SECRET, {});
        res.json({ token, user: payload });
        return;
      }
    }

    respondError422(res, "Username atau Password Salah");
  } catch (err) {
    console.error("Auth login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /auth/register — Registrasi Pengguna Baru
// ═══════════════════════════════════════════════════════════════
router.post('/register', async (req, res) => {
  const result = schema.validate(req.body);
  if (result.error) {
    respondError422(res, "Validasi gagal");
    return;
  }

  try {
    const checkSql = `SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1`;
    const rowsCheck = await queryAsync(db, checkSql, [req.body.username, req.body.email]);

    if (rowsCheck && rowsCheck.length > 0) {
      res.status(409).json({ message: 'Username atau email sudah digunakan' });
      return;
    }

    const hashed = await bcrypt.hash(req.body.password, 12);
    const userId = uniqid();

    const insertUtama = `
      INSERT INTO users 
      (id, username, nama, hp, email, password, menu_klp, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await queryAsync(db, insertUtama, [
      userId,
      req.body.username,
      req.body.nama,
      req.body.hp,
      req.body.email,
      hashed,
      3
    ]);

    const insertErida = `
      INSERT INTO user 
      (id, username, nama, hp, email, password, id_pengguna, createAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    try {
      await queryAsync(dbErida, insertErida, [
        userId,
        req.body.username,
        req.body.nama,
        req.body.hp,
        req.body.email,
        hashed,
        3
      ]);
    } catch (eErida) {
      console.error('Erida sync warning:', eErida);
    }

    syncToPerak(req.body, hashed, userId);

    res.json({
      success: true,
      message: 'Registrasi berhasil (sync semua database)'
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada registrasi' });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /auth/forgot-password — Kirim OTP Lupa Password
// ═══════════════════════════════════════════════════════════════
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    respondError422(res, "E-mail wajib diisi");
    return;
  }

  try {
    const rows = await queryAsync(db, `SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
    if (!rows || rows.length === 0) {
      respondError422(res, "E-mail tidak terdaftar.");
      return;
    }

    const otp = generateOTP();
    otpStore.set(email, { otp, expiresAt: Date.now() + 300000 });

    const mailOptions = {
      from: `"APP KONSEL SETARA" <${transporter.options.auth.user}>`,
      to: email,
      subject: 'Kode Reset Password - Konsel Setara',
      text: `Kode OTP Anda adalah: ${otp}\nJangan bagikan kode ini ke siapapun. Kode ini berlaku selama 5 menit.`,
      html: `<h3>Kode OTP Anda: <b style="font-size:24px; color:#1976D2;">${otp}</b></h3><p>Jangan bagikan kode ini ke siapapun. Kode ini berlaku selama 5 menit.</p>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Kode OTP berhasil dikirim' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Gagal memproses permintaan OTP' });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /auth/reset-password — Verifikasi OTP & Simpan Password Baru
// ═══════════════════════════════════════════════════════════════
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    respondError422(res, "Email, Kode OTP, dan Password Baru wajib diisi");
    return;
  }

  if (newPassword.length < 8) {
    respondError422(res, "Password minimal 8 karakter");
    return;
  }

  const storedOtpData = otpStore.get(email);
  if (!storedOtpData) {
    respondError422(res, "Sesi OTP sudah kedaluwarsa atau belum meminta OTP.");
    return;
  }

  if (Date.now() > storedOtpData.expiresAt) {
    otpStore.delete(email);
    respondError422(res, "Kode OTP sudah kedaluwarsa, silakan minta kode baru.");
    return;
  }

  if (storedOtpData.otp !== code) {
    respondError422(res, "Kode OTP salah.");
    return;
  }

  try {
    const rows = await queryAsync(db, `SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
    if (!rows || rows.length === 0) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    const userId = rows[0].id;

    await queryAsync(db, `UPDATE users SET password = ? WHERE id = ?`, [hashed, userId]);

    try {
      await queryAsync(dbErida, `UPDATE user SET password = ? WHERE id = ?`, [hashed, userId]);
    } catch (eErida) {
      console.error('Erida password sync warning:', eErida);
    }

    otpStore.delete(email);
    res.json({ success: true, message: 'Password berhasil diperbarui' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Gagal memproses password baru' });
  }
});

module.exports = router;