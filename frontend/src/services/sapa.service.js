import { apiSapa } from '../api/sapakonsel'
// import { sapaPublic } from './sapaPublic'

export const SapaService = {

  // 🔐 NEED TOKEN
  getLaporan(payload) {
    return apiSapa.post('server_laporan/viewAdmin', payload)
  },

  // 🌐 NO TOKEN
  getPengguna(payload) {
    return apiSapa.post('server_pengguna/view', payload)
  },

  getEdukasi(payload) {
    return apiSapa.post('client_artikel/view', payload)
  }

}