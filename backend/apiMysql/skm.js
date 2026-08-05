const express = require('express');
const fs = require('fs');
const router = express.Router();
var db = require('../db/MySql/utama');
var upload = require('../db/multer/pdf');
var uniqid = require('uniqid');

// APLIKASI
router.post('/viewAplikasi', (req, res) => {
    var data_batas = 10;
    var data_star = (req.body.data_ke - 1) * data_batas;
    var cari = req.body.cari_value;
    var halaman = 1;

    let jml_data = `
        SELECT aplikasi.*

        FROM aplikasi
    `;

    let view = `
        SELECT aplikasi.*

        FROM aplikasi
        LIMIT `+ data_star + `,` + data_batas + `
    `;

    db.query(jml_data, (err, row) => {
        if (err) {
            console.log(err);
            res.json(err)
        } else {
            halaman = Math.ceil(row.length / data_batas);
            if (halaman < 1) { halaman = 1 }
            // ========================
            db.query(view, (err, result) => {
                if (err) { res.json(err) }
                else {
                    halaman = Math.ceil(row.length / data_batas);
                    if (halaman < 1) { halaman = 1 }
                    res.json({
                        data: result,
                        jml_data: halaman,
                        total: row.length,
                    })
                }
            })
            // ========================
        }
    })
});

router.post('/addAplikasi', (req, res) => {
    console.log(req.body);
    let query = `INSERT INTO aplikasi (id, nama, keterangan, kategori, skor, responden, createdAt)
    VALUES(
        '`+ uniqid() + `',
        '`+ req.body.nama + `',
        '`+ req.body.keterangan + `',
        '`+ req.body.kategori + `',
        '`+ req.body.skor + `',
        '`+ req.body.responden + `',
        NOW()
    )
    `;

    db.query(query, (err, row) => {
        if (err) {
            console.log('errrrooorrr');
            res.send(err);
            console.log(err);
        } else {
            res.send(row);
            console.log(row)
        }
    })
    console.log(req.body);
});

router.post('/editAplikasi', (req, res) => {
    console.log(req.body);
    var query = `
        UPDATE aplikasi SET
        nama = '`+ req.body.nama + `',
        keterangan = '`+ req.body.keterangan + `',
        kategori = '`+ req.body.kategori + `'
        
        WHERE id = '`+ req.body.id + `'
    `;

    db.query(query, (err, row) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log("SUKSES MERUBAH DATA")
            res.send(row);
        }
    })
});

router.post('/removeAplikasi', (req, res) => {
    var query = `
        DELETE FROM aplikasi WHERE id = '`+ req.body.id + `';
    `;
    db.query(query, (err, row) => {
        if (err) {
            res.send(err);
        } else {
            console.log('SUKSESSSSSS MENGHAPUS DATA')
            res.send(row);
        }
    });
});

router.post('/listAplikasi', (req, res) => {
    let query = `SELECT * FROM aplikasi`

    db.query(query, (err, row) => {
        if (err) {
            res.send(err);
            console.log(err);
        } else {
            res.send(row);
        }
    })
});
// APLIKASI

// ULASAN
router.post('/viewUlasan', (req, res) => {
    var data_batas = 10;
    var data_star = (req.body.data_ke - 1) * data_batas;
    var cari = req.body.cari_value;
    var halaman = 1;

    let jml_data = `
        SELECT ulasan.*

        FROM ulasan
    `;

    let view = `
        SELECT ulasan.*

        FROM ulasan
        LIMIT `+ data_star + `,` + data_batas + `
    `;

    db.query(jml_data, (err, row) => {
        if (err) {
            console.log(err);
            res.json(err)
        } else {
            halaman = Math.ceil(row.length / data_batas);
            if (halaman < 1) { halaman = 1 }
            // ========================
            db.query(view, (err, result) => {
                if (err) { res.json(err) }
                else {
                    halaman = Math.ceil(row.length / data_batas);
                    if (halaman < 1) { halaman = 1 }
                    res.json({
                        data: result,
                        jml_data: halaman,
                        total: row.length,
                    })
                }
            })
            // ========================
        }
    })
});

router.post('/addUlasan', (req, res) => {
    console.log(req.body);
    let query = `INSERT INTO ulasan (id, aplikasi_id, rating, komentar, createdBy, createdAt)
    VALUES(
        '`+ uniqid() + `',
        '`+ req.body.aplikasi_id + `',
        '`+ req.body.rating + `',
        '`+ req.body.komentar + `',
        '`+ req.body.createdBy + `',
        NOW()
    )
    `;

    db.query(query, (err, row) => {
        if (err) {
            console.log('errrrooorrr');
            res.send(err);
            console.log(err);
        } else {
            res.send(row);
            console.log(row)
        }
    })
});
// ULASAN


module.exports = router;