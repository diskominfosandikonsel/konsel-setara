import axios from 'axios'

export const apiPerak = axios.create({
  baseURL: 'https://serverperak.konaweselatankab.go.id/api/v1/'
})

apiPerak.interceptors.request.use((config) => {
  const token = localStorage.token

  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }

  return config
})