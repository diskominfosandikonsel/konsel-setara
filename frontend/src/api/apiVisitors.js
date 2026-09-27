import { api } from './api'

export const apiVisitors = {
  // Catat kunjungan harian (anti-spam idempotent)
  hit: (data = {}) => api.post('/api/v1/visitors/hit', data),

  // Ambil angka statistik pengunjung (Hari Ini, Bulan Ini, Total)
  getStats: () => api.get('/api/v1/visitors/stats')
}
