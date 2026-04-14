import { apiSapa } from '../api/sapakonsel'

export const SapaService = {

  // 🔐 NEED TOKEN
  getLaporan(payload) {
    return apiSapa.post('publish_laporan/view', payload)
  },

  // 🌐 NO TOKEN
  getPengguna(payload) {
    return apiSapa.post('server_pengguna/view', payload)
  },

  getEdukasi(payload) {
    return apiSapa.post('client_artikel/view', payload)
  },

  async uploadEmergency(formData) {
    return apiSapa.post('publish_laporan/uploadEmergency', formData)
  },

  // 🔍 DETAIL LAPORAN
  getDetail(payload) {
    return apiSapa.post('publish_laporan/isi_laporan', payload)
  }

}