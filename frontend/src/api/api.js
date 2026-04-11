import axios from 'axios'

const api = axios.create({
<<<<<<< HEAD
  // baseURL: 'https://konsel-setara.konaweselatankab.go.id/'
  baseURL: 'http://localhost:5028/'
=======
  baseURL: 'https://konsel-setara.konaweselatankab.go.id/'
  //baseURL: 'http://localhost:5028/'
>>>>>>> 00d41cef982e603e971422f0c794e4e2e28f0c70
})

api.interceptors.request.use((config) => {
  const token = localStorage.token
  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }
  return config
})

export { api }