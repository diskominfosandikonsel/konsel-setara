import axios from 'axios'

export const sapaPublic = axios.create({
  baseURL: 'https://serversapakonsel.konaweselatankab.go.id/api/v1/'
})