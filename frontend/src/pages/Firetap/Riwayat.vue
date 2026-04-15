<template>
  <q-page class="bg-gray-soft">
    <!-- HEADER -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="text-h6 text-weight-regular q-ml-sm text-uppercase text-dark" style="letter-spacing: 1.5px;">RIWAYAT LAPORAN</div>
    </div>

    <!-- FILTER TABS — Status -->
    <div class="q-px-md q-pt-md">
      <div class="filter-container">
        <q-tabs v-model="activeFilter" dense active-color="deep-orange" indicator-color="deep-orange" align="left" narrow-indicator class="filter-tabs">
          <q-tab name="semua" label="Semua" />
          <q-tab name="0" label="Lapor" />
          <q-tab name="1" label="Proses" />
          <q-tab name="3" label="Selesai" />
          <q-tab name="2" label="Batal" />
        </q-tabs>
      </div>

      <!-- FILTER KATEGORI -->
      <div class="q-mt-sm q-mb-md">
        <q-scroll-area style="height: 44px;">
          <div class="row no-wrap q-gutter-xs">
            <q-chip
              v-for="(kat, i) in ['Semua', ...kategoriList]"
              :key="i"
              :color="activeKategori === (i === 0 ? null : i - 1) ? 'deep-orange' : 'grey-2'"
              :text-color="activeKategori === (i === 0 ? null : i - 1) ? 'white' : 'grey-7'"
              clickable
              dense
              square
              class="text-weight-bold"
              style="font-size: 11px; border-radius: 8px !important;"
              @click="activeKategori = (i === 0 ? null : i - 1); loadRiwayat()"
            >
              {{ kat }}
            </q-chip>
          </div>
        </q-scroll-area>
      </div>
    </div>

    <!-- CONTENT AREA -->
    <div class="content-wrapper q-pa-md">

      <!-- Loading -->
      <div v-if="firetapStore.loading" class="text-center q-py-xl">
        <q-spinner-orbit size="48px" color="deep-orange" />
        <div class="text-grey-6 q-mt-md">Memuat data...</div>
      </div>

      <transition-group v-else appear enter-active-class="animated fadeInUp" leave-active-class="animated fadeOutDown">
        <!-- Empty State -->
        <div v-if="filteredList.length === 0" key="empty" class="empty-state text-center q-mt-xl">
          <div class="glass-icon-wrapper">
            <div style="font-size: 48px;">🧯</div>
          </div>
          <div class="text-h6 text-weight-medium text-grey-8 q-mt-lg">Belum Ada Laporan</div>
          <div class="text-grey-6 q-mt-xs">Laporan kebakaran Anda akan muncul di sini</div>
          <q-btn unelevated color="deep-orange" no-caps rounded class="q-mt-lg" @click="$router.push('/firetap_lapor')">
            <q-icon name="add" class="q-mr-xs" /> Buat Laporan
          </q-btn>
        </div>

        <!-- List Card -->
        <q-card
          v-for="(item, index) in filteredList"
          :key="item.id"
          class="laporan-card q-mb-md cursor-pointer"
          flat
          v-ripple
          @click="goDetail(item.id)"
        >
          <div class="card-status-bar" :class="`bar-${item.status_kasus}`"></div>

          <q-card-section class="q-pa-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center">
                <div class="kategori-dot" :style="{ background: getKatColor(item.jenis_kasus) }"></div>
                <div class="text-overline text-grey-7">{{ firetapStore.getKategoriLabel(item.jenis_kasus) }}</div>
              </div>
              <div class="status-chip" :class="`chip-${item.status_kasus}`">
                <q-icon :name="statusIcon(item.status_kasus)" size="13px" class="q-mr-xs" />
                {{ firetapStore.getStatusLabel(item.status_kasus) }}
              </div>
            </div>

            <div class="laporan-title q-mb-sm">{{ item.judul_kasus || 'Tidak ada judul' }}</div>

            <div class="text-caption text-grey-6 ellipsis-2-lines q-mb-sm">{{ item.catatan_kasus || '-' }}</div>

            <div class="divider"></div>

            <div class="row items-center justify-between q-mt-sm">
              <div class="row items-center text-grey-6 text-caption">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                {{ formatDate(item.tanggal_kasus) }}
              </div>
              <div class="text-deep-orange text-caption text-weight-bold row items-center cursor-pointer">
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
import { useFiretapStore } from 'stores/firetap'

const router = useRouter()
const firetapStore = useFiretapStore()

const activeFilter = ref('semua')
const activeKategori = ref(null)

const kategoriList = ['Kebakaran', 'Penyelamatan', 'Satwa', 'Lingkungan', 'Properti', 'Materil', 'Infrastruktur', 'Perangkat']

const katColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']
const getKatColor = (index) => katColors[parseInt(index)] || '#6b7280'

const filteredList = computed(() => {
  let list = firetapStore.list_kasus || []
  if (activeFilter.value !== 'semua') {
    list = list.filter(i => String(i.status_kasus) === activeFilter.value)
  }
  return list
})

const statusIcon = (status) => {
  const map = { 0: 'flag', 1: 'sync', 2: 'cancel', 3: 'check_circle' }
  return map[status] || 'info'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const loadRiwayat = () => {
  firetapStore.fetchKasus(
    activeFilter.value !== 'semua' ? parseInt(activeFilter.value) : null,
    activeKategori.value
  )
}

const goDetail = (id) => router.push(`/firetap_detail/${id}`)

onMounted(() => loadRiwayat())
</script>

<style scoped>
.bg-gray-soft {
  background-color: #f4f7fc;
  min-height: 100vh;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.border-bottom { border-bottom: 1px solid #e5e7eb; }

.filter-container {
  background: white;
  border-radius: 16px;
  padding: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.filter-tabs { border-radius: 12px; }

/* ─── CARD ─── */
.laporan-card {
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 8px 20px rgba(149, 157, 165, 0.1);
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.laporan-card:active { transform: scale(0.98); }

.card-status-bar {
  height: 4px;
  width: 100%;
}

.bar-0 { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.bar-1 { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
.bar-2 { background: linear-gradient(90deg, #ef4444, #f87171); }
.bar-3 { background: linear-gradient(90deg, #10b981, #34d399); }

/* ─── KATEGORI DOT ─── */
.kategori-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

/* ─── STATUS CHIPS ─── */
.status-chip {
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.chip-0 { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
.chip-1 { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; }
.chip-2 { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
.chip-3 { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

/* ─── TYPOGRAPHY ─── */
.laporan-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.divider { height: 1px; background: #f1f5f9; width: 100%; }

/* ─── EMPTY STATE ─── */
.glass-icon-wrapper {
  background: white;
  width: 100px;
  height: 100px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
}

/* ─── ANIMATIONS ─── */
.animated { animation-duration: 0.5s; animation-fill-mode: both; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translate3d(0, 20px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
.fadeInUp { animation-name: fadeInUp; }
</style>
