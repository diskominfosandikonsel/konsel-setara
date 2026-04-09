import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { PenelitianService } from 'src/services/erida/penelitian.service'

export const usePenelitianStore = defineStore('penelitian', {
  state: () => ({
    list: [],
    loading: false,
    page: 1,
    total: 0,
    cari: ''
  }),

  actions: {
    // 🔥 GET DATA
    async fetchData() {
      this.loading = true
      Loading.show()

      try {
        const params = {
          page: this.page,
          cari: this.cari
        }

        const res = await PenelitianService.getAll(params)

        this.list = res.data.data || res.data
        this.total = res.data.total || 0

      } catch (err) {
        Notify.create({
          message: 'Gagal ambil data',
          color: 'negative'
        })
      } finally {
        this.loading = false
        Loading.hide()
      }
    },

    // 🔥 CREATE
    async addData(payload) {
      Loading.show()

      try {
        const formData = new FormData()

        formData.append('title', payload.title)

        if (payload.file) {
          formData.append('file', payload.file)
        }

        await PenelitianService.create(formData)

        Notify.create({
          message: 'Berhasil tambah data',
          color: 'positive'
        })

        this.fetchData()

      } catch (err) {
        Notify.create({
          message: err.response?.data?.message || 'Gagal tambah',
          color: 'negative'
        })
      } finally {
        Loading.hide()
      }
    },

    // 🔥 UPDATE
    async editData(id, payload) {
      Loading.show()

      try {
        const formData = new FormData()

        formData.append('title', payload.title)

        if (payload.file) {
          formData.append('file', payload.file)
        }

        await PenelitianService.update(id, formData)

        Notify.create({
          message: 'Berhasil update',
          color: 'positive'
        })

        this.fetchData()

      } catch (err) {
        Notify.create({
          message: 'Gagal update',
          color: 'negative'
        })
      } finally {
        Loading.hide()
      }
    },

    // 🔥 DELETE
    async deleteData(id) {
      Loading.show()

      try {
        await PenelitianService.delete(id)

        Notify.create({
          message: 'Berhasil hapus',
          color: 'positive'
        })

        this.fetchData()

      } catch (err) {
        Notify.create({
          message: 'Gagal hapus',
          color: 'negative'
        })
      } finally {
        Loading.hide()
      }
    }
  }
})