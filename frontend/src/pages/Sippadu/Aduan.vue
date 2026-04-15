<template>
  <q-page class="bg-black text-white">

    <!-- 🔵 CAMERA MODE -->
    <div v-if="mode === 'camera'" class="camera-wrapper">
      <div id="sippaduCameraPreview" class="camera-preview"></div>

      <!-- TOP BAR -->
      <div class="top-bar row items-center justify-between q-px-md">
        <q-btn flat round icon="close" color="white" @click="$router.back()" />
        <div class="text-weight-bold">ADUAN {{ jenisLabel }}</div>
        <div style="width: 40px"></div>
      </div>

      <!-- BOTTOM BAR -->
      <div class="bottom-bar">
        <div class="row items-center justify-around">
          <!-- Gallery -->
          <q-btn flat round size="20px" icon="photo_library" color="white" @click="pickFromGallery" />

          <!-- Capture -->
          <div class="capture-wrapper" @click="takePicture">
            <div class="capture-ring" :class="jenis">
              <div class="capture-inner"></div>
            </div>
          </div>

          <!-- Switch Camera -->
          <q-btn flat round size="20px" icon="flip_camera_android" color="white" @click="switchCamera" />
        </div>
      </div>
    </div>

    <!-- 🟡 FORM MODE (setelah foto diambil) -->
    <div v-else class="form-mode">

      <!-- HEADER with photo preview -->
      <div class="aduan-header" :class="jenis">
        <div class="header-overlay"></div>
        <div class="row items-center q-px-md q-pt-md relative-position z-top">
          <q-btn flat round dense icon="arrow_back" color="white" class="glass-btn" @click="retakePhoto" />
          <div class="header-title q-ml-sm">ADUAN {{ jenisLabel }}</div>
        </div>

        <!-- PHOTO PREVIEW AREA -->
        <div class="photo-zone column flex-center q-pb-lg relative-position z-top" @click="retakePhoto">
          <div class="photo-preview-wrapper">
            <img :src="capturedImage" class="photo-preview" />
            <div class="change-photo-hint">
              <q-icon name="camera_alt" size="16px" class="q-mr-xs" />
              Ganti Foto
            </div>
          </div>
        </div>
      </div>

      <!-- FORM AREA -->
      <div class="form-area">

        <!-- KETERANGAN LAPORAN -->
        <div class="form-card q-mb-md">
          <div class="form-card-head">
            <q-icon name="edit_note" color="primary" size="20px" />
            <span>Keterangan Laporan</span>
          </div>
          <div class="form-card-body">
            <q-input v-model="form.uraian" type="textarea" outlined
              placeholder="Jelaskan secara rinci lokasi, waktu, dan bentuk pelanggaran yang Anda lihat..." rows="4"
              bg-color="white" />
          </div>
        </div>

        <!-- LOKASI -->
        <div class="form-card q-mb-xl">
          <div class="form-card-head">
            <q-icon name="place" color="primary" size="20px" />
            <span>Lokasi Kejadian</span>
          </div>
          <div class="form-card-body">
            <div v-if="!hasLocation && !loadingLocation" class="loc-tap-box" @click="getLocation">
              <div class="loc-tap-icon">
                <q-icon name="my_location" size="28px" color="primary" />
              </div>
              <div class="q-ml-md">
                <div class="text-weight-bold" style="font-size: 14px; color: #1e3a8a">Tap untuk Ambil Lokasi</div>
                <div class="text-caption text-grey-6">Izinkan akses lokasi di browser Anda</div>
              </div>
              <q-icon name="chevron_right" color="grey-4" class="q-ml-auto" />
            </div>

            <div v-else-if="loadingLocation" class="location-status">
              <div class="row items-center q-gutter-sm">
                <q-spinner-dots color="primary" size="22px" />
                <div>
                  <div class="text-weight-bold" style="font-size: 13px">Mendeteksi lokasi...</div>
                  <div class="text-caption text-grey-6">Mohon tunggu sebentar</div>
                </div>
              </div>
            </div>

            <div v-else class="location-status active">
              <div class="row items-center no-wrap">
                <div class="loc-dot dot-active"></div>
                <div class="q-ml-sm col">
                  <div class="text-weight-bold" style="font-size: 13px">Lokasi Terdeteksi ✓</div>
                  <div class="text-caption text-grey-6">{{ locationLabel }}</div>
                </div>
                <q-btn flat round dense icon="refresh" color="grey-5" size="sm" @click="resetLocation">
                  <q-tooltip>Perbarui lokasi</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- UPLOAD PROGRESS -->
        <div v-if="uploading" class="upload-progress-area q-mb-md">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-caption text-grey-7">Mengunggah foto...</span>
            <span class="text-caption text-primary text-weight-bold">{{ uploadPercent }}%</span>
          </div>
          <q-linear-progress :value="uploadPercent / 100" color="primary" rounded size="8px" animation-speed="200" />
        </div>

        <!-- SUBMIT BUTTON -->
        <q-btn unelevated class="submit-btn full-width" :class="jenis" no-caps :loading="isSending" :disable="!canSubmit"
          @click="handleKirim">
          <q-icon name="send" class="q-mr-sm" />
          KIRIM LAPORAN
          <div class="btn-shine"></div>
        </q-btn>

        <div class="text-center text-caption text-grey-5 q-mt-md q-mb-xl">
          Laporan bersifat resmi dan akan diverifikasi oleh petugas Satpol PP
        </div>

      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSippaduStore } from 'stores/sippadu'
import { useAuthStore } from 'stores/auth'
import { SippaduService } from 'src/services/sippadu.service'
import { Geolocation } from '@capacitor/geolocation'
import { Camera } from '@capacitor/camera'
import { CameraPreview } from '@capacitor-community/camera-preview'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const sippaduStore = useSippaduStore()
const authStore = useAuthStore()

// type: 'perda' | 'perkada'
const jenis = computed(() => route.params.type || 'perda')
const jenisLabel = computed(() => jenis.value === 'perkada' ? 'PERKADA' : 'PERDA')

// Mode: 'camera' or 'form'
const mode = ref('camera')
const cameraPosition = ref('rear')

// Form state
const form = ref({
  uraian: '',
  lokasi: '',
  lat: null,
  lng: null,
  status: 'proses',
  keterangan: 'Laporan Sedang Dalam Proses',
  file: ''
})

// Coba berbagai kemungkinan field name dari backend response
const namaUser = computed(() => {
  const u = authStore.user
  if (!u) return ''
  return u.nama || u.name || u.full_name || u.fullname || u.username || ''
})

const hpUser = computed(() => {
  const u = authStore.user
  if (!u) return ''
  return u.hp || u.phone || u.no_hp || u.telepon || u.no_telp || ''
})

// Camera & photo
const capturedImage = ref(null)
const capturedFile = ref(null)
const flash = ref(false)

// Location
const loadingLocation = ref(false)
const hasLocation = computed(() => !!form.value.lat && !!form.value.lng)
const locationLabel = computed(() =>
  loadingLocation.value
    ? 'Sedang mendeteksi koordinat GPS...'
    : hasLocation.value
      ? `${Number(form.value.lat).toFixed(5)}, ${Number(form.value.lng).toFixed(5)}`
      : 'GPS tidak aktif — pastikan izin lokasi diberikan'
)

// Upload & submit
const uploading = ref(false)
const uploadPercent = ref(0)
const isSending = ref(false)

// Validasi: minimal foto + uraian
const canSubmit = computed(() =>
  !!capturedFile.value && form.value.uraian.trim().length > 5
)

// ═══════════════════════════════════
// CAMERA METHODS
// ═══════════════════════════════════

const initPermissions = async () => {
  try {
    const cam = await Camera.requestPermissions()
    if (cam.camera !== 'granted') {
      $q.dialog({
        title: 'Izin Dibutuhkan',
        message: 'Kamera dibutuhkan untuk mengambil foto kejadian',
        ok: 'Buka Pengaturan',
        cancel: true
      })
      return false
    }
  } catch (e) {
    console.warn('Camera permission check failed', e)
  }

  // Get location in background
  try {
    const loc = await Geolocation.requestPermissions()
    if (loc.location === 'granted' || loc.coarseLocation === 'granted') {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      })
      form.value.lat = pos.coords.latitude
      form.value.lng = pos.coords.longitude
      form.value.lokasi = `${pos.coords.latitude},${pos.coords.longitude}`
    }
  } catch (e) {
    console.warn('Location permission/get failed', e)
  }

  return true
}

const startCamera = async () => {
  await nextTick()
  try {
    await CameraPreview.start({
      parent: 'sippaduCameraPreview',
      className: 'camera-preview',
      position: cameraPosition.value,
      width: window.innerWidth,
      height: window.innerHeight,
      toBack: true
    })
  } catch (e) {
    console.error('Start camera error:', e)
  }
}

const switchCamera = async () => {
  try {
    cameraPosition.value = cameraPosition.value === 'rear' ? 'front' : 'rear'
    await CameraPreview.stop()
    await startCamera()
  } catch (err) {
    console.error('Switch camera error:', err)
  }
}

const takePicture = async () => {
  try {
    flash.value = true
    setTimeout(() => (flash.value = false), 120)

    const result = await CameraPreview.capture({ quality: 80 })
    const dataUrl = 'data:image/jpeg;base64,' + result.value

    const compressed = await compressImage(dataUrl)
    capturedImage.value = compressed

    const blob = dataURLtoBlob(compressed)
    capturedFile.value = new File([blob], `img_${Date.now()}.jpg`, {
      type: 'image/jpeg'
    })

    mode.value = 'form'
    await nextTick()
    await CameraPreview.stop()
  } catch (err) {
    console.error('Capture error:', err)
  }
}

const pickFromGallery = async () => {
  try {
    const image = await Camera.getPhoto({
      resultType: 'dataUrl',
      source: 'photos'
    })

    if (!image?.dataUrl) return

    const compressed = await compressImage(image.dataUrl)
    capturedImage.value = compressed

    const blob = dataURLtoBlob(compressed)
    capturedFile.value = new File([blob], `img_${Date.now()}.jpg`, {
      type: 'image/jpeg'
    })

    mode.value = 'form'
    await nextTick()
    await CameraPreview.stop()
  } catch (err) {
    console.error('Gallery pick error:', err)
  }
}

const retakePhoto = async () => {
  mode.value = 'camera'
  capturedImage.value = null
  capturedFile.value = null
  await startCamera()
}

// ═══════════════════════════════════
// UTILS
// ═══════════════════════════════════

const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  const u8arr = new Uint8Array(bstr.length)
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }
  return new Blob([u8arr], { type: mime })
}

const compressImage = (dataUrl, quality = 0.6, maxWidth = 1280) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = dataUrl
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      let w = img.width
      let h = img.height

      if (w > maxWidth) {
        h = (h * maxWidth) / w
        w = maxWidth
      }

      canvas.width = w
      canvas.height = h
      ctx.drawImage(img, 0, 0, w, h)

      // Watermark
      const now = new Date()
      const time = now.toLocaleString()
      const gps = (form.value.lat && form.value.lng)
        ? `${form.value.lat.toFixed(5)}, ${form.value.lng.toFixed(5)}`
        : 'No GPS'
      const text = `${time} | ${gps}`

      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, h - 50, w, 50)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(text, 10, h - 20)

      const final = canvas.toDataURL('image/jpeg', quality)
      resolve(final)
    }
  })
}

// ═══════════════════════════════════
// LOCATION
// ═══════════════════════════════════

let isGettingLocation = false
const doGetLocation = async () => {
  if (isGettingLocation || hasLocation.value) return
  isGettingLocation = true
  loadingLocation.value = true

  try {
    const perm = await Geolocation.requestPermissions()
    if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
      $q.notify({ color: 'warning', message: 'Izin lokasi tidak diberikan', icon: 'warning' })
      loadingLocation.value = false
      isGettingLocation = false
      return
    }

    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    })

    form.value.lat = pos.coords.latitude
    form.value.lng = pos.coords.longitude
    form.value.lokasi = `${pos.coords.latitude},${pos.coords.longitude}`

  } catch (err) {
    console.error('Error getting location', err)
    $q.notify({ color: 'negative', message: 'Gagal mendapatkan lokasi. Pastikan GPS aktif.', icon: 'location_off' })
  } finally {
    loadingLocation.value = false
    isGettingLocation = false
  }
}

const getLocation = () => doGetLocation()

const resetLocation = () => {
  form.value.lat = null
  form.value.lng = null
  form.value.lokasi = ''
  isGettingLocation = false
}

// ═══════════════════════════════════
// SUBMIT
// ═══════════════════════════════════

const handleKirim = async () => {
  if (!capturedFile.value) {
    return $q.notify({ color: 'negative', message: 'Foto kejadian wajib dilampirkan', icon: 'photo_camera' })
  }
  if (!form.value.uraian.trim()) {
    return $q.notify({ color: 'negative', message: 'Keterangan tidak boleh kosong', icon: 'edit' })
  }

  isSending.value = true
  uploading.value = true
  uploadPercent.value = 0

  let baseName = capturedFile.value.name || 'image'
  let cleanName = baseName.replace(/[^a-zA-Z0-9.]/g, '_')
  if (!cleanName.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
    cleanName += '.jpg'
  }
  const fileName = `aduan-${Date.now()}-${cleanName}`

  // Progress simulasi
  const progressInterval = setInterval(() => {
    if (uploadPercent.value < 80) uploadPercent.value += 15
  }, 250)

  try {
    // ── Step 1: Upload foto via octet-stream ─────────────────────────
    try {
      await SippaduService.uploadFile(capturedFile.value, fileName)
    } catch (uploadErr) {
      console.warn('Upload foto error (lanjut):', uploadErr?.response?.status, uploadErr?.message)
    }

    clearInterval(progressInterval)
    uploadPercent.value = 100
    uploading.value = false

    // ── Step 2: Simpan data laporan ──────────────────────────────────
    const payload = {
      uraian: form.value.uraian.trim(),
      objek: jenis.value === 'perkada' ? 1 : 0,
      lat: form.value.lat,
      lng: form.value.lng,
      lokasi: form.value.lokasi,
      status: 'proses',
      keterangan: 'Laporan Sedang Dalam Proses',
      file: fileName,
      nama: namaUser.value,
      hp: hpUser.value
    }

    const success = await sippaduStore.addData(payload)

    if (success) {
      capturedImage.value = null
      capturedFile.value = null
      form.value.uraian = ''
      router.replace('/sippadu_riwayat')
    }
  } catch (err) {
    clearInterval(progressInterval)
    console.error('Kirim laporan error:', err)
    $q.notify({ color: 'negative', message: 'Terjadi kesalahan. Coba ulangi.', icon: 'error' })
  } finally {
    isSending.value = false
    uploading.value = false
    uploadPercent.value = 0
  }
}

// ═══════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════

onMounted(async () => {
  const allowed = await initPermissions()
  if (!allowed) return
  await startCamera()
})

onBeforeUnmount(() => {
  try {
    CameraPreview.stop()
  } catch (e) {}
})
</script>

<style scoped>
/* ─── CAMERA MODE ─── */
.camera-wrapper {
  position: relative;
  height: 100vh;
  z-index: 0;
}

#sippaduCameraPreview {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.camera-preview {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.q-page {
  background: transparent !important;
}

body, html {
  background: transparent !important;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  padding: 12px 16px;
  padding-top: calc(env(safe-area-inset-top) + 12px);
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  padding: 16px;
  padding-bottom: calc(env(safe-area-inset-bottom) + 16px);
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
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

.capture-ring.perda {
  border-color: #60a5fa;
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
}

.capture-ring.perkada {
  border-color: #a78bfa;
  box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
}

.capture-ring:active {
  transform: scale(0.85);
  box-shadow: 0 0 30px rgba(255,255,255,0.5);
}

.capture-inner {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
}

/* ⚡ FLASH */
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

/* ─── FORM MODE ─── */
.form-mode {
  background: #f0f4f9;
  min-height: 100vh;
}

.aduan-header {
  position: relative;
  min-height: 320px;
  overflow: hidden;
  border-bottom-left-radius: 36px;
  border-bottom-right-radius: 36px;
}

.aduan-header.perda {
  background: linear-gradient(160deg, #1e40af 0%, #3b82f6 60%, #60a5fa 100%);
}

.aduan-header.perkada {
  background: linear-gradient(160deg, #5b21b6 0%, #7c3aed 60%, #a78bfa 100%);
}

.header-overlay {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 3px 3px, rgba(255, 255, 255, 0.08) 2px, transparent 0);
  background-size: 30px 30px;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.18) !important;
  backdrop-filter: blur(6px);
}

.header-title {
  font-size: 15px;
  font-weight: 800;
  color: white;
  letter-spacing: 2px;
}

/* ─── PHOTO ZONE ─── */
.photo-zone {
  min-height: 240px;
  cursor: pointer;
}

.photo-preview-wrapper {
  position: relative;
  width: calc(100% - 48px);
  max-width: 360px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.photo-preview {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.change-photo-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 12px;
  display: flex;
  align-items: center;
}

/* ─── FORM AREA ─── */
.form-area {
  padding: 20px 16px 32px;
  margin-top: -20px;
}

.form-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.form-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  font-weight: 800;
  font-size: 13px;
  color: #1e3a8a;
  border-bottom: 1px solid #f1f5f9;
  letter-spacing: 0.3px;
}

.form-card-body {
  padding: 16px 20px;
}

/* ─── TAP-TO-GET LOCATION BOX ─── */
.loc-tap-box {
  display: flex;
  align-items: center;
  background: #eff6ff;
  border: 1.5px dashed #93c5fd;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.loc-tap-box:active {
  transform: scale(0.98);
  background: #dbeafe;
}

.loc-tap-icon {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  flex-shrink: 0;
}

/* ─── LOCATION STATUS ─── */
.location-status {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  transition: all 0.3s ease;
}

.location-status.active {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.loc-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-active {
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
}

/* ─── UPLOAD PROGRESS ─── */
.upload-progress-area {
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* ─── SUBMIT BUTTON ─── */
.submit-btn {
  border-radius: 18px !important;
  height: 58px !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  letter-spacing: 1.5px !important;
  position: relative;
  overflow: hidden;
}

.submit-btn.perda {
  background: linear-gradient(135deg, #1e40af, #3b82f6) !important;
  box-shadow: 0 10px 24px rgba(59, 130, 246, 0.4);
  color: white !important;
}

.submit-btn.perkada {
  background: linear-gradient(135deg, #5b21b6, #7c3aed) !important;
  box-shadow: 0 10px 24px rgba(124, 58, 237, 0.4);
  color: white !important;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 40%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transform: skewX(-20deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  40% { left: 150%; }
  100% { left: 150%; }
}
</style>
