import axios from 'axios'

export const apiCsr = axios.create({
  baseURL: 'https://server-csr.konaweselatankab.go.id/'
})

apiCsr.interceptors.request.use((config) => {
  const token = localStorage.token
  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }
  return config
})
