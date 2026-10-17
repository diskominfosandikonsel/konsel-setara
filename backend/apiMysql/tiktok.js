const express = require('express');
const router = express.Router();
const axios = require('axios');
const tiktokService = require('../services/tiktokService');
const middleware = require('../auth/middlewares');
const { requirePermission } = require('../auth/accessControl');

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/tiktok/feed — Daftar Video TikTok untuk Mobile App
// Query: ?category=all|official|daily & limit=8 & page=1
// ═══════════════════════════════════════════════════════════════
router.get('/feed', async (req, res) => {
  try {
    const { category = 'all', limit = 8, page = 1 } = req.query;
    const videos = await tiktokService.getFeed({ category, limit, page });

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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
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

    const saved = await tiktokService.addVideoByUrl(videoUrl, category);
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
    const result = await tiktokService.getAllVideosAdmin({ category, search, limit, page });

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
