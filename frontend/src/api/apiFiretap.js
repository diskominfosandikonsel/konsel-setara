import axios from 'axios'

export const apiFiretap = axios.create({
  baseURL: 'https://server-firetap.konaweselatankab.go.id/'
})

apiFiretap.interceptors.request.use((config) => {
  const token = localStorage.token

  if (token) {
    config.headers.Authorization = 'xxx ' + token
  }

  return config
})
