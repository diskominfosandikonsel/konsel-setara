import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { SippaduService } from 'src/services/sippadu.service'

export const useSippaduStore = defineStore('sippadu', {
  state: () => ({
    list_laporan: [],
    list_perda: [],
    list_perkada: [],
    list_berita: [],
    list_riwayat: [],
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
    },

    // 🌐 PERDA
    async fetchPerda() {
        this.loading = true
        Loading.show()

        try {
            const res = await SippaduService.getPerda()
            console.log('PERDA:', res.data)
            this.list_perda = res.data
        } catch (err) {
            console.error(err)
            Notify.create({
                message: 'Gagal ambil data Perda',
                color: 'negative'
            })
        } finally {
            this.loading = false
            Loading.hide()
        }
    },

    // 🌐 PERKADA
    async fetchPerkada() {
        this.loading = true
        Loading.show()

        try {
            const res = await SippaduService.getPerkada()
            console.log('PERKADA:', res.data)
            this.list_perkada = res.data
        } catch (err) {
            console.error(err)
            Notify.create({
                message: 'Gagal ambil data Perkada',
                color: 'negative'
            })
        } finally {
            this.loading = false
            Loading.hide()
        }
    },

    // 📰 BERITA
    async fetchBerita() {
        try {
            const res = await SippaduService.getBerita()
            console.log('BERITA:', res.data)
            this.list_berita = res.data
        } catch (err) {
            console.error(err)
            Notify.create({
                message: 'Gagal ambil data Berita',
                color: 'negative'
            })
        }
    },

    // 📖 RIWAYAT LAPORAN USER
    async fetchRiwayat() {
        this.loading = true
        Loading.show()
        try {
            const payload = {
                data_ke: this.page,
                cari_value: this.cari
            }
            const res = await SippaduService.getLaporanUser(payload)
            
            let resultData = res.data.data || []
            this.list_riwayat = resultData
        } catch (err) {
            console.error(err)
            Notify.create({
                message: 'Gagal ambil data Riwayat Laporan',
                color: 'negative'
            })
        } finally {
            this.loading = false
            Loading.hide()
        }
    }
  }
})