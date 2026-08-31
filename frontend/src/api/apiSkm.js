import { api } from './api'

export const apiSkm = {
  addUlasan: (data) => api.post('/api/v1/skm/addUlasan', data),
  checkStatus: (data) => api.post('/api/v1/skm/checkStatus', data),
  listAplikasi: () => api.post('/api/v1/skm/listAplikasi', {}),
  getDashboard: () => api.get('/api/v1/skm/getDashboard'),
}
