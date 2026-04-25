import { defineStore } from 'pinia'
import { BeritaService } from 'src/services/berita.service'

export const useBeritaStore = defineStore('berita', {
  state: () => ({
    berita: [],
    video: [],
    loading: false
  }),

  actions: {


    async fetchBerita(payload = {}) {
      this.loading = true

      try {
        const res = await BeritaService.getBerita(payload)
        return res.data // ⬅️ return full response
      } catch (err) {
        return { data: [], jml_data: 1 }
      } finally {
        this.loading = false
      }
    },

    async fetchVideo(payload = {}) {
      this.loading = true

      try {
        const res = await BeritaService.getVideo(payload)
        return res.data // API response untuk data video
      } catch (err) {
        return { data: [], jml_data: 1 }
      } finally {
        this.loading = false
      }
    },

    async fetchPengumuman(payload = {}) {
      this.loading = true

      try {
        const res = await BeritaService.getPengumuman(payload)
        return res.data
      } catch (err) {
        return { data: [], jml_data: 1 }
      } finally {
        this.loading = false
      }
    }


  }
})