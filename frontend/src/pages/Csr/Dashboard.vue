<template>
  <q-page class="csr-bg">

    <!-- ═══════════════════════════════════════════ -->
    <!-- PREMIUM HEADER                              -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="csr-header">
      <div class="header-overlay"></div>
      <div class="header-particles">
        <div class="particle p1"></div>
        <div class="particle p2"></div>
        <div class="particle p3"></div>
        <div class="particle p4"></div>
      </div>

      <div class="row items-center justify-between q-pa-md relative-position z-top">
        <q-btn flat round icon="arrow_back" color="white" class="glass-btn" @click="$router.back()" />

        <q-btn unelevated rounded color="teal-7" text-color="white" size="sm" class="hotline-btn"
          @click="authStore.user ? doLogout() : $router.push('/login')">
          <q-icon :name="authStore.user ? 'logout' : 'login'" size="14px" class="q-mr-xs" />
          {{ authStore.user ? 'LOGOUT' : 'LOGIN' }}
        </q-btn>
      </div>

      <div class="column flex-center q-pb-md relative-position z-top">
        <!-- <div class="brand-logo-wrapper">
          <img src="/icons/Csr.png" alt="CSR" class="brand-logo" />
        </div> -->
        <div class="app-title">CSR - SETARA</div>
        <div class="app-subtitle">Corporate Social Responsibility</div>
        <div class="app-sub-badge text-center cursor-pointer" @click="openCSRPortal">Portal CSR - SETARA <br> Kabupaten
          Konawe Selatan</div>
        <div class="header-quote">Tanggung jawab sosial dan lingkungan adalah komitmen perseroan untuk berperan serta
          dalam pembangunan ekonomi berkelanjutan guna meningkatkan kualitas kehidupan dan lingkungan yang bermanfaat,
          baik bagi perseroan sendiri, komunitas setempat, maupun masyarakat pada umumnya.</div>
      </div>
    </div>

    <!-- ════════════════════════════ -->
    <!-- CONTENT SECTION              -->
    <!-- ════════════════════════════ -->
    <div class="main-content">

      <!-- ══════════════════════════════════════════ -->
      <!-- CTA DAFTARKAN PERUSAHAAN (Kecil & Di Atas)  -->
      <!-- ══════════════════════════════════════════ -->
      <div v-if="!isCompany" class="cta-section q-mb-lg">
        <div class="cta-card-small" @click="goRegistrasi">
          <div class="cta-glow"></div>
          <div class="row items-center no-wrap q-gutter-md relative-position z-top">
            <div class="cta-icon-wrap-small">
              <q-icon name="handshake" size="24px" color="white" />
            </div>
            <div class="col">
              <div class="cta-title-small">Daftarkan Perusahaan Anda</div>
              <div class="cta-desc-small">Berkontribusi nyata untuk daerah melalui CSR.</div>
            </div>
            <q-btn flat round color="white" icon="chevron_right" class="cta-arrow-btn" />
          </div>
        </div>
      </div>

      <!-- MENU UTAMA — 2 Kolom Grid -->
      <div class="q-pb-md">
        <div class="text-weight-bold text-dark q-mb-md" style="font-size: 15px; letter-spacing: 0.3px;">Menu Utama</div>

        <div class="row q-col-gutter-md">
          <div v-for="item in menuItems" :key="item.key" class="col-6">
            <div :class="['grid-card', item.cardClass]" @click="item.action">
              <div class="card-badge-top" :style="{ color: item.badgeColor }">
                <q-icon :name="item.badgeIcon" size="12px" />
              </div>
              <div :class="['grid-icon-wrap', item.iconBgClass]">
                <q-icon :name="item.icon" size="24px" color="white" />
              </div>
              <div :class="['grid-label', item.labelColor]">{{ item.label }}</div>
              <div class="grid-hint">{{ item.hint }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- PROGRAM CSR TERBARU -->
      <div class="q-mt-md q-mb-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-weight-bold text-dark" style="font-size: 15px;">Program Terbaru</div>
          <div class="text-caption text-teal cursor-pointer text-weight-bold" @click="goProgram">
            Lihat Semua <q-icon name="chevron_right" />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingProgram" class="program-scroll">
          <div v-for="n in 3" :key="'skel-' + n" class="program-mini-card q-mr-sm">
            <q-skeleton height="100px" class="rounded-borders" />
            <div class="q-pa-xs">
              <q-skeleton type="text" width="80%" />
            </div>
          </div>
        </div>

        <!-- Data -->
        <div v-else class="program-scroll">
          <div v-for="item in latestPrograms" :key="item.id" class="program-mini-card q-mr-sm"
            @click="goDetailProgram(item.id)">
            <q-img :src="getImage(item)" height="100px" class="rounded-borders">
              <div class="absolute-bottom-right q-pa-xs">
                <q-chip :color="getStatusColor(item.status)" text-color="white" size="xs" dense>
                  {{ getStatusLabel(item.status) }}
                </q-chip>
              </div>
            </q-img>
            <div class="program-mini-title">{{ item.nama_csr }}</div>
            <div class="program-mini-bidang" v-if="item.uraian_bidang_csr">{{ item.uraian_bidang_csr }}</div>
          </div>
        </div>
      </div>

      <!-- BERITA CSR TERBARU -->
      <div class="q-mt-lg q-mb-xl">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-weight-bold text-dark" style="font-size: 15px;">Berita CSR</div>
          <div class="text-caption text-teal cursor-pointer text-weight-bold" @click="goBerita">
            Lihat Semua <q-icon name="chevron_right" />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingBerita">
          <div v-for="n in 3" :key="'skel-b-' + n" class="row q-mb-md">
            <div class="col-4"><q-skeleton type="rect" height="80px" class="rounded-borders" /></div>
            <div class="col-8 q-pl-md">
              <q-skeleton type="text" width="80%" />
              <q-skeleton type="text" width="50%" class="q-mt-xs" />
            </div>
          </div>
        </div>

        <!-- Data -->
        <div v-else>
          <div v-for="item in latestBerita" :key="item.id" class="berita-item q-mb-md" @click="goDetailBerita(item.id)">
            <div class="row items-start">
              <div class="col-4">
                <q-img :src="getImageBerita(item)" ratio="1" class="berita-img" />
              </div>
              <div class="col-8 q-pl-md column justify-between" style="min-height: 80px;">
                <div class="berita-item-title">{{ item.judul }}</div>
                <q-chip color="teal-1" text-color="teal-8" size="sm" class="q-ma-none text-weight-bold" square>
                  {{ formatDate(item.createAt) }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { CsrService } from 'src/services/csr.service'

const router = useRouter()
const authStore = useAuthStore()

// Check if logged in as CSR company
const isCompany = computed(() => {
  if (!authStore.user) return false
  const u = authStore.user
  return u.db_csrkonsel == 4 || u.menu_klp == 4 || u.profile?.db_csrkonsel == 4 || u.profile?.menu_klp == 4
})

const doLogout = () => {
  authStore.logout()
}

// Navigation
const goProgram = () => router.push('/csr_program')
const goBerita = () => router.push('/csr_berita')
const goMitra = () => router.push('/csr_mitra')
const goRegistrasi = () => router.push('/csr_registrasi')
const goPanel = () => router.push('/csr_panel')
const goPengajuan = () => router.push('/csr_pengajuan')
const goDetailProgram = (id) => router.push('/csr_detail/' + id)
const goDetailBerita = (id) => router.push('/csr_berita_detail/' + id)

// Dynamic menu items
const menuItems = computed(() => {
  const base = [
    {
      key: 'program', label: 'PROGRAM', hint: 'Program CSR Setara',
      icon: 'volunteer_activism', badgeIcon: 'eco', badgeColor: '#059669',
      cardClass: 'program-card', iconBgClass: 'program-icon-bg', labelColor: 'text-teal-8',
      action: goProgram
    },
    {
      key: 'mitra', label: 'MITRA RESMI', hint: 'Daftar Perusahaan',
      icon: 'handshake', badgeIcon: 'verified', badgeColor: '#ea580c',
      cardClass: 'regis-card', iconBgClass: 'regis-icon-bg', labelColor: 'text-orange-8',
      action: goMitra
    }
  ]

  if (isCompany.value) {
    base.push({
      key: 'panel', label: 'PERUSAHAAN', hint: 'Panel Perusahaan',
      icon: 'business', badgeIcon: 'verified', badgeColor: '#059669',
      cardClass: 'program-card', iconBgClass: 'program-icon-bg', labelColor: 'text-teal-8',
      action: goPanel
    })
    base.push({
      key: 'pengajuan', label: 'PENGAJUAN', hint: 'Pengajuan Saya',
      icon: 'assignment', badgeIcon: 'pending_actions', badgeColor: '#ea580c',
      cardClass: 'regis-card', iconBgClass: 'regis-icon-bg', labelColor: 'text-purple-8',
      action: goPengajuan
    })
  }

  return base
})

const openCSRPortal = () => {
  window.open('https://csr-setara.konaweselatankab.go.id', '_blank')
}

// Data
const loadingProgram = ref(true)
const loadingBerita = ref(true)
const latestPrograms = ref([])
const latestBerita = ref([])

const fetchLatestPrograms = async () => {
  loadingProgram.value = true
  try {
    const res = await CsrService.getHomeCSR()
    latestPrograms.value = res.data?.data || []
  } catch (err) {
    console.error('Gagal fetch program CSR:', err)
  } finally {
    loadingProgram.value = false
  }
}

const fetchLatestBerita = async () => {
  loadingBerita.value = true
  try {
    const res = await CsrService.getHomeBerita()
    latestBerita.value = res.data || []
  } catch (err) {
    console.error('Gagal fetch berita CSR:', err)
  } finally {
    loadingBerita.value = false
  }
}

const getImage = (item) => {
  const url = CsrService.getImageUrl(item.file_name)
  return url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&auto=format'
}

const getImageBerita = (item) => {
  const url = CsrService.getImageUrl(item.file_name)
  return url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&auto=format'
}

const getStatusLabel = (status) => {
  const map = { 1: 'Baru', 2: 'Proses', 3: 'Sebagian', 4: 'Selesai' }
  return map[status] || '-'
}

const getStatusColor = (status) => {
  const map = { 1: 'amber-8', 2: 'blue', 3: 'blue-grey', 4: 'green' }
  return map[status] || 'grey'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

onMounted(() => {
  fetchLatestPrograms()
  fetchLatestBerita()
})
</script>

<style scoped>
.csr-bg {
  background: #f0fdf4;
  min-height: 100vh;
}

/* ─── HEADER ─── */
.csr-header {
  position: relative;
  background: linear-gradient(135deg, #065f46 0%, #059669 40%, #10b981 100%);
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  overflow: hidden;
  padding-bottom: 24px;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.3) 0%, rgba(16, 185, 129, 0.15) 100%);
}

.header-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(167, 243, 208, 0.3);
  animation: float-up 5s infinite;
}

.p1 {
  width: 8px;
  height: 8px;
  left: 15%;
  animation-delay: 0s;
}

.p2 {
  width: 5px;
  height: 5px;
  left: 45%;
  animation-delay: 1.2s;
}

.p3 {
  width: 10px;
  height: 10px;
  left: 70%;
  animation-delay: 2.5s;
}

.p4 {
  width: 6px;
  height: 6px;
  left: 30%;
  animation-delay: 1.8s;
}

@keyframes float-up {
  0% {
    bottom: 0;
    opacity: 0.8;
    transform: translateX(0) scale(1);
  }

  50% {
    opacity: 0.5;
    transform: translateX(10px) scale(1.2);
  }

  100% {
    bottom: 100%;
    opacity: 0;
    transform: translateX(-5px) scale(0.8);
  }
}

.glass-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
}

.hotline-btn {
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.5);
  font-weight: 800;
}

.brand-logo-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: logo-pulse 3s ease-in-out infinite;
  border: 2px solid rgba(255, 255, 255, 0.25);
}

.brand-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border-radius: 14px;
}

@keyframes logo-pulse {

  0%,
  100% {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    transform: scale(1);
  }

  50% {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
    transform: scale(1.03);
  }
}

.app-title {
  font-size: 20px;
  font-weight: 900;
  color: white;
  letter-spacing: 3px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  margin-top: 6px;
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 10px;
  margin-top: 2px;
}

.app-sub-badge {
  margin-top: 4px;
  padding: 3px 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 99px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 10px;
  font-weight: 600;
}

/* ─── CONTENT ─── */
.main-content {
  margin-top: 16px;
  padding: 0 16px 40px;
}

.header-quote {
  margin-top: 8px;
  padding: 0 20px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
  text-align: center;
  font-style: italic;
  max-width: 320px;
}

/* ─── GRID CARDS ─── */
.grid-card {
  background: white;
  border-radius: 16px;
  padding: 14px 12px 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  min-height: 125px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.grid-card:active {
  transform: scale(0.95);
}

.program-card {
  border: 1.5px solid #bbf7d0;
  background: linear-gradient(145deg, #f0fdf4, #fff);
}

.berita-card {
  border: 1.5px solid #bfdbfe;
  background: linear-gradient(145deg, #eff6ff, #fff);
}

.regis-card {
  border: 1.5px solid #ddd6fe;
  background: linear-gradient(145deg, #f5f3ff, #fff);
}

.card-badge-top {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.program-icon-bg {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
}

.berita-icon-bg {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.regis-icon-bg {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 6px 16px rgba(124, 58, 237, 0.3);
}

.grid-label {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.grid-hint {
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.2;
}

/* ─── PROGRAM SCROLL ─── */
.program-scroll {
  display: flex;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.program-scroll::-webkit-scrollbar {
  display: none;
}

.program-mini-card {
  min-width: 160px;
  max-width: 160px;
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.program-mini-card:active {
  transform: scale(0.97);
}

.program-mini-title {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  padding: 6px 8px 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.program-mini-bidang {
  font-size: 10px;
  color: #94a3b8;
  padding: 0 8px 8px;
}

/* ─── BERITA ITEMS ─── */
.berita-item {
  background: white;
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
}

.berita-item:active {
  transform: scale(0.98);
}

.berita-img {
  border-radius: 10px;
}

.berita-item-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ─── CTA DAFTAR PERUSAHAAN (VERSI KECIL) ─── */
.cta-card-small {
  position: relative;
  background: linear-gradient(135deg, #065f46 0%, #059669 100%);
  border-radius: 14px;
  padding: 12px 16px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(5, 150, 105, 0.2);
  transition: transform 0.2s ease;
}

.cta-card-small:active {
  transform: scale(0.98);
}

.cta-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.cta-icon-wrap-small {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cta-title-small {
  font-size: 14px;
  font-weight: 800;
  color: white;
  letter-spacing: 0.3px;
}

.cta-desc-small {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.cta-arrow-btn {
  background: rgba(255, 255, 255, 0.15);
}
</style>
