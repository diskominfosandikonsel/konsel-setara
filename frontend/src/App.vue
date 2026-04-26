<template>
  <router-view />
</template>

<script>
import { PushNotifications } from '@capacitor/push-notifications'
import { api } from 'src/api/api'
import { useNotifikasiStore } from 'src/stores/notifikasi'

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

          // Simpan ke riwayat notifikasi
          const notifStore = useNotifikasiStore()
          const data = notification.data || {}
          notifStore.add({
            title: notification.title || 'Notifikasi',
            body: notification.body || '',
            type: data.type || '',
            laporanId: data.laporanId || data.kasusId || data.id || data.id_kasus || ''
          })

          // Tampilkan banner atas dengan aksi klik
          this.$q.notify({
            message: notification.title || 'Notifikasi',
            caption: notification.body || '',
            color: 'primary',
            icon: 'notifications',
            position: 'bottom',
            timeout: 5000,
            actions: [
              {
                label: 'Lihat',
                color: 'white',
                handler: () => {
                  this.navigateToDetail(data)
                }
              }
            ]
          })
        })

        // 👆 CLICK EVENT (dari background / cold start)
        PushNotifications.addListener('pushNotificationActionPerformed', async (action) => {
          console.log('CLICKED:', action)

          // Simpan ke riwayat notifikasi
          const notifStore = useNotifikasiStore()
          const notif = action.notification
          const data = notif.data || {}
          notifStore.add({
            title: notif.title || 'Notifikasi',
            body: notif.body || '',
            type: data.type || '',
            laporanId: data.laporanId || data.kasusId || data.id || data.id_kasus || ''
          })

          await this.navigateToDetail(data)
        })

      } catch (err) {
        console.error('Push init error:', err)
      }
    },

    /**
     * Navigasi ke halaman detail berdasarkan data payload notifikasi
     */
    async navigateToDetail(data) {
      if (!data || !data.type) return

      if (data.type === 'sippadu' && data.laporanId) {
        const target = '/sippadu_detail/' + data.laporanId

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

      else if (data.type === 'firetap') {
        const firetapId = data.laporanId || data.kasusId || data.id || data.id_kasus
        if (firetapId) {
          const target = '/firetap_detail/' + firetapId

          if (this.$route.path !== '/firetap_riwayat' && this.$route.path !== target) {
            await this.$router.replace('/')
            await this.$router.push('/firetap_riwayat')
            await this.$router.push(target)
          } else {
            await this.$router.push(target)
          }
        }
      }

      else if (data.type === 'perak') {
        const perakId = data.id || data.laporanId 
        console.log(perakId);
        if (perakId) {
          const target = '/kartu/'

          if (this.$route.path !== '/kartu' && this.$route.path !== target) {
            await this.$router.replace('/')
            await this.$router.push('/kartu')
            await this.$router.push(target)
          } else {
            await this.$router.push(target)
          }
        }
      }
    }
  }
}
</script>