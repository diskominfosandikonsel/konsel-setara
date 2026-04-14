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

    async sendLaporan(payload, file) {
      this.loading = true
      Loading.show()

      try {
        const formData = new FormData()

        formData.append('file', file)

        Object.keys(payload).forEach(key => {
          formData.append(key, payload[key])
        })

        await SapaService.uploadEmergency(formData)

        Notify.create({
          message: 'Laporan berhasil dikirim',
          color: 'positive'
        })

        return true

      } catch (err) {
        console.error(err)

        Notify.create({
          message: 'Gagal kirim laporan',
          color: 'negative'
        })

        return false

      } finally {
        this.loading = false
        Loading.hide()
      }
    },

    async retryQueue() {
      const queue = JSON.parse(localStorage.getItem('laporan_queue') || '[]')
      if (!queue.length) return

      const newQueue = []

      for (const item of queue) {
        try {
          const blob = this.dataURLtoBlob(item.file)

          const file = new File(
            [blob],
            'retry.jpg',
            { type: 'image/jpeg' }
          )

          const formData = new FormData()

          formData.append('file', file)

          Object.keys(item.payload).forEach(key => {
            formData.append(key, item.payload[key])
          })

          await SapaService.uploadEmergency(formData)

          await new Promise(r => setTimeout(r, 1000))

        } catch (err) {
          newQueue.push(item)
        }
      }

      localStorage.setItem('laporan_queue', JSON.stringify(newQueue))
    },


    async fetchEdukasi(payload = {}) {
      this.loading = true

      try {
        const res = await SapaService.getEdukasi(payload)
        return res.data
      } catch (err) {
        return { data: [], jml_data: 1 }
      } finally {
        this.loading = false
      }
    },

    async fetchDetailEdukasi(id) {
      try {
        const res = await SapaService.getDetailEdukasi({ id })
        return res.data?.[0] || null
      } catch (err) {
        return null
      }
    },

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
    },

    async fetchLaporan(payload = {}, reset = false) {
      if (reset) {
        this.page = 1
        this.laporan = []
        this.lastPage = 1
      }

      if (this.page > this.lastPage) return

      this.loading = true
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      try {
        const res = await SapaService.getLaporan({
          data_ke: this.page,
          cari_value: this.cari,
          userId: user._id,
          ...payload
        })

        const dataBaru = res.data.data || []
        
        this.laporan = [
          ...new Map(
            [...this.laporan, ...dataBaru]
              .map(item => [item.id, item])
          ).values()
        ]

        this.lastPage = res.data.jml_data || 1
        this.page++

      } catch (err) {
        Notify.create({
          message: 'Gagal ambil laporan',
          color: 'negative'
        })
      } finally {
        this.loading = false
      }
    },

    async fetchDetailLaporan(id) {
      try {
        const res = await SapaService.getDetailLaporan({ id })
        return res.data?.[0] || null
      } catch (err) {
        return null
      }
    },

  }
})