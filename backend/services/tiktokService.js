const axios = require('axios');
const db = require('../db/MySql/utama');

class TikTokService {
  /**
   * Mengambil daftar feed video untuk mobile app
   * Mendukung filter category ('all', 'official', 'daily')
   */
  async getFeed({ category = 'all', limit = 8, page = 1 } = {}) {
    return new Promise((resolve, reject) => {
      const parsedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 8));
      const parsedPage = Math.max(1, parseInt(page, 10) || 1);
      const offset = (parsedPage - 1) * parsedLimit;

      let whereConditions = ['v.is_active = 1'];
      const params = [];

      if (category && category !== 'all') {
        whereConditions.push('v.category = ?');
        params.push(category);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          v.id,
          v.tiktok_id,
          v.account_id,
          v.author_username,
          v.category,
          v.title,
          v.video_url,
          v.play_url,
          v.cover_url,
          v.play_count,
          v.digg_count,
          v.comment_count,
          v.posted_at,
          v.created_at,
          a.display_name AS account_name,
          a.badge_color,
          a.avatar_url AS account_avatar
        FROM tiktok_videos v
        LEFT JOIN tiktok_accounts a ON v.account_id = a.id
        ${whereClause}
        ORDER BY v.posted_at DESC
        LIMIT ? OFFSET ?
      `;

      params.push(parsedLimit, offset);

      db.query(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  /**
   * Mengambil daftar akun TikTok yang dipantau
   */
  async getAccounts() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, username, display_name, category, badge_color, avatar_url, is_active, last_sync_at
        FROM tiktok_accounts
        WHERE is_active = 1
        ORDER BY id ASC
      `;
      db.query(query, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  /**
   * Ekstraksi metadata video menggunakan TikTok oEmbed API Resmi
   */
  async fetchOembedMetadata(videoUrl) {
    try {
      const cleanUrl = videoUrl.trim();
      const oembedApi = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;

      const response = await axios.get(oembedApi, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 10000
      });

      if (response.data) {
        return {
          title: response.data.title || '',
          author_name: response.data.author_name || '',
          author_url: response.data.author_url || '',
          author_unique_id: response.data.author_unique_id || '',
          thumbnail_url: response.data.thumbnail_url || '',
          html: response.data.html || '',
          embed_product_id: response.data.embed_product_id || ''
        };
      }
      return null;
    } catch (err) {
      console.warn(`[TikTokService] oEmbed gagal untuk URL ${videoUrl}:`, err.message);
      return null;
    }
  }

  /**
   * Ekstraksi ID unik dari URL TikTok
   */
  extractTikTokId(url) {
    const videoMatch = url.match(/\/video\/(\d+)/);
    if (videoMatch && videoMatch[1]) return videoMatch[1];

    const shortMatch = url.match(/tiktok\.com\/([^/?#]+)/);
    if (shortMatch && shortMatch[1]) return shortMatch[1];

    return `tt_${Date.now()}`;
  }

  /**
   * Menambahkan atau memperbarui video di database
   */
  async saveVideo(videoData) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO tiktok_videos (
          tiktok_id, account_id, author_username, category, title, video_url, 
          play_url, cover_url, play_count, digg_count, comment_count, posted_at, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          cover_url = COALESCE(VALUES(cover_url), cover_url),
          play_url = COALESCE(VALUES(play_url), play_url),
          play_count = VALUES(play_count),
          digg_count = VALUES(digg_count),
          comment_count = VALUES(comment_count),
          updated_at = CURRENT_TIMESTAMP
      `;

      const values = [
        videoData.tiktok_id,
        videoData.account_id,
        videoData.author_username,
        videoData.category || 'official',
        videoData.title || '',
        videoData.video_url,
        videoData.play_url || null,
        videoData.cover_url || null,
        videoData.play_count || 0,
        videoData.digg_count || 0,
        videoData.comment_count || 0,
        videoData.posted_at || new Date()
      ];

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  /**
   * Menambahkan video manual dari URL postingan TikTok
   */
  async addVideoByUrl(videoUrl, category = 'official') {
    const cleanUrl = videoUrl.trim();
    const tiktokId = this.extractTikTokId(cleanUrl);

    // Ambil akun yang cocok
    const accounts = await this.getAccounts();
    let matchedAccount = accounts.find(a => a.category === category);
    if (!matchedAccount && accounts.length > 0) matchedAccount = accounts[0];

    const accountId = matchedAccount ? matchedAccount.id : 1;
    const authorUsername = matchedAccount ? matchedAccount.username : 'diskominfo.konsel';

    // Ambil metadata dari oEmbed
    const meta = await this.fetchOembedMetadata(cleanUrl);

    const videoData = {
      tiktok_id: tiktokId,
      account_id: accountId,
      author_username: meta?.author_unique_id || authorUsername,
      category: category,
      title: meta?.title || 'Video Pemkab Konawe Selatan',
      video_url: cleanUrl,
      play_url: null, // Siap untuk in-app embed / stream
      cover_url: meta?.thumbnail_url || null,
      posted_at: new Date()
    };

    await this.saveVideo(videoData);
    return videoData;
  }

  /**
   * Sinkronisasi akun TikTok yang terdaftar
   */
  async syncAllAccounts() {
    try {
      console.log('🔄 [TikTokService] Memulai proses sinkronisasi akun TikTok...');
      const accounts = await this.getAccounts();
      const results = [];

      for (const acc of accounts) {
        try {
          console.log(`📡 [TikTokService] Memeriksa akun: @${acc.username} (${acc.display_name})...`);

          // Catat waktu sinkronisasi
          await new Promise((resolve) => {
            db.query(
              'UPDATE tiktok_accounts SET last_sync_at = NOW() WHERE id = ?',
              [acc.id],
              resolve
            );
          });

          results.push({ account: acc.username, status: 'synced' });
        } catch (accountErr) {
          console.error(`❌ [TikTokService] Error sinkronisasi @${acc.username}:`, accountErr.message);
          results.push({ account: acc.username, status: 'error', message: accountErr.message });
        }
      }

      return results;
    } catch (err) {
      console.error('❌ [TikTokService] Global sync error:', err.message);
      throw err;
    }
  }

  /**
   * Toggle status aktif video (Sembunyikan / Tampilkan)
   */
  async toggleActive(id, isActive) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE tiktok_videos SET is_active = ? WHERE id = ?';
      db.query(sql, [isActive ? 1 : 0, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

module.exports = new TikTokService();
