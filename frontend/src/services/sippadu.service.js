import { apiSippadu } from '../api/apiSippadu'
import axios from 'axios'

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
    return axios.get('http://localhost:5028/api/v1/sippadu_berita')
  },
  getDetailBerita(payload) {
    return axios.post('http://localhost:5028/api/v1/sippadu_berita/isi_berita', payload)
  }
}