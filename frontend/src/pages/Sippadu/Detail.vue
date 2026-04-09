<template>
  <q-page class="detail-bg pb-xl">

    <!-- ═══════════════════════════════════════════ -->
    <!-- TEAM STANDARD HEADER                        -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header shadow-sm">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="text-h6 text-weight-regular q-ml-sm text-uppercase text-dark header-text">DETAIL LAPORAN</div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- LOADING STATE                               -->
    <!-- ═══════════════════════════════════════════ -->
    <div v-if="!item.id" class="loading-state flex flex-center column q-py-xl">
      <q-spinner-orbit size="48px" color="primary" />
      <div class="text-grey-6 q-mt-md text-body2">Sinkronisasi data...</div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- MAIN CONTENT                                -->
    <!-- ═══════════════════════════════════════════ -->
    <transition appear enter-active-class="animated fadeInUp">
      <div v-if="item.id" class="content-area">

        <!-- STATUS HERO CARD — Premium Glassmorphism Effect -->
        <div class="status-hero-card shadow-premium" :class="`card-${statusColor}`">
          <div class="hero-pattern"></div>
          
          <div class="col items-center text-center">
            <div class="status-icon-glow" :class="`glow-${statusColor}`">
              <q-icon :name="statusIcon" size="40px" />
            </div>
            
            <div class="text-overline q-mt-md text-white-70">{{ itemJenis.toUpperCase() }}</div>
            <div class="text-h4 text-weight-bolder text-white q-mt-xs">{{ statusLabel }}</div>
            <div class="row items-center justify-center q-mt-sm text-white-60">
              <q-icon name="event" size="14px" class="q-mr-xs" />
              <span>Dilaporkan {{ formatDate(item.createAt) }}</span>
            </div>

            <div class="status-badge-premium q-mt-lg">
              <q-icon :name="statusIcon" size="16px" class="q-mr-xs" />
              {{ item.status === 'proses' ? 'Sedang Diproses' : item.status === 'selesai' ? 'Selesai Terverifikasi' : 'Perlu Perbaikan' }}
            </div>
          </div>
        </div>

        <!-- ── INFORMASI PELAPOR ── -->
        <div class="premium-info-card q-mb-md">
          <div class="card-head">
            <q-icon name="person" color="primary" size="20px" />
            <span>Informasi Pelapor</span>
          </div>
          
          <div class="card-body">
            <div class="data-row">
              <span class="label">Nama Lengkap</span>
              <span class="value">{{ item.nama || authStore.user?.nama || 'Anonim' }}</span>
            </div>
            <div class="data-row">
              <span class="label">Nomor WhatsApp</span>
              <span class="value">{{ item.hp || authStore.user?.hp || '-' }}</span>
            </div>
            <div class="data-row">
              <span class="label">Kategori</span>
              <span class="value">
                <q-badge :color="itemJenis === 'Perkada' ? 'deep-purple-6' : 'blue-8'" rounded>
                  {{ itemJenis }}
                </q-badge>
              </span>
            </div>
          </div>
        </div>

        <!-- ── KETERANGAN ── -->
        <div class="premium-info-card q-mb-md">
          <div class="card-head">
            <q-icon name="description" color="primary" size="20px" />
            <span>Keterangan / Uraian</span>
          </div>
          <div class="card-body">
            <div class="uraian-content">
              {{ item.uraian || '-' }}
            </div>
            
            <!-- Tindak Lanjut UI -->
            <div v-if="item.status !== 'proses' && item.keterangan" class="tl-alert q-mt-md">
              <div class="tl-alert-head">Pesan Petugas:</div>
              <div class="tl-alert-body">{{ item.keterangan }}</div>
            </div>
          </div>
        </div>

        <!-- ── LAMPIRAN FOTO ── -->
        <div class="premium-info-card q-mb-md">
          <div class="card-head">
            <q-icon name="image" color="primary" size="20px" />
            <span>Lampiran Foto</span>
          </div>
          <div class="card-body">
            <div class="photo-container" @click="showImageFullscreen = true">
              <q-img :src="getImageUrl(item.file)" class="detail-photo" fit="cover" :ratio="16/9">
                <template #loading><q-spinner-puff color="white" /></template>
              </q-img>
              <div class="photo-hint">
                <q-icon name="fullscreen" /> Tap untuk memperbesar
              </div>
            </div>
          </div>
        </div>

        <!-- ── LOKASI — with Maps Preview placeholder ── -->
        <div class="premium-info-card q-mb-lg" v-if="item.lat || item.lng || item.lokasi">
          <div class="card-head">
            <q-icon name="near_me" color="primary" size="20px" />
            <span>Lokasi Kejadian</span>
          </div>
          <div class="card-body">
            <div class="lokasi-pill q-mb-sm">
                <q-icon name="place" class="q-mr-xs" />
                {{ item.lokasi || `${item.lat}, ${item.lng}` }}
            </div>
            <q-btn 
              unelevated 
              color="blue-7" 
              class="full-width maps-action-btn" 
              no-caps
              @click="openLocation"
            >
              <q-icon name="map" class="q-mr-sm" />
              Buka di Google Maps
              <div class="btn-glow"></div>
            </q-btn>
          </div>
        </div>

      </div>
    </transition>

    <!-- FULLSCREEN DLALOG -->
    <q-dialog v-model="showImageFullscreen" maximized>
      <div class="bg-black flex flex-center relative-position">
        <q-btn icon="close" flat round color="white" class="absolute-top-right q-ma-md z-top" v-close-popup />
        <q-img :src="getImageUrl(item.file)" class="full-width" fit="contain" style="max-height: 90vh" />
      </div>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSippaduStore } from 'stores/sippadu'
import { useAuthStore } from 'stores/auth'

const route = useRoute()
const router = useRouter()
const sippaduStore = useSippaduStore()
const authStore = useAuthStore()

const showImageFullscreen = ref(false)
const reportId = route.params.id

// Data Laporan
const item = computed(() => {
  const source = [...sippaduStore.list_riwayat, ...sippaduStore.list_laporan]
  const found = source.find(r => r.id === reportId) || {}
  if (found.id) console.log('DEBUG SIPPADU ITEM:', found)
  return found
})

onMounted(async () => {
  if (sippaduStore.list_riwayat.length === 0 && sippaduStore.list_laporan.length === 0) {
    await sippaduStore.fetchRiwayat()
    if (!item.value.id) await sippaduStore.getLaporan()
  }
})

// MAPPING UTILS
const itemJenis = computed(() => String(item.value.objek) === '1' ? 'Perkada' : 'Perda')
const statusLabel = computed(() => {
  const map = { proses: 'Sedang Diproses', selesai: 'Selesai', dikembalikan: 'Dikembalikan' }
  return map[item.value.status] || item.value.status || '...'
})
const statusIcon = computed(() => {
  const map = { proses: 'sync', selesai: 'check_circle', dikembalikan: 'warning' }
  return map[item.value.status] || 'info'
})
const statusColor = computed(() => {
  const map = { proses: 'warning', selesai: 'positive', dikembalikan: 'negative' }
  return map[item.value.status] || 'grey'
})
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
const getImageUrl = (file) => {
  if (!file) return 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop'
  return `https://server-sippadu.konaweselatankab.go.id/uploads/${file}`
}
const openLocation = () => {
  const q = (item.value.lat && item.value.lng) ? `${item.value.lat},${item.value.lng}` : encodeURIComponent(item.value.lokasi)
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank')
}
</script>

<style scoped>
.detail-bg { background: #f0f4f9; min-height: 100vh; }

.header-text { letter-spacing: 2px; font-size: 16px; }

.sticky-header { position: sticky; top: 0; z-index: 100; }

.content-area { padding: 16px; }

/* ─── HERO CARD ─── */
.status-hero-card {
  position: relative;
  border-radius: 28px;
  padding: 40px 24px;
  overflow: hidden;
  margin-bottom: 20px;
  transition: all 0.4s ease;
}

.hero-pattern {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0);
  background-size: 24px 24px;
  opacity: 0.5;
}

.card-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.card-positive { background: linear-gradient(135deg, #10b981, #059669); }
.card-negative { background: linear-gradient(135deg, #ef4444, #dc2626); }
.card-grey     { background: linear-gradient(135deg, #6b7280, #4b5563); }

.status-icon-glow {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
  background: rgba(255,255,255,0.2);
  box-shadow: 0 0 30px rgba(255,255,255,0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
    70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(255,255,255,0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
}

.text-white-70 { color: rgba(255,255,255,0.7); }
.text-white-60 { color: rgba(255,255,255,0.6); }

.status-badge-premium {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: white;
  color: #1e293b;
  border-radius: 99px;
  font-weight: 800;
  font-size: 13px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

/* ─── INFO CARDS ─── */
.premium-info-card {
  background: white;
  border-radius: 20px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.02);
}

.card-head {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  color: #1e3a8a;
  border-bottom: 1px solid #f1f5f9;
  letter-spacing: 0.5px;
  font-size: 14px;
}

.card-body { padding: 20px; }

.data-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dotted #e2e8f0;
}

.data-row:last-child { border-bottom: none; }

.data-row .label { color: #94a3b8; font-size: 13px; }
.data-row .value { color: #1e293b; font-weight: 700; font-size: 13px; }

.uraian-content {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  line-height: 1.6;
  color: #475569;
  font-size: 14px;
}

.tl-alert {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 14px;
}

.tl-alert-head { font-weight: 800; color: #92400e; font-size: 12px; margin-bottom: 4px; }
.tl-alert-body { color: #b45309; font-size: 13px; }

.photo-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}

.detail-photo { border-radius: 16px; transition: transform 0.3s ease; }
.photo-container:active .detail-photo { transform: scale(0.98); }

.photo-hint {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.lokasi-pill {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
}

.maps-action-btn {
  border-radius: 14px;
  height: 54px;
  font-weight: 800;
  position: relative;
  overflow: hidden;
}

.btn-glow {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  30% { left: 150%; }
  100% { left: 150%; }
}
</style>
