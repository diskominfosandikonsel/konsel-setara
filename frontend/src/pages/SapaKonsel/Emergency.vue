<template>
  <q-page class="bg-black text-white">

    <!-- 🔴 CAMERA MODE -->
    <div v-if="mode === 'camera'" class="camera-wrapper">
      <div id="cameraPreview" class="camera-preview"></div>

      <!-- TOP -->
      <!-- <div class="top-bar row items-center justify-between q-px-md">
        <q-btn flat round icon="close" @click="$router.back()" />
        <div class="text-weight-bold">Mode Darurat</div>
        <div style="width: 40px"></div>
      </div> -->

      <div class="top-bar row items-center justify-between q-px-md">
        <q-btn flat round icon="close" @click="$router.back()" />

        <div class="text-weight-bold">Laporan Darurat</div>

        <!-- 🔄 SWITCH CAMERA -->
        <q-btn flat round icon="flip_camera_android" @click="switchCamera" />
      </div>

      <!-- BOTTOM -->
      <div class="bottom-bar">
        <div class="row items-center justify-around">

          <q-btn flat round icon="photo_library" @click="pickFromGallery" />

          <div class="capture-wrapper" @click="takePicture">
            <div class="capture-ring">
              <div class="capture-inner"></div>
            </div>
          </div>

          <div style="width: 40px"></div>

        </div>
      </div>
    </div>

    <!-- 🟡 PREVIEW MODE -->
    <div v-else class="camera-wrapper">
      <div v-if="flash" class="flash"></div>

      <img :src="capturedImage" :key="capturedImage" class="preview-image" />

      <!-- TOP -->
      <div class="top-bar row items-center justify-between q-px-md">
        <q-btn flat round icon="arrow_back" @click="retake" />
        <div class="text-weight-bold">Preview</div>
        <div style="width: 40px"></div>
      </div>

      <!-- FORM -->
      <div class="bottom-bar column">
        <q-input
          v-model="uraian"
          dark
          filled
          placeholder="Apa yang terjadi?"
          class="q-mb-md"
        />

        <q-btn
          color="primary"
          label="Kirim Laporan"
          :loading="isSending"
          @click="sendEmergency"
        />
      </div>
    </div>

  </q-page>
</template>

<script>
import { Camera } from '@capacitor/camera'
import { CameraPreview } from '@capacitor-community/camera-preview'
import { Geolocation } from '@capacitor/geolocation'
import { App } from '@capacitor/app'

import { SapaService } from 'src/services/sapa.service'
import { useSapaStore } from 'stores/sapa'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

export default {
  name: 'EmergencyPage',

  data() {
    return {
      mode: 'camera',
      cameraPosition: 'rear', // 'rear' | 'front'

      capturedImage: null,
      capturedFile: null,
      uraian: '',

      lat: null,
      lng: null,

      isSending: false,
      flash: false,

      sapaStore: useSapaStore(),
      authStore: useAuthStore(),
      $q: useQuasar()
    }
  },

  async mounted() {
    const allowed = await this.initPermissions()
    if (!allowed) return

    await this.startCamera()
  },

  beforeUnmount() {
    try {
      CameraPreview.stop()
    } catch (e) {}
  },

  methods: {

    // 🔥 INIT PERMISSION FLOW
    async initPermissions() {
      // CAMERA
      const cam = await Camera.requestPermissions()
      if (cam.camera !== 'granted') {
        this.openSettingDialog('Kamera dibutuhkan')
        return false
      }

      // LOCATION
      const loc = await Geolocation.requestPermissions()
      if (loc.location !== 'granted') {
        this.openSettingDialog('Lokasi dibutuhkan')
        return false
      }

      const pos = await Geolocation.getCurrentPosition()
      this.lat = pos.coords.latitude
      this.lng = pos.coords.longitude

      return true
    },

    openSettingDialog(message) {
      this.$q.dialog({
        title: 'Izin Dibutuhkan',
        message,
        ok: 'Buka Pengaturan',
        cancel: true
      }).onOk(() => {
        App.openSettings()
      })
    },

    // 🔥 START CAMERA (LIVE)
    async startCamera() {
      await this.$nextTick()

      await CameraPreview.start({
        parent: 'cameraPreview',
        className: 'camera-preview',
        position: this.cameraPosition,
        width: window.innerWidth,
        height: window.innerHeight,
        toBack: true
      })
    },

    async switchCamera() {
      try {
        this.cameraPosition = this.cameraPosition === 'rear' ? 'front' : 'rear'

        await CameraPreview.stop()
        await this.startCamera()

      } catch (err) {
        console.error('Switch camera error:', err)
      }
    },

    // 🔥 CAPTURE
    async takePicture() {
      try {
        this.flash = true
        setTimeout(() => (this.flash = false), 120)

        const result = await CameraPreview.capture({ quality: 80 })
        const dataUrl = 'data:image/jpeg;base64,' + result.value

        const compressed = await this.compressImage(dataUrl)

        // ✅ SET IMAGE FIRST
        this.capturedImage = compressed

        const blob = this.dataURLtoBlob(compressed)
        this.capturedFile = new File([blob], `img_${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })

        // ✅ STOP CAMERA AFTER IMAGE READY
        this.mode = 'preview'
        await this.$nextTick()
        await CameraPreview.stop()

      } catch (err) {
        console.error(err)
      }
    },

    // 🔥 GALLERY
    async pickFromGallery() {
      const image = await Camera.getPhoto({
        resultType: 'dataUrl',
        source: 'photos'
      })

      if (!image?.dataUrl) return

      const compressed = await this.compressImage(image.dataUrl)

      this.capturedImage = compressed

      console.log('IMAGE:', this.capturedImage?.substring(0, 50))

      const blob = this.dataURLtoBlob(compressed)
      this.capturedFile = new File([blob], `img_${Date.now()}.jpg`, {
        type: 'image/jpeg'
      })

      this.mode = 'preview'
      await this.$nextTick()
      await CameraPreview.stop()
    },

    // 🔥 RETAKE
    async retake() {
      this.mode = 'camera'
      this.capturedImage = null
      this.capturedFile = null
      this.uraian = ''

      await this.startCamera()
    },

    // 🔥 SEND
    async sendEmergency() {
      if (!this.capturedFile) return

      this.isSending = true

      try {
        const payload = {
          uraian: this.uraian || 'Laporan darurat',
          lat: this.lat,
          lng: this.lng,
          lokasi: `${this.lat},${this.lng}`,
          jenis: 1,
          objek: 0,
          status: 'baru',
          keterangan: this.uraian || '-',
          nama: this.authStore.user?.nama || '',
          hp: this.authStore.user?.hp || ''
        }

        const success = await this.sapaStore.sendLaporan(
          payload,
          this.capturedFile
        )

        if (success) {
          this.$router.replace('/sapa_riwayat')
        }

      } catch (err) {
        console.error(err)
      } finally {
        this.isSending = false
      }
    },

    // 🔧 UTIL
    dataURLtoBlob(dataurl) {
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      const u8arr = new Uint8Array(bstr.length)

      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i)
      }

      return new Blob([u8arr], { type: mime })
    },

    async compressImage(dataUrl, quality = 0.6, maxWidth = 1280) {
      return new Promise((resolve) => {
        const img = new Image()
        img.src = dataUrl

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          let w = img.width
          let h = img.height

          // 🔥 resize
          if (w > maxWidth) {
            h = (h * maxWidth) / w
            w = maxWidth
          }

          canvas.width = w
          canvas.height = h

          ctx.drawImage(img, 0, 0, w, h)

          // =========================
          // 🔥 WATERMARK
          // =========================

          const now = new Date()
          const time = now.toLocaleString()

          const gps = (this.lat && this.lng)
            ? `${this.lat.toFixed(5)}, ${this.lng.toFixed(5)}`
            : 'No GPS'

          const text = `${time} | ${gps}`

          // background box
          ctx.fillStyle = 'rgba(0,0,0,0.6)'
          ctx.fillRect(0, h - 50, w, 50)

          // text
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 14px Arial'
          ctx.fillText(text, 10, h - 20)

          // =========================

          const final = canvas.toDataURL('image/jpeg', quality)
          resolve(final)
        }
      })
    }

  }
}
</script>

<style scoped>

body, html {
  background: transparent !important;
}

.camera-preview {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* 🔘 CAPTURE BUTTON */
.capture-wrapper {
  width: 90px;
  height: 90px;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.capture-ring {
  width: 80px;
  height: 80px;
  border: 4px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.capture-ring:active {
  transform: scale(0.85);
  box-shadow: 0 0 20px rgba(255,255,255,0.5);
}

.capture-inner {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
}

/* ⚡ FLASH EFFECT */
.flash {
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  z-index: 20;
  opacity: 0.8;
  animation: flashAnim 0.15s ease-out;
}

@keyframes flashAnim {
  from { opacity: 0.9; }
  to { opacity: 0; }
}

.q-page {
  background: transparent !important; /* 🔥 IMPORTANT */
}

.top-bar {
  position: absolute;
  z-index: 9999;
  top: 0;
  width: 100%;
  padding-top: 20px;
}

.bottom-bar {
  position: absolute;
  z-index: 9999;
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

.camera-wrapper {
  position: relative;
  height: 100vh;
  z-index: 0;
}

#cameraPreview {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.top-bar,
.bottom-bar,
.capture-wrapper {
  z-index: 9999 !important;
  position: relative;
}
</style>