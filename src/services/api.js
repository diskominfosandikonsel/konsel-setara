import axios from 'axios'

const api = axios.create({
  baseURL: 'http://10.202.204.37:5028/'
})

api.interceptors.request.use((config) => {
  const token = localStorage.token
  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }
  return config
})

export { api }