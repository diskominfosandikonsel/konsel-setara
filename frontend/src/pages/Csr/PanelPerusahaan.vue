<template>
  <q-page class="panel-bg">

    <!-- HEADER -->
    <div class="panel-header">
      <div class="header-overlay"></div>
      <div class="row items-center q-pa-md relative-position z-top">
        <q-btn flat round icon="arrow_back" color="white" class="glass-btn" @click="$router.back()" />
        <div class="q-ml-sm text-white text-weight-bold" style="font-size: 16px;">Panel Perusahaan</div>
        <q-space />
        <q-btn flat round icon="logout" color="white" class="glass-btn" @click="confirmLogout" />
      </div>
    </div>

    <div class="main-content">

      <!-- PROFIL PERUSAHAAN -->
      <div class="profile-card q-mb-md">
        <div v-if="loading" class="q-pa-md">
          <q-skeleton type="text" width="60%" class="q-mb-sm" />
          <q-skeleton type="text" width="80%" />
          <q-skeleton type="text" width="50%" class="q-mt-sm" />
        </div>

        <div v-else-if="mitra" class="q-pa-md">
          <div class="row items-center q-mb-md">
            <q-avatar size="56px" class="profile-avatar">
              <img v-if="mitra.file_name" :src="getLogoUrl(mitra.file_name)" alt="Logo" />
              <q-icon v-else name="business" size="28px" color="teal" />
            </q-avatar>
            <div class="q-ml-md col">
              <div class="text-weight-bold text-dark" style="font-size: 16px; line-height: 1.3;">
                {{ mitra.perusahaan_nama || mitra.nama || '-' }}
              </div>
              <q-badge color="teal" text-color="white" class="q-mt-xs">
                Mitra CSR Terverifikasi
              </q-badge>
            </div>
          </div>

          <q-separator class="q-mb-sm" />

          <div class="info-grid">
            <div class="info-row">
              <q-icon name="person" size="16px" color="teal" class="q-mr-xs" />
              <span class="info-label">PIC:</span>
              <span class="info-value">{{ mitra.pic_nama || mitra.nama_pic || '-' }}</span>
            </div>
            <div class="info-row">
              <q-icon name="email" size="16px" color="teal" class="q-mr-xs" />
              <span class="info-label">Email:</span>
              <span class="info-value">{{ mitra.perusahaan_email || '-' }}</span>
            </div>
            <div class="info-row">
              <q-icon name="phone" size="16px" color="teal" class="q-mr-xs" />
              <span class="info-label">Telp:</span>
              <span class="info-value">{{ mitra.perusahaan_telp || '-' }}</span>
            </div>
            <div class="info-row">
              <q-icon name="place" size="16px" color="teal" class="q-mr-xs" />
              <span class="info-label">Alamat:</span>
              <span class="info-value">{{ mitra.perusahaan_alamat || '-' }}</span>
            </div>
          </div>
        </div>

        <div v-else class="q-pa-lg text-center text-grey">
          <q-icon name="error_outline" size="32px" class="q-mb-sm" />
          <div>Data perusahaan tidak ditemukan</div>
        </div>
      </div>

      <!-- WIDGET STATUS -->
      <div class="text-weight-bold text-dark q-mb-sm" style="font-size: 15px;">Status Pengajuan</div>
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-6" v-for="w in widgets" :key="w.key">
          <div class="widget-card" :style="{ borderLeft: '4px solid ' + w.color }">
            <div class="widget-icon" :style="{ background: w.color + '20', color: w.color }">
              <q-icon :name="w.icon" size="22px" />
            </div>
            <div class="widget-info">
              <div class="widget-count" :style="{ color: w.color }">{{ widgetStatus[w.key] || 0 }}</div>
              <div class="widget-label">{{ w.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- QUICK ACTIONS -->
      <div class="text-weight-bold text-dark q-mb-sm" style="font-size: 15px;">Aksi Cepat</div>
      <div class="row q-col-gutter-sm q-mb-xl">
        <div class="col-6">
          <q-btn unelevated rounded color="teal" text-color="white" class="full-width q-py-sm"
            icon="volunteer_activism" label="Lihat Program" @click="$router.push('/csr_program')" />
        </div>
        <div class="col-6">
          <q-btn unelevated rounded color="deep-purple" text-color="white" class="full-width q-py-sm"
            icon="assignment" label="Pengajuan Saya" @click="$router.push('/csr_pengajuan')" />
        </div>
      </div>

    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { CsrService } from 'src/services/csr.service'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const loading = ref(true)
const mitra = ref(null)
const widgetStatus = ref({
  total_pengajuan: 0,
  diterima: 0,
  ditolak: 0,
  diproses: 0
})

const widgets = [
  { key: 'total_pengajuan', label: 'Total Pengajuan', icon: 'pending_actions', color: '#1976D2' },
  { key: 'diterima', label: 'Diterima', icon: 'check_circle', color: '#43a047' },
  { key: 'ditolak', label: 'Ditolak', icon: 'cancel', color: '#e53935' },
  { key: 'diproses', label: 'Diproses', icon: 'hourglass_top', color: '#ff9800' }
]

const getUserId = () => {
  return authStore.user?._id || authStore.user?.id || null
}

const getLogoUrl = (fileName) => {
  if (!fileName) return ''
  if (fileName.startsWith('http')) return fileName
  return 'https://server-csr.konaweselatankab.go.id/uploads/logo/' + fileName
}

const fetchProfile = async () => {
  loading.value = true
  try {
    const userId = getUserId()
    if (!userId) return

    const res = await CsrService.getProfilePerusahaan(userId)
    const data = res.data?.data || res.data
    mitra.value = Array.isArray(data) ? data[0] : data
  } catch (err) {
    console.error('Gagal fetch profil perusahaan:', err)
  } finally {
    loading.value = false
  }
}

const fetchWidgetStatus = async () => {
  try {
    const userId = getUserId()
    if (!userId) return

    const res = await CsrService.getStatusPengajuan(userId)
    if (res.data?.data) {
      widgetStatus.value = res.data.data
    }
  } catch (err) {
    console.error('Gagal fetch widget status:', err)
  }
}

const confirmLogout = () => {
  $q.dialog({
    title: 'Keluar',
    message: 'Apakah Anda yakin ingin keluar dari akun perusahaan?',
    cancel: { label: 'Batal', color: 'grey', flat: true },
    ok: { label: 'Keluar', color: 'negative' },
    persistent: true
  }).onOk(async () => {
    await authStore.logout()
    router.push('/csr_dashboard')
  })
}

onMounted(() => {
  fetchProfile()
  fetchWidgetStatus()
})
</script>

<style scoped>
.panel-bg {
  background: #f0fdf4;
  min-height: 100vh;
}

.panel-header {
  position: relative;
  background: linear-gradient(135deg, #065f46 0%, #059669 40%, #10b981 100%);
  padding-bottom: 8px;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.3) 0%, rgba(16, 185, 129, 0.15) 100%);
}

.glass-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
}

.main-content {
  padding: 16px;
}

.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.profile-avatar {
  background: #f0fdf4;
  border: 2px solid #a7f3d0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  font-size: 13px;
  color: #334155;
  line-height: 1.4;
}

.info-label {
  font-weight: 600;
  margin-right: 4px;
  white-space: nowrap;
}

.info-value {
  color: #64748b;
  word-break: break-word;
}

.widget-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 70px;
}

.widget-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.widget-info {
  flex: 1;
}

.widget-count {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.1;
}

.widget-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}
</style>
