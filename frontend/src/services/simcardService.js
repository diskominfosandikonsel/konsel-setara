import { apiSimcard } from './apiSimcard'

export const SimcardService  = {

  // 🔐 NEED TOKEN
  // getLaporan(payload) {
  //   return apiSimcard.post('server_laporan/viewAdmin', payload)
  // },

  cekAuth() {
    return apiSimcard.get('checkAuth/checkAuth')
  },

  kk1_View(payload) {
    return apiSimcard.post('api/v1/permohonan_KK_baru/view', payload)
  },

  // 🌐 NO TOKEN
  getPengguna(payload) {
    return apiSimcard.post('server_pengguna/view', payload)
  }

}