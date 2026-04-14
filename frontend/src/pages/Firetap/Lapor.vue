<template>
  <q-page class="lapor-bg">

    <!-- ══════════════════════════════ -->
    <!-- HEADER                         -->
    <!-- ══════════════════════════════ -->
    <div class="lapor-header">
      <div class="header-overlay"></div>
      <div class="row items-center q-px-md q-pt-md relative-position z-top">
        <q-btn flat round dense icon="arrow_back" color="white" class="glass-btn" @click="$router.back()" />
        <div class="header-title q-ml-sm">🔥 LAPOR KEJADIAN</div>
      </div>

      <!-- PHOTO AREA -->
      <div class="photo-zone column flex-center q-pb-lg relative-position z-top" @click="triggerCamera">
        <transition name="fade" mode="out-in">
          <div v-if="capturedImage" key="preview" class="photo-preview-wrapper">
            <img :src="capturedImage" class="photo-preview" />
            <div class="change-photo-hint">
              <q-icon name="camera_alt" size="16px" class="q-mr-xs" />
              Ganti Foto
            </div>
          </div>
          <div v-else key="empty" class="photo-empty column flex-center">
            <div class="camera-icon-ring">
              <q-icon name="add_a_photo" size="40px" color="white" />
            </div>
            <div class="camera-hint q-mt-md">TAP UNTUK AMBIL FOTO KEJADIAN</div>
          </div>
        </transition>
      </div>
    </div>

    <!-- ══════════════════════════════ -->
    <!-- FORM AREA                      -->
    <!-- ══════════════════════════════ -->
    <div class="form-area">

      <!-- KATEGORI ADUAN — Field tambahan khusus Firetap -->
      <div class="form-card q-mb-md">
        <div class="form-card-head">
          <q-icon name="local_fire_department" color="deep-orange" size="20px" />
          <span>Kategori Aduan</span>
        </div>
        <div class="form-card-body">
          <div class="row q-gutter-sm">
            <div v-for="(kat, i) in kategoriList" :key="i" class="kategori-chip-btn"
              :class="{ 'kat-active': form.jenis_kasus === i }" @click="form.jenis_kasus = i">
              <span class="kat-icon">{{ kat.icon }}</span>
              <span class="kat-label">{{ kat.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- JUDUL KASUS -->
      <div class="form-card q-mb-md">
        <div class="form-card-head">
          <q-icon name="title" color="deep-orange" size="20px" />
          <span>Judul Laporan</span>
        </div>
        <div class="form-card-body">
          <q-input v-model="form.judul_kasus" outlined placeholder="Contoh: Kebakaran rumah di Jl. Merdeka"
            bg-color="white" color="deep-orange" />
        </div>
      </div>

      <!-- KETERANGAN -->
      <div class="form-card q-mb-md">
        <div class="form-card-head">
          <q-icon name="edit_note" color="deep-orange" size="20px" />
          <span>Catatan / Keterangan</span>
        </div>
        <div class="form-card-body">
          <q-input v-model="form.catatan_kasus" type="textarea" outlined
            placeholder="Jelaskan secara rinci situasi dan kondisi kejadian..." rows="3" bg-color="white"
            color="deep-orange" />
        </div>
      </div>

      <!-- LOKASI -->
      <div class="form-card q-mb-xl">
        <div class="form-card-head">
          <q-icon name="place" color="deep-orange" size="20px" />
          <span>Lokasi Kejadian</span>
        </div>
        <div class="form-card-body">
          <div v-if="!hasLocation && !loadingLocation" class="loc-tap-box" @click="getLocation">
            <div class="loc-tap-icon">
              <q-icon name="my_location" size="28px" color="deep-orange" />
            </div>
            <div class="q-ml-md">
              <div class="text-weight-bold" style="font-size: 14px; color: #c2410c">Tap untuk Ambil Lokasi</div>
              <div class="text-caption text-grey-6">Izinkan akses lokasi di browser Anda</div>
            </div>
            <q-icon name="chevron_right" color="grey-4" class="q-ml-auto" />
          </div>

          <div v-else-if="loadingLocation" class="location-status">
            <div class="row items-center q-gutter-sm">
              <q-spinner-dots color="deep-orange" size="22px" />
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
          <span class="text-caption text-deep-orange text-weight-bold">{{ uploadPercent }}%</span>
        </div>
        <q-linear-progress :value="uploadPercent / 100" color="deep-orange" rounded size="8px" animation-speed="200" />
      </div>

      <!-- SUBMIT BUTTON -->
      <q-btn unelevated class="submit-btn full-width" no-caps :loading="isSending" :disable="!canSubmit"
        @click="handleKirim">
        <q-icon name="send" class="q-mr-sm" />
        KIRIM LAPORAN DARURAT
        <div class="btn-shine"></div>
      </q-btn>

      <div class="text-center text-caption text-grey-5 q-mt-md q-mb-xl">
        Laporan akan langsung diterima oleh petugas pemadam kebakaran
      </div>
    </div>

    <!-- HIDDEN CAMERA INPUT -->
    <input type="file" accept="image/*" ref="cameraInput" style="display: none"
      @change="onCameraCapture" />

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useFiretapStore } from 'stores/firetap'
import { useAuthStore } from 'stores/auth'
import { Geolocation } from '@capacitor/geolocation'

const router = useRouter()
const $q = useQuasar()
const firetapStore = useFiretapStore()
const authStore = useAuthStore()

// Form
const form = ref({
  judul_kasus: '',
  catatan_kasus: '',
  jenis_kasus: null,
  latitude: 0,
  longitude: 0,
  status_kasus: 0,
  file: ''
})

// Kategori
const kategoriList = [
  { label: 'Kebakaran', icon: '🔥' },
  { label: 'Penyelamatan', icon: '🚑' },
  { label: 'Satwa', icon: '🐾' },
  { label: 'Lingkungan', icon: '🌿' },
  { label: 'Properti', icon: '🏠' },
  { label: 'Materil', icon: '📦' },
  { label: 'Infrastruktur', icon: '🏗️' },
  { label: 'Perangkat', icon: '⚙️' },
]

// Camera & photo
const cameraInput = ref(null)
const capturedImage = ref(null)
const capturedFile = ref(null)

// Location
const loadingLocation = ref(false)
const hasLocation = computed(() => !!form.value.latitude && !!form.value.longitude)
const locationLabel = computed(() =>
  hasLocation.value
    ? `${Number(form.value.latitude).toFixed(5)}, ${Number(form.value.longitude).toFixed(5)}`
    : 'GPS tidak aktif'
)

// Upload & submit
const uploading = ref(false)
const uploadPercent = ref(0)
const isSending = ref(false)

const canSubmit = computed(() =>
  !!capturedFile.value && form.value.judul_kasus.trim().length > 2 && form.value.jenis_kasus !== null
)

const triggerCamera = () => {
  if (cameraInput.value) cameraInput.value.click()
}

const onCameraCapture = (event) => {
  const file = event.target.files[0]
  if (!file) return
  capturedFile.value = file
  capturedImage.value = URL.createObjectURL(file)
  event.target.value = ''
}

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

    form.value.latitude = pos.coords.latitude
    form.value.longitude = pos.coords.longitude
    
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
  form.value.latitude = 0
  form.value.longitude = 0
  isGettingLocation = false
}

const handleKirim = async () => {
  if (form.value.jenis_kasus === null) {
    return $q.notify({ color: 'negative', message: 'Pilih kategori aduan terlebih dahulu', icon: 'category' })
  }
  if (!capturedFile.value) {
    return $q.notify({ color: 'negative', message: 'Foto kejadian wajib dilampirkan', icon: 'photo_camera' })
  }
  if (!form.value.judul_kasus.trim()) {
    return $q.notify({ color: 'negative', message: 'Judul laporan tidak boleh kosong', icon: 'edit' })
  }

  isSending.value = true
  uploading.value = true
  uploadPercent.value = 0

  // Bersihkan spasi dan pastikan berakhiran .jpg
  let baseName = capturedFile.value.name || 'image'
  let cleanName = baseName.replace(/[^a-zA-Z0-9.]/g, '_')
  if (!cleanName.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
    cleanName += '.jpg'
  }
  const namaFile = `upload-${Date.now()}-${cleanName}`

  const progressInterval = setInterval(() => {
    if (uploadPercent.value < 80) uploadPercent.value += 15
  }, 250)

  try {
    let user = {}
    try {
      const tokenStr = localStorage.getItem('token')
      if (tokenStr) {
        const payloadStr = atob(tokenStr.split('.')[1])
        user = JSON.parse(payloadStr)
      }
    } catch (e) {
      console.error('Failed to parse token', e)
      user = authStore.user || {}
    }

    console.log('🔥 [FIRETAP DEBUG] Parsed token user:', JSON.stringify(user))

    const hpValue = user.hp || user.no_telp || user.phone || user.profile?.hp || ''
    const namaValue = user.nama || user.name || user.username || user.profile?.nama || ''

    console.log('🔥 [FIRETAP DEBUG] nama:', namaValue, '| hp:', hpValue)

    const payload = {
      judul_kasus: form.value.judul_kasus.trim(),
      catatan_kasus: form.value.catatan_kasus.trim(),
      deskripsi_kasus: `${form.value.catatan_kasus.trim()}\n\n---\nData Pelapor:\nNama: ${namaValue || '-'}\nNo. HP: ${hpValue || '-'}`,
      alamat_kasus: hasLocation.value
        ? `${Number(form.value.latitude).toFixed(5)}, ${Number(form.value.longitude).toFixed(5)}`
        : '',
      jenis_kasus: form.value.jenis_kasus,
      latitude: form.value.latitude,
      longitude: form.value.longitude,
      status_kasus: 0,
      file: namaFile
    }

    const ok = await firetapStore.addKasus(payload, capturedFile.value, namaFile)

    clearInterval(progressInterval)
    uploadPercent.value = 100
    uploading.value = false

    if (ok) {
      capturedImage.value = null
      capturedFile.value = null
      form.value.judul_kasus = ''
      form.value.catatan_kasus = ''
      form.value.jenis_kasus = null
      router.replace('/firetap_riwayat')
    }
  } catch (err) {
    clearInterval(progressInterval)
    $q.notify({ color: 'negative', message: 'Terjadi kesalahan. Coba ulangi.', icon: 'error' })
  } finally {
    isSending.value = false
    uploading.value = false
    uploadPercent.value = 0
  }
}
</script>

<style scoped>
.lapor-bg {
  background: #fff7f0;
  min-height: 100vh;
}

/* ─── HEADER ─── */
.lapor-header {
  position: relative;
  min-height: 300px;
  overflow: hidden;
  border-bottom-left-radius: 36px;
  border-bottom-right-radius: 36px;
  background: linear-gradient(160deg, #7c1d06 0%, #ea580c 60%, #f97316 100%);
}

.header-overlay {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 3px 3px, rgba(255, 255, 255, 0.08) 2px, transparent 0);
  background-size: 28px 28px;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.18) !important;
  backdrop-filter: blur(6px);
}

.header-title {
  font-size: 15px;
  font-weight: 800;
  color: white;
  letter-spacing: 1.5px;
}

/* ─── PHOTO ZONE ─── */
.photo-zone {
  min-height: 230px;
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
  height: 190px;
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

.camera-icon-ring {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 3px dashed rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {

  0%,
  100% {
    border-color: rgba(255, 255, 255, 0.5);
  }

  50% {
    border-color: rgba(255, 255, 255, 0.9);
  }
}

.camera-hint {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

/* ─── TRANSITION ─── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
  padding: 14px 20px;
  font-weight: 800;
  font-size: 13px;
  color: #9a3412;
  border-bottom: 1px solid #fff7ed;
  letter-spacing: 0.3px;
}

.form-card-body {
  padding: 16px 20px;
}

/* ─── KATEGORI CHIPS ─── */
.kategori-chip-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(25% - 10px);
  padding: 10px 8px;
  border-radius: 14px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.kategori-chip-btn:active {
  transform: scale(0.93);
}

.kategori-chip-btn.kat-active {
  border-color: #ea580c;
  background: #fff7ed;
}

.kat-icon {
  font-size: 22px;
}

.kat-label {
  font-size: 10px;
  font-weight: 700;
  color: #374151;
  margin-top: 4px;
  text-align: center;
}

.kat-active .kat-label {
  color: #c2410c;
}

/* ─── LOCATION STYLES ─── */
.loc-tap-box {
  display: flex;
  align-items: center;
  background: #fff7ed;
  border: 1.5px dashed #fdba74;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.loc-tap-box:active {
  transform: scale(0.98);
  background: #fed7aa;
}

.loc-tap-icon {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.15);
  flex-shrink: 0;
}

.location-status {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
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

  0%,
  100% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
  }

  50% {
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }
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
  font-size: 14px !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
  background: linear-gradient(135deg, #7c1d06, #ea580c) !important;
  box-shadow: 0 10px 24px rgba(234, 88, 12, 0.4);
  color: white !important;
  position: relative;
  overflow: hidden;
}

.submit-btn:disabled {
  opacity: 0.5 !important;
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
  0% {
    left: -100%;
  }

  40% {
    left: 150%;
  }

  100% {
    left: 150%;
  }
}
</style>
