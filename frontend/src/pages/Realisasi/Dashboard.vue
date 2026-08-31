<template>
  <q-page class="realisasi-bg">
    <!-- Header Banner (Foto Realisasi Setara) -->
    <div class="realisasi-header-banner">
      <img
        src="realisasi_setara.png"
        alt="Program Prioritas Menuju Konsel Setara"
        class="header-banner-image"
      />
      <div class="header-gradient-overlay"></div>
      
      <!-- Top Navigation Bar Overlay -->
      <div class="row items-center justify-between q-pa-md top-nav-bar">
        <q-btn flat round icon="arrow_back" color="white" class="glass-nav-btn" @click="$router.back()" />
        <div class="header-nav-title text-subtitle2 text-weight-bold text-white tracking-wide">
          REALISASI SETARA
        </div>
        <q-btn flat round icon="refresh" color="white" class="glass-nav-btn" @click="fetchData" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <q-pull-to-refresh @refresh="onRefresh">
        <!-- Filter Tahun Horizontal Chips -->
        <div class="filter-section q-mb-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-weight-bold text-grey-9 text-subtitle2">Tahun Anggaran</div>
            <div class="text-caption text-primary text-weight-bold" v-if="selectedYear !== 'all'">
              Tahun {{ selectedYear }}
            </div>
            <div class="text-caption text-grey-6" v-else>
              Semua Periode
            </div>
          </div>

          <div class="row q-gutter-x-sm scroll-x no-wrap q-py-xs">
            <q-chip
              clickable
              :color="selectedYear === 'all' ? 'primary' : 'grey-2'"
              :text-color="selectedYear === 'all' ? 'white' : 'grey-8'"
              class="year-chip text-weight-bold"
              @click="setYear('all')"
            >
              Semua Tahun
            </q-chip>
            <q-chip
              v-for="yr in availableYears"
              :key="yr"
              clickable
              :color="selectedYear === yr.toString() ? 'primary' : 'grey-2'"
              :text-color="selectedYear === yr.toString() ? 'white' : 'grey-8'"
              class="year-chip text-weight-bold"
              @click="setYear(yr.toString())"
            >
              {{ yr }}
            </q-chip>
          </div>
        </div>

        <!-- Summary Banner Card -->
        <div class="summary-card q-pa-md rounded-borders q-mb-lg shadow-2">
          <div class="row items-center justify-between">
            <div>
              <div class="text-caption text-blue-1 text-weight-medium">Total Realisasi Anggaran</div>
              <div class="text-h6 text-weight-bolder text-white q-mt-xs">
                {{ formatRupiah(summary.total_realisasi) }}
              </div>
            </div>
            <div class="summary-badge text-center">
              <div class="text-h6 text-weight-bolder text-amber-3">{{ summary.total_program }}</div>
              <div class="text-[10px] text-blue-1">Program</div>
            </div>
          </div>
        </div>

        <!-- Alert / Note untuk Tahun Berjalan (2026) -->
        <div v-if="selectedYear === currentYear.toString() || selectedYear === '2026'" class="provisional-alert q-pa-sm q-mb-md rounded-borders">
          <div class="row items-center q-gutter-x-xs text-amber-9 text-caption text-weight-bold">
            <q-icon name="info" size="16px" />
            <span>* Data Sementara (Tahun Berjalan {{ currentYear }})</span>
          </div>
          <div class="text-[11px] text-grey-8 q-mt-xs">
            Angka realisasi anggaran dan penyaluran volume fisik masih terus bergerak dan diperbarui secara berkala.
          </div>
        </div>

        <!-- List Program Prioritas -->
        <div class="program-section">
          <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-md flex justify-between items-center">
            <span>Daftar Program Terpantau</span>
            <span class="text-caption text-grey-6">{{ programList.length }} Data</span>
          </div>

          <!-- Loading State Skeleton -->
          <div v-if="loading" class="q-gutter-y-md">
            <q-card v-for="n in 3" :key="'skel-' + n" class="program-card rounded-borders no-shadow border-card">
              <q-card-section>
                <div class="row items-center justify-between q-mb-sm">
                  <q-skeleton type="text" width="60%" height="22px" />
                  <q-skeleton type="QChip" width="60px" />
                </div>
                <q-skeleton type="text" width="80%" />
                <q-skeleton type="text" width="40%" class="q-mt-sm" />
              </q-card-section>
            </q-card>
          </div>

          <!-- Empty State -->
          <div v-else-if="programList.length === 0" class="column flex-center q-py-xl text-center">
            <q-avatar size="72px" color="blue-1" text-color="primary" class="q-mb-md">
              <q-icon name="folder_open" size="36px" />
            </q-avatar>
            <div class="text-weight-bold text-grey-8 text-subtitle1">Belum Ada Program</div>
            <div class="text-caption text-grey-6 max-w-xs q-mt-xs">
              Belum ada data realisasi program prioritas untuk tahun yang dipilih.
            </div>
          </div>

          <!-- Program Cards -->
          <div v-else class="q-gutter-y-md q-pb-xl">
            <q-card
              v-for="(item, idx) in programList"
              :key="item.id || idx"
              class="program-card rounded-borders no-shadow border-card transition-card"
            >
              <q-card-section class="q-pa-md">
                <!-- Program Header & Year -->
                <div class="row items-start justify-between no-wrap q-mb-sm">
                  <div class="col text-weight-bold text-dark text-subtitle2 program-title">
                    {{ item.nama_program }}
                  </div>
                  <div class="row items-center q-gutter-x-xs shrink-0 q-ml-sm">
                    <q-badge color="indigo-1" text-color="indigo-9" class="text-weight-bold q-px-sm py-1 font-mono">
                      {{ item.tahun }}
                    </q-badge>
                    <q-badge
                      v-if="item.tahun >= currentYear"
                      color="amber-1"
                      text-color="amber-9"
                      class="text-weight-bold text-[10px] q-px-xs py-1"
                    >
                      * Sementara
                    </q-badge>
                  </div>
                </div>

                <q-separator class="q-my-sm bg-grey-3" />

                <!-- Grid Details: Anggaran & Volume -->
                <div class="row q-col-gutter-sm q-mt-xs">
                  <!-- Realisasi Anggaran -->
                  <div class="col-12 col-sm-6">
                    <div class="detail-box q-pa-sm rounded-borders bg-emerald-light">
                      <div class="row items-center q-gutter-x-xs text-caption text-emerald-dark text-weight-medium">
                        <q-icon name="account_balance_wallet" size="14px" />
                        <span>Realisasi Anggaran</span>
                      </div>
                      <div class="text-subtitle2 text-weight-bolder text-emerald-dark q-mt-xs font-mono">
                        {{ formatRupiah(item.realisasi_anggaran) }}
                      </div>
                    </div>
                  </div>

                  <!-- Volume & Satuan Dinamis -->
                  <div class="col-12 col-sm-6">
                    <div class="detail-box q-pa-sm rounded-borders bg-amber-light">
                      <div class="row items-center q-gutter-x-xs text-caption text-amber-dark text-weight-medium">
                        <q-icon name="assessment" size="14px" />
                        <span>Volume / Penyaluran</span>
                      </div>
                      <div class="text-subtitle2 text-weight-bolder text-amber-dark q-mt-xs">
                        {{ formatNumber(item.volume) }} <span class="text-caption text-weight-bold">{{ item.satuan }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footnote if current year -->
                <div v-if="item.tahun >= currentYear" class="text-[11px] text-amber-9 text-italic q-mt-sm flex items-center gap-1">
                  <q-icon name="schedule" size="12px" />
                  <span>* Data capaian tahun berjalan (sementara)</span>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-pull-to-refresh>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/api/api'

export default {
  name: 'RealisasiDashboard',
  setup() {
    const currentYear = new Date().getFullYear()
    const loading = ref(false)
    const selectedYear = ref('all')
    const availableYears = ref([2026, 2025, 2024])
    const programList = ref([])
    const summary = ref({
      total_program: 0,
      total_realisasi: 0,
    })

    const formatRupiah = (val) => {
      const num = Number(val) || 0
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(num)
    }

    const formatNumber = (val) => {
      const num = Number(val) || 0
      return new Intl.NumberFormat('id-ID').format(num)
    }

    const fetchYears = async () => {
      try {
        const res = await api.get('/api/v1/realisasi/years')
        if (res.data?.years && res.data.years.length > 0) {
          availableYears.value = res.data.years
        }
      } catch (err) {
        console.warn('Gagal memuat tahun realisasi:', err)
      }
    }

    const fetchData = async () => {
      loading.value = true
      try {
        const payload = {
          data_ke: 1,
          page_limit: 100,
        }
        if (selectedYear.value !== 'all') {
          payload.tahun = Number(selectedYear.value)
        }

        // Fetch List
        const resList = await api.post('/api/v1/realisasi/view', payload)
        programList.value = resList.data?.data || []

        // Fetch Summary
        const summaryParam = selectedYear.value !== 'all' ? `?tahun=${selectedYear.value}` : ''
        const resSum = await api.get(`/api/v1/realisasi/summary${summaryParam}`)
        if (resSum.data) {
          summary.value = resSum.data
        }
      } catch (err) {
        console.error('Gagal mengambil data realisasi:', err)
      } finally {
        loading.value = false
      }
    }

    const setYear = (year) => {
      selectedYear.value = year
      fetchData()
    }

    const onRefresh = async (done) => {
      await fetchYears()
      await fetchData()
      done()
    }

    onMounted(async () => {
      await fetchYears()
      await fetchData()
    })

    return {
      currentYear,
      loading,
      selectedYear,
      availableYears,
      programList,
      summary,
      formatRupiah,
      formatNumber,
      setYear,
      fetchData,
      onRefresh,
    }
  },
}
</script>

<style scoped>
.realisasi-bg {
  background-color: #f8fafc;
  min-height: 100vh;
}

.provisional-alert {
  background-color: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.realisasi-header-banner {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: #0f172a;
}

.header-banner-image {
  width: 100%;
  height: auto;
  min-height: 180px;
  max-height: 280px;
  display: block;
  object-fit: cover;
  object-position: center;
}

.header-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 100%);
  pointer-events: none;
}

.top-nav-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
}

.glass-nav-btn {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-nav-title {
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
  letter-spacing: 0.5px;
}

.main-content {
  padding: 16px;
  margin-top: -22px;
  border-radius: 22px 22px 0 0;
  background: #f8fafc;
  position: relative;
  z-index: 10;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
}

.scroll-x {
  overflow-x: auto;
  scrollbar-width: none;
}
.scroll-x::-webkit-scrollbar {
  display: none;
}

.year-chip {
  transition: all 0.2s ease;
  font-size: 13px;
  padding: 8px 14px;
}

.summary-card {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-badge {
  background: rgba(255, 255, 255, 0.08);
  padding: 6px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.border-card {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 14px;
}

.transition-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.transition-card:active {
  transform: scale(0.99);
}

.program-title {
  font-size: 14.5px;
  line-height: 1.35;
}

.bg-emerald-light {
  background-color: #ecfdf5;
}
.text-emerald-dark {
  color: #065f46;
}

.bg-amber-light {
  background-color: #fffbeb;
}
.text-amber-dark {
  color: #92400e;
}
</style>
