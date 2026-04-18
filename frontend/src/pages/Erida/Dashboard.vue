<template>
  <q-page class="bg-grey-2">

    <!-- Header -->
    <div class="row items-center justify-between q-pa-md">
      <div class="row items-center">
        <q-avatar size="42px">
          <img src="https://i.pravatar.cc/100" />
        </q-avatar>
        <div class="q-ml-sm text-weight-bold text-subtitle1">E-RIDA</div>
      </div>
      <q-btn flat round icon="notifications" class="notif-btn" />
    </div>

    <!-- Skeleton -->
    <div v-if="skeletonLoading" class="q-px-md row no-wrap overflow-hidden">
      <div
        v-for="n in 2"
        :key="n"
        class="shimmer-card q-mr-sm"
        style="min-width: 80%; height: 180px; border-radius: 20px;"
      ></div>
    </div>

    <!-- Swiper -->
    <div v-else class="swiper-full">
      <swiper
        :modules="modules"
        :slides-per-view="1.1"
        :centered-slides="true"
        :loop="true"
        :looped-slides="swiperData.length"
        :slides-offset-before="10"
        :slides-offset-after="10"
        :autoplay="{
          delay: 10000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false
        }"
        :speed="800"
        :pagination="{ el: '.custom-pagination', clickable: true }"
        @slideChange="onSlideChange"
      >
        <swiper-slide v-for="(item, index) in swiperData" :key="item.id">
          <div class="erida-card">

            <!-- HEADER -->
            <div class="row justify-between items-center">
              <div class="text-white text-caption">{{ item.title }}</div>
              <div class="chip"></div>
            </div>

            <!-- VALUE -->
            <div class="text-white text-h5 q-mt-sm">
              {{ item.value }}
            </div>

            <!-- MINI CHART -->
            <div class="q-mt-md chart-wrapper">
              <apexchart
                v-if="activeIndex === index"
                :key="'active-' + index"
                :type="item.type"
                height="70"
                :options="getChartOptions(item.type, true)"
                :series="[{ data: item.chart }]"
              />

              <apexchart
                v-else
                :key="'inactive-' + index"
                :type="item.type"
                height="70"
                :options="getChartOptions(item.type, false)"
                :series="[{ data: item.chart }]"
              />
            </div>

            <!-- FOOTER -->
            <div class="row justify-between items-end q-mt-md">
              <div>
                <div class="text-white text-caption">Status</div>
                <div class="text-white text-weight-bold">
                  {{ item.status }}
                </div>
              </div>
              <div class="brand-circle"></div>
            </div>

          </div>
        </swiper-slide>
      </swiper>

      <div class="custom-pagination"></div>
    </div>

    <!-- Quick Actions -->
    <div class="q-px-md q-mt-lg">
      <div class="text-subtitle2 text-weight-bold">Quick Actions</div>
      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-4" v-for="item in quickActions" :key="item.label">
          <q-card flat class="action-card">
            <div class="icon-box">
              <q-icon :name="item.icon" size="24px" />
            </div>
            <div class="text-caption q-mt-sm">{{ item.label }}</div>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="q-px-md q-mt-lg">
      <div class="text-subtitle2 text-weight-bold">Statistik Riset</div>

      <q-card flat class="chart-card q-mt-sm">
        <div class="chart-placeholder">
          <div class="chart-bar" style="height: 40%"></div>
          <div class="chart-bar" style="height: 70%"></div>
          <div class="chart-bar" style="height: 55%"></div>
          <div class="chart-bar" style="height: 90%"></div>
          <div class="chart-bar" style="height: 60%"></div>
        </div>
      </q-card>
    </div>

    <!-- Activity -->
    <div class="q-px-md q-mt-lg">
      <div class="row justify-between items-center">
        <div class="text-subtitle2 text-weight-bold">Aktivitas</div>
        <q-btn flat dense label="Lihat Semua" />
      </div>

      <q-card
        v-for="act in activities"
        :key="act.title"
        class="activity-card q-mt-sm"
        flat
      >
        <q-item>
          <q-item-section avatar>
            <div class="avatar-icon">
              <q-icon :name="act.icon" />
            </div>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ act.title }}</q-item-label>
            <q-item-label caption>{{ act.date }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="text-weight-bold">{{ act.status }}</div>
          </q-item-section>
        </q-item>
      </q-card>
    </div>

  </q-page>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'EridaDashboard',
  components: { Swiper, SwiperSlide, apexchart: VueApexCharts },

  data() {
    return {
      modules: [Autoplay, Pagination],
      skeletonLoading: true,
      activeIndex: 0,

      swiperData: [
        {
          id: 1,
          title: 'Total Riset',
          value: '128 Data',
          status: 'Aktif',
          type: 'area',
          chart: [40, 70, 55, 25, 60, 80, 80, 60, 90, 60]
        },
        {
          id: 2,
          title: 'Total Inovasi',
          value: '54 Program',
          status: 'Kabupaten',
          type: 'bar',
          chart: [20, 50, 80, 60, 40, 50, 80, 60, 40, 30]
        },
        {
          id: 3,
          title: 'Pertumbuhan',
          value: '+12%',
          status: 'Tahun Ini',
          type: 'line',
          chart: [10, 30, 25, 60, 80, 80, 60, 40, 50, 80]
        },
        {
          id: 4,
          title: 'Distribusi',
          value: '5 OPD',
          status: 'Aktif',
          type: 'area',
          chart: [15, 45, 35, 70, 25, 60, 80, 80, 60, 50]
        },
        {
          id: 5,
          title: 'Kinerja',
          value: 'Baik',
          status: 'Evaluasi',
          type: 'bar',
          chart: [60, 40, 75, 25, 60, 80, 80, 60, 55, 90]
        }
      ],

      quickActions: [
        { label: 'Tambah Riset', icon: 'add' },
        { label: 'Ajukan Inovasi', icon: 'lightbulb' },
        { label: 'Laporan', icon: 'description' }
      ],

      activities: [
        {
          title: 'Riset AI Daerah',
          date: '12 April 2026',
          status: 'Diproses',
          icon: 'science'
        },
        {
          title: 'Inovasi Smart Village',
          date: '10 April 2026',
          status: 'Disetujui',
          icon: 'lightbulb'
        }
      ]
    }
  },

  mounted() {
    this.loadInfografis()
  },

  methods: {
    async loadInfografis() {
      setTimeout(() => {
        this.skeletonLoading = false
      }, 500)
    },
    getChartOptions(type, isActive) {
      return {
        chart: {
          sparkline: { enabled: true },
          toolbar: { show: false },
          animations: {
            enabled: isActive,
            easing: 'easeinout',
            speed: 600
          }
        },
        stroke: {
          curve: 'smooth',
          width: type === 'bar' ? 0 : (isActive ? 3 : 2)
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: '50%'
          }
        },
        fill: {
          type: type === 'area' ? 'gradient' : 'solid',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: isActive ? 0.7 : 0.2,
            opacityTo: 0.05
          }
        },
        colors: ['#ffffff'],
        grid: { show: false },
        tooltip: { enabled: false },
        dataLabels: { enabled: false },
        xaxis: {
          labels: { show: false },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: { show: false }
      }
    },
    onSlideChange(swiper) {
      this.activeIndex = swiper.realIndex
    }
  }
}
</script>

<style scoped>

/* SWIPER */
.swiper-full {
  width: 100%;
  overflow: visible;
}

.swiper-full :deep(.swiper-slide) {
  transition: transform 0.3s ease;
}

.swiper-full :deep(.swiper-slide-active) {
  transform: scale(1);
}

.swiper-full :deep(.swiper-slide-next),
.swiper-full :deep(.swiper-slide-prev) {
  transform: scale(0.92);
  opacity: 0.8;
}

.custom-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
}

.custom-pagination :deep(.swiper-pagination-bullet) {
  background: rgba(0,0,0,0.3);
  opacity: 1;
  margin: 0 4px;
}

.custom-pagination :deep(.swiper-pagination-bullet-active) {
  background: #3683FD;
  width: 16px;
  border-radius: 8px;
}

/* CARD */
.erida-card {
  border-radius: 22px;
  padding: 20px;
  height: 180px;
  color: white;
  background: linear-gradient(135deg, #5b7cff, #3b5bdb);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

/* CHIP */
.chip {
  width: 36px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #ffd43b, #fab005);
}

.brand-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
}

/* ACTION */
.action-card {
  padding: 15px;
  text-align: center;
  border-radius: 16px;
  background: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.icon-box {
  background: #eef2ff;
  width: 45px;
  height: 45px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
}

/* CHART */
.chart-card {
  padding: 20px;
  border-radius: 16px;
  background: white;
}

.chart-placeholder {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 120px;
}

.chart-bar {
  width: 18%;
  background: #5b7cff;
  border-radius: 6px;
}

/* ACTIVITY */
.activity-card {
  border-radius: 16px;
  background: white;
}

.avatar-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-wrapper {
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.swiper-slide-active .chart-wrapper {
  opacity: 1;
}

/* NOTIF */
.notif-btn {
  background: white;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

/* SKELETON */
.shimmer-card {
  background: linear-gradient(90deg, #eee, #f5f5f5, #eee);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}

</style>