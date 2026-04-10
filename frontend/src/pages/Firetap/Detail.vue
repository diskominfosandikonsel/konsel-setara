<template>
  <q-page class="detail-bg pb-xl">

    <!-- HEADER -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header shadow-sm">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="text-h6 text-weight-regular q-ml-sm text-uppercase text-dark header-text">DETAIL LAPORAN</div>
    </div>

    <!-- LOADING -->
    <div v-if="!item" class="loading-state flex flex-center column q-py-xl">
      <q-spinner-orbit size="48px" color="deep-orange" />
      <div class="text-grey-6 q-mt-md text-body2">Memuat data...</div>
    </div>

    <!-- MAIN CONTENT -->
    <transition appear enter-active-class="animated fadeInUp">
      <div v-if="item" class="content-area">

        <!-- STATUS HERO CARD -->
        <div class="status-hero-card" :class="`card-${statusColor}`">
          <div class="hero-pattern"></div>
          <div class="hero-inner">
            <div class="status-icon-glow">
              <div style="font-size: 28px;">{{ statusEmoji }}</div>
            </div>
            <div class="q-ml-md">
              <div class="text-caption text-white-70">{{ firetapStore.getKategoriLabel(item.jenis_kasus).toUpperCase() }}</div>
              <div class="text-h6 text-weight-bolder text-white">{{ statusLabel }}</div>
              <div class="row items-center q-mt-xs text-white-60" style="font-size: 11px;">
                <q-icon name="event" size="12px" class="q-mr-xs" />
                <span>{{ formatDate(item.tanggal_kasus) }}</span>
              </div>
            </div>
            <q-space />
          </div>
        </div>

        <!-- ── JUDUL & CATATAN ── -->
        <div class="premium-info-card q-mb-md">
          <div class="card-head">
            <q-icon name="description" color="deep-orange" size="20px" />
            <span>Detail Kasus</span>
          </div>
          <div class="card-body">
            <div class="text-weight-bold text-dark q-mb-xs" style="font-size: 15px;">{{ item.judul_kasus || '-' }}</div>
            <div class="uraian-content">{{ item.catatan_kasus || '-' }}</div>
          </div>
        </div>

        <!-- ── LAMPIRAN FOTO ── -->
        <div class="premium-info-card q-mb-md" v-if="item.foto_kasus">
          <div class="card-head">
            <q-icon name="image" color="deep-orange" size="20px" />
            <span>Lampiran Foto</span>
          </div>
          <div class="card-body">
            <div class="photo-container" @click="showImageFullscreen = true">
              <q-img :src="getImageUrl(item.foto_kasus)" class="detail-photo" fit="cover" :ratio="16/9">
                <template #loading><q-spinner-puff color="white" /></template>
              </q-img>
              <div class="photo-hint">
                <q-icon name="fullscreen" /> Tap untuk memperbesar
              </div>
            </div>
          </div>
        </div>

        <!-- ── LOKASI ── -->
        <div class="premium-info-card q-mb-md" v-if="item.latitude || item.longitude">
          <div class="card-head">
            <q-icon name="near_me" color="deep-orange" size="20px" />
            <span>Lokasi Kejadian</span>
          </div>
          <div class="card-body">
            <div class="lokasi-pill q-mb-sm">
              <q-icon name="place" class="q-mr-xs" />
              {{ item.latitude }}, {{ item.longitude }}
            </div>
            <q-btn unelevated color="deep-orange" class="full-width maps-action-btn" no-caps @click="openLocation">
              <q-icon name="map" class="q-mr-sm" />
              Buka di Google Maps
              <div class="btn-glow"></div>
            </q-btn>
          </div>
        </div>

        <!-- ── PETUGAS ── -->
        <div class="premium-info-card q-mb-lg" v-if="firetapStore.list_pegawai.length > 0">
          <div class="card-head">
            <q-icon name="badge" color="deep-orange" size="20px" />
            <span>Tim Petugas</span>
          </div>
          <div class="card-body">
            <div class="row q-gutter-md">
              <div
                v-for="(p, i) in firetapStore.list_pegawai"
                :key="i"
                class="column items-center"
                style="min-width: 70px"
              >
                <q-avatar size="54px">
                  <img :src="firetapStore.fileUrl + p.foto_pegawai" onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent(p.nama_pegawai) + '&background=ea580c&color=fff'" />
                </q-avatar>
                <div class="text-caption text-center text-grey-8 q-mt-xs" style="font-size: 10px; max-width: 70px;">{{ p.nama_pegawai }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </transition>

    <!-- FULLSCREEN DIALOG -->
    <q-dialog v-model="showImageFullscreen" maximized>
      <div class="bg-black flex flex-center relative-position">
        <q-btn icon="close" flat round color="white" class="absolute-top-right q-ma-md z-top" v-close-popup />
        <q-img :src="getImageUrl(item?.foto_kasus)" class="full-width" fit="contain" style="max-height: 90vh" />
      </div>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFiretapStore } from 'stores/firetap'

const route = useRoute()
const firetapStore = useFiretapStore()

const showImageFullscreen = ref(false)
const reportId = route.params.id

// Ambil dari store
const item = computed(() => firetapStore.detail_kasus)

onMounted(() => {
  firetapStore.fetchDetailKasus(reportId)
})

const statusLabel = computed(() => firetapStore.getStatusLabel(item.value?.status_kasus))
const statusColor = computed(() => firetapStore.getStatusColor(item.value?.status_kasus))

const statusEmoji = computed(() => {
  const map = { 0: '🚨', 1: '🔄', 2: '❌', 3: '✅' }
  return map[item.value?.status_kasus] || '🔥'
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getImageUrl = (file) => {
  if (!file) return 'https://images.unsplash.com/photo-1580894732930-0babd100d356?q=80&w=800&auto=format&fit=crop'
  return firetapStore.fileUrl + file
}

const openLocation = () => {
  if (item.value?.latitude && item.value?.longitude) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${item.value.latitude},${item.value.longitude}`, '_blank')
  }
}
</script>

<style scoped>
.detail-bg {
  background: #fff7f0;
  min-height: 100vh;
}

.header-text {
  letter-spacing: 2px;
  font-size: 16px;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.border-bottom { border-bottom: 1px solid #e5e7eb; }

.loading-state { min-height: 60vh; }

.content-area { padding: 16px; }

/* ─── HERO CARD ─── */
.status-hero-card {
  position: relative;
  border-radius: 20px;
  padding: 18px 20px;
  overflow: hidden;
  margin-bottom: 16px;
}

.hero-pattern {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.1) 1px, transparent 0);
  background-size: 24px 24px;
  opacity: 0.5;
}

.card-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.card-info    { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.card-negative { background: linear-gradient(135deg, #ef4444, #dc2626); }
.card-positive { background: linear-gradient(135deg, #10b981, #059669); }

.status-icon-glow {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.hero-inner {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.text-white-70 { color: rgba(255, 255, 255, 0.75); }
.text-white-60 { color: rgba(255, 255, 255, 0.6); }

/* ─── INFO CARDS ─── */
.premium-info-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.card-head {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  color: #9a3412;
  border-bottom: 1px solid #fff7ed;
  letter-spacing: 0.3px;
  font-size: 13px;
}

.card-body { padding: 20px; }

.uraian-content {
  background: #fff7f0;
  padding: 14px;
  border-radius: 12px;
  line-height: 1.6;
  color: #475569;
  font-size: 14px;
}

/* ─── PHOTO ─── */
.photo-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}

.detail-photo {
  border-radius: 16px;
  transition: transform 0.3s ease;
}

.photo-container:active .detail-photo { transform: scale(0.98); }

.photo-hint {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ─── LOKASI ─── */
.lokasi-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: #fff7ed;
  color: #ea580c;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.maps-action-btn {
  border-radius: 14px;
  height: 52px;
  font-weight: 800;
  position: relative;
  overflow: hidden;
}

.btn-glow {
  position: absolute;
  top: 0; left: -100%;
  width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  30% { left: 150%; }
  100% { left: 150%; }
}

/* ─── ANIMATIONS ─── */
.animated { animation-duration: 0.5s; animation-fill-mode: both; }
@keyframes fadeInUp {
  from { opacity: 0; transform: translate3d(0, 20px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
.fadeInUp { animation-name: fadeInUp; }
</style>
