import { defineStore } from 'pinia'
import { Notify, Loading } from 'quasar'
import { AuthService } from 'src/services/auth.service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.token || null,
    loading: false
  }),

  actions: {
    async login(form) {
      this.loading = true
      Loading.show()

      try {
        console.log('LOGIN PAYLOAD:', form)

        const res = await AuthService.login(form)

        console.log('LOGIN RESPONSE:', res.data)

        // 🔥 adjust based on your backend response
        const { token, user } = res.data

        this.token = token
        this.user = user

        // save to localStorage
        localStorage.token = token
        localStorage.user = JSON.stringify(user)

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

    logout() {
      this.token = null
      this.user = null

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})