<template>
  <q-page class="bg-gray-soft">
    <!-- TEAM STANDARD HEADER -->
    <div class="row items-center q-px-sm q-py-md bg-white" style="border-bottom: 1px solid #e5e7eb;">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="text-h6 text-weight-regular q-ml-sm text-uppercase" style="letter-spacing: 1.5px;">RIWAYAT LAPORAN
      </div>
    </div>

    <!-- SEARCH & FILTER AREA -->
    <div class="q-px-md q-pt-md">
      <div class="filter-container">
        <q-tabs v-model="activeFilter" dense active-color="primary" indicator-color="primary" align="left"
          narrow-indicator class="filter-tabs">
          <q-tab name="semua" label="Semua" />
          <q-tab name="proses" label="Proses" />
          <q-tab name="selesai" label="Selesai" />
          <q-tab name="dikembalikan" label="Dikembalikan" />
        </q-tabs>
      </div>
    </div>

    <!-- CONTENT AREA -->
    <div class="content-wrapper q-pa-md">

      <!-- TRANSITION LIST FOR ANIMATION EFFECT -->
      <transition-group appear enter-active-class="animated fadeInUp" leave-active-class="animated fadeOutDown">
        <div v-if="filteredList.length === 0" key="empty" class="empty-state text-center q-mt-xl">
          <div class="glass-icon-wrapper">
            <q-icon name="assignment_late" size="64px" color="primary" />
          </div>
          <div class="text-h6 text-weight-medium text-grey-8 q-mt-lg">Belum Ada Data</div>
          <div class="text-grey-6">Laporan Anda yang masuk akan muncul di sini</div>
        </div>

        <q-card v-for="(item, index) in filteredList" :key="item.id" class="laporan-card-premium q-mb-md cursor-pointer"
          flat v-ripple @click="goDetail(item.id)">
          <div class="card-glass-glow"></div>

          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center">
                <div class="category-dot" :class="itemJenis(item.objek)"></div>
                <div class="text-overline text-grey-7">{{ itemJenis(item.objek).toUpperCase() }}</div>
              </div>
              <div class="status-chip" :class="`chip-${item.status}`">
                <q-icon :name="statusIcon(item.status)" size="14px" class="q-mr-xs" />
                {{ statusLabel(item.status) }}
              </div>
            </div>

            <!-- Uraian pengaduan dipakai sebagai Judul laporan -->
            <div class="laporan-title q-mb-sm">{{ item.uraian }}</div>

            <div class="divider"></div>

            <div class="row items-center justify-between q-mt-sm">
              <div class="row items-center text-grey-6 text-caption">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                {{ formatDate(item.createAt) }}
              </div>
              <div class="text-primary text-caption text-weight-bold row items-center cursor-pointer">
                Lihat Detail <q-icon name="chevron_right" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </transition-group>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSippaduStore } from 'stores/sippadu'

const router = useRouter()
const sippaduStore = useSippaduStore()

// -- REAKTIFITAS (Composition API) --
const activeFilter = ref('semua')

onMounted(() => {
  sippaduStore.fetchRiwayat()
})

// -- LOGIKA --
const filteredList = computed(() => {
  const list = sippaduStore.list_riwayat || []
  if (activeFilter.value === 'semua') return list
  return list.filter(i => i.status === activeFilter.value)
})

const itemJenis = (objek) => {
  // Objek dari backend: 0 = Perda, 1 = Perkada
  return String(objek) === '1' ? 'perkada' : 'perda'
}

const statusLabel = (status) => {
  // Mapping kata dari backend 'proses', 'selesai', 'dikembalikan'
  const map = { proses: 'Sedang Proses', selesai: 'Selesai', dikembalikan: 'Dikembalikan' }
  return map[status] || status
}

const statusIcon = (status) => {
  const map = { proses: 'sync', selesai: 'check_circle', dikembalikan: 'cancel' }
  return map[status] || 'info'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

const goDetail = (id) => {
  // Sementara diarahkan ke halaman detail kosong,
  // ke depannya bisa router.push(`/sippadu_detail/${id}`)
  router.push('/sippadu_detail')
}
</script>

<style scoped>
/* BACKGROUND UTAMA */
.bg-gray-soft {
  background-color: #f4f7fc;
}



/* FILTER TABS */
.filter-container {
  background: white;
  border-radius: 16px;
  padding: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.filter-tabs {
  border-radius: 12px;
}

/* CARD PREMIUM */
.laporan-card-premium {
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.03);
  box-shadow: 0 8px 20px rgba(149, 157, 165, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.laporan-card-premium:active {
  transform: scale(0.98);
}

.card-glass-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

/* KATEGORI DOT */
.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.perda {
  background: #3b82f6;
}

.perkada {
  background: #8b5cf6;
}

/* STATUS CHIPS */
.status-chip {
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.chip-proses {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fef3c7;
}

.chip-selesai {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #dcfce7;
}

.chip-dikembalikan {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fee2e2;
}

/* TYPOGRAPHY */
.laporan-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
}

.divider {
  height: 1px;
  background: #f1f5f9;
  width: 100%;
}

/* EMPTY STATE */
.glass-icon-wrapper {
  background: white;
  width: 120px;
  height: 120px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
}

/* ANIMATIONS */
.animated {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.fadeInUp {
  animation-name: fadeInUp;
}
</style>
