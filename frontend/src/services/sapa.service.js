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
  },

  // 📤 UPLOAD IMAGE (RAW BINARY)
  uploadFile(file, fileName) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async () => {
        try {
          await fetch(`${apiSapa.defaults.baseURL}/server_laporan/uploadImage`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
              'file-name': fileName
            },
            body: reader.result
          })

          resolve(true)
        } catch (err) {
          reject(err)
        }
      }

      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  },

  // 🚨 ADD DATA (LAPORAN BARU)
  addLaporan(payload) {
    return apiSapa.post('server_laporan/addData', payload)
  },

  // 🔍 DETAIL LAPORAN
  getDetail(payload) {
    return apiSapa.post('server_laporan/isi_laporan', payload)
  }

}