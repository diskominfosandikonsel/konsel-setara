import { apiSippadu } from '../api/apiSippadu'

export const SippaduService = {
  getLaporan(payload = {}) {
    return apiSippadu.post('server_laporan/viewAdmin', payload)
  },

  // Ambil laporan hanya milik user yang sedang login
  getLaporanUser(payload = {}) {
    return apiSippadu.post('publish_laporan/view', payload)
  },

  // 🌐 PERDA & PERKADA (Dari API Server SIPPADU Asli)
  getPerda() {
    return apiSippadu.get('publish_peraturan/perda')
  },
  getPerkada() {
    return apiSippadu.get('publish_peraturan/perkada')
  },

  // 📝 KIRIM LAPORAN BARU
  addData(payload) {
    return apiSippadu.post('publish_laporan/addData', payload)
  },

  // 📸 UPLOAD FOTO LAPORAN
  // Server mengharapkan raw binary (octet-stream) dengan header File-Name
  // Endpoint: /api/v1/laporan (lihat uploadImage.js di server referensi)
  async uploadFile(fileBlob, fileName) {
    const token = localStorage.token
    const url = 'https://server-sippadu.konaweselatankab.go.id/api/v1/laporan'
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'File-Name': fileName,
        ...(token ? { 'Authorization': 'kikensbatara ' + token } : {})
      },
      body: fileBlob
    })
    
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Fetch failed ${res.status}: ${errText}`)
    }
    
    return { data: 'OK' }
  }
}