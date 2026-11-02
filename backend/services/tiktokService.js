const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('../db/MySql/utama');

const COVER_UPLOAD_DIR = path.join(__dirname, '../uploads/tiktok-covers');
if (!fs.existsSync(COVER_UPLOAD_DIR)) {
  fs.mkdirSync(COVER_UPLOAD_DIR, { recursive: true });
}

const DEFAULT_BASE_URL = (process.env.BASE_API_URL || 'https://konsel-setara.konaweselatankab.go.id').replace(/\/$/, '');
const TIKTOK_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Referer': 'https://www.tiktok.com/'
};

class TikTokService {
  constructor() {
    // Antrean berurutan untuk mencegah rate-limit TikWM (maks 1 request / detik)
    this.tikwmQueue = Promise.resolve();
    this.lastTikwmCallAt = 0;
    // Single-flight map agar request cover untuk ID yang sama tidak diunduh ganda
    this.coverInFlight = new Map();
    this.isSyncingCovers = false;
  }

  /**
   * Mencari file cover lokal yang sudah tersimpan di disk untuk video tertentu
   */
  findExistingLocalCoverFile(videoId, storedCoverUrl = '') {
    if (storedCoverUrl && !storedCoverUrl.startsWith('http://') && !storedCoverUrl.startsWith('https://')) {
      const normalized = storedCoverUrl.replace(/^\/+/, '');
      if (normalized.startsWith('uploads/tiktok-covers/')) {
        const filename = path.basename(normalized);
        const fullPath = path.join(COVER_UPLOAD_DIR, filename);
        if (fs.existsSync(fullPath)) {
          return {
            filename,
            relativePath: `uploads/tiktok-covers/${filename}`,
            filePath: fullPath
          };
        }
      }
    }

    if (videoId) {
      for (const ext of ['jpg', 'webp', 'png', 'jpeg']) {
        const filename = `cover_${videoId}.${ext}`;
        const fullPath = path.join(COVER_UPLOAD_DIR, filename);
        if (fs.existsSync(fullPath)) {
          return {
            filename,
            relativePath: `uploads/tiktok-covers/${filename}`,
            filePath: fullPath
          };
        }
      }
    }

    return null;
  }

  /**
   * Menghapus seluruh variasi file cover lokal saat video dihapus atau diganti ekstensi
   */
  removeLocalCoverFiles(videoId, exceptFilename = null) {
    if (!videoId) return;
    for (const ext of ['jpg', 'webp', 'png', 'jpeg']) {
      const filename = `cover_${videoId}.${ext}`;
      if (exceptFilename && filename === exceptFilename) continue;
      const fullPath = path.join(COVER_UPLOAD_DIR, filename);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.warn(`[TikTokService] Gagal menghapus file cover lama ${filename}:`, err.message);
      }
    }
  }

  /**
   * Membentuk URL cover publik untuk Mobile App & Web Admin:
   * - Jika file lokal tersedia di disk -> langsung mengarah ke file statis /uploads/tiktok-covers/...
   * - Jika belum tersedia -> mengarah ke endpoint self-healing /api/v1/tiktok/cover/:id
   */
  buildPublicCoverUrl(row, baseUrl = DEFAULT_BASE_URL) {
    const cleanBase = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    const localCover = this.findExistingLocalCoverFile(row.id, row.cover_url);
    if (localCover) {
      return `${cleanBase}/${localCover.relativePath}`;
    }
    return `${cleanBase}/api/v1/tiktok/cover/${row.id}`;
  }

  /**
   * Mengecek apakah URL remote CDN TikTok kemungkinan masih aktif berdasarkan parameter x-expires
   */
  isRemoteUrlLikelyValid(url) {
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return false;
    }
    const expMatch = url.match(/[?&]x-expires=(\d+)/);
    if (expMatch && expMatch[1]) {
      const expiresAt = parseInt(expMatch[1], 10);
      const nowSec = Math.floor(Date.now() / 1000);
      return expiresAt > nowSec + 120;
    }
    return true;
  }

  /**
   * Mengunduh gambar cover dari CDN dan menyimpannya secara permanen di uploads/tiktok-covers/
   */
  async downloadImageToLocal(videoId, imageUrl) {
    if (!videoId || !imageUrl || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
      return null;
    }

    try {
      const res = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          ...TIKTOK_HEADERS,
          'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
        }
      });

      const buffer = Buffer.from(res.data || []);
      if (res.status !== 200 || buffer.length < 500) {
        return null;
      }

      const contentType = String(res.headers['content-type'] || '').toLowerCase();
      // Validasi magic bytes gambar agar tidak menyimpan halaman error HTML/JSON
      const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
      const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isWebp = buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP';

      if (!contentType.startsWith('image/') && !isJpeg && !isPng && !isWebp) {
        return null;
      }

      let ext = 'jpg';
      if (isWebp || contentType.includes('webp')) {
        ext = 'webp';
      } else if (isPng || contentType.includes('png')) {
        ext = 'png';
      }

      if (!fs.existsSync(COVER_UPLOAD_DIR)) {
        fs.mkdirSync(COVER_UPLOAD_DIR, { recursive: true });
      }

      const filename = `cover_${videoId}.${ext}`;
      const fullPath = path.join(COVER_UPLOAD_DIR, filename);
      const tempPath = `${fullPath}.${process.pid}.${Date.now()}.tmp`;

      fs.writeFileSync(tempPath, buffer);
      fs.renameSync(tempPath, fullPath);
      this.removeLocalCoverFiles(videoId, filename);

      return {
        filename,
        relativePath: `uploads/tiktok-covers/${filename}`,
        filePath: fullPath
      };
    } catch (err) {
      console.warn(`[TikTokService] Gagal mengunduh cover video #${videoId}:`, err.message);
      return null;
    }
  }

  /**
   * Menjalankan pemanggilan ke TikWM secara berurutan (jeda minimal 1,4 detik)
   * agar bebas dari penolakan rate-limit ketika memproses beberapa video sekaligus
   */
  enqueueTikwmRequest(taskFn) {
    const run = async () => {
      const minIntervalMs = 1400;
      const elapsed = Date.now() - this.lastTikwmCallAt;
      if (elapsed < minIntervalMs) {
        await new Promise((r) => setTimeout(r, minIntervalMs - elapsed));
      }
      this.lastTikwmCallAt = Date.now();
      return taskFn();
    };

    const next = this.tikwmQueue.then(run, run);
    this.tikwmQueue = next.catch(() => {});
    return next;
  }

  /**
   * Mengambil daftar feed video untuk mobile app
   * Mendukung filter category ('all', 'official', 'daily')
   */
  async getFeed({ category = 'all', limit = 8, page = 1, baseUrl = DEFAULT_BASE_URL } = {}) {
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
        const cleanBase = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
        const mapped = (rows || []).map((r) => ({
          ...r,
          // Video selalu diputar melalui backend. URL CDN TikTok/TikWM bersifat
          // sementara dan tidak boleh diberikan langsung ke admin/mobile.
          play_url: `${cleanBase}/api/v1/tiktok/stream/${r.id}`,
          cover_url: this.buildPublicCoverUrl(r, cleanBase),
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
   * Ekstraksi ID unik dari URL TikTok (mendukung /video/, /photo/, dan shortlink vt.tiktok.com)
   */
  extractTikTokId(url) {
    const mediaMatch = url.match(/\/(?:video|photo)\/(\d+)/);
    if (mediaMatch && mediaMatch[1]) return mediaMatch[1];

    const shortMatch = url.match(/tiktok\.com\/(?:t\/)?([^/?#@][^/?#]*)/);
    if (shortMatch && shortMatch[1]) return shortMatch[1];

    return `tt_${Date.now()}`;
  }

  /**
   * Mencari primary key ID berdasarkan tiktok_id
   */
  async findVideoIdByTiktokId(tiktokId) {
    return new Promise((resolve, reject) => {
      db.query('SELECT id FROM tiktok_videos WHERE tiktok_id = ? LIMIT 1', [tiktokId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows && rows.length > 0 ? rows[0].id : null);
      });
    });
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
          cover_url = CASE
            WHEN VALUES(cover_url) LIKE 'uploads/tiktok-covers/%' THEN VALUES(cover_url)
            WHEN cover_url LIKE 'uploads/tiktok-covers/%' THEN cover_url
            ELSE COALESCE(VALUES(cover_url), cover_url)
          END,
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
   * Ekstraksi metadata lengkap video (mencoba direct stream TikWM terantre dahulu, fallback ke oEmbed)
   */
  async fetchVideoMetadata(videoUrl) {
    const cleanUrl = videoUrl.trim();

    // 1. Coba ambil direct stream MP4 & cover via TikWM dengan proteksi antrean rate-limit
    try {
      const tikwmData = await this.enqueueTikwmRequest(async () => {
        const tikwmApi = `https://tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`;
        let res = await axios.get(tikwmApi, {
          headers: { 'User-Agent': TIKTOK_HEADERS['User-Agent'] },
          timeout: 12000
        });

        // Jika masih terkena rate-limit (-1), tunggu 2 detik dan coba 1x lagi
        if (res.data && res.data.code === -1) {
          await new Promise((r) => setTimeout(r, 2000));
          this.lastTikwmCallAt = Date.now();
          res = await axios.get(tikwmApi, {
            headers: { 'User-Agent': TIKTOK_HEADERS['User-Agent'] },
            timeout: 12000
          });
        }

        return res.data;
      });

      if (tikwmData && tikwmData.code === 0 && tikwmData.data) {
        const d = tikwmData.data;
        return {
          aweme_id: d.id ? String(d.id) : '',
          title: d.title || '',
          author_unique_id: d.author?.unique_id || '',
          thumbnail_url: d.cover || d.origin_cover || '',
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
        aweme_id: oembedMeta.embed_product_id ? String(oembedMeta.embed_product_id) : '',
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
   * Sekaligus mengunduh file thumbnail cover secara permanen ke penyimpanan lokal
   */
  async addVideoByUrl(videoUrl, category = 'official', baseUrl = DEFAULT_BASE_URL) {
    const cleanUrl = videoUrl.trim();

    // Ambil akun yang cocok
    const accounts = await this.getAccounts();
    let matchedAccount = accounts.find(a => a.category === category);
    if (!matchedAccount && accounts.length > 0) matchedAccount = accounts[0];

    const accountId = matchedAccount ? matchedAccount.id : 1;
    const authorUsername = matchedAccount ? matchedAccount.username : 'diskominfo.konsel';

    // Ambil metadata dari TikWM / oEmbed terlebih dahulu
    const meta = await this.fetchVideoMetadata(cleanUrl);
    const tiktokId = meta?.aweme_id || this.extractTikTokId(cleanUrl);

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

    const saveResult = await this.saveVideo(videoData);
    const savedId = (saveResult && saveResult.insertId)
      ? saveResult.insertId
      : await this.findVideoIdByTiktokId(tiktokId);

    if (savedId) {
      videoData.id = savedId;
      if (meta?.thumbnail_url) {
        const localCover = await this.downloadImageToLocal(savedId, meta.thumbnail_url);
        if (localCover) {
          await new Promise((resolve) => {
            db.query(
              'UPDATE tiktok_videos SET cover_url = ?, updated_at = NOW() WHERE id = ?',
              [localCover.relativePath, savedId],
              () => resolve()
            );
          });
          videoData.cover_url = localCover.relativePath;
        }
      }
      const cleanBase = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
      videoData.cover_url = this.buildPublicCoverUrl(videoData, cleanBase);
      videoData.play_url = `${cleanBase}/api/v1/tiktok/stream/${savedId}`;
    }

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
  async getAllVideosAdmin({ category = 'all', search = '', limit = 10, page = 1, baseUrl = DEFAULT_BASE_URL } = {}) {
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
          const cleanBase = (baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
          const mapped = (rows || []).map((r) => ({
            ...r,
            play_url: `${cleanBase}/api/v1/tiktok/stream/${r.id}`,
            cover_url: this.buildPublicCoverUrl(r, cleanBase),
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
   * Hapus video TikTok dari database beserta file cover lokalnya
   */
  async deleteVideo(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM tiktok_videos WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        this.removeLocalCoverFiles(id);
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
   * Memastikan file cover lokal tersedia di disk untuk video tertentu.
   * Jika belum ada, mencoba mengunduh dari cover_url aktif atau merefresh via TikWM,
   * lalu menyimpan file ke uploads/tiktok-covers/ dan mengupdate database.
   */
  async ensureLocalCover(videoId, { forceRefresh = false } = {}) {
    const key = String(videoId);
    if (!forceRefresh && this.coverInFlight.has(key)) {
      return this.coverInFlight.get(key);
    }

    const job = (async () => {
      const video = await this.getVideoById(videoId);
      if (!video) return null;

      // 1. Cek apakah sudah tersedia di disk lokal
      if (!forceRefresh) {
        const existingLocal = this.findExistingLocalCoverFile(video.id, video.cover_url);
        if (existingLocal) {
          if (video.cover_url !== existingLocal.relativePath) {
            db.query(
              'UPDATE tiktok_videos SET cover_url = ? WHERE id = ?',
              [existingLocal.relativePath, video.id]
            );
          }
          return existingLocal;
        }
      }

      // 2. Jika cover_url di DB berupa URL remote yang belum melewati x-expires, unduh langsung tanpa memanggil TikWM
      if (!forceRefresh && this.isRemoteUrlLikelyValid(video.cover_url)) {
        const directDownload = await this.downloadImageToLocal(video.id, video.cover_url);
        if (directDownload) {
          db.query(
            'UPDATE tiktok_videos SET cover_url = ?, updated_at = NOW() WHERE id = ?',
            [directDownload.relativePath, video.id]
          );
          return directDownload;
        }
      }

      // 3. Jika URL lama sudah kadaluarsa (HTTP 403) atau kosong, ambil URL cover segar via TikWM (terantre aman)
      if (video.video_url) {
        const meta = await this.fetchVideoMetadata(video.video_url);
        if (meta && meta.thumbnail_url) {
          const refreshedDownload = await this.downloadImageToLocal(video.id, meta.thumbnail_url);
          if (refreshedDownload) {
            db.query(
              'UPDATE tiktok_videos SET cover_url = ?, play_url = COALESCE(?, play_url), updated_at = NOW() WHERE id = ?',
              [refreshedDownload.relativePath, meta.play_url || null, video.id]
            );
            return refreshedDownload;
          }
        }
      }

      return null;
    })();

    this.coverInFlight.set(key, job);
    try {
      return await job;
    } finally {
      this.coverInFlight.delete(key);
    }
  }

  /**
   * Menyinkronkan seluruh video lama di database yang belum memiliki file cover lokal di disk.
   * Berjalan satu kali secara non-blocking di background saat server menyala (atau saat dipicu admin).
   */
  async syncMissingCoversInBackground({ forceRefresh = false } = {}) {
    if (this.isSyncingCovers) {
      return { started: false, message: 'Sinkronisasi cover sedang berjalan' };
    }

    this.isSyncingCovers = true;
    try {
      const rows = await new Promise((resolve, reject) => {
        db.query(
          'SELECT id, video_url, cover_url FROM tiktok_videos ORDER BY is_active DESC, id DESC',
          (err, res) => (err ? reject(err) : resolve(res || []))
        );
      });

      const targets = forceRefresh
        ? rows
        : rows.filter((r) => !this.findExistingLocalCoverFile(r.id, r.cover_url));

      if (targets.length === 0) {
        return { started: true, total: rows.length, synced: 0, skipped: rows.length };
      }

      console.log(`[TikTokService] Menyinkronkan ${targets.length} thumbnail video ke penyimpanan lokal...`);
      let synced = 0;
      for (const row of targets) {
        try {
          const saved = await this.ensureLocalCover(row.id, { forceRefresh });
          if (saved) synced++;
        } catch (err) {
          console.warn(`[TikTokService] Gagal sinkron cover video #${row.id}:`, err.message);
        }
      }
      console.log(`[TikTokService] Sinkronisasi cover selesai: ${synced}/${targets.length} thumbnail tersimpan lokal.`);
      return { started: true, total: rows.length, synced, attempted: targets.length };
    } catch (err) {
      console.error('[TikTokService] Error saat sinkronisasi cover background:', err.message);
      return { started: false, error: err.message };
    } finally {
      this.isSyncingCovers = false;
    }
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
            'User-Agent': TIKTOK_HEADERS['User-Agent']
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
          // Pastikan tidak menimpa cover_url lokal yang sudah permanen dengan URL CDN sementara
          let nextCoverPath = null;
          if (!this.findExistingLocalCoverFile(video.id, video.cover_url) && meta.thumbnail_url) {
            const downloaded = await this.downloadImageToLocal(video.id, meta.thumbnail_url);
            if (downloaded) {
              nextCoverPath = downloaded.relativePath;
            }
          }

          db.query(
            'UPDATE tiktok_videos SET play_url = ?, cover_url = COALESCE(?, cover_url), updated_at = NOW() WHERE id = ?',
            [meta.play_url, nextCoverPath, video.id]
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
