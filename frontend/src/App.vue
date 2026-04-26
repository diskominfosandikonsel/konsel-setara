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
          console.log('CLICKED:', JSON.stringify(action))

          // Simpan ke riwayat notifikasi (cegah duplikat dengan foreground)
          const notifStore = useNotifikasiStore()
          const notif = action.notification || {}
          const data = notif.data || {}

          // Ambil title & body dari semua kemungkinan lokasi
          let resolvedTitle = notif.title || data.title || notif.body || 'Notifikasi'
          let resolvedBody = notif.body || data.body || ''

          // FALLBACK KHUSUS PERAK: Karena backend perak tidak mengirim title/body di dalam data payload
          if (data.type === 'perak' && (!notif.title && !data.title)) {
            if (data.status === 'diterima') {
              resolvedTitle = 'Data Diverifikasi'
              resolvedBody = 'Selamat! Data Pencaker Anda telah diterima oleh Admin.'
            } else if (data.status === 'ditolak') {
              resolvedTitle = 'Data Ditolak'
              resolvedBody = 'Maaf, Data Pencaker Anda ditolak oleh Admin.'
            } else {
              resolvedTitle = 'Notifikasi Perak'
              resolvedBody = 'Ada pembaruan status pada pengajuan Anda.'
            }
          }

          // FALLBACK KHUSUS SIPPADU
          if (data.type === 'sippadu' && (!notif.title && !data.title)) {
            if (data.status === 'proses') {
              resolvedTitle = 'Laporan Diproses'
              resolvedBody = 'Laporan SIPPADU Anda sedang diproses oleh petugas.'
            } else if (data.status === 'selesai') {
              resolvedTitle = 'Laporan Selesai'
              resolvedBody = 'Laporan SIPPADU Anda telah selesai ditindaklanjuti.'
            } else if (data.status === 'dikembalikan') {
              resolvedTitle = 'Laporan Dikembalikan'
              resolvedBody = 'Laporan SIPPADU Anda dikembalikan, mohon cek detailnya.'
            } else {
              resolvedTitle = 'Notifikasi SIPPADU'
              resolvedBody = 'Ada pembaruan pada laporan SIPPADU Anda.'
            }
          }

          // FALLBACK KHUSUS FIRETAP
          if (data.type === 'firetap' && (!notif.title && !data.title)) {
            const statusFiretap = String(data.status || data.status_kasus || '')
            if (statusFiretap === '0') {
              resolvedTitle = 'Laporan Diterima'
              resolvedBody = 'Laporan Firetap Anda telah diterima.'
            } else if (statusFiretap === '3') {
              resolvedTitle = 'Penanganan Selesai'
              resolvedBody = 'Laporan Firetap Anda telah selesai ditangani.'
            } else {
              resolvedTitle = 'Notifikasi Firetap'
              resolvedBody = 'Ada pembaruan pada laporan FIRETAP Anda.'
            }
          }

          // Cek apakah notifikasi yang sama sudah tersimpan (dari foreground listener)
          const recentDuplicate = notifStore.list.find(n =>
            n.type === (data.type || '') &&
            n.laporanId === (data.laporanId || data.kasusId || data.id || data.id_kasus || '') &&
            (Date.now() - new Date(n.createdAt).getTime()) < 30000 // dalam 30 detik terakhir
          )

          if (!recentDuplicate) {
            notifStore.add({
              title: resolvedTitle,
              body: resolvedBody,
              type: data.type || '',
              laporanId: data.laporanId || data.kasusId || data.id || data.id_kasus || ''
            })
          }

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
        const perakId = data.id || data.laporanId || data.kasusId || data.id_kasus
        if (perakId) {
          const target = '/kartu/'

          if (this.$route.path !== '/perak_dashboard' && this.$route.path !== target) {
            await this.$router.replace('/')
            await this.$router.push('/perak_dashboard')
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