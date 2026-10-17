const express = require('express');
const router = express.Router();
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
// POST /api/v1/tiktok/sync — Trigger Sinkronisasi Manual
// ═══════════════════════════════════════════════════════════════
router.post('/sync', middleware.isLoggedIn, requirePermission('video_konsel', 'update'), async (req, res) => {
  try {
    const results = await tiktokService.syncAllAccounts();
    return res.json({
      success: true,
      message: 'Proses sinkronisasi video TikTok berhasil dijalankan',
      results
    });
  } catch (err) {
    console.error('[API TIKTOK] Error running sync:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal menjalankan sinkronisasi TikTok',
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
