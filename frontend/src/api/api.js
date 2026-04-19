import axios from 'axios'

const api = axios.create({
  baseURL: 'https://konsel-setara.konaweselatankab.go.id/'
  // baseURL: 'http://localhost:5025/'
})

api.interceptors.request.use((config) => {
  const token = localStorage.token
  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }
  return config
})

export { api }