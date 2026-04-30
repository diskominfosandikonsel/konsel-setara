import { apiCsr } from '../api/apiCsr'

const UPLOADS_BASE = 'https://server-csr.konaweselatankab.go.id/uploads/'

export const CsrService = {

  // ========== PUBLIC ENDPOINTS (no auth required) ==========

  // Home: latest kegiatan CSR
  getHomeCSR() {
    return apiCsr.post('api/v1/publish/homeCSR/homeCSRview')
  },

  // Home: latest berita
  getHomeBerita() {
    return apiCsr.post('api/v1/publish/homeCSR/beritaHome')
  },

  // Kegiatan CSR list (with filters & pagination)
  getKegiatanCSR(payload = {}) {
    return apiCsr.post('api/v1/publish/kegiatanCSR/kegiatanCSRview', payload)
  },

  // Detail kegiatan CSR
  getDetailCSR(id) {
    return apiCsr.post('api/v1/publish/kegiatanCSR/detailCSR', { id })
  },

  // Bidang CSR dropdown
  getBidangCSR() {
    return apiCsr.get('api/v1/publish/kegiatanCSR/bidangCSR')
  },

  // Sub-bidang CSR dropdown
  getSubBidangCSR(bidang_id) {
    return apiCsr.get('api/v1/publish/kegiatanCSR/subBidangCSR?bidang_id=' + bidang_id)
  },

  // Kecamatan dropdown
  getKecamatan() {
    return apiCsr.post('api/v1/publish/kegiatanCSR/kecamatan')
  },

  // Desa dropdown (by kecamatan)
  getDesa(kecamatan_id) {
    return apiCsr.post('api/v1/publish/kegiatanCSR/desa', { kecamatan_id })
  },

  // Berita CSR list (with pagination)
  getBeritaCSR(payload = {}) {
    return apiCsr.post('api/v1/publish/beritaCSR/getview', payload)
  },

  // Detail berita CSR
  getDetailBerita(id) {
    return apiCsr.post('api/v1/publish/beritaCSR/detilBerita', { id })
  },

  // Bidang Usaha dropdown (for registration)
  getBidangUsaha() {
    return apiCsr.post('api/v1/publish_bidang_usaha/view')
  },

  // Register mitra (company registration) — multipart form
  registerMitra(formData) {
    return apiCsr.post('api/v1/publish/registrasiMitra', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Lihat mitra yang ikut kegiatan
  getMitraKegiatan(kegiatan_id) {
    return apiCsr.get('api/v1/publish/kegiatanCSR/lihatmitra?id=' + kegiatan_id)
  },

  // ========== AUTHENTICATED ENDPOINTS (company panel) ==========

  // Profil perusahaan by users_id
  getProfilePerusahaan(users_id) {
    return apiCsr.post('api/v1/data_mitra/viewByUser', { users_id })
  },

  // Widget status pengajuan (diterima, ditolak, proses, total)
  getStatusPengajuan(users_id) {
    return apiCsr.post('api/v1/dashboard/statusPengajuan', { users_id })
  },

  // Bidang CSR chart data
  getBidangCSRChart(users_id) {
    return apiCsr.post('api/v1/dashboard/bidangCSR', { users_id })
  },

  // List pengajuan (filtered)
  getPengajuanSaya(payload = {}) {
    return apiCsr.post('api/v1/list_pengajuan/view', payload)
  },

  // Submit pengajuan program (route: kegiatan_csr, bukan list_pengajuan)
  addPengajuan(payload) {
    return apiCsr.post('api/v1/kegiatan_csr/addPengajuan', payload)
  },

  // Edit jumlah pengajuan
  editPengajuan(payload) {
    return apiCsr.post('api/v1/list_pengajuan/editPengajuan', payload)
  },

  // Hapus pengajuan
  removePengajuan(id) {
    return apiCsr.post('api/v1/list_pengajuan/removePengajuan', { id })
  },

  // Upload bukti dukung (multipart)
  uploadEviden(formData) {
    return apiCsr.post('api/v1/list_pengajuan/uploadEviden', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Lihat daftar bukti dukung
  getEviden(pengajuan_id) {
    return apiCsr.post('api/v1/list_pengajuan/viewEviden', { pengajuan_id })
  },

  // Hapus bukti dukung
  hapusEviden(id) {
    return apiCsr.post('api/v1/list_pengajuan/hapusEviden', { id })
  },

  // ========== HELPERS ==========
  getImageUrl(fileName) {
    if (!fileName) return null
    if (fileName.startsWith('http')) return fileName
    return UPLOADS_BASE + fileName
  }
}
