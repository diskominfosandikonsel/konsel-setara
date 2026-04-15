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
        
        console.log("================================")
        console.log("ISI MENTAH DATA VIDEO DARI SERVER:", res.data)
        console.log("================================")

        return res.data // API response untuk data video
      } catch (err) {
        return { data: [], jml_data: 1 }
      } finally {
        this.loading = false
      }
    }


  }
})