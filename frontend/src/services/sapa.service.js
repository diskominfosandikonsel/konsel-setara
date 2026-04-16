import { apiSapa } from '../api/sapakonsel'

export const SapaService = {
  
  getInfografis() {
    return apiSapa.get('publish_beranda/infografis')
  },

  async uploadEmergency(formData) {
    return apiSapa.post('publish_laporan/uploadEmergency', formData)
  },

  getEdukasi(payload) {
    return apiSapa.post('client_artikel/view', payload)
  },

  getDetailEdukasi(payload) {
    return apiSapa.post('client_artikel/isi_berita', payload)
  },

  getPengguna(payload) {
    return apiSapa.post('server_pengguna/view', payload)
  },

  getLaporan(payload) {
    return apiSapa.post('publish_laporan/view', payload)
  },

  getDetailLaporan(payload) {
    return apiSapa.post('publish_laporan/isi_laporan', payload)
  },

}