import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { JdihService } from 'src/services/jdih.service'

export const useJdihStore = defineStore('jdih', {
  state: () => ({
    produkHukum: [],
    loading: false
  }),

  actions: {
    // 🌐 PRODUK HUKUM (NO TOKEN)
    async fetchProdukHukum(payload = {}) {
      console.log("terpanggil");
      this.loading = true
      Loading.show()

      try {
        const res = await JdihService.getProdukHukum(payload)
        console.log("Response Backend:", res.data)
        this.produkHukum = res.data.data || res.data
      } catch (err) {
        Notify.create({
          message: 'Gagal ambil data',
          color: 'negative'
        })
      } finally {
        this.loading = false
        Loading.hide()
      }
    }

  }
})