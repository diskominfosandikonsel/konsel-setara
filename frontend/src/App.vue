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

        if (result.receive === 'granted') {
          await PushNotifications.register()
        }

        // 🔥 Get FCM Token
        PushNotifications.addListener('registration', async (token) => {
          localStorage.setItem('fcm_token', token.value)

          const user = JSON.parse(localStorage.getItem('user'))

          try {
            // ⚠️ make sure user already logged in
            if (!user || !user._id) {
              console.warn('User not ready yet, skip sending token')
              return
            }

            const fcmToken = localStorage.getItem('fcm_token')

            if (fcmToken) {
              await api.post('/fcm/save-token', {
                token: fcmToken,
                device: 'android'
              })
            }

            console.log('Token sent to backend ✅')

          } catch (err) {
            console.error('Failed to send token:', err.message)
          }
        })

        // 📩 Notification received (foreground)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Notification received:', notification)
        })

        // 👆 Notification clicked
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Notification clicked:', action)
        })

      } catch (err) {
        console.error('Push init error:', err)
      }
    }
  }
}
</script>