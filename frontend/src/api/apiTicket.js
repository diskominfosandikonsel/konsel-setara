import axios from 'axios'

export const SLA_BASE_URL = 'https://helpdesk.konaweselatankab.go.id/api'

export const apiTicket = axios.create({
  baseURL: SLA_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

apiTicket.interceptors.request.use(
  (config) => {
    const slaToken = localStorage.getItem('sla_token') || localStorage.getItem('token')
    if (slaToken) {
      config.headers.Authorization = `Bearer ${slaToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiTicket.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[apiTicket] Sesi token SLA kedaluwarsa atau tidak valid.')
    }
    return Promise.reject(error)
  }
)

export default apiTicket
