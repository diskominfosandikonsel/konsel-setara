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
            const user = JSON.parse(localStorage.getItem('user'))

            if (!user?._id) return false

            await api.post('/fcm/save-token', {
              userId: user._id,
              token: token.value,
              device: 'android'
            })

            console.log('TOKEN SAVED')
            return true
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
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('CLICKED:', action)
        })

      } catch (err) {
        console.error('Push init error:', err)
      }
    }
  }
}
</script>