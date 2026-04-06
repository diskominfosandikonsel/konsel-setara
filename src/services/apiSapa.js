import axios from 'axios'

export const apiSapa = axios.create({
  baseURL: 'https://serversapakonsel.konaweselatankab.go.id/api/v1/'
})

apiSapa.interceptors.request.use((config) => {
  const token = localStorage.token

  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }

  return config
})