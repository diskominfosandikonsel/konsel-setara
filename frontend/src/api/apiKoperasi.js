import axios from 'axios'

// Konfigurasi endpoint Publik APLI DAKOP / Koperasi & UMKM
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Jika berjalan di dalam aplikasi Android native (Capacitor di HP)
    if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) {
      return 'https://statistik-server.konaweselatankab.go.id/api/v1/public/aplidakop'
    }

    const host = window.location.hostname
    // Jika sedang dibuka di browser development lokal laptop
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5020/api/v1/public/aplidakop'
    }
  }
  return 'https://statistik-server.konaweselatankab.go.id/api/v1/public/aplidakop'
}

export const apiKoperasi = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000
})

export const KoperasiService = {
  // 1. Ringkasan Agregat Publik
  getStatistik: () => apiKoperasi.get('/statistik-ringkasan'),

  // 2. Direktori Koperasi
  getKoperasi: (params = {}) => apiKoperasi.get('/koperasi', { params }),

  // 3. Direktori & Katalog Pelaku UMKM
  getUmkm: (params = {}) => apiKoperasi.get('/umkm', { params }),

  // 4. Data Master Wilayah & Referensi
  getKecamatan: () => apiKoperasi.get('/kecamatan'),
  getDesa: (kecamatanId) => apiKoperasi.get(`/desa/${kecamatanId}`),
  getJenisUsaha: () => apiKoperasi.get('/jenis-usaha'),
  getJenisKoperasi: () => apiKoperasi.get('/jenis-koperasi'),

  // 5. Cek Status Pendaftaran / Bantuan via NIK
  cekStatusPendaftaran: (nik) => apiKoperasi.get('/status-pendaftaran', { params: { nik } }),

  // 6. Formulir Pendaftaran Mandiri UMKM
  submitPendaftaran: (formData) => apiKoperasi.post('/pendaftaran-umkm', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // 7. Pengajuan Bantuan UMKM
  cariPelakuBantuan: (search) => apiKoperasi.get('/bantuan-umkm/pelaku', { params: { search } }),
  submitBantuan: (formData) => apiKoperasi.post('/bantuan-umkm', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
