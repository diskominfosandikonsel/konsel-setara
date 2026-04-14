import { apiPerak } from '../api/apiPerak'

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