import { apiErida } from '../../api/erida'

export const PenelitianService = {
  getAll(params = {}) {
    return apiErida.get('penelitian', { params })
  },

  create(data) {
    return apiErida.post('penelitian', data)
  },

  update(id, data) {
    return apiErida.put(`penelitian/${id}`, data)
  },

  delete(id) {
    return apiErida.delete(`penelitian/${id}`)
  }
}