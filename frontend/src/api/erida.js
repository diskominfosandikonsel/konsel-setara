import axios from 'axios'

export const apiErida = axios.create({
  baseURL: 'https://server-erida.konaweselatankab.go.id/api/v1/'
})

apiErida.interceptors.request.use((config) => {
  const token = localStorage.token

  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }

  return config
})