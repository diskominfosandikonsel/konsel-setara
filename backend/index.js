const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config({ debug: false });

const middleware = require('./auth/middlewares');
const auth = require('./auth');

app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.use(middleware.checkTokenSeetUser);

// Rute dasar / Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Server Konsel Setara API Running 🚀',
    user: req.user
  });
});

// Autentikasi & Media Statis
app.use('/auth', auth);
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Sektoral & Core Layanan API
const checkAuth = require('./apiMysql/checkAuth');
app.use('/api/v1/checkAuth', checkAuth);

const profile = require('./apiMysql/profile');
app.use('/api/v1/profile', profile);

const sippaduBerita = require('./apiMysql/sippadu/berita');
app.use('/api/v1/sippadu_berita', sippaduBerita);

const notificationRoutes = require('./routes/notification');
app.use('/notification', notificationRoutes);

const fcmRoutes = require('./routes/fcm');
app.use('/fcm', fcmRoutes);

const slider = require('./apiMysql/slider');
app.use('/api/v1/slider', slider);

// Halaman Statis Kebijakan & Syarat (Syarat Google Play Store)
app.get('/kebijakan-privasi', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/kebijakan-privasi.html'));
});

app.get('/syarat-ketentuan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/syarat-ketentuan.html'));
});

// Pengecekan Versi Aplikasi Mobile
app.get('/api/v1/app-version', (req, res) => {
  res.json({
    latestVersion: '1.4.0',
    storeUrl: 'https://play.google.com/store/apps/details?id=id.go.konaweselatankab.setara',
    forceUpdate: true
  });
});

// Modul Survei Kepuasan Masyarakat (SKM) & IKM
const skm = require('./apiMysql/skm');
app.use('/api/v1/skm', skm);

// Modul Menu Dinamis
const menu = require('./apiMysql/menu');
app.use('/api/v1/menu', menu);

// Modul Manajemen Pengguna
const users = require('./apiMysql/users');
app.use('/api/v1/users', users);

// Modul Tracking Realisasi Permohonan
const realisasi = require('./apiMysql/realisasi');
app.use('/api/v1/realisasi', realisasi);

// Modul Data Pegawai & Petugas Pelayanan
const pegawai = require('./apiMysql/pegawai');
app.use('/api/v1/pegawai', pegawai);

// Error Handling Middleware
function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found - ' + req.originalUrl);
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: err.message,
    stack: err.stack
  });
}

app.use(notFound);
app.use(errorHandler);

// Server Listener
const port = process.env.PORT || 5025;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
  console.error('Server failed:', err);
});

