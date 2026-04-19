import { apiSlider } from '../api/apiSlider'

export const SliderService = {
  // Ambil semua data slider (Public)
  async getAll() {
    return await apiSlider.get('slider')
  },

  // Tambah slider baru (Admin only - upload file + link)
  async create(fd) {
    return await apiSlider.post('slider', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Update slider (ganti link dan/atau gambar)
  async update(id, fd) {
    return await apiSlider.put(`slider/${id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Hapus slider berdasarkan ID (Admin only)
  async remove(id) {
    return await apiSlider.delete(`slider/${id}`)
  },

  // Simpan urutan baru (Admin only)
  async reorder(orders) {
    return await apiSlider.post('slider/reorder', { orders })
  }
}
