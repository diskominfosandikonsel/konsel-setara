import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { SapaService } from 'src/services/sapa.service'

export const useSapaStore = defineStore('sapa', {
  state: () => ({
    laporan: [],
    pengguna: [],
    loading: false
  }),

  actions: {

    // 🔐 LAPORAN (WITH TOKEN)
    async fetchLaporan(payload) {
      this.loading = true
      Loading.show()

      try {
        const res = await SapaService.getLaporan(payload)
        this.laporan = res.data.data || res.data
      } catch (err) {
        Notify.create({
          message: 'Gagal ambil laporan',
          color: 'negative'
        })
      } finally {
        this.loading = false
        Loading.hide()
      }
    },

    // 🌐 PENGGUNA (NO TOKEN)
    async fetchPengguna(payload = {}) {
      this.loading = true
      Loading.show()

      try {
        const res = await SapaService.getPengguna(payload)
        this.pengguna = res.data.data || res.data
      } catch (err) {
        Notify.create({
          message: 'Gagal ambil pengguna',
          color: 'negative'
        })
      } finally {
        this.loading = false
        Loading.hide()
      }
    }

  }
})