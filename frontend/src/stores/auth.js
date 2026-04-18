import { defineStore } from 'pinia'
import { Notify, Loading } from 'quasar'
import { AuthService } from 'src/services/auth.service'
import { api } from 'src/api/api'

export const useAuthStore = defineStore('auth', {
  state: () => {
    let user = null
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser && storedUser !== 'undefined') {
        user = JSON.parse(storedUser)
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e)
    }

    return {
      user: user,
      token: localStorage.getItem('token') || null,
      loading: false
    }
  },

  actions: {
    async login(form) {
      this.loading = true
      Loading.show()

      try {
        const res = await AuthService.login(form)

        const { token, user } = res.data

        this.token = token
        this.user = user

        // save to localStorage
        localStorage.token = this.token
        localStorage.user = JSON.stringify(this.user)

        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('riwayat_')) {
            localStorage.removeItem(key)
          }
        })

        // 🔥 DAFTARKAN ULANG TOKEN FCM SAAT LOGIN
        const fcmToken = localStorage.getItem('fcm_token')
        if (fcmToken && this.user?._id) {
          try {
            // Tanpa await tidak apa-apa agar login tetap cepat
            api.post('/fcm/save-token', {
              userId: this.user._id,
              token: fcmToken,
              device: 'android'
            }).catch(e => console.error('Gagal daftar FCM pasca login', e))
          } catch (e) {
            console.error('Error saat mencoba simpan token', e)
          }
        }

        Notify.create({
          message: 'Login berhasil',
          color: 'positive'
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
        console.log('REGISTER PAYLOAD:', form) // 🔥 DEBUG

        const res = await AuthService.register(form)

        Notify.create({
          message: 'Registrasi berhasil',
          color: 'positive'
        })

        return true

      } catch (err) {
        console.error(err)

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

    async logout() {
      // 🔥 Hapus token FCM dari server sebelum logout
      const fcmToken = localStorage.getItem('fcm_token')
      if (fcmToken) {
        try {
          await api.post('/fcm/remove-token', { token: fcmToken })
        } catch (e) {
          console.error('Gagal menghapus token FCM dari server:', e)
        }
      }

      this.token = null
      this.user = null

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('push_notifications')

      Notify.create({
        message: 'Anda Berhasil Keluar',
        color: 'positive',
        position: 'top',
        timeout: 2000
      })

      return true
    }
  }
})