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
   * Trigger sinkronisasi manual ke backend
   */
  sync: () => api.post('/api/v1/tiktok/sync'),

  /**
   * Menambahkan video manual dari URL TikTok
   * @param {Object} data - { videoUrl: string, category: 'official'|'daily' }
   */
  addVideo: (data) => api.post('/api/v1/tiktok/add', data)
}
