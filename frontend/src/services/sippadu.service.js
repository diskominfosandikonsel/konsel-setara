import { apiSippadu } from './apiSippadu'
import { api } from './api'

export const SippaduService = {
  getLaporan(payload = {}) {
    return apiSippadu.post('server_laporan/viewAdmin', payload)
  },
  
  // Ambil laporan hanya milik user yang sedang login
  getLaporanUser(payload = {}) {
    return apiSippadu.post('publish_laporan/view', payload)
  },

  // 🌐 PERDA & PERKADA (Dari API Server SIPPADU Asli)
  getPerda() {
    return apiSippadu.get('publish_peraturan/perda')
  },
  getPerkada() {
    return apiSippadu.get('publish_peraturan/perkada')
  },

  // 📰 BERITA / BERANDA (Lewat Proxy API Backend Konsel-Setara lokal untuk bypass CORS)
  getBerita() {
    return api.get('api/v1/sippadu_berita')
  },
  getDetailBerita(payload) {
    return api.post('api/v1/sippadu_berita/isi_berita', payload)
  }
}