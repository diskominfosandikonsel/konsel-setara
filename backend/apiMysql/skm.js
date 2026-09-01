const express = require('express');
const fs = require('fs');
const router = express.Router();
var db = require('../db/MySql/utama');
var upload = require('../db/multer/pdf');
var uniqid = require('uniqid');

// DASBOARD
router.get('/getDashboard', async (req, res) => {
    try {
        // Query 1: Ringkasan Keseluruhan (Skor Kepuasan, Total Responden, Total Layanan)
        const qSummary = `
            SELECT 
                COALESCE(ROUND(AVG(rating), 1), 0) AS skorKepuasan,
                COUNT(id) AS totalResponden,
                (SELECT COUNT(id) FROM aplikasi) AS totalLayanan
            FROM ulasan
        `;

        // Query 2: Tren Kepuasan (Group per bulan 6 bulan terakhir)
        const qTren = `
            SELECT 
                DATE_FORMAT(createdAt, '%b') AS bulan,
                ROUND(AVG(rating), 1) AS skor
            FROM ulasan
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY YEAR(createdAt), MONTH(createdAt)
            ORDER BY createdAt ASC
        `;

        // Query 3: Kategori Kepuasan (Distribution Rating 1 - 5)
        const qKategori = `
            SELECT 
                CASE 
                    WHEN rating = 5 THEN 'Sangat Puas'
                    WHEN rating = 4 THEN 'Puas'
                    WHEN rating = 3 THEN 'Cukup'
                    WHEN rating = 2 THEN 'Kurang'
                    WHEN rating = 1 THEN 'Kecewa'
                END AS nilai,
                COUNT(id) AS jumlah,
                CASE 
                    WHEN rating = 5 THEN '#10b981'
                    WHEN rating = 4 THEN '#60a5fa'
                    WHEN rating = 3 THEN '#facc15'
                    WHEN rating = 2 THEN '#f97316'
                    WHEN rating = 1 THEN '#ef4444'
                END AS fill
            FROM ulasan
            GROUP BY rating
            ORDER BY rating DESC
        `;

        // Query 4: Skor per Layanan (Aplikasi)
        const qLayanan = `
            SELECT 
                aplikasi.*,
                COALESCE(ROUND(AVG(ulasan.rating), 1), 0) AS skor,
                COUNT(ulasan.id) AS responden
            FROM aplikasi
            LEFT JOIN ulasan ON ulasan.aplikasi_id = aplikasi.id
            GROUP BY aplikasi.id
            ORDER BY aplikasi.id DESC
            LIMIT 5
        `;

        // Query 5: 5 Komentar Terbaru
        const qKomentar = `
            SELECT 
                u.id,
                COALESCE(NULLIF(usr.nama, ''), NULLIF(u.createdBy, ''), 'Anonim') AS nama,
                u.komentar,
                u.rating,
                a.nama AS layanan,
                u.createdAt AS waktu
            FROM ulasan u
            LEFT JOIN users usr ON usr.id = u.createdBy
            LEFT JOIN aplikasi a ON a.id = u.aplikasi_id
            ORDER BY u.createdAt DESC
            LIMIT 5
        `;

        // Eksekusi semua query secara paralel
        const [summaryRes, trenRes, kategoriRes, layananRes, komentarRes] = await Promise.all([
            new Promise((resolve, reject) => db.query(qSummary, (err, r) => err ? reject(err) : resolve(r))),
            new Promise((resolve, reject) => db.query(qTren, (err, r) => err ? reject(err) : resolve(r))),
            new Promise((resolve, reject) => db.query(qKategori, (err, r) => err ? reject(err) : resolve(r))),
            new Promise((resolve, reject) => db.query(qLayanan, (err, r) => err ? reject(err) : resolve(r))),
            new Promise((resolve, reject) => db.query(qKomentar, (err, r) => err ? reject(err) : resolve(r)))
        ]);

        res.json({
            summary: summaryRes[0] || { skorKepuasan: 0, totalResponden: 0, totalLayanan: 0 },
            trenKepuasan: trenRes,
            kategoriKepuasan: kategoriRes,
            kepuasanPerLayanan: layananRes,
            komentarPengguna: komentarRes
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// DASBOARD


// APLIKASI
router.post('/viewAplikasi', (req, res) => {
    const data_batas = Number(req.body.page_limit) || 10;
    const page_first = Number(req.body.data_ke) || 1;
    const data_star = (page_first - 1) * data_batas;
    const cari = req.body.cari_value || '';

    let whereClause = '';
    let params = [];
    if (cari) {
        whereClause = ` WHERE aplikasi.nama LIKE ? OR aplikasi.keterangan LIKE ?`;
        params = [`%${cari}%`, `%${cari}%`];
    }

    const jml_data = `
        SELECT COUNT(*) AS total
        FROM aplikasi
        ${whereClause}
    `;

    const view = `
        SELECT 
            aplikasi.*,
            COALESCE(ROUND(AVG(ulasan.rating), 1), 0) AS skor,
            COUNT(ulasan.id) AS responden
        FROM aplikasi
        LEFT JOIN ulasan ON ulasan.aplikasi_id = aplikasi.id
        ${whereClause}
        GROUP BY aplikasi.id
        ORDER BY aplikasi.id DESC
        LIMIT ${data_star}, ${data_batas}
    `;

    db.query(jml_data, params, (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }

        const totalData = countResult[0].total;
        let totalHalaman = Math.ceil(totalData / data_batas);
        if (totalHalaman < 1) totalHalaman = 1;

        db.query(view, params, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err.message });
            }

            res.json({
                data: result,
                jml_data: totalHalaman,
                total: totalData
            });
        });
    });
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
        SELECT ulasan.*,
        users.nama,
        aplikasi.nama as app

        FROM ulasan

        LEFT JOIN users ON users.id = ulasan.createdBy
        LEFT JOIN aplikasi ON aplikasi.id = ulasan.aplikasi_id

        ORDER BY ulasan.createdAt DESC
    `;

    let view = `
        SELECT ulasan.*,
        users.nama,
        aplikasi.nama as app

        FROM ulasan

        LEFT JOIN users ON users.id = ulasan.createdBy
        LEFT JOIN aplikasi ON aplikasi.id = ulasan.aplikasi_id

        ORDER BY ulasan.createdAt DESC

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

router.post('/checkStatus', (req, res) => {
    const { aplikasi_id, createdBy } = req.body;
    if (!aplikasi_id || !createdBy || createdBy === 'anonim') {
        return res.json({ hasSubmitted: false });
    }
    const checkSql = `SELECT id, rating, komentar, createdAt FROM ulasan WHERE (aplikasi_id = ? OR aplikasi_id = (SELECT id FROM aplikasi WHERE nama LIKE ? LIMIT 1)) AND createdBy = ? LIMIT 1`;
    db.query(checkSql, [aplikasi_id, `%${aplikasi_id}%`, createdBy], (err, rows) => {
        if (err) {
            console.error('checkStatus error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({
            hasSubmitted: Boolean(rows && rows.length > 0),
            review: rows && rows.length > 0 ? rows[0] : null
        });
    });
});

router.post('/addUlasan', (req, res) => {
    const { aplikasi_id, rating, komentar, createdBy } = req.body;

    if (!aplikasi_id || !rating) {
        return res.status(422).json({ success: false, message: 'Aplikasi dan rating wajib diisi' });
    }

    const userId = createdBy && createdBy !== 'anonim' ? createdBy : null;

    // Jika user login, cek apakah sudah pernah mengisi survei untuk aplikasi ini
    if (userId) {
        const checkSql = `SELECT id FROM ulasan WHERE aplikasi_id = ? AND createdBy = ? LIMIT 1`;
        db.query(checkSql, [aplikasi_id, userId], (err, rows) => {
            if (err) {
                console.error('Check ulasan error:', err);
                return res.status(500).json({ error: err.message });
            }
            if (rows && rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    alreadySubmitted: true,
                    message: 'Anda sudah pernah mengisi survei kepuasan untuk layanan ini.'
                });
            }
            insertUlasan();
        });
    } else {
        insertUlasan();
    }

    function insertUlasan() {
        const newId = uniqid();
        let query = `INSERT INTO ulasan (id, aplikasi_id, rating, komentar, createdBy, createdAt)
        VALUES (?, ?, ?, ?, ?, NOW())`;

        db.query(query, [newId, aplikasi_id, Number(rating), komentar || '-', createdBy || 'anonim'], (err, row) => {
            if (err) {
                console.error('Insert ulasan error:', err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Ulasan berhasil dikirim', id: newId });
        });
    }
});
// ULASAN
// LIST APLIKASI UNTUK DROPDOWN / FILTER
router.get('/listAplikasi', (req, res) => {
    const query = `SELECT id, nama, kategori FROM aplikasi ORDER BY nama ASC`;
    db.query(query, (err, rows) => {
        if (err) {
            console.error('listAplikasi error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows || [] });
    });
});

const { MongoClient } = require('mongodb');
const uriMongoWB = "mongodb://diskominfosandi:Kominfo2018@121.52.72.101:27017/warga_bicara?authSource=admin";

// Fungsi sinkronisasi realtime dari MongoDB Warga Bicara ke MySQL konsel_setara
async function syncWargaBicaraRatings() {
    try {
        const client = new MongoClient(uriMongoWB, { serverSelectionTimeoutMS: 5000 });
        await client.connect();
        const mongoDb = client.db('warga_bicara');

        const pipeline = [
            {
                $lookup: {
                    from: 'post',
                    localField: 'post_id',
                    foreignField: 'id',
                    as: 'post_info'
                }
            },
            { $unwind: { path: '$post_info', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'created_by',
                    foreignField: 'id',
                    as: 'user_info'
                }
            },
            { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    id: 1,
                    post_id: 1,
                    nilai: 1,
                    ulasan: 1,
                    created_at: 1,
                    created_by: 1,
                    post_title: '$post_info.title',
                    pelapor_nama: { $ifNull: ['$user_info.nama', '$user_info.username', 'Pelapor'] }
                }
            },
            { $sort: { created_at: -1 } }
        ];

        const ratings = await mongoDb.collection('rating').aggregate(pipeline).toArray();
        await client.close();

        if (!ratings || ratings.length === 0) return;

        db.query("SELECT id FROM aplikasi WHERE nama LIKE '%WARGA BICARA%' LIMIT 1", (err, apps) => {
            if (err || !apps || apps.length === 0) return;
            const appId = apps[0].id;

            db.query("DELETE FROM ulasan WHERE aplikasi_id = ?", [appId], () => {
                for (const r of ratings) {
                    const ulasanId = r._id.toString();
                    const ratingVal = Number(r.nilai) || 5;
                    const komentar = r.ulasan ? r.ulasan.trim() : (r.post_title ? `Aduan: ${r.post_title}` : '-');
                    const createdBy = r.pelapor_nama;
                    const createdAt = r.created_at ? new Date(r.created_at) : new Date();

                    db.query(
                        "INSERT INTO ulasan (id, aplikasi_id, rating, komentar, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
                        [ulasanId, appId, ratingVal, komentar, createdBy, createdAt]
                    );
                }
            });
        });
    } catch (err) {
        console.warn("Sync Warga Bicara MongoDB notice:", err.message);
    }
}

// Endpoint manual sync jika dibutuhkan
router.get('/syncWargaBicara', async (req, res) => {
    await syncWargaBicaraRatings();
    res.json({ success: true, message: "Sinkronisasi Warga Bicara berhasil" });
});

// ═══════════════════════════════════════════════════════════════
// ENDPOINT BARU KHUSUS ADMIN (CEPAT & TERINDEX)
// ═══════════════════════════════════════════════════════════════
router.post('/viewUlasanFast', (req, res) => {
    const data_batas = Number(req.body.page_limit) || 10;
    const page_first = Number(req.body.data_ke) || 1;
    const data_star = (page_first - 1) * data_batas;
    const cari = req.body.cari_value || '';
    const aplikasi_id = req.body.aplikasi_id || '';

    let whereConditions = [];
    let params = [];

    if (cari && cari.trim() !== '') {
        whereConditions.push(`(users.nama LIKE ? OR ulasan.createdBy LIKE ? OR ulasan.komentar LIKE ? OR aplikasi.nama LIKE ?)`);
        params.push(`%${cari}%`, `%${cari}%`, `%${cari}%`, `%${cari}%`);
    }

    if (aplikasi_id && aplikasi_id !== 'all') {
        whereConditions.push(`(ulasan.aplikasi_id = ? OR aplikasi.id = ? OR aplikasi.nama = ?)`);
        params.push(aplikasi_id, aplikasi_id, aplikasi_id);
    }

    const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `
        SELECT COUNT(ulasan.id) AS total
        FROM ulasan
        LEFT JOIN users ON users.id = ulasan.createdBy
        LEFT JOIN aplikasi ON aplikasi.id = ulasan.aplikasi_id
        ${whereClause}
    `;

    const dataQuery = `
        SELECT 
            ulasan.id,
            ulasan.rating,
            ulasan.komentar,
            ulasan.createdAt,
            COALESCE(NULLIF(users.nama, ''), NULLIF(ulasan.createdBy, ''), 'Anonim') AS nama,
            aplikasi.nama as app
        FROM ulasan
        LEFT JOIN users ON users.id = ulasan.createdBy
        LEFT JOIN aplikasi ON aplikasi.id = ulasan.aplikasi_id
        ${whereClause}
        ORDER BY ulasan.createdAt DESC
        LIMIT ${data_star}, ${data_batas}
    `;

    db.query(countQuery, params, (err, countResult) => {
        if (err) {
            console.error('viewUlasanFast count error:', err);
            return res.status(500).json({ error: err.message });
        }

        const totalData = countResult[0] ? countResult[0].total : 0;
        let totalHalaman = Math.ceil(totalData / data_batas);
        if (totalHalaman < 1) totalHalaman = 1;

        db.query(dataQuery, params, (err2, dataResult) => {
            if (err2) {
                console.error('viewUlasanFast data error:', err2);
                return res.status(500).json({ error: err2.message });
            }

            res.json({
                data: dataResult,
                jml_data: totalHalaman,
                total: totalData,
            });
        });
    });
});


module.exports = router;