const express = require('express');
const router = express.Router();
const axios = require('axios');
const tiktokService = require('../services/tiktokService');
const middleware = require('../auth/middlewares');
const { requirePermission } = require('../auth/accessControl');

const FALLBACK_COVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#bg)"/>
  <g transform="translate(95, 130) scale(0.24)">
    <path fill="#475569" d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z"/>
  </g>
</svg>`;

function resolveRequestBaseUrl(req) {
  if (process.env.BASE_API_URL) {
    return process.env.BASE_API_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || '';
  if (/^(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+)(:\d+)?$/i.test(host)) {
    return `${req.protocol || 'http'}://${host}`;
  }
  return 'https://konsel-setara.konaweselatankab.go.id';
}

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/tiktok/feed — Daftar Video TikTok untuk Mobile App
// Query: ?category=all|official|daily & limit=8 & page=1
// ═══════════════════════════════════════════════════════════════
router.get('/feed', async (req, res) => {
  try {
    const { category = 'all', limit = 8, page = 1 } = req.query;
    const baseUrl = resolveRequestBaseUrl(req);
    const videos = await tiktokService.getFeed({ category, limit, page, baseUrl });

    return res.json({
      success: true,
      data: videos,
      meta: {
        category,
        count: videos.length,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 8
      }
    });
  } catch (err) {
    console.error('[API TIKTOK] Error fetching feed:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil feed video TikTok',
      error: err.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/tiktok/cover/:id — Self-Healing Thumbnail Cover
// Mengunduh & menyimpan cover ke disk lokal jika belum ada / kadaluarsa
// ═══════════════════════════════════════════════════════════════
router.get('/cover/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const localCover = await tiktokService.ensureLocalCover(id);

    if (localCover && localCover.filePath) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
      return res.sendFile(localCover.filePath);
    }

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, max-age=0');
    return res.status(200).send(FALLBACK_COVER_SVG);
  } catch (err) {
    console.error(`[API TIKTOK] Cover error #${req.params.id}:`, err.message);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, max-age=0');
    return res.status(200).send(FALLBACK_COVER_SVG);
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/tiktok/stream/:id — Streaming Proxy Video MP4
// Mengalirkan video langsung dari server backend Konsel Setara
// 100% Bebas dari kendala CORS, Referer Blocking, dan 403 Forbidden TikTok CDN
// ═══════════════════════════════════════════════════════════════
router.get('/stream/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playUrl = await tiktokService.getFreshPlayUrl(id);
    if (!playUrl) {
      return res.status(404).send('Video stream tidak ditemukan');
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
      'Referer': 'https://www.tiktok.com/'
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const streamResponse = await axios({
      method: 'get',
      url: playUrl,
      responseType: 'stream',
      headers,
      timeout: 15000
    });

    res.status(streamResponse.status);
    ['content-type', 'content-range', 'content-length', 'accept-ranges'].forEach((h) => {
      if (streamResponse.headers[h]) {
        res.setHeader(h, streamResponse.headers[h]);
      }
    });

    streamResponse.data.pipe(res);

    streamResponse.data.on('error', (err) => {
      console.warn(`[API TIKTOK] Stream pipe error #${id}:`, err.message);
      if (!res.headersSent) res.status(500).send('Streaming error');
    });
  } catch (err) {
    console.error(`[API TIKTOK] Stream proxy error #${req.params.id}:`, err.message);
    if (!res.headersSent) {
      return res.status(500).send('Gagal mengalirkan video');
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/tiktok/play/:id — Redirect Langsung ke Stream MP4 Aktif
// Jika token play_url lama kadaluarsa (403), otomatis direfresh ke link aktif
// ═══════════════════════════════════════════════════════════════
router.get('/play/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playUrl = await tiktokService.getFreshPlayUrl(id);
    if (!playUrl) {
      return res.status(404).json({
        success: false,
        message: 'Link streaming video tidak tersedia'
      });
    }
    // Redirect 302 langsung ke URL CDN MP4 yang segar dan aktif
    return res.redirect(302, playUrl);
  } catch (err) {
    console.error(`[API TIKTOK] Error resolving play URL untuk #${req.params.id}:`, err.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal memutar video',
      error: err.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/tiktok/stream-info/:id — Dapatkan JSON Stream URL Aktif
// ═══════════════════════════════════════════════════════════════
router.get('/stream-info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playUrl = await tiktokService.getFreshPlayUrl(id);
    return res.json({
      success: true,
      play_url: playUrl
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan info streaming video',
      error: err.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/tiktok/accounts — Daftar Akun TikTok Aktif
// ═══════════════════════════════════════════════════════════════
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await tiktokService.getAccounts();
    return res.json({
      success: true,
      data: accounts
    });
  } catch (err) {
    console.error('[API TIKTOK] Error fetching accounts:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar akun TikTok',
      error: err.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/tiktok/add — Tambah Video Manual via URL TikTok
// Body: { videoUrl: string, category: 'official' | 'daily' }
// ═══════════════════════════════════════════════════════════════
router.post('/add', middleware.isLoggedIn, requirePermission('video_konsel', 'create'), async (req, res) => {
  try {
    const { videoUrl, category = 'official' } = req.body;
    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Tautan videoUrl TikTok wajib diisi'
      });
    }

    const baseUrl = resolveRequestBaseUrl(req);
    const saved = await tiktokService.addVideoByUrl(videoUrl, category, baseUrl);
    return res.json({
      success: true,
      message: 'Video TikTok berhasil ditambahkan ke dalam aplikasi',
      data: saved
    });
  } catch (err) {
    console.error('[API TIKTOK] Error adding video:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan video TikTok',
      error: err.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/tiktok/list — Daftar Lengkap Video untuk Web Admin
// Query: ?category=all|official|daily & search=... & limit=10 & page=1
// ═══════════════════════════════════════════════════════════════
router.get('/list', middleware.isLoggedIn, requirePermission('video_konsel', 'read'), async (req, res) => {
  try {
    const { category = 'all', search = '', limit = 10, page = 1 } = req.query;
    const baseUrl = resolveRequestBaseUrl(req);
    const result = await tiktokService.getAllVideosAdmin({ category, search, limit, page, baseUrl });

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    console.error('[API TIKTOK] Error fetching admin list:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar video admin',
      error: err.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/tiktok/sync-covers — Sinkronisasi Thumbnail Lokal
// ═══════════════════════════════════════════════════════════════
router.post('/sync-covers', middleware.isLoggedIn, requirePermission('video_konsel', 'update'), async (req, res) => {
  try {
    const forceRefresh = Boolean(req.body?.force);
    tiktokService.syncMissingCoversInBackground({ forceRefresh });
    return res.json({
      success: true,
      message: 'Sinkronisasi thumbnail video sedang berjalan di background'
    });
  } catch (err) {
    console.error('[API TIKTOK] Error syncing covers:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal menjalankan sinkronisasi thumbnail',
      error: err.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// DELETE /api/v1/tiktok/:id — Hapus Video Permanen
// ═══════════════════════════════════════════════════════════════
router.delete('/:id', middleware.isLoggedIn, requirePermission('video_konsel', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    await tiktokService.deleteVideo(id);
    return res.json({
      success: true,
      message: `Video #${id} berhasil dihapus`
    });
  } catch (err) {
    console.error('[API TIKTOK] Error deleting video:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus video',
      error: err.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// PUT /api/v1/tiktok/:id — Edit Informasi Video (Kategori / Judul)
// ═══════════════════════════════════════════════════════════════
router.put('/:id', middleware.isLoggedIn, requirePermission('video_konsel', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title } = req.body;
    await tiktokService.updateVideo(id, { category, title });
    return res.json({
      success: true,
      message: `Video #${id} berhasil diperbarui`
    });
  } catch (err) {
    console.error('[API TIKTOK] Error updating video:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui video',
      error: err.message
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// PATCH /api/v1/tiktok/toggle/:id — Aktifkan / Sembunyikan Video
// Body: { is_active: boolean }
// ═══════════════════════════════════════════════════════════════
router.patch('/toggle/:id', middleware.isLoggedIn, requirePermission('video_konsel', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await tiktokService.toggleActive(id, is_active);
    return res.json({
      success: true,
      message: `Status video #${id} berhasil diperbarui`
    });
  } catch (err) {
    console.error('[API TIKTOK] Error toggling video:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status video',
      error: err.message
    });
  }
});

module.exports = router;
