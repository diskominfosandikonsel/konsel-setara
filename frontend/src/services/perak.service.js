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
  getBiodata(payload = {}) {
    return apiPerak.post('keterangan_umum/view', payload)
  },
  addBiodata(payload) {
    return apiPerak.post('keterangan_umum/addData', payload)
  },
  editData(payload) {
    return apiPerak.post('keterangan_umum/editData', payload)
  },
  removeData(payload) {
    return apiPerak.post('keterangan_umum/removeData', payload)
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