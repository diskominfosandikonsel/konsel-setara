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
        <!-- Filter Tahun Horizontal Pills -->
        <div class="filter-section q-mb-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-weight-bold text-slate-800 text-subtitle2">Tahun Anggaran</div>
            <div class="text-caption text-slate-500 font-medium" v-if="selectedYear !== 'all'">
              Periode {{ selectedYear }}
            </div>
            <div class="text-caption text-slate-400" v-else>
              Semua Periode
            </div>
          </div>

          <div class="row q-gutter-x-sm scroll-x no-wrap q-py-xs">
            <button
              type="button"
              :class="['filter-pill', selectedYear === 'all' ? 'filter-pill-active' : 'filter-pill-inactive']"
              @click="setYear('all')"
            >
              Semua Tahun
            </button>
            <button
              v-for="yr in availableYears"
              :key="yr"
              type="button"
              :class="['filter-pill', selectedYear === yr.toString() ? 'filter-pill-active' : 'filter-pill-inactive']"
              @click="setYear(yr.toString())"
            >
              {{ yr }}
            </button>
          </div>
        </div>

        <!-- Summary Banner Card -->
        <div class="summary-card q-pa-md rounded-borders q-mb-lg">
          <div class="row items-center justify-between">
            <div>
              <div class="text-caption text-slate-300 text-weight-medium">Total Realisasi Anggaran</div>
              <div class="text-h6 text-weight-bolder text-white q-mt-xs font-mono tracking-tight">
                {{ formatRupiah(summary.total_realisasi) }}
              </div>
            </div>
            <div class="summary-badge text-center">
              <div class="text-h6 text-weight-bolder text-white">{{ summary.total_program }}</div>
              <div class="text-[10px] text-slate-300">Program</div>
            </div>
          </div>
        </div>

        <!-- Alert / Note untuk Tahun Berjalan -->
        <div v-if="selectedYear === currentYear.toString() || selectedYear === '2026'" class="provisional-alert q-pa-sm q-mb-md">
          <div class="row items-center q-gutter-x-xs text-caption text-weight-bold text-amber-800">
            <q-icon name="info" size="15px" />
            <span>Data Tahun Berjalan ({{ currentYear }})</span>
          </div>
          <div class="text-[11px] text-slate-600 q-mt-xs leading-normal">
            Angka realisasi anggaran dan capaian fisik masih terus diperbarui secara berkala.
          </div>
        </div>

        <!-- List Program Prioritas -->
        <div class="program-section">
          <div class="row justify-between items-center q-mb-md">
            <span class="text-subtitle2 text-weight-bold text-slate-800">Daftar Program Terpantau</span>
            <span class="text-caption text-slate-500 font-medium">{{ programList.length }} Program</span>
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
            <q-avatar size="64px" color="slate-100" text-color="slate-500" class="q-mb-md">
              <q-icon name="folder_open" size="32px" />
            </q-avatar>
            <div class="text-weight-bold text-slate-800 text-subtitle2">Belum Ada Program</div>
            <div class="text-caption text-slate-500 max-w-xs q-mt-xs">
              Belum ada data realisasi program prioritas untuk tahun yang dipilih.
            </div>
          </div>

          <!-- Program Cards -->
          <div v-else class="q-gutter-y-md q-pb-xl">
            <q-card
              v-for="(item, idx) in programList"
              :key="item.id || idx"
              class="program-card rounded-borders no-shadow border-card"
            >
              <q-card-section class="q-pa-md">
                <!-- Program Header & Year -->
                <div class="row items-start justify-between no-wrap q-mb-sm">
                  <div class="col program-title">
                    {{ item.nama_program }}
                  </div>
                  <div class="row items-center q-gutter-x-xs shrink-0 q-ml-sm">
                    <span class="year-badge">
                      {{ item.tahun }}
                    </span>
                    <span
                      v-if="item.tahun >= currentYear"
                      class="provisional-badge"
                    >
                      Sementara
                    </span>
                  </div>
                </div>

                <q-separator class="q-my-sm bg-slate-100" />

                <!-- Grid Details: Anggaran & Volume -->
                <div class="row q-col-gutter-sm q-mt-xs">
                  <!-- Realisasi Anggaran -->
                  <div class="col-12 col-sm-6">
                    <div class="metric-box q-pa-sm">
                      <div class="row items-center q-gutter-x-xs text-caption text-slate-500 font-medium">
                        <q-icon name="account_balance_wallet" size="14px" class="text-emerald-600" />
                        <span>Realisasi Anggaran</span>
                      </div>
                      <div class="text-subtitle2 metric-value-emerald q-mt-xs font-mono">
                        {{ formatRupiah(item.realisasi_anggaran) }}
                      </div>
                    </div>
                  </div>

                  <!-- Volume & Satuan Dinamis -->
                  <div class="col-12 col-sm-6">
                    <div class="metric-box q-pa-sm">
                      <div class="row items-center q-gutter-x-xs text-caption text-slate-500 font-medium">
                        <q-icon name="layers" size="14px" class="text-sky-600" />
                        <span>Volume / Penyaluran</span>
                      </div>
                      <div class="text-subtitle2 metric-value-sky q-mt-xs">
                        {{ formatNumber(item.volume) }} <span class="metric-unit-sky">{{ item.satuan }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sub Breakdown (Rincian Indikator) -->
                <div v-if="getRincianList(item).length > 0" class="rincian-box q-pa-sm q-mt-sm">
                  <div class="row items-center q-gutter-x-xs text-[11px] text-slate-600 font-semibold q-mb-xs">
                    <q-icon name="subdirectory_arrow_right" size="13px" class="text-purple-600" />
                    <span>Rincian Sub-Capaian:</span>
                  </div>
                  <div class="row q-gutter-xs">
                    <div
                      v-for="(sub, subIdx) in getRincianList(item)"
                      :key="subIdx"
                      class="rincian-chip col-auto"
                    >
                      <span class="text-slate-500">{{ sub.label }}:</span>
                      <strong class="text-purple-700 q-ml-xs font-mono font-bold">{{ formatNumber(sub.nilai) }}</strong>
                      <span class="text-[10px] text-slate-400 q-ml-xs">{{ sub.satuan || item.satuan }}</span>
                    </div>
                  </div>
                </div>

                <!-- Footnote if current year -->
                <div v-if="item.tahun >= currentYear" class="footnote-text q-mt-sm flex items-center gap-1">
                  <q-icon name="update" size="12px" />
                  <span>Data capaian tahun berjalan (berkala)</span>
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

    const getRincianList = (item) => {
      if (!item || !item.rincian) return []
      if (Array.isArray(item.rincian)) return item.rincian
      if (typeof item.rincian === 'string') {
        try {
          const parsed = JSON.parse(item.rincian)
          return Array.isArray(parsed) ? parsed : []
        } catch (e) {
          return []
        }
      }
      return []
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
      getRincianList,
      setYear,
      fetchData,
      onRefresh,
    }
  },
}
</script>

<style scoped>
/* Page & Canvas */
.realisasi-bg {
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Header Banner */
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

/* Main Container Card */
.main-content {
  padding: 18px 16px;
  margin-top: -22px;
  border-radius: 22px 22px 0 0;
  background: #f8fafc;
  position: relative;
  z-index: 10;
  box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.04);
}

.scroll-x {
  overflow-x: auto;
  scrollbar-width: none;
}
.scroll-x::-webkit-scrollbar {
  display: none;
}

/* Modern Filter Pills */
.filter-pill {
  border: none;
  outline: none;
  font-size: 12.5px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.filter-pill-active {
  background-color: #0f172a;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);
}

.filter-pill-inactive {
  background-color: #ffffff;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.filter-pill-inactive:active {
  background-color: #f1f5f9;
}

/* Summary Card */
.summary-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.12);
}

.summary-badge {
  background: rgba(255, 255, 255, 0.08);
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* Alert Box */
.provisional-alert {
  background-color: #fefce8;
  border: 1px solid #fef08a;
  border-radius: 10px;
}

/* Program Card */
.border-card {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.program-title {
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.35;
  color: #1d4ed8; /* Vibrant Royal Blue */
}

/* Metric Values with Focused Colors */
.metric-value-emerald {
  color: #059669; /* Emerald Green for Budget */
  font-weight: 800;
  font-size: 14.5px;
}

.metric-value-sky {
  color: #0284c7; /* Sky Blue for Volume */
  font-weight: 800;
  font-size: 14.5px;
}

.metric-unit-sky {
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
}

/* Year & Status Badges */
.year-badge {
  font-size: 11px;
  font-weight: 700;
  color: #334155;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 2px 8px;
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.provisional-badge {
  font-size: 10.5px;
  font-weight: 600;
  color: #b45309;
  background-color: #fef3c7;
  border: 1px solid #fde68a;
  padding: 2px 6px;
  border-radius: 6px;
}

/* Unified Neutral Metric Box */
.metric-box {
  background-color: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
}

/* Sub Rincian */
.rincian-box {
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
}

.rincian-chip {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
}

.footnote-text {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

/* Custom Tailwind-like Text Helpers */
.text-slate-900 { color: #0f172a; }
.text-slate-800 { color: #1e293b; }
.text-slate-700 { color: #334155; }
.text-slate-600 { color: #475569; }
.text-slate-500 { color: #64748b; }
.text-slate-400 { color: #94a3b8; }
.text-slate-300 { color: #cbd5e1; }
.bg-slate-100 { background-color: #f1f5f9; }
</style>

