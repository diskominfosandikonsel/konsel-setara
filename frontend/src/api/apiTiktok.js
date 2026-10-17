import { api } from './api'

export const apiTiktok = {
  /**
   * Mengambil feed video TikTok
   * @param {Object} params - { category: 'all'|'official'|'daily', limit: number, page: number }
   */
  getFeed: (params = {}) => api.get('/api/v1/tiktok/feed', { params }),

  /**
   * Mengambil daftar akun TikTok aktif
   */
  getAccounts: () => api.get('/api/v1/tiktok/accounts'),

  /**
   * Menambahkan video manual dari URL TikTok
   * @param {Object} data - { videoUrl: string, category: 'official'|'daily' }
   */
  addVideo: (data) => api.post('/api/v1/tiktok/add', data),

  /**
   * Mengambil info streaming video aktif (auto-refresh link jika expired)
   */
  getStreamInfo: (id) => api.get(`/api/v1/tiktok/stream-info/${id}`)
}
