<template>
  <q-page class="detail-page">
    <!-- HEADER -->
    <div class="detail-header">
      <div class="header-inner">
        <q-btn flat round dense icon="arrow_back" color="white" @click="$router.back()" class="q-mr-sm" />
        <div class="col">
          <div class="text-subtitle1 text-weight-bold text-white ellipsis-title">
            {{ namaOpd }}
          </div>
          <div class="text-caption text-blue-2" style="font-size: 11px">
            {{ kodeOpd }}
          </div>
        </div>
      </div>

      <!-- Search Indikator -->
      <div class="q-px-md q-pb-md">
        <q-input v-model="searchIndikator" dense outlined bg-color="white" placeholder="Cari indikator..."
          class="search-ind" color="indigo" debounce="300">
          <template v-slot:prepend>
            <q-icon name="search" color="indigo-4" />
          </template>
          <template v-slot:append>
            <q-icon v-if="searchIndikator" name="close" color="grey-5" class="cursor-pointer"
              @click="searchIndikator = ''" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="q-px-md q-pt-md q-pb-xl">
      <!-- Loading -->
      <template v-if="loadingDetail">
        <div v-for="n in 3" :key="'skel-' + n" class="q-mb-md">
          <q-card class="chart-card">
            <q-card-section>
              <q-skeleton type="text" width="60%" />
              <q-skeleton type="text" width="30%" class="q-mt-xs" />
              <q-skeleton type="rect" height="200px" class="q-mt-md" />
            </q-card-section>
          </q-card>
        </div>
      </template>

      <!-- Indicator Charts -->
      <template v-else>
        <div class="text-body2 text-weight-bold text-grey-7 q-mb-md">
          <q-icon name="insights" color="indigo-5" class="q-mr-xs" />
          Grafik Time Series
          <q-chip dense color="indigo-1" text-color="indigo-8" size="sm" class="q-ml-sm">
            {{ filteredIndicators.length }} indikator
          </q-chip>
        </div>

        <div v-if="filteredIndicators.length === 0" class="text-center q-pa-xl">
          <q-icon name="bar_chart" size="64px" color="grey-3" />
          <div class="text-grey-5 q-mt-md">
            {{ searchIndikator ? 'Tidak ada indikator yang cocok' : 'Tidak ada data indikator' }}
          </div>
        </div>

        <div v-for="(indicator, idx) in filteredIndicators" :key="indicator.kode_indikator" class="q-mb-md"
          :style="{ animationDelay: idx * 60 + 'ms' }">
          <q-card class="chart-card animate-card">
            <q-card-section>
              <!-- Indicator Header -->
              <div class="row items-start no-wrap">
                <div class="col">
                  <div class="text-subtitle2 text-weight-bold text-grey-9" style="line-height: 1.3">
                    {{ indicator.nama_indikator }}
                  </div>
                  <div class="row items-center q-mt-xs q-gutter-x-sm">
                    <q-chip dense size="sm" color="indigo-1" text-color="indigo-8" square class="q-ma-none">
                      {{ indicator.nama_opd }}
                    </q-chip>
                    <span class="text-caption text-grey-5">
                      Satuan: <b class="text-grey-7">{{ indicator.satuan }}</b>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Chart Container -->
              <div :id="'chart-' + indicator.kode_indikator" class="q-mt-md chart-container"></div>

              <!-- Latest Value Highlight -->
              <div class="latest-value-row q-mt-sm" v-if="indicator.values && indicator.values.length > 0">
                <div class="latest-badge">
                  <q-icon name="trending_up" size="14px" class="q-mr-xs" />
                  Terbaru ({{ indicator.years[indicator.years.length - 1] }}):
                  <b>{{ formatValue(indicator.values[indicator.values.length - 1]) }} {{ indicator.satuan }}</b>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script>
import Highcharts from 'highcharts'
import { useDataStore } from 'stores/data'
import { mapState } from 'pinia'

export default {
  name: 'DataDetailOpd',

  data() {
    return {
      kodeOpd: '',
      namaOpd: '',
      searchIndikator: ''
    }
  },

  computed: {
    ...mapState(useDataStore, ['dashboard', 'loadingDetail']),

    opdIndicators() {
      return this.dashboard.filter(d => d.kode_opd === this.kodeOpd)
    },

    filteredIndicators() {
      if (!this.searchIndikator) return this.opdIndicators
      const q = this.searchIndikator.toLowerCase()
      return this.opdIndicators.filter(ind =>
        ind.nama_indikator.toLowerCase().includes(q)
      )
    }
  },

  watch: {
    filteredIndicators() {
      this.$nextTick(() => {
        this.renderCharts()
      })
    }
  },

  methods: {
    getStore() {
      return useDataStore()
    },

    formatValue(val) {
      if (val === null || val === undefined) return '-'
      if (typeof val === 'number') {
        return new Intl.NumberFormat('id-ID', {
          maximumFractionDigits: 2
        }).format(val)
      }
      return val
    },

    async renderCharts() {
      for (const indicator of this.filteredIndicators) {
        // Optimasi: Membagi proses render grafik agar tidak membekukan UI (Main Thread Yielding)
        await new Promise(resolve => setTimeout(resolve, 15))

        const containerId = 'chart-' + indicator.kode_indikator
        const el = document.getElementById(containerId)
        if (!el) continue

        const years = indicator.years || []
        const values = indicator.values || []

        // Determine trend color
        const lastVal = values[values.length - 1] || 0
        const prevVal = values[values.length - 2] || 0
        const trendUp = lastVal >= prevVal

        // Color palette
        const barColors = values.map((val, idx) => {
          if (idx === values.length - 1) {
            return trendUp ? '#4338ca' : '#ef4444'
          }
          return '#a5b4fc'
        })

        Highcharts.chart(containerId, {
          chart: {
            type: 'column',
            height: 220,
            backgroundColor: 'transparent',
            style: { fontFamily: 'inherit' }
          },
          title: { text: null },
          xAxis: {
            categories: years,
            crosshair: true,
            labels: {
              style: {
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '600'
              }
            },
            lineColor: '#e5e7eb',
            tickWidth: 0
          },
          yAxis: {
            title: { text: null },
            gridLineColor: '#f3f4f6',
            labels: {
              style: {
                fontSize: '10px',
                color: '#9ca3af'
              }
            }
          },
          tooltip: {
            headerFormat: '<span style="font-size:12px;font-weight:bold">{point.key}</span><br/>',
            pointFormat: '<b>{point.y}</b> ' + (indicator.satuan || ''),
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#e5e7eb',
            borderRadius: 12,
            shadow: { color: 'rgba(0,0,0,0.08)', offsetX: 0, offsetY: 4, width: 12 }
          },
          plotOptions: {
            column: {
              borderRadius: 6,
              borderWidth: 0,
              colorByPoint: true,
              colors: barColors,
              dataLabels: {
                enabled: true,
                style: {
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#374151',
                  textOutline: 'none'
                },
                formatter() {
                  const val = this.y
                  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
                  if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
                  return val
                }
              },
              animation: {
                duration: 800,
                easing: 'easeOutBounce'
              }
            }
          },
          legend: { enabled: false },
          credits: { enabled: false },
          series: [{
            name: indicator.satuan || 'Nilai',
            data: values.map(v => (typeof v === 'number' ? v : parseFloat(v) || 0))
          }]
        })
      }
    }
  },

  async mounted() {
    this.kodeOpd = this.$route.query.kode || ''
    this.namaOpd = this.$route.query.nama || ''

    const store = this.getStore()

    // If dashboard data is empty, fetch it
    if (store.dashboard.length === 0) {
      await store.fetchDashboard()
    }

    this.$nextTick(() => {
      this.renderCharts()
    })
  }
}
</script>

<style scoped>
.detail-page {
  background: #f4f6fb;
  min-height: 100vh;
}

.detail-header {
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  position: relative;
  overflow: hidden;
}

.detail-header::before {
  content: '';
  position: absolute;
  top: -30px;
  right: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.header-inner {
  display: flex;
  align-items: center;
  padding: 16px 16px 12px;
  position: relative;
  z-index: 1;
}

.ellipsis-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.search-ind :deep(.q-field__control) {
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* CHART CARD */
.chart-card {
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.2s ease;
}

.chart-card:active {
  transform: scale(0.99);
}

.animate-card {
  animation: cardSlide 0.5s ease forwards;
  opacity: 0;
}

@keyframes cardSlide {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chart-container {
  min-height: 220px;
  border-radius: 12px;
  overflow: hidden;
}

/* LATEST VALUE */
.latest-value-row {
  display: flex;
  justify-content: flex-end;
}

.latest-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  color: #4338ca;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

/* TABLET */
@media (min-width: 600px) {
  .chart-container {
    min-height: 280px;
  }
}
</style>
