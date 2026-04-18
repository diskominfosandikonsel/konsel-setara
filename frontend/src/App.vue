<template>
  <router-view />
</template>

<script>
import { PushNotifications } from '@capacitor/push-notifications'
import { api } from 'src/api/api'

export default {
  name: 'App',

  async mounted() {
    await this.initPush()
  },

  methods: {
    async initPush() {
      try {
        const result = await PushNotifications.requestPermissions()

        if (result.receive !== 'granted') return

        // 🔥 IMPORTANT: create channel (FIX ANDROID SILENT ISSUE)
        await PushNotifications.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: 5
        })

        await PushNotifications.register()

        // 📌 TOKEN RECEIVED
        PushNotifications.addListener('registration', async (token) => {
          console.log('FCM TOKEN:', token.value)

          localStorage.setItem('fcm_token', token.value)

          const trySave = async () => {
            try {
              const userStr = localStorage.getItem('user')
              if (!userStr || userStr === 'undefined') return false

              const user = JSON.parse(userStr)
              if (!user?._id) return false

              await api.post('/fcm/save-token', {
                userId: user._id,
                token: token.value,
                device: 'android'
              })

              console.log('TOKEN SAVED')
              return true
            } catch (err) {
              console.error('Save token failed:', err)
              return false
            }
          }

          // try immediately
          let saved = await trySave()

          // retry until login exists
          if (!saved) {
            const interval = setInterval(async () => {
              saved = await trySave()
              if (saved) clearInterval(interval)
            }, 2000)
          }
        })

        // 📩 FOREGROUND NOTIFICATION
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('FOREGROUND:', notification)

          this.$q.notify({
            message: notification?.notification?.body || 'New Notification',
            color: 'primary'
          })
        })

        // 👆 CLICK EVENT
        PushNotifications.addListener('pushNotificationActionPerformed', async (action) => {
          console.log('CLICKED:', action)

          const data = action.notification.data

          if (data && data.type) {

            if (data.type === 'sippadu' && data.laporanId) {
              const target = '/sippadu_detail/' + data.laporanId

              // Selalu buat jembatan rute yang mulus dari asalnya (kapanpun diklik)
              // Jika aplikasi dari background, kita buat rutenya tetap terjalin rapi
              if (this.$route.path !== '/sippadu_riwayat' && this.$route.path !== target) {
                await this.$router.replace('/')
                await this.$router.push('/sippadu_riwayat')
                await this.$router.push(target)
              } else {
                await this.$router.push(target)
              }
            }

            else if (data.type === 'sapakonsel' && data.laporanId) {
              const target = '/sapa_riwayat/' + data.laporanId

              if (this.$route.path !== '/sapa_dashboard' && this.$route.path !== target) {
                await this.$router.replace('/')
                await this.$router.push('/sapa_dashboard')
                await this.$router.push(target)
              } else {
                await this.$router.push(target)
              }
            }

          }
        })

      } catch (err) {
        console.error('Push init error:', err)
      }
    }
  }
}
</script>