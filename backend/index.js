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
  console.log('🌐 REQUEST:', req.method, req.url)
  console.log('📦 BODY:', req.body)
  console.log('🔑 AUTH:', req.headers.authorization)
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

// Proxy SIPPADU (Bypass CORS)
const sippaduBerita = require('./apiMysql/sippadu/berita');
app.use('/api/v1/sippadu_berita', sippaduBerita);

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

const port = process.env.PORT || 5028;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
  console.error('Server failed:', err);
});
