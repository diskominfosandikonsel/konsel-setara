<template>
  <q-page class="bg-black text-white">

    <div class="camera-wrapper">

      <img
        v-if="capturedImage"
        :src="capturedImage"
        class="camera-preview"
      />

      <div v-else class="camera-placeholder flex flex-center">
        <q-icon name="photo_camera" size="80px" />
      </div>

      <div class="top-bar row items-center justify-between q-px-md">
        <q-btn flat round icon="close" @click="$router.back()" />
        <div class="text-weight-bold">Mode Darurat</div>
        <div style="width: 40px"></div>
      </div>

      <div class="bottom-bar column">

        <q-input
          v-model="uraian"
          dark
          filled
          placeholder="Apa yang terjadi? (opsional)"
          class="q-mb-md"
        />

        <div class="row items-center justify-around">

          <q-btn flat round icon="photo_library" @click="pickFromGallery" />

          <q-btn
            round
            size="lg"
            class="capture-btn"
            @click="takePicture"
          />

          <q-btn
            flat
            round
            icon="send"
            :loading="isSending"
            :disable="!capturedImage || isSending"
            @click="sendEmergency"
          />

        </div>
      </div>

    </div>

  </q-page>
</template>

<script>
import { App } from '@capacitor/app'
import { Camera } from '@capacitor/camera'
import { Geolocation } from '@capacitor/geolocation'
import { SapaService } from 'src/services/sapa.service'
import { useSapaStore } from 'stores/sapa'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

export default {
  name: 'EmergencyPage',

  data() {
    return {
      capturedImage: null,
      capturedFile: null,
      uraian: '',
      lat: null,
      lng: null,

      sapaStore: useSapaStore(),
      authStore: useAuthStore(),
      $q: useQuasar(),

      isSending: false
    }
  },

  methods: {
    async takePicture() {
      const allowed = await this.checkPermissions()
      if (!allowed) return

      try {
        await this.getLocation()

        const image = await Camera.getPhoto({
          quality: 80,
          resultType: 'dataUrl',
          source: 'camera',
          correctOrientation: true
        })

        if (!image || !image.dataUrl) return

        const compressed = await this.compressImage(image.dataUrl, 0.6, 1280)

        this.capturedImage = compressed

        const blob = this.dataURLtoBlob(compressed)

        this.capturedFile = new File(
          [blob],
          `emergency_${Date.now()}.jpg`,
          { type: 'image/jpeg' }
        )

        await this.sendEmergency()

      } catch (err) {
        console.error(err)
      }
    },

    async checkPermissions() {
      const permissions = await Camera.checkPermissions()

      if (permissions.camera !== 'granted') {
        const request = await Camera.requestPermissions({
          permissions: ['camera', 'photos']
        })

        if (request.camera !== 'granted') {

          // 🚨 SHOW DIALOG HERE
          this.$q.dialog({
            title: 'Izin Dibutuhkan',
            message: 'Aplikasi butuh kamera untuk laporan darurat',
            ok: 'Buka Pengaturan',
            cancel: true
          }).onOk(() => {
            App.openSettings() // 🔥 OPEN ANDROID SETTINGS
          })

          return false
        }
      }

      return true
    },

    async pickFromGallery() {
      try {
        const image = await Camera.getPhoto({
          resultType: 'dataUrl',
          source: 'photos'
        })

        if (!image || !image.dataUrl) return

        const compressed = await this.compressImage(image.dataUrl, 0.6, 1280)

        this.capturedImage = compressed

        const blob = this.dataURLtoBlob(compressed)

        this.capturedFile = new File(
          [blob],
          `gallery_${Date.now()}.jpg`,
          { type: 'image/jpeg' }
        )

      } catch (err) {
        if (err?.message !== 'User cancelled photos app') {
          console.error('Gallery error:', err)
        }
      }
    },

    async getLocation() {
      try {
        const permission = await Geolocation.requestPermissions()

        if (permission.location !== 'granted') {

          this.$q.dialog({
            title: 'Izin Lokasi Dibutuhkan',
            message: 'Aktifkan lokasi untuk mengirim laporan',
            ok: 'Buka Pengaturan',
            cancel: true
          }).onOk(() => {
            App.openSettings()
          })

          return false
        }

        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true
        })

        this.lat = pos.coords.latitude
        this.lng = pos.coords.longitude

        return true

      } catch (err) {
        console.error(err)
        return false
      }
    },

    async sendEmergency() {
      if (!this.capturedFile || this.isSending) return

      this.isSending = true

      try {
        await this.getLocation()

        const originalName = this.capturedFile.name
        const fileName = `image-${originalName}`

        const payload = {
          uraian: this.uraian || 'Laporan darurat',
          lat: this.lat,
          lng: this.lng,
          lokasi: `${this.lat},${this.lng}`,
          file: fileName,

          jenis: 1,
          objek: 0,
          status: 'baru',
          keterangan: this.uraian || '-',

          nama: this.authStore.user?.nama || '',
          hp: this.authStore.user?.hp || ''
        }

        if (!navigator.onLine) {
          this.saveToQueue(payload, this.capturedImage)

          this.$q.notify({
            color: 'warning',
            message: 'Offline: laporan disimpan & akan dikirim otomatis'
          })

          this.$router.replace('/sapa_riwayat')
          return
        }

        // NORMAL FLOW
        await SapaService.uploadFile(this.capturedFile, originalName)
        const success = await this.sapaStore.addData(payload)

        if (success) {
          this.$q.notify({
            color: 'positive',
            message: 'Laporan darurat terkirim'
          })

          this.$router.replace('/sapa_riwayat')
        }

      } catch (err) {
        console.error(err)

        // 🔥 FAIL → SAVE TO QUEUE
        this.saveToQueue(
          {
            uraian: this.uraian || 'Laporan darurat',
            lat: this.lat,
            lng: this.lng,
            lokasi: `${this.lat},${this.lng}`,
            file: `image-${this.capturedFile.name}`,
            nama: this.authStore.user?.nama || '',
            hp: this.authStore.user?.hp || ''
          },
          this.capturedImage
        )

        this.$q.notify({
          color: 'warning',
          message: 'Gagal kirim, akan dicoba ulang otomatis'
        })

      } finally {
        this.isSending = false
      }
    },

    dataURLtoBlob(dataurl) {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }

      return new Blob([u8arr], { type: mime })
    },

    async retryQueue() {
      const queue = JSON.parse(localStorage.getItem('laporan_queue') || '[]')

      if (!queue.length) return

      const newQueue = []

      for (const item of queue) {
        try {
          const blob = this.dataURLtoBlob(item.file)
          const file = new File([blob], item.payload.file.replace('image-', ''), {
            type: 'image/jpeg'
          })

          await SapaService.uploadFile(file, file.name)
          await this.sapaStore.addData(item.payload)

        } catch (err) {
          newQueue.push(item) // gagal → simpan lagi
        }
      }

      localStorage.setItem('laporan_queue', JSON.stringify(newQueue))
    },

    async compressImage(dataUrl, quality = 0.6, maxWidth = 1280) {
      return new Promise((resolve) => {
        const img = new Image()
        img.src = dataUrl

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          ctx.drawImage(img, 0, 0, width, height)

          // 🔥 WATERMARK
          const now = new Date()
          const time = now.toLocaleString()

          ctx.fillStyle = 'rgba(0,0,0,0.6)'
          ctx.fillRect(0, height - 40, width, 40)

          ctx.fillStyle = '#fff'
          ctx.font = '14px Arial'
          ctx.fillText(time, 10, height - 15)

          if (this.lat && this.lng) {
            ctx.fillText(
              `${this.lat.toFixed(5)}, ${this.lng.toFixed(5)}`,
              width - 180,
              height - 15
            )
          }

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedDataUrl)
        }
      })
    },
    saveToQueue(payload, fileBase64) {
      const queue = JSON.parse(localStorage.getItem('laporan_queue') || '[]')

      queue.push({
        payload,
        file: fileBase64,
        createdAt: Date.now()
      })

      localStorage.setItem('laporan_queue', JSON.stringify(queue))
    }
  },
  mounted() {
    this.takePicture()

    window.addEventListener('online', this.retryQueue)

    this.retryQueue()
  }
}
</script>

<style scoped>
.camera-wrapper {
  position: relative;
  height: 100vh;
}

.camera-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  height: 100%;
  background: #111;
}

.top-bar {
  position: absolute;
  top: 0;
  width: 100%;
  padding-top: 20px;
}

.bottom-bar {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.capture-btn {
  width: 70px;
  height: 70px;
  background: white;
}
</style>