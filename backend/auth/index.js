const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var dbs = require('../db/MySql/umum');

const router = express.Router();

const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(20).required(),
    password: Joi.string().min(6).required(),
});

function respondError422(res, text){
  return res.status(422).json({
    success: false,
    message: text
  });
}

router.post('/login', (req, res) => {

  const result = schema.validate(req.body)

  if (result.error) {
    return respondError422(res, "Gagal Login, periksa username/password")
  }

  const sql = `
    SELECT * FROM users 
    WHERE username = ?
  `

  dbs.query(sql, [req.body.username], async (err, rows) => {

    // 🔥 HANDLE ERROR FIRST
    if (err) {
      console.error('DB ERROR:', err)
      return res.status(500).json({ message: 'Database error' })
    }

    // 🔥 SAFE CHECK
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
        profile: {
          username: user.username,
          nama: user.nama,
          hp: user.hp,
          email: user.email,
          menu_klp: user.menu_klp
        }
      }

      jwt.sign(payload, process.env.TOKEN_SECRET, {}, (err, token) => {
        if (err) {
          return respondError422(res, "Gagal membuat token")
        }

        return res.json({
          token,
          profile: payload
        })
      })

    } catch (e) {
      console.error('BCRYPT ERROR:', e)
      return res.status(500).json({ message: 'Auth error' })
    }

  })
});

router.post('/register', (req, res, next) => {

    console.log(req.body)

    const request = {
        username: req.body.username,
        password: req.body.password,
    }

    const result = Joi.validate(request, schema);

    if (result.error === null) {

        
        let view = `
            SELECT * 
            FROM user
            WHERE 
            user.username = '`+ req.body.username +`' OR user.email = '`+req.body.email +`'
        `

        dbs.query(view, (err, row) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else{
                if (row.length <= 0) {
                    bcrypt.hash(req.body.password.trim(), 12).then(hashedPassword => {

                        var query = '';
                            req.body.menu_klp = 3;
                            query = `
                            INSERT INTO user (id, username, nama, hp, email, password, level_id, createAt)
                            VALUES (
                                '`+uniqid()+`',
                                '`+req.body.username+`',
                                '`+req.body.nama+`',
                                '`+req.body.hp+`',
                                '`+req.body.email+`',
                                '`+hashedPassword+`',
                                '`+req.body.menu_klp+`',
                                NOW()
                            )
                        `;

                        dbs.query(query, (err, row) => {
                            if (err) {
                                console.log(err)
                                res.send('Gagal Registrasi');
                            }else{
                                console.log('Sukses Registrasi')
                                res.send(row);
                            }
                        })

                    });

                }else{
                    const error = new Error('Username atau email sudah digunakan');
                    res.status(409);
                    next(error);
                }
            }
        })


    } else {
        res.status(422);
        next(result.error);
    }

});

module.exports = router;