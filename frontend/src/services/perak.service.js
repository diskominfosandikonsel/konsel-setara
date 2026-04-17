import { apiPerak } from '../api/apiPerak'

// Fungsi pembantu untuk ambil user dari localStorage secara aman
const getActiveUser = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch (e) {
    return null
  }
}

export const PerakService = {
  getKecamatan() {
    return apiPerak.post('m_kecamatan/list')
  },
  getDesKel(id) {
    return apiPerak.post('m_des_kel/list', { kecamatan_id: id })
  },
  getPerkawinan() {
    return apiPerak.post('dm_perkawinan/list')
  },
  getAgama() {
    return apiPerak.post('dm_agama/list')
  },
  getPendidikan() {
    return apiPerak.post('dm_master_pendidikan/list')
  },
  getJurusan(id) {
    return apiPerak.post('dm_master_jurusan/list', { pendidikan_id: id })
  },
  getUpah() {
    return apiPerak.post('dm_master_besaran_upah/list')
  },
  getListKeterampilan(payload) {
    return apiPerak.post('dm_master_keterampilan/list1', payload)
  },


  getBiodata(payload = {}) {
    return apiPerak.post('keterangan_umum/view', payload)
  },
  addBiodata(payload) {
    return apiPerak.post('keterangan_umum/addData', payload)
  },
  editBiodata(payload) {
    return apiPerak.post('keterangan_umum/editData', payload)
  },
  removeBiodata(payload) {
    return apiPerak.post('keterangan_umum/removeData', payload)
  },
  getPendidikanFormal(payload = {}) {
    return apiPerak.post('pendidikan_formal/view', payload)
  },
  addPendidikan(payload) {
    return apiPerak.post('pendidikan_formal/addData', payload)
  },
  editPendidikan(payload) {
    return apiPerak.post('pendidikan_formal/editData', payload)
  },
  removePendidikan(payload) {
    return apiPerak.post('pendidikan_formal/removeData', payload)
  },

  getPengalaman(payload = {}) {
    return apiPerak.post('pengalaman_kerja/view', payload)
  },
  addPengalaman(payload) {
    return apiPerak.post('pengalaman_kerja/addData', payload)
  },
  editPengalaman(payload) {
    return apiPerak.post('pengalaman_kerja/editData', payload)
  },
  removePengalaman(payload) {
    return apiPerak.post('pengalaman_kerja/removeData', payload)
  },

  getJabatan(payload = {}) {
    return apiPerak.post('jabatan/view', payload)
  },
  addJabatan(payload) {
    return apiPerak.post('jabatan/addData', payload)
  },
  editJabatan(payload) {
    return apiPerak.post('jabatan/editData', payload)
  },
  removeJabatan(payload) {
    return apiPerak.post('jabatan/removeData', payload)
  },

  getLampiran(payload = {}) {
    return apiPerak.post('lampiran_biodata/view', payload)
  },
  addLampiran(payload) {
    return apiPerak.post('lampiran_biodata/addData', payload)
  },
  removeLampiran(payload) {
    return apiPerak.post('lampiran_biodata/removeData', payload)
  },

  getKeterampilan(params = {}) {
    return apiPerak.post('keterampilan/view', params)
  },
  addKeterampilan(payload) {
    return apiPerak.post('keterampilan/addData', payload)
  },
  removeKeterampilan(payload) {
    return apiPerak.post('keterampilan/removeData', payload)
  },


  // 📸 UPLOAD FOTO LAPORAN
  // Endpoint: /api/v1/laporan (lihat uploadImage.js di server referensi)
  uploadFile(fileBlob, fileName) {
    return apiPerak.post('laporan', fileBlob, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'File-Name': fileName
      }
    })
  }
}