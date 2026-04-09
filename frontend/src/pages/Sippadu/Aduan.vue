<template>
  <q-page class="aduan-bg">

    <!-- ══════════════════════════════ -->
    <!-- HEADER                         -->
    <!-- ══════════════════════════════ -->
    <div class="aduan-header" :class="jenis">
      <div class="header-overlay"></div>
      <div class="row items-center q-px-md q-pt-md relative-position z-top">
        <q-btn flat round dense icon="arrow_back" color="white" class="glass-btn" @click="$router.back()" />
        <div class="header-title q-ml-sm">ADUAN {{ jenisLabel }}</div>
      </div>

      <!-- PHOTO AREA -->
      <div class="photo-zone column flex-center q-pb-lg relative-position z-top" @click="triggerCamera">
        <transition name="fade" mode="out-in">
          <!-- Preview foto yang sudah diambil -->
          <div v-if="capturedImage" key="preview" class="photo-preview-wrapper">
            <img :src="capturedImage" class="photo-preview" />
            <div class="change-photo-hint">
              <q-icon name="camera_alt" size="16px" class="q-mr-xs" />
              Ganti Foto
            </div>
          </div>

          <!-- Empty state — dorong user ambil foto -->
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

      <!-- IDENTITAS PELAPOR — Diambil otomatis dari akun -->
      <!-- <div class="form-card q-mb-md">
        <div class="form-card-head">
          <q-icon name="person_pin" color="primary" size="20px" />
          <span>Identitas Pelapor</span>
        </div>
        <div class="form-card-body">
          <div class="data-row">
            <span class="data-label">Nama</span>
            <span class="data-val" :class="{ 'data-empty': !namaUser }">
              {{ namaUser || '(belum ada di profil)' }}
            </span>
          </div>
          <div class="data-divider" />
          <div class="data-row">
            <span class="data-label">Nomor HP</span>
            <span class="data-val" :class="{ 'data-empty': !hpUser }">
              {{ hpUser || '(belum ada di profil)' }}
            </span>
          </div>
         
          <div v-if="!namaUser || !hpUser" class="profile-hint q-mt-sm">
            <q-icon name="info" size="13px" class="q-mr-xs" />
            Data diambil dari profil akun Anda. Laporan tetap bisa dikirim.
          </div>
        </div>
      </div> -->

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

      <!-- LOKASI — Tap untuk ambil dari perangkat -->
      <div class="form-card q-mb-xl">
        <div class="form-card-head">
          <q-icon name="place" color="primary" size="20px" />
          <span>Lokasi Kejadian</span>
        </div>
        <div class="form-card-body">
          <!-- Belum dapat lokasi: tampil tombol besar -->
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

          <!-- Sedang loading -->
          <div v-else-if="loadingLocation" class="location-status">
            <div class="row items-center q-gutter-sm">
              <q-spinner-dots color="primary" size="22px" />
              <div>
                <div class="text-weight-bold" style="font-size: 13px">Mendeteksi lokasi...</div>
                <div class="text-caption text-grey-6">Mohon tunggu sebentar</div>
              </div>
            </div>
          </div>

          <!-- Berhasil dapat lokasi -->
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

    <!-- HIDDEN CAMERA INPUT -->
    <input type="file" accept="image/*" capture="environment" ref="cameraInput" style="display: none"
      @change="onCameraCapture" />

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSippaduStore } from 'stores/sippadu'
import { useAuthStore } from 'stores/auth'
import { SippaduService } from 'src/services/sippadu.service'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const sippaduStore = useSippaduStore()
const authStore = useAuthStore()

// type: 'perda' | 'perkada'
const jenis = computed(() => route.params.type || 'perda')
const jenisLabel = computed(() => jenis.value === 'perkada' ? 'PERKADA' : 'PERDA')

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
const cameraInput = ref(null)
const capturedImage = ref(null)
const capturedFile = ref(null)

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

onMounted(() => {
  // Tidak auto-request GPS — tunggu user tap agar tidak memicu OS-level error di desktop
})

const triggerCamera = () => {
  if (cameraInput.value) cameraInput.value.click()
}

const onCameraCapture = (event) => {
  const file = event.target.files[0]
  if (!file) return
  capturedFile.value = file
  capturedImage.value = URL.createObjectURL(file)
  form.value.file = file.name
  event.target.value = ''
}

// Cek permission sebelum request GPS — mencegah OS-level error (kCLErrorLocationUnknown)
const checkAndGetLocation = async () => {
  if (!navigator.geolocation) return

  try {
    const perm = await navigator.permissions.query({ name: 'geolocation' })
    if (perm.state === 'granted') {
      doGetLocation()
    }
    // 'prompt' atau 'denied' → tidak auto-request, tunggu user tap
  } catch (_e) {
    // Permissions API tidak tersedia — tidak auto-request
  }
}

// Eksekusi GPS — hanya dipanggil saat user tap
let isGettingLocation = false
const doGetLocation = () => {
  if (isGettingLocation || hasLocation.value) return
  isGettingLocation = true
  loadingLocation.value = true

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.value.lat = pos.coords.latitude
      form.value.lng = pos.coords.longitude
      form.value.lokasi = `${pos.coords.latitude},${pos.coords.longitude}`
      loadingLocation.value = false
      isGettingLocation = false
    },
    () => {
      loadingLocation.value = false
      isGettingLocation = false
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
  )
}

// Tombol retry — panggil manual (akan memunculkan dialog permission jika belum diizinkan)
const getLocation = () => doGetLocation()

// Reset lokasi agar user bisa update ulang
const resetLocation = () => {
  form.value.lat = null
  form.value.lng = null
  form.value.lokasi = ''
  isGettingLocation = false
}

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

  const fileName = capturedFile.value.name

  // Progress simulasi
  const progressInterval = setInterval(() => {
    if (uploadPercent.value < 80) uploadPercent.value += 15
  }, 250)

  try {
    // ── Step 1: Upload foto via octet-stream ─────────────────────────
    // Server (uploadImage.js) mengharapkan: Content-Type: application/octet-stream
    // dengan header File-Name berisi nama file
    try {
      await SippaduService.uploadFile(capturedFile.value, fileName)
    } catch (uploadErr) {
      // Jika upload gagal, lanjut saja — data laporan tetap disimpan
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
</script>

<style scoped>
.aduan-bg {
  background: #f0f4f9;
  min-height: 100vh;
}

/* ─── HEADER ─── */
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
  padding: 16px 20px;
  font-weight: 800;
  font-size: 13px;
  color: #1e3a8a;
  border-bottom: 1px solid #f1f5f9;
  letter-spacing: 0.3px;
}

/* ─── DATA ROW (Identitas read-only) ─── */
.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.data-label {
  font-size: 13px;
  color: #94a3b8;
}

.data-val {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.data-empty {
  color: #94a3b8;
  font-weight: 400;
  font-style: italic;
}

.data-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0 -4px;
}

.profile-hint {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 10px;
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

.loc-spinner {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.loc-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-idle {
  background: #94a3b8;
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
