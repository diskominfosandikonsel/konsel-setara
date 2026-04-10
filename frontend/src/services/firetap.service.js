import { apiFiretap } from '../api/apiFiretap'

const BASE_URL = 'https://server-firetap.konaweselatankab.go.id/'

export const FiretapAuthService = {
  login(data) {
    return apiFiretap.post('auth/login', data)
  },
  register(data) {
    return apiFiretap.post('auth/signup_mobile', data)
  }
}

export const FiretapService = {
  // Dashboard / Beranda
  getDashboard() {
    return apiFiretap.get('api/v1/publish_beranda/')
  },

  // Kasus (Laporan Kebakaran)
  getKasus(payload = {}) {
    return apiFiretap.post('api/v1/server_kasus/view', payload)
  },

  // Telepon Penting / Darurat
  getTeleponPenting() {
    return apiFiretap.get('api/v1/publishTelepon/view')
  },

  getDetailKasus(id) {
    return apiFiretap.post('api/v1/server_kasus/detail_kasus', { id })
  },

  // Tambah kasus baru (dari mobile)
  addKasus(payload) {
    return apiFiretap.post('api/v1/server_kasus/addMobile', payload)
  },

  // Upload foto kasus (octet-stream)
  uploadFoto(fileBlob, fileName) {
    return apiFiretap.post('api/v1/publishKasus/uploadImage', fileBlob, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'File-Name': fileName
      }
    })
  },

  // Update lokasi user
  updateLokasi(payload) {
    return apiFiretap.post('api/v1/updateLocation/', payload)
  },

  // Pegawai satgas
  getPegawaiByKasus(id_kasus) {
    return apiFiretap.post('api/v1/dataPegawai/sesuai_kasus', { id_kasus })
  },
  getSatgasByKasus(id_kasus) {
    return apiFiretap.post('api/v1/dataPegawai/dari_satgas', { id_kasus })
  },

  // Tambah Satgas ke kasus
  cekSatgas(id_kasus, id_user) {
    return apiFiretap.post('api/v1/server_kasus/cek_satgas', { id_kasus, id_user })
  },
  addSatgas(id_kasus) {
    return apiFiretap.post('api/v1/server_kasus/addSatgas', { id_kasus })
  }
}
