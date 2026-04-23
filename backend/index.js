const express = require('express');
const app = express();
const cors = require('cors');
var path = require("path");
require('dotenv').config({ debug: false })

const middleware = require('./auth/middlewares');
const auth = require('./auth');

app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.use(middleware.checkTokenSeetUser);

app.use((req, res, next) => {
  console.log('==========================')
  // console.log('🌐 REQUEST:', req.method, req.url)
  // console.log('📦 BODY:', req.body)
  // console.log('🔑 AUTH:', req.headers.authorization)
  console.log('==========================')
  next()
})

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨Hello pengunjung,,, Anda mengunjugi alamat yg salah... mungkin maksud anda http://konaweselatankab.go.id ! 🌈✨🦄',
    user: req.user
  });
});

// API ENDPOINTS

app.use('/auth', auth);
app.use('/uploads', express.static(path.join(__dirname, './uploads')))

const checkAuth = require('./apiMysql/checkAuth');
app.use('/api/v1/checkAuth', checkAuth);

const profile = require('./apiMysql/profile');
app.use('/api/v1/profile', profile);

const sippaduBerita = require('./apiMysql/sippadu/berita');
app.use('/api/v1/sippadu_berita', sippaduBerita);

const notificationRoutes = require('./routes/notification')
app.use('/notification', notificationRoutes)

const fcmRoutes = require('./routes/fcm')
app.use('/fcm', fcmRoutes)

const slider = require('./apiMysql/slider');
app.use('/api/v1/slider', slider);

// STATIC LEGAL PAGES FOR PLAY STORE
app.get('/kebijakan-privasi', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/kebijakan-privasi.html'));
});

app.get('/syarat-ketentuan', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/syarat-ketentuan.html'));
});

// API ENDPOINTS

// ERROR HANDLER

function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found data - ' + req.originalUrl);
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

// ERROR HANDLER

const port = process.env.PORT || 5025;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
  console.error('Server failed:', err);
});
