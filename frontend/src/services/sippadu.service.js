import { apiSippadu } from '../api/apiSippadu'

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

  // 📝 KIRIM LAPORAN BARU
  addData(payload) {
    return apiSippadu.post('publish_laporan/addData', payload)
  }
}