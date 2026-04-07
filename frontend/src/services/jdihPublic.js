import axios from 'axios'

export const jdihPublic = axios.create({
  baseURL: 'https://server.jdih.konaweselatankab.go.id/api/v1/'
})