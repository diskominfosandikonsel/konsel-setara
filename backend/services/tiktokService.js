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
        const baseUrl = process.env.BASE_API_URL || 'https://konsel-setara.konaweselatankab.go.id';
        const mapped = (rows || []).map((r) => ({
          ...r,
          // Video selalu diputar melalui backend. URL CDN TikTok/TikWM bersifat
          // sementara dan tidak boleh diberikan langsung ke admin/mobile.
          play_url: `${baseUrl}/api/v1/tiktok/stream/${r.id}`,
        }));
        resolve(mapped);
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
  /**
   * Ekstraksi metadata lengkap video (mencoba direct stream TikWM dahulu, fallback ke oEmbed)
   */
  async fetchVideoMetadata(videoUrl) {
    const cleanUrl = videoUrl.trim();

    // 1. Coba ambil direct stream MP4 tanpa watermark via TikWM
    try {
      const tikwmApi = `https://tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`;
      const res = await axios.get(tikwmApi, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        timeout: 10000
      });

      if (res.data && res.data.code === 0 && res.data.data) {
        const d = res.data.data;
        return {
          title: d.title || '',
          author_unique_id: d.author?.unique_id || '',
          thumbnail_url: d.cover || '',
          play_url: d.play || d.wmplay || null,
          play_count: d.play_count || 0,
          digg_count: d.digg_count || 0,
          comment_count: d.comment_count || 0
        };
      }
    } catch (err) {
      console.warn(`[TikTokService] TikWM direct stream tidak tersedia, mencoba oEmbed... (${err.message})`);
    }

    // 2. Fallback ke official oEmbed
    const oembedMeta = await this.fetchOembedMetadata(cleanUrl);
    if (oembedMeta) {
      return {
        title: oembedMeta.title || '',
        author_unique_id: oembedMeta.author_unique_id || '',
        thumbnail_url: oembedMeta.thumbnail_url || '',
        play_url: null,
        play_count: 0,
        digg_count: 0,
        comment_count: 0
      };
    }

    return null;
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

    // Ambil metadata dari TikWM / oEmbed
    const meta = await this.fetchVideoMetadata(cleanUrl);

    const videoData = {
      tiktok_id: tiktokId,
      account_id: accountId,
      author_username: meta?.author_unique_id || authorUsername,
      category: category,
      title: meta?.title || 'Video Pemkab Konawe Selatan',
      video_url: cleanUrl,
      play_url: meta?.play_url || null, // Direct MP4 stream tanpa keluar aplikasi
      cover_url: meta?.thumbnail_url || null,
      play_count: meta?.play_count || 0,
      digg_count: meta?.digg_count || 0,
      comment_count: meta?.comment_count || 0,
      posted_at: new Date()
    };

    await this.saveVideo(videoData);
    return videoData;
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

  /**
   * Ambil semua video untuk Web Admin (termasuk yang tidak aktif)
   */
  async getAllVideosAdmin({ category = 'all', search = '', limit = 10, page = 1 } = {}) {
    return new Promise((resolve, reject) => {
      const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
      const parsedPage = Math.max(1, parseInt(page, 10) || 1);
      const offset = (parsedPage - 1) * parsedLimit;

      let whereConditions = [];
      const params = [];

      if (category && category !== 'all') {
        whereConditions.push('v.category = ?');
        params.push(category);
      }

      if (search && search.trim() !== '') {
        whereConditions.push('(v.title LIKE ? OR v.author_username LIKE ?)');
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const countSql = `SELECT COUNT(*) AS total FROM tiktok_videos v ${whereClause}`;
      db.query(countSql, params, (countErr, countRows) => {
        if (countErr) return reject(countErr);
        const total = countRows[0]?.total || 0;

        const dataSql = `
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
            v.is_active,
            v.posted_at,
            v.created_at,
            a.display_name AS account_name,
            a.badge_color
          FROM tiktok_videos v
          LEFT JOIN tiktok_accounts a ON v.account_id = a.id
          ${whereClause}
          ORDER BY v.id DESC
          LIMIT ? OFFSET ?
        `;

        db.query(dataSql, [...params, parsedLimit, offset], (dataErr, rows) => {
          if (dataErr) return reject(dataErr);
          const baseUrl = process.env.BASE_API_URL || 'https://konsel-setara.konaweselatankab.go.id';
          const mapped = (rows || []).map((r) => ({
            ...r,
            play_url: `${baseUrl}/api/v1/tiktok/stream/${r.id}`,
          }));
          resolve({
            data: mapped,
            pagination: {
              total,
              page: parsedPage,
              limit: parsedLimit,
              totalPages: Math.ceil(total / parsedLimit)
            }
          });
        });
      });
    });
  }

  /**
   * Hapus video TikTok dari database
   */
  async deleteVideo(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM tiktok_videos WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  /**
   * Perbarui informasi video TikTok
   */
  async updateVideo(id, { category, title }) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (category) {
        fields.push('category = ?');
        values.push(category);
      }
      if (typeof title === 'string') {
        fields.push('title = ?');
        values.push(title);
      }

      if (fields.length === 0) return resolve(null);

      values.push(id);
      const sql = `UPDATE tiktok_videos SET ${fields.join(', ')} WHERE id = ?`;
      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  /**
   * Mengambil video berdasarkan ID
   */
  async getVideoById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM tiktok_videos WHERE id = ? LIMIT 1';
      db.query(sql, [id], (err, rows) => {
        if (err) return reject(err);
        resolve(rows && rows.length > 0 ? rows[0] : null);
      });
    });
  }

  /**
   * Mendapatkan direct play_url yang valid dan aktif.
   * Jika play_url lama kadaluarsa (HTTP 403) atau kosong,
   * secara otomatis merefresh link stream baru via TikWM dan menyimpannya ke database.
   */
  async getFreshPlayUrl(videoId) {
    const video = await this.getVideoById(videoId);
    if (!video) throw new Error('Video tidak ditemukan');

    // Cek apakah play_url saat ini masih aktif
    if (video.play_url) {
      try {
        const check = await axios.head(video.play_url, {
          timeout: 3500,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          }
        });
        if (check.status === 200) {
          return video.play_url;
        }
      } catch (e) {
        console.warn(`[TikTokService] play_url video #${video.id} kadaluarsa (${e.message}), merefresh stream baru...`);
      }
    }

    // Ambil metadata & play_url baru via TikWM
    if (video.video_url) {
      try {
        const meta = await this.fetchVideoMetadata(video.video_url);
        if (meta && meta.play_url) {
          // Update play_url baru ke database agar request berikutnya cepat
          db.query(
            'UPDATE tiktok_videos SET play_url = ?, cover_url = COALESCE(?, cover_url), updated_at = NOW() WHERE id = ?',
            [meta.play_url, meta.thumbnail_url, video.id]
          );
          console.log(`[TikTokService] Berhasil merefresh stream aktif untuk video #${video.id}`);
          return meta.play_url;
        }
      } catch (refreshErr) {
        console.warn(`[TikTokService] Gagal merefresh play_url video #${video.id}:`, refreshErr.message);
      }
    }

    return video.play_url;
  }
}

module.exports = new TikTokService();
