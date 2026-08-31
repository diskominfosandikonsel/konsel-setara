<template>
  <!-- ══════════════════════════════════════════════ -->
  <!-- FLOATING BUTTON SKM (Hanya tampil jika belum isi survei) -->
  <!-- ══════════════════════════════════════════════ -->
  <div v-if="!hasSubmitted" class="skm-fab-wrapper">
    <q-btn
      id="skm-fab-btn"
      round
      unelevated
      class="skm-fab-btn"
      @click="openDialog"
    >
      <div class="skm-fab-inner">
        <q-icon name="star_rate" size="22px" color="white" />
      </div>
      <div class="skm-fab-label">SURVEY</div>
    </q-btn>
  </div>

  <!-- ══════════════════════════════════════════════ -->
  <!-- DIALOG FORM SURVEY SKM                         -->
  <!-- ══════════════════════════════════════════════ -->
  <q-dialog
    v-model="dialogOpen"
    position="bottom"
    :no-backdrop-dismiss="false"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="skm-dialog-card">

      <!-- Handle bar -->
      <div class="skm-handle-bar"></div>

      <!-- Header dialog -->
      <div class="skm-dialog-header">
        <div class="skm-dialog-icon-wrap">
          <q-icon name="sentiment_satisfied_alt" size="36px" color="white" />
        </div>
        <div class="skm-dialog-title">Survei Kepuasan Masyarakat</div>
        <div class="skm-dialog-subtitle">{{ namaAplikasiDisplay }}</div>
      </div>

      <!-- Body form -->
      <div class="skm-dialog-body">

        <!-- Pertanyaan rating -->
        <div class="skm-question">
          Bagaimana penilaian Anda terhadap layanan ini?
        </div>

        <!-- Star Rating -->
        <div class="skm-stars-row">
          <div
            v-for="n in 5"
            :key="n"
            class="skm-star-item"
            @click="rating = n"
            @mouseenter="hoveredStar = n"
            @mouseleave="hoveredStar = 0"
          >
            <q-icon
              :name="(hoveredStar || rating) >= n ? 'star' : 'star_outline'"
              :color="(hoveredStar || rating) >= n ? ratingColor(hoveredStar || rating) : 'grey-4'"
              size="40px"
              class="skm-star-icon"
            />
          </div>
        </div>

        <!-- Label rating -->
        <transition name="fade">
          <div
            v-if="rating > 0"
            class="skm-rating-label"
            :style="{ color: ratingColorHex(rating) }"
          >
            {{ ratingLabel(rating) }}
          </div>
        </transition>

        <!-- Komentar -->
        <q-input
          v-model="komentar"
          type="textarea"
          outlined
          autogrow
          rows="3"
          placeholder="Tuliskan komentar atau masukan Anda (opsional)..."
          class="skm-textarea q-mt-md"
          maxlength="500"
          counter
        />

        <!-- Tombol Aksi -->
        <div class="skm-actions row q-gutter-sm q-mt-md">
          <q-btn
            flat
            class="col skm-btn-batal"
            label="Batal"
            @click="dialogOpen = false"
          />
          <q-btn
            unelevated
            class="col skm-btn-kirim"
            :label="submitting ? 'Mengirim...' : 'Kirim Ulasan'"
            :loading="submitting"
            :disable="rating === 0 || submitting"
            @click="submitUlasan"
          />
        </div>

      </div>
    </q-card>
  </q-dialog>

  <!-- ══════════════════════════════════════════════ -->
  <!-- DIALOG SUKSES                                  -->
  <!-- ══════════════════════════════════════════════ -->
  <q-dialog
    v-model="successDialog"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="skm-success-card text-center">
      <div class="skm-success-icon">
        <q-icon name="check_circle" size="64px" color="positive" />
      </div>
      <div class="skm-success-title">Terima Kasih!</div>
      <div class="skm-success-msg">
        Ulasan Anda telah berhasil dikirim. Masukan Anda sangat berarti bagi kami.
      </div>
      <q-btn
        unelevated
        color="primary"
        label="Tutup"
        class="q-mt-md full-width skm-btn-close"
        @click="successDialog = false"
      />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify } from 'quasar'
import { apiSkm } from 'src/api/apiSkm'

// ─── Props ────────────────────────────────────────────
const props = defineProps({
  // Nama modul/aplikasi, dipakai untuk mencari aplikasi_id secara otomatis
  namaAplikasi: {
    type: String,
    required: true
  }
})

// ─── State ────────────────────────────────────────────
const dialogOpen = ref(false)
const successDialog = ref(false)
const rating = ref(0)
const hoveredStar = ref(0)
const komentar = ref('')
const submitting = ref(false)
const aplikasiId = ref(null)
const namaAplikasiDisplay = ref(props.namaAplikasi)
const hasSubmitted = ref(false)

// ─── Helpers ──────────────────────────────────────────
const ratingLabel = (r) => {
  const labels = ['', 'Sangat Tidak Puas', 'Tidak Puas', 'Cukup Puas', 'Puas', 'Sangat Puas']
  return labels[r] || ''
}

const ratingColor = (r) => {
  if (r <= 1) return 'red-6'
  if (r === 2) return 'orange-6'
  if (r === 3) return 'amber-6'
  if (r === 4) return 'light-green-6'
  return 'green-6'
}

const ratingColorHex = (r) => {
  if (r <= 1) return '#e53935'
  if (r === 2) return '#fb8c00'
  if (r === 3) return '#ffb300'
  if (r === 4) return '#7cb342'
  return '#43a047'
}

// ─── Key localStorage ─────────────────────────────────
const SKM_KEY = computed(() => `skm_submitted_${props.namaAplikasi}`)

const getUserId = () => {
  try {
    const storedUser = localStorage.getItem('user')
    if (storedUser && storedUser !== 'undefined') {
      const user = JSON.parse(storedUser)
      return user._id || user.id || user.username || user.nama || 'anonim'
    }
  } catch (e) {
    // ignore
  }
  return 'anonim'
}

// ─── Cek Status Sudah Isi Survei atau Belum ──────────
const checkSubmissionStatus = async () => {
  // 1. Cek LocalStorage
  const localFlag = localStorage.getItem(SKM_KEY.value)
  if (localFlag) {
    hasSubmitted.value = true
  }

  // 2. Cek ke Database jika user login
  const userId = getUserId()
  if (userId && userId !== 'anonim') {
    try {
      const res = await apiSkm.checkStatus({
        aplikasi_id: aplikasiId.value || props.namaAplikasi,
        createdBy: userId
      })
      if (res.data?.hasSubmitted) {
        hasSubmitted.value = true
        localStorage.setItem(SKM_KEY.value, '1')
      }
    } catch (e) {
      console.warn('[SKM] Gagal cek status ulasan:', e)
    }
  }
}

// ─── Ambil aplikasi_id dari backend berdasarkan nama ──
const fetchAplikasiId = async () => {
  try {
    const res = await apiSkm.listAplikasi()
    const list = res.data || []
    // Cari berdasarkan nama yang mirip (case-insensitive)
    const found = list.find(
      a => a.nama?.toLowerCase().includes(props.namaAplikasi.toLowerCase()) ||
           props.namaAplikasi.toLowerCase().includes(a.nama?.toLowerCase())
    )
    if (found) {
      aplikasiId.value = found.id
      namaAplikasiDisplay.value = found.nama
    }
  } catch (err) {
    console.warn('[SKM] Gagal fetch aplikasi list:', err)
  } finally {
    await checkSubmissionStatus()
  }
}

// ─── Buka dialog ──────────────────────────────────────
const openDialog = () => {
  if (hasSubmitted.value) {
    Notify.create({
      message: 'Anda sudah mengisi survei kepuasan untuk layanan ini.',
      color: 'info',
      icon: 'check_circle',
      position: 'top'
    })
    return
  }
  rating.value = 0
  hoveredStar.value = 0
  komentar.value = ''
  dialogOpen.value = true
}

// ─── Submit ulasan ────────────────────────────────────
const submitUlasan = async () => {
  if (rating.value === 0 || hasSubmitted.value) return

  submitting.value = true
  try {
    const createdBy = getUserId()

    await apiSkm.addUlasan({
      aplikasi_id: aplikasiId.value || props.namaAplikasi,
      rating: rating.value,
      komentar: komentar.value || '-',
      createdBy
    })

    // Tandai sudah mengisi
    hasSubmitted.value = true
    localStorage.setItem(SKM_KEY.value, Date.now().toString())

    dialogOpen.value = false
    successDialog.value = true
  } catch (err) {
    console.error('[SKM] Gagal kirim ulasan:', err)
    if (err.response?.data?.alreadySubmitted || err.response?.status === 409) {
      hasSubmitted.value = true
      localStorage.setItem(SKM_KEY.value, Date.now().toString())
      dialogOpen.value = false
      Notify.create({
        message: 'Anda sudah pernah mengisi survei kepuasan untuk layanan ini.',
        color: 'warning',
        icon: 'info',
        position: 'top'
      })
      return
    }
    Notify.create({
      message: err.response?.data?.message || 'Gagal mengirim ulasan. Silakan coba lagi.',
      color: 'negative',
      icon: 'error',
      position: 'top'
    })
  } finally {
    submitting.value = false
  }
}

// ─── Lifecycle ────────────────────────────────────────
onMounted(() => {
  fetchAplikasiId()
})
</script>

<style scoped>
/* ─── FLOATING BUTTON ─── */
.skm-fab-wrapper {
  position: fixed;
  bottom: 80px;
  right: 18px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.skm-fab-btn {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #1565c0 0%, #42a5f5 100%) !important;
  box-shadow: 0 4px 18px rgba(21, 101, 192, 0.45) !important;
  border-radius: 16px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.skm-fab-btn:hover,
.skm-fab-btn:active {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(21, 101, 192, 0.55) !important;
}

.skm-fab-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.skm-fab-label {
  font-size: 9px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
  margin-top: 1px;
}

/* ─── DIALOG ─── */
.skm-dialog-card {
  width: 100%;
  max-width: 480px;
  border-radius: 24px 24px 0 0 !important;
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom, 12px);
}

.skm-handle-bar {
  width: 40px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin: 12px auto 0;
}

.skm-dialog-header {
  background: linear-gradient(135deg, #1565c0 0%, #42a5f5 100%);
  padding: 20px 24px 24px;
  text-align: center;
}

.skm-dialog-icon-wrap {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.skm-dialog-title {
  color: white;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.skm-dialog-subtitle {
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  margin-top: 4px;
}

.skm-dialog-body {
  padding: 20px 20px 8px;
}

.skm-question {
  font-size: 14px;
  font-weight: 600;
  color: #1a2340;
  text-align: center;
  margin-bottom: 16px;
}

/* ─── STARS ─── */
.skm-stars-row {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
}

.skm-star-item {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.skm-star-item:hover {
  transform: scale(1.18);
}

.skm-star-icon {
  display: block;
  transition: color 0.15s ease;
}

.skm-rating-label {
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.2px;
  min-height: 20px;
  transition: color 0.2s;
}

/* ─── TEXTAREA ─── */
.skm-textarea :deep(.q-field__control) {
  border-radius: 12px;
}

/* ─── BUTTONS ─── */
.skm-actions {
  padding-bottom: 8px;
}

.skm-btn-batal {
  border-radius: 12px;
  color: #607d8b;
  font-weight: 600;
  border: 1.5px solid #e0e0e0;
}

.skm-btn-kirim {
  border-radius: 12px;
  background: linear-gradient(135deg, #1565c0 0%, #42a5f5 100%) !important;
  color: white !important;
  font-weight: 700;
}

.skm-btn-kirim:disabled {
  opacity: 0.5;
}

/* ─── SUCCESS DIALOG ─── */
.skm-success-card {
  border-radius: 20px !important;
  padding: 28px 24px 20px;
  max-width: 320px;
  width: 100%;
}

.skm-success-icon {
  margin-bottom: 12px;
}

.skm-success-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a2340;
  margin-bottom: 8px;
}

.skm-success-msg {
  font-size: 13px;
  color: #607d8b;
  line-height: 1.5;
}

.skm-btn-close {
  border-radius: 12px;
  font-weight: 700;
}

/* ─── TRANSITIONS ─── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
