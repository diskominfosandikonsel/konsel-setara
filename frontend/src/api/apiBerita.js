import axios from 'axios'

export const apiBerita = axios.create({
  baseURL: 'https://server-web.konaweselatankab.go.id/api/v1/'
})

// Web API Publik Konsel tidak membutuhkan token SapaKonsel/kikensbatara, 
// justru token tersebut menyebabkan CORS Block karena header terlarang.
apiBerita.interceptors.request.use((config) => {
  // Hanya pakai form-data untuk mencegah preflight strict di server CI
  return config
})