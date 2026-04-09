import { apiErida } from '../../api/erida'

export const PenelitianService = {

  getData(payload) {
    return apiErida.post('server_penelitian/view', payload)
  },

  addData(formData) {
    return apiErida.post('server_penelitian/addData', formData)
  },

  editData(formData) {
    return apiErida.post('server_penelitian/editData', formData)
  }
}