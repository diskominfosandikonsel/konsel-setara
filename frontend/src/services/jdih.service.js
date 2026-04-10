import { apiJdih } from '../api/apiJdih'

export const JdihService = {

  // 🔐 NEED TOKEN
  // getLaporan(payload) {
  //   return apiJdih.post('server_laporan/viewAdmin', payload)
  // },

  // 🌐 NO TOKEN
  getProdukHukum(payload) {
    return apiJdih.post('publish_produk_hukum/views', payload)
  },
  getDetailProduk(id) {
    return apiJdih.post('publish_produk_hukum/getOne', { id: id });
  },
  getDokumen(payload) {
    return apiJdih.post('publish_dokumen/view', payload)
  },
  // getDetailDokumen(id) {
  //   return apiJdih.post('publish_produk_hukum/', { id: id });
  // },

}