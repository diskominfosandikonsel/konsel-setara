import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { PenelitianService } from 'src/services/erida/penelitian.service'

export const usePenelitianStore = defineStore('penelitian', {
  state: () => ({
    list: [],
    page: 1,
    cari: '',
    total: 0,
    loading: false
  }),

  actions: {

    // 🔥 GET DATA
    async fetchData() {
      this.loading = true
      Loading.show()

      try {
        const payload = {
          data_ke: this.page,
          cari_value: this.cari
        }

        const res = await PenelitianService.getData(payload)

        console.log('DATA ERIDA:', res.data)

        this.list = res.data.data
        this.total = res.data.jml_data

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
    },

    // ➕ ADD
    async addData(form) {
      Loading.show()

      try {
        const formData = new FormData()

        formData.append('file', form.file)

        formData.append('data', JSON.stringify({
          nama: form.nama,
          alamat: form.alamat,
          hp: form.hp,
          email: form.email,
          nik: form.nik
        }))

        await PenelitianService.addData(formData)

        Notify.create({
          message: 'Berhasil tambah',
          color: 'positive'
        })

        this.fetchData()

      } catch (err) {
        console.error(err)

        Notify.create({
          message: 'Gagal tambah data',
          color: 'negative'
        })
      } finally {
        Loading.hide()
      }
    },

    // ✏️ EDIT
    async editData(form) {
      Loading.show()

      try {
        const formData = new FormData()

        if (form.file) {
          formData.append('file', form.file)
        }

        formData.append('data', JSON.stringify({
          id: form.id,
          nama: form.nama,
          alamat: form.alamat,
          hp: form.hp,
          email: form.email,
          nik: form.nik,
          ktp: form.ktp // old file
        }))

        await PenelitianService.editData(formData)

        Notify.create({
          message: 'Berhasil update',
          color: 'positive'
        })

        this.fetchData()

      } catch (err) {
        console.error(err)

        Notify.create({
          message: 'Gagal update',
          color: 'negative'
        })
      } finally {
        Loading.hide()
      }
    }
  }
})