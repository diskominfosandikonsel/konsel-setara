import { apiBerita } from '../api/apiBerita'

export const BeritaService = {
  async getBerita(payload = {}) {

    const response = await apiBerita.post('web_publish_berita/view', payload)
    return response
  },

  async getVideo(payload = {}) {

    const response = await apiBerita.post('web_publish_video/view', payload)
    return response
  },

  async getPengumuman(payload = {}) {
    const response = await apiBerita.post('web_publish_pengumuman/view', payload)
    return response
  }

}