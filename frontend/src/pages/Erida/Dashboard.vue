<template>
  <q-page class="bg-grey-2">

    <!-- HEADER -->
    <div class="row items-center justify-between q-pa-md">
      <div class="row items-center">
        <q-avatar size="42px">
          <img src="https://i.pravatar.cc/100" />
        </q-avatar>
        <div class="q-ml-sm text-weight-bold text-subtitle1">E-RIDA</div>
      </div>
      <q-btn flat round icon="notifications" class="notif-btn" />
    </div>

    <!-- ========================= -->
    <!-- SKELETON -->
    <!-- ========================= -->
    <div v-if="erida.loading" class="q-px-md row no-wrap overflow-hidden">
      <div
        v-for="n in 2"
        :key="n"
        class="shimmer-card q-mr-sm"
      />
    </div>

    <!-- ========================= -->
    <!-- SWIPER -->
    <!-- ========================= -->
    <div v-else class="swiper-full">
      <swiper
        :modules="modules"
        :slides-per-view="1.1"
        :centered-slides="true"
        :slides-offset-before="15"
        :slides-offset-after="15"
        :loop="true"
        :looped-slides="erida.swiperData.length"
        :autoplay="{
          delay: 10000,
          disableOnInteraction: false
        }"
        :speed="750"
        :pagination="{ el: '.custom-pagination', clickable: true }"
        @slideChange="onSlideChange"
      >
        <swiper-slide
          v-for="(item, index) in erida.swiperData"
          :key="item.id"
        >
          <div class="erida-card" @click="goDetail(item)">

            <!-- HEADER -->
            <div class="row justify-between items-center">
              <div class="text-white text-caption">
                {{ item.title }}
              </div>
              <div class="chip"></div>
            </div>

            <!-- VALUE -->
            <div class="text-white text-h5 q-mt-sm">
              {{ item.value }}
            </div>

            <!-- CHART -->
            <div class="q-mt-md chart-wrapper">
              <apexchart
                :key="activeIndex === index ? 'active' + index : 'idle' + index"
                :type="item.type"
                height="80"
                :options="getChartOptions(item, activeIndex === index)"
                :series="[{ data: item.chart }]"
              />
            </div>

          </div>
        </swiper-slide>
      </swiper>

      <div class="custom-pagination"></div>
    </div>

    <!-- ========================= -->
    <!-- QUICK ACTION -->
    <!-- ========================= -->
    <div class="q-px-md q-mt-lg">
      <div class="text-subtitle2 text-weight-bold">Quick Actions</div>

      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-4" v-for="item in quickActions" :key="item.label">
          <q-card flat class="action-card">
            <div class="icon-box">
              <q-icon :name="item.icon" size="24px" />
            </div>
            <div class="text-caption q-mt-sm">
              {{ item.label }}
            </div>
          </q-card>
        </div>
      </div>
    </div>

  </q-page>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import VueApexCharts from 'vue3-apexcharts'
import { useEridaStore } from 'stores/erida'

export default {
  name: 'EridaDashboard',

  components: {
    Swiper,
    SwiperSlide,
    apexchart: VueApexCharts
  },

  data() {
    return {
      modules: [Autoplay, Pagination],
      erida: useEridaStore(),
      activeIndex: 0,

      quickActions: [
        { label: 'Tambah Riset', icon: 'add' },
        { label: 'Ajukan Inovasi', icon: 'lightbulb' },
        { label: 'Laporan', icon: 'description' }
      ]
    }
  },

  async mounted() {
    await this.erida.fetchDashboard()
  },

  methods: {

    onSlideChange(swiper) {
      this.activeIndex = swiper.realIndex
    },

    goDetail(item) {
      // 🔥 dynamic route
      this.$router.push({
        name: 'erida-detail',
        query: { type: item.status }
      })
    },

    getChartOptions(item, isActive) {
  return {
    chart: {
      sparkline: { enabled: false },
      toolbar: { show: false },
      animations: {
        enabled: isActive,
        speed: 500
      }
    },

    stroke: {
      curve: 'smooth',
      width: item.type === 'bar' ? 0 : 2
    },

    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '60%'
      }
    },

    dataLabels: {
      enabled: true,
      formatter: (val) => val === 0 ? '' : val,
      offsetY: -6,
      style: {
        fontSize: '9px',
        colors: ['#3b5bdb']
      }
    },

    colors: ['#ffffff'],

    xaxis: {
      categories: item.labels,
      labels: {
        show: true,
        rotate: -30, // 🔥 important for mobile
        style: {
          colors: '#ffffff',
          fontSize: '9px'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },

    yaxis: {
      show: false
    },

    grid: {
      show: false
    },

    tooltip: {
      enabled: true,
      theme: 'dark',
      y: {
        formatter: (val) => `${val}`
      }
    },

    fill: {
      type: item.type === 'area' ? 'gradient' : 'solid',
      gradient: {
        opacityFrom: isActive ? 0.6 : 0.2,
        opacityTo: 0.05
      }
    },

    markers: {
      size: item.type === 'line' || item.type === 'area' ? 3 : 0
    }
  }
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

/* PAGINATION */
.custom-pagination {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.custom-pagination :deep(.swiper-pagination-bullet) {
  background: rgba(0,0,0,0.3);
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
  height: 200px;
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

/* SKELETON */
.shimmer-card {
  min-width: 80%;
  height: 200px;
  border-radius: 20px;
  background: linear-gradient(90deg, #eee, #f5f5f5, #eee);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}

.notif-btn {
  background: white;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

</style>