<template>
  <q-page class="bg-grey-1">
    <!-- HEADER SECTION -->
    <div class="header q-pa-md">
      <div class="row items-center justify-between relative-position" style="min-height: 40px;">
        <q-btn flat round icon="arrow_back" color="white" @click="$router.back()" />

        <!-- LOGO AREA -->
        <div class="absolute-center row items-center q-gutter-sm logo-wrapper">
          <div class="logo-image-container">
            <img src="/icons/sippadu/logo_konsel.png" class="header-logo" alt="Logo Konsel" />
          </div>
          <div class="logo-image-container">
            <img src="/icons/sippadu/satpol.png" class="header-logo" alt="Logo Satpol" />
          </div>
        </div>

        <q-btn rounded icon="call" label="HOTLINE" size="sm" class="hotline-btn" />
      </div>

      <div class="q-mt-md flex flex-center">
        <img src="/icons/sippadu/banner-lapor.png" class="banner-main" alt="Banner Sippadu" />
      </div>

      <div class="header-fade"></div>
    </div>

    <div class="content q-pa-md">
      <!-- TITLE & CAPTION -->
      <div class="text-center q-mb-lg title-wrapper">
        <div class="text-h6 text-primary text-weight-bold">SIPPADU</div>
        <div class="text-caption text-grey-7">
          SISTEM INFORMASI PENGADUAN PELANGGARAN PERDA<br />
          DAN PERKADA SECARA TERPADU
        </div>
      </div>

      <!-- MAIN ACTION CARDS -->
      <q-card flat bordered class="q-pa-md q-mb-md rounded-card shadow-soft">
        <div class="text-subtitle2 text-weight-bold q-mb-sm text-grey-9">Klik untuk Melapor</div>
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-card clickable class="lapor-card" @click="goPerda">
              <q-img src="/icons/sippadu/icon-perda.png" width="60px" />
              <div class="q-mt-sm text-weight-bold text-primary">PERDA</div>
            </q-card>
          </div>

          <div class="col-6">
            <q-card clickable class="lapor-card" @click="goPerkada">
              <q-img src="/icons/sippadu/icon-perkada.png" width="60px" />
              <div class="q-mt-sm text-weight-bold text-primary">PERKADA</div>
            </q-card>
          </div>
        </div>
      </q-card>

      <!-- INFO BANNERS -->
      <div class="text-subtitle2 text-weight-bold q-mb-sm text-grey-9">Informasi Penting</div>
      <q-card clickable @click="goPerdaInfo" class="q-mb-sm rounded-card overflow-hidden shadow-soft">
        <q-img src="/icons/sippadu/banner-perda.png" ratio="4.68" />
      </q-card>
      <q-card clickable @click="goPerkadaInfo" class="q-mb-md rounded-card overflow-hidden shadow-soft">
        <q-img src="/icons/sippadu/banner-perkada.png" ratio="4.68" />
      </q-card>

      <!-- HISTORY LINK -->
      <q-card flat bordered class="q-pa-md q-mb-xl row items-center justify-between rounded-card history-card" clickable
        @click="goRiwayat">
        <div class="row items-center">
          <q-icon name="history" color="primary" size="24px" class="q-mr-sm" />
          <div class="text-weight-bold text-grey-9">Riwayat Laporan Anda</div>
        </div>
        <q-icon name="chevron_right" color="grey-6" size="24px" />
      </q-card>

    </div>

    <!-- HIDDEN CAMERA INPUT -->
    <input type="file" accept="image/*" capture="environment" ref="cameraInput" style="display: none"
      @change="onCameraCapture" />

    <!-- FULLSCREEN LAPORAN DIALOG -->
    <q-dialog v-model="showLaporDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-dark text-white relative-position">
        <q-img v-if="capturedImage" :src="capturedImage" class="absolute-full" fit="cover" />

        <!-- Header area for close icon -->
        <div class="absolute-top row items-center q-pa-md z-max"
          style="background: linear-gradient(rgba(0,0,0,0.6), transparent);">
          <q-btn round flat dense icon="arrow_back" color="white" @click="closeLaporDialog" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold" style="text-shadow: 1px 1px 2px black;">SIPPADU Aduan {{
            selectedType.toUpperCase() }}</div>
        </div>

        <!-- Bottom Overlay -->
        <div class="absolute-bottom q-pa-md z-top"
          style="background: linear-gradient(transparent, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.9)); padding-top: 60px;">
          <q-input v-model="laporanText" outlined bg-color="white" color="primary" placeholder="Tulis keterangan..."
            class="q-mb-md" dense />
          <q-btn unelevated color="primary" class="full-width text-weight-bold" label="KIRIM LAPORAN"
            style="border-radius: 8px; padding: 12px 0;" @click="kirimLaporan" />
        </div>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSippaduStore } from 'stores/sippadu'

const router = useRouter()
const $q = useQuasar()
const sippaduStore = useSippaduStore()

// -- CAMERA & LAPORAN STATE --
const cameraInput = ref(null)
const showLaporDialog = ref(false)
const capturedImage = ref(null)
const capturedFile = ref(null)
const laporanText = ref('')
const selectedType = ref('')

onMounted(() => {
  // Hanya fetch yang benar-benar dibutuhkan jika ada nanti
})

const goPerda = () => {
  selectedType.value = 'perda'
  if (cameraInput.value) {
    cameraInput.value.click()
  }
}

const goPerkada = () => {
  selectedType.value = 'perkada'
  if (cameraInput.value) {
    cameraInput.value.click()
  }
}

const onCameraCapture = (event) => {
  const file = event.target.files[0]
  if (file) {
    capturedFile.value = file
    capturedImage.value = URL.createObjectURL(file)
    laporanText.value = ''
    showLaporDialog.value = true
  }
  event.target.value = ''
}

const closeLaporDialog = () => {
  showLaporDialog.value = false
  setTimeout(() => {
    capturedImage.value = null
    capturedFile.value = null
  }, 300)
}

const kirimLaporan = async () => {
  if (!laporanText.value) {
    $q.notify({
      color: 'negative',
      message: 'Keterangan tidak boleh kosong',
      position: 'top'
    })
    return
  }

  // Ambil lokasi
  $q.loading.show({ message: 'Mengambil lokasi...' })
  
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords
    
    const payload = {
      uraian: laporanText.value,
      objek: selectedType.value === 'perkada' ? 1 : 0, // 0: Perda, 1: Perkada
      lat: latitude,
      lng: longitude,
      status: 'proses',
      file: capturedFile.value ? capturedFile.value.name : ''
    }

    const success = await sippaduStore.addData(payload)
    if (success) {
      closeLaporDialog()
    }
    $q.loading.hide()
  }, (err) => {
    $q.loading.hide()
    $q.notify({
      color: 'negative',
      message: 'Gagal mengambil lokasi. Pastikan GPS aktif.',
      position: 'top'
    })
  }, { enableHighAccuracy: true })
}
const goPerdaInfo = () => router.push('/Perda')
const goPerkadaInfo = () => router.push('/Perkada')
const goRiwayat = () => router.push('/sippadu_riwayat')
</script>

<style scoped>
/* GLOBAL STYLES */
.shadow-soft {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04) !important;
}

.shadow-mini {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02) !important;
}

/* HEADER SECTION */
.header {
  position: relative;
  background: linear-gradient(135deg, #4a7cff 0%, #7aa1ff 100%);
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  color: white;
  padding-bottom: 40px;
}

.header-fade {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 60px;
  background: linear-gradient(to bottom, rgba(250, 250, 250, 0) 0%, #FAFAFA 100%);
}

.content {
  margin-top: -30px;
  position: relative;
  z-index: 2;
}

/* CARDS */
.rounded-card {
  border-radius: 18px;
}

.lapor-card {
  text-align: center;
  padding: 20px 10px;
  border-radius: 16px;
  background: #f0f7ff;
  border: 1px solid #e1ecff;
  transition: all 0.3s ease;
}

.lapor-card:active {
  transform: scale(0.95);
  background: #e1ecff;
}

.history-card {
  background: #ffffff;
  border: 1px dashed #4a7cff !important;
}

/* NEWS SECTION */
.news-card {
  background: white;
  transition: all 0.3s ease;
}

.news-card:active {
  background: #f9f9f9;
}

.news-img {
  height: 90px;
  border-radius: 12px 0 0 12px;
}

.news-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e292b;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
  line-height: 1.3;
}

.news-date {
  font-size: 11px;
}

/* UTILS */
.logo-image-container {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  padding: 6px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-logo {
  height: 28px;
  width: auto;
  object-fit: contain;
}

.banner-main {
  max-width: 260px;
  height: auto;
  object-fit: contain;
}

.hotline-btn {
  background: #f6c34a !important;
  color: #1a1a1a !important;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(246, 195, 74, 0.3);
}
</style>
