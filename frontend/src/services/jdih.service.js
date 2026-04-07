import { apiJdih } from './apiJdih'

export const JdihService = {

  // 🔐 NEED TOKEN
  // getLaporan(payload) {
  //   return apiJdih.post('server_laporan/viewAdmin', payload)
  // },

  // 🌐 NO TOKEN
  getProdukHukum(payload) {
    return apiJdih.post('publish_produk_hukum/views', payload)
  }

}