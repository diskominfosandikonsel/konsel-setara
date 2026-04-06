import axios from 'axios'

export const apiSippadu = axios.create({
  baseURL: 'https://server-sippadu.konaweselatankab.go.id/api/v1/'
})

apiSippadu.interceptors.request.use((config) => {
  const token = localStorage.token

  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }

  return config
})