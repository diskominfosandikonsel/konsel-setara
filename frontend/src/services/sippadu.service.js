import { apiSippadu } from './apiSippadu'

export const SippaduService = {
  getLaporan(payload = {}) {
    return apiSippadu.post('server_laporan/viewAdmin', payload)
  }
}