import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { SippaduService } from 'src/services/sippadu.service'

export const useSippaduStore = defineStore('sippadu', {
  state: () => ({
    list_laporan: [],
    total: 0,
    page: 1,
    loading: false,
    cari: ''
  }),

  actions: {
    async getLaporan() {
        this.loading = true
        Loading.show()

        try {
            const payload = {
                data_ke: this.page,
                cari_value: this.cari
            }

            const res = await SippaduService.getLaporan(payload)

            console.log('SIPPADU:', res.data)

            // ⚠️ depends on backend response structure
            this.list_laporan = res.data.data // 👈 IMPORTANT
            this.total = res.data.total

        } catch (err) {
            console.error(err)

            Notify.create({
            message: 'Gagal ambil data SIPPADU',
            color: 'negative'
            })
        } finally {
            this.loading = false
            Loading.hide()
        }
        }
  }
})