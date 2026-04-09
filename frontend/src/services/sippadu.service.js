import { apiSippadu } from '../api/apiSippadu'
import { api } from '../api/api'
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

  // 📰 BERITA / BERANDA (Menggunakan AllOrigins Proxy untuk Bypass CORS langsung dari Browser)
  // Karena server backend produksi memiliki batasan network (firewall) untuk akses keluar.
  async getBerita() {
    const targetUrl = encodeURIComponent('https://server-web.konaweselatankab.go.id/api/v1/publish_satpol_pengumuman/beritaAndroidDashboard')
    const res = await axios.get(`https://api.allorigins.win/get?url=${targetUrl}`)
    // AllOrigins mengembalikan data dalam nested field 'contents' sebagai string
    return { data: JSON.parse(res.data.contents) }
  },

  async getDetailBerita(payload) {
    // Karena AllOrigins adalah GET proxy, kita sertakan ID berita sebagai parameter di URL target
    const targetUrl = encodeURIComponent(`https://server-web.konaweselatankab.go.id/api/v1/publish_satpol_pengumuman/isi_berita?id=${payload.id}&data_ke=1&cari_value=`)
    
    const res = await axios.get(`https://api.allorigins.win/get?url=${targetUrl}`)
    let result = JSON.parse(res.data.contents)

    // Kembalikan dalam format yang diharapkan detail news page
    return { data: result }
  }
}