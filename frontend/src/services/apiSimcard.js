import axios from 'axios'

export const apiSimcard = axios.create({
  // baseURL: 'https://serversapakonsel.konaweselatankab.go.id/api/v1/'
  // baseURL: 'https://server-simcard.konaweselatankab.go.id/api/v1/'
  baseURL: 'http://server-simcard.konaweselatankab.go.id/'
  // baseURL: 'http://10.91.178.2:5012/'
  
  //  http://server-simcard.konaweselatankab.go.id/checkAuth
})

apiSimcard.interceptors.request.use((config) => {
  const token = localStorage.token

  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }

  return config
})