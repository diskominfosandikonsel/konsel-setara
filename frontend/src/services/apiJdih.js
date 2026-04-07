import axios from 'axios'

export const apiJdih = axios.create({
  baseURL: 'https://server.jdih.konaweselatankab.go.id/api/v1/'
})

apiJdih.interceptors.request.use((config) => {
  const token = localStorage.token

  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }

  return config
})