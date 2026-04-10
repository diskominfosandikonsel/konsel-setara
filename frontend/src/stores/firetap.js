import { defineStore } from 'pinia'
import { Notify, Loading } from 'quasar'
import { FiretapService, FiretapAuthService } from 'src/services/firetap.service'

const FIRETAP_URL = 'https://server-firetap.konaweselatankab.go.id/'

export const useFiretapAuthStore = defineStore('firetapAuth', {
  state: () => {
    let user = null
    let status = null
    try {
      const storedUser = localStorage.getItem('firetap_user')
      if (storedUser && storedUser !== 'undefined') {
        user = JSON.parse(storedUser)
      }
      const storedStatus = localStorage.getItem('firetap_status')
      if (storedStatus) status = JSON.parse(storedStatus)
    } catch (e) {
      console.error('Failed to parse firetap user from localStorage', e)
    }

    return {
      user: user,
      token: localStorage.getItem('firetap_token') || null,
      status: status,
      loading: false
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
    namaUser: (state) => state.user?.profile?.nama || state.user?.nama || '',
    hpUser: (state) => state.user?.profile?.hp || state.user?.hp || '',
    statusPengguna: (state) => state.user?.profile?.status || state.status || 8
  },

  actions: {
    async login(form) {
      this.loading = true
      Loading.show()

      try {
        const res = await FiretapAuthService.login(form)
        const { token, profile } = res.data

        this.token = token
        this.user = { profile }
        this.status = profile?.status

        localStorage.setItem('firetap_token', token)
        localStorage.setItem('firetap_user', JSON.stringify({ profile }))
        localStorage.setItem('firetap_status', JSON.stringify(profile?.status))
        localStorage.setItem('firetap_pengguna', JSON.stringify(profile?._id))

        Notify.create({
          message: 'Login FireTap berhasil',
          color: 'positive',
          icon: 'local_fire_department'
        })

        return true
      } catch (err) {
        Notify.create({
          message: err.response?.data?.message || 'Login gagal',
          color: 'negative'
        })
        return false
      } finally {
        this.loading = false
        Loading.hide()
      }
    },

    async register(form) {
      this.loading = true
      Loading.show()

      try {
        await FiretapAuthService.register(form)

        Notify.create({
          message: 'Registrasi berhasil! Silakan login.',
          color: 'positive',
          icon: 'check_circle'
        })

        return true
      } catch (err) {
        Notify.create({
          message: err.response?.data?.message || 'Registrasi gagal',
          color: 'negative'
        })
        return false
      } finally {
        this.loading = false
        Loading.hide()
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.status = null

      localStorage.removeItem('firetap_token')
      localStorage.removeItem('firetap_user')
      localStorage.removeItem('firetap_status')
      localStorage.removeItem('firetap_pengguna')
    }
  }
})

export const useFiretapStore = defineStore('firetap', {
  state: () => ({
    list_kasus: [],
    detail_kasus: null,
    list_pegawai: [],
    total: 0,
    page: 1,
    loading: false,
    cari: '',
    filter_status: null,
    filter_jenis: null,

    // Kategori Kasus
    kategori: [
      'Kebakaran',
      'Penyelamatan',
      'Satwa',
      'Lingkungan',
      'Properti',
      'Materil',
      'Infrastruktur',
      'Perangkat'
    ],
    status_list: ['Lapor', 'Proses', 'Batal', 'Selesai']
  }),

  getters: {
    fileUrl: () => FIRETAP_URL + 'uploads/',

    getKategoriLabel: (state) => (index) => {
      const idx = parseInt(index)
      return state.kategori[idx] || '-'
    },

    getStatusLabel: () => (status) => {
      const map = { 0: 'Lapor', 1: 'Proses', 2: 'Batal', 3: 'Selesai' }
      return map[status] || 'Tidak Diketahui'
    },

    getStatusColor: () => (status) => {
      const map = { 0: 'warning', 1: 'info', 2: 'negative', 3: 'positive' }
      return map[status] || 'grey'
    }
  },

  actions: {
    async fetchKasus(filterStatus = null, filterJenis = null) {
      this.loading = true
      Loading.show()

      try {
        const firetapAuth = useFiretapAuthStore()
        const payload = {
          data_ke: this.page,
          cari_value: this.cari,
          jenis: filterJenis,
          status: filterStatus,
          status_pengguna: firetapAuth.statusPengguna
        }

        const res = await FiretapService.getKasus(payload)
        this.list_kasus = res.data.data || []
        this.total = res.data.jml_data || 0
      } catch (err) {
        console.error(err)
        Notify.create({
          message: 'Gagal mengambil data kasus',
          color: 'negative'
        })
      } finally {
        this.loading = false
        Loading.hide()
      }
    },

    async fetchDetailKasus(id) {
      this.loading = true
      Loading.show()

      try {
        const res = await FiretapService.getDetailKasus(id)
        this.detail_kasus = res.data.data?.[0] || null

        // Ambil pegawai
        await this.fetchPegawai(id)
      } catch (err) {
        console.error(err)
        Notify.create({
          message: 'Gagal mengambil detail kasus',
          color: 'negative'
        })
      } finally {
        this.loading = false
        Loading.hide()
      }
    },

    async fetchPegawai(id_kasus) {
      try {
        const res = await FiretapService.getPegawaiByKasus(id_kasus)
        this.list_pegawai = res.data.data || []

        // Tambah satgas ke list
        const resSatgas = await FiretapService.getSatgasByKasus(id_kasus)
        const satgasList = resSatgas.data.data || []
        satgasList.forEach((s) => {
          this.list_pegawai.push({
            nama_pegawai: s.nama_pegawai,
            foto_pegawai: s.foto_pegawai
          })
        })
      } catch (err) {
        console.error('Gagal ambil pegawai:', err)
      }
    },

    async addKasus(payload, fotoFile, namaFile) {
      Loading.show({ message: 'Mengirim laporan...' })
      try {
        // Step 1: Upload foto
        try {
          await FiretapService.uploadFoto(fotoFile, namaFile)
        } catch (uploadErr) {
          console.warn('Upload foto gagal (lanjut):', uploadErr?.message)
        }

        // Step 2: Simpan data kasus
        payload.file = namaFile
        const res = await FiretapService.addKasus(payload)

        Notify.create({
          message: 'Laporan berhasil dikirim!',
          color: 'positive',
          icon: 'check_circle'
        })

        await this.fetchKasus()
        return true
      } catch (err) {
        console.error(err)
        Notify.create({
          message: 'Gagal mengirim laporan',
          color: 'negative'
        })
        return false
      } finally {
        Loading.hide()
      }
    }
  }
})
