import axios from 'axios'

export const apiBansos = axios.create({
  baseURL: 'https://server.hibah.konaweselatankab.go.id/'
})

apiBansos.interceptors.request.use((config) => {
  const token = localStorage.token

  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }

  return config
})