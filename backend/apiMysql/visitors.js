const express = require('express');
const router = express.Router();
const db = require('../db/MySql/utama');

// Helper untuk mengambil IP klien yang bersih
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/visitors/hit — Catat Kunjungan (Anti-Spam Idempotent)
// ═══════════════════════════════════════════════════════════════
router.post('/hit', (req, res) => {
  try {
    const platform = req.body.platform || 'android';
    const deviceId = req.body.deviceId || null;
    const userId = req.body.userId || null;
    const ipAddress = getClientIp(req);

    // Cek apakah kombinasi perangkat/IP sudah tercatat hari ini
    let checkSql = `
      SELECT id FROM app_visitors 
      WHERE visit_date = CURDATE() 
        AND (
          (? IS NOT NULL AND device_id = ?) 
          OR ip_address = ?
        )
      LIMIT 1
    `;

    db.query(checkSql, [deviceId, deviceId, ipAddress], (err, rows) => {
      if (err) {
        console.error('[VISITORS] Check hit error:', err);
        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
      }

      if (rows && rows.length > 0) {
        // Sudah tercatat hari ini
        return res.json({ success: true, message: 'Already recorded today', isNew: false });
      }

      // Catat kunjungan baru
      const insertSql = `
        INSERT INTO app_visitors (platform, ip_address, device_id, user_id, visit_date, created_at)
        VALUES (?, ?, ?, ?, CURDATE(), NOW())
      `;

      db.query(insertSql, [platform, ipAddress, deviceId, userId], (insErr, result) => {
        if (insErr) {
          console.error('[VISITORS] Insert hit error:', insErr);
          return res.status(500).json({ success: false, message: 'Insert error', error: insErr.message });
        }

        return res.json({
          success: true,
          message: 'Hit recorded successfully',
          isNew: true,
          id: result.insertId
        });
      });
    });
  } catch (error) {
    console.error('[VISITORS] Unexpected hit error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/visitors/stats — Statistik Kunjungan untuk Mobile
// ═══════════════════════════════════════════════════════════════
router.get('/stats', (req, res) => {
  const statsSql = `
    SELECT 
      COALESCE(COUNT(CASE WHEN visit_date = CURDATE() THEN 1 END), 0) AS today,
      COALESCE(COUNT(CASE WHEN MONTH(visit_date) = MONTH(CURDATE()) AND YEAR(visit_date) = YEAR(CURDATE()) THEN 1 END), 0) AS thisMonth,
      COALESCE(COUNT(id), 0) AS total
    FROM app_visitors
  `;

  db.query(statsSql, (err, rows) => {
    if (err) {
      console.error('[VISITORS] Stats error:', err);
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }

    const stats = rows && rows[0] ? rows[0] : { today: 0, thisMonth: 0, total: 0 };

    return res.json({
      success: true,
      data: {
        today: Number(stats.today) || 0,
        thisMonth: Number(stats.thisMonth) || 0,
        total: Number(stats.total) || 0
      }
    });
  });
});

module.exports = router;
