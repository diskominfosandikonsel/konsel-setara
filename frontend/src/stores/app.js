import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/api/api'

export const useAppStore = defineStore('app', {
  state: () => ({
    list_cek: [],
    loading: false
  }),

  actions: {
    async getCekStores() {
      this.loading = true
      Loading.show()

      try {
        const res = await api.get('api/v1/checkAuth') 
        // console.log('API RESULT:', data) // 🔥 debug

        this.list_cek = res.data

      } catch (err) {
        console.error(err)
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