import axios from 'axios'

export const apiBerita = axios.create({
  baseURL: 'https://server-web.konaweselatankab.go.id/api/v1/'
})

// Web API Publik Konsel tidak membutuhkan token SapaKonsel/kikensbatara, 
// justru token tersebut menyebabkan CORS Block karena header terlarang.
apiBerita.interceptors.request.use((config) => {
  const token = localStorage.token

  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }

  return config
})