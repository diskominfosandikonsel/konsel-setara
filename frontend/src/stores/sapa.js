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
    },

    async fetchEdukasi(payload = {}) {
      this.loading = true

      try {
        const res = await SapaService.getEdukasi(payload)
        return res.data // ⬅️ return full response
      } catch (err) {
        return { data: [], jml_data: 1 }
      } finally {
        this.loading = false
      }
    },

    async sendLaporan(payload, file) {
      this.loading = true
      Loading.show()

      try {
        const formData = new FormData()

        // 📷 FILE
        formData.append('file', file)

        // 🧾 PAYLOAD
        Object.keys(payload).forEach(key => {
          formData.append(key, payload[key])
        })

        // 🚀 SINGLE REQUEST
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

    async fetchDetail(id) {
      this.loading = true
      Loading.show()

      try {
        const res = await SapaService.getDetail({ id })
        return res.data?.[0] || null
      } catch (err) {
        Notify.create({
          message: 'Gagal ambil detail',
          color: 'negative'
        })
        return null
      } finally {
        this.loading = false
        Loading.hide()
      }
    }

  }
})