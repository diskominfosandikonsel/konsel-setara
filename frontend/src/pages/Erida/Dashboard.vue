<template>
  <q-page class="dashboard-page">
    <!-- HEADER -->
    <div class="row items-center justify-between q-pa-md">
      <div class="text-weight-semibold">Elektronik Riset & Inovasi Daerah</div>
      <q-icon
        name="eva-close-circle-outline"
        color="grey-9"
        size="30px"
        class="cursor-pointer"
        @click="goBack"
      />
    </div>

    <!-- ========================= -->
    <!-- SKELETON -->
    <!-- ========================= -->
    <div v-if="erida.loading" class="q-px-md row no-wrap overflow-hidden">
      <div v-for="n in 2" :key="n" class="shimmer-card q-mr-sm" />
    </div>

    <!-- ========================= -->
    <!-- SWIPER -->
    <!-- ========================= -->
    <div v-else class="swiper-full">
      <swiper
        :modules="modules"
        :slides-per-view="1.05"
        :centered-slides="true"
        :slides-offset-before="15"
        :slides-offset-after="15"
        :loop="true"
        :looped-slides="erida.swiperData.length || 1"
        :autoplay="{
          delay: 10000,
          disableOnInteraction: false,
        }"
        :speed="750"
        :pagination="{ el: '.custom-pagination', clickable: true }"
        @slideChange="onSlideChange"
      >
        <swiper-slide v-for="(item, index) in erida.swiperData" :key="item.id">
          <div
            class="erida-card"
            :class="{ 'no-click': !item.route }"
            @click="goDetail(item)"
          >
            <!-- HEADER -->
            <div class="row justify-between items-center">
              <div class="text-caption text-grey-7">
                {{ item.title }}
              </div>
              <q-icon
                flat
                round
                icon="close"
                color="grey-9"
                size="17px"
              />
            </div>

            <!-- CHART -->
            <div class="q-mt-xs">
              <apexchart
                :key="activeIndex === index ? 'active' + index : 'idle' + index"
                :type="item.type"
                height="100"
                :options="getChartOptions(item, activeIndex === index, index)"
                :series="[{ name: item.title, data: item.values }]"
                :redrawOnWindowResize="false"
                :animations="{
                  enabled: true,
                  easing: 'easeinout',
                  speed: 600,
                  animateGradually: {
                    enabled: true,
                    delay: 80,
                  },
                  dynamicAnimation: {
                    enabled: true,
                    speed: 500,
                  },
                }"
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
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import VueApexCharts from "vue3-apexcharts";
import { useEridaStore } from "stores/erida";

export default {
  name: "EridaDashboard",

  components: {
    Swiper,
    SwiperSlide,
    apexchart: VueApexCharts,
  },

  data() {
    return {
      modules: [Autoplay, Pagination],
      erida: useEridaStore(),
      activeIndex: 0,

      quickActions: [
        { label: "Tambah Riset", icon: "add" },
        { label: "Ajukan Inovasi", icon: "lightbulb" },
        { label: "Laporan", icon: "description" },
      ],
    };
  },

  async mounted() {
    await this.erida.fetchDashboard();
  },

  methods: {
    goBack() {
      this.$router.back();
    },

    onSlideChange(swiper) {
      const index = swiper.realIndex;

      requestAnimationFrame(() => {
        this.activeIndex = index;
      });
    },

    goDetail(item) {
      console.log("CLICK ITEM:", item);

      if (!item.route) {
        console.warn("No route for:", item);
        return;
      }

      this.$router.push({ name: item.route });
    },

    getColor(index, item) {
      const palette = [
        "#3b82f6", // blue
        "#22c55e", // green
        "#f59e0b", // amber
        "#ef4444", // red
        "#8b5cf6", // purple
      ];

      // fallback by index (loop safely)
      return palette[index % palette.length];
    },

    getChartOptions(item, isActive, index) {
      const color = this.getColor(index, item);
      const isBar = item.type === "bar";

      const options = {
        chart: {
          toolbar: { show: false },
          animations: {
            enabled: isActive,
            speed: 500,
          },
        },

        // ✅ ONLY add stroke for non-bar
        ...(isBar
          ? {}
          : {
              stroke: {
                curve: "smooth",
                width: 2,
                colors: [color],
              },
            }),

        /* removed invalid fill completely */

        // plotOptions: {
        //   bar: {
        //     borderRadius: 4,
        //     columnWidth: '50%'
        //   }
        // },

        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: "35%",

            dataLabels: {
              position: "top",
            },
          },
        },

        colors: [color],

        // dataLabels: {
        //   enabled: true,
        //   offsetY: isBar ? -8 : -6,
        //   style: {
        //     fontSize: '11px',
        //     colors: [color]
        //   }
        // },

        dataLabels: {
          enabled: true,

          // only show when bar OR line
          enabledOnSeries: [0],

          formatter: (val) => val,

          offsetY: isBar ? -12 : -6,

          style: {
            fontSize: "11px",
            colors: [color],
            fontWeight: 600,
          },

          dropShadow: {
            enabled: false,
          },
        },

        xaxis: {
          categories: item.labels,
          tickPlacement: "on",
          labels: {
            show: true,
            // rotate: -45,
            // rotateAlways: true, // 🔥 force rotation
            hideOverlappingLabels: false, // 🔥 important
            trim: false,
            style: {
              colors: "#666",
              fontSize: "10px",
            },
          },
        },

        yaxis: {
          show: false,
        },

        grid: {
          show: false,
        },

        tooltip: {
          theme: "light",
        },

        markers: isBar
          ? { size: 0 }
          : {
              size: 4,
              colors: [color],
            },
      };

      return options;
    },
  },
};
</script>

<style scoped>
.dashboard-page {
  background: linear-gradient(180deg, #bdccff 0%, #f8fafc 100%);
  min-height: 100vh;
}

.chart-wrapper {
  margin-top: 8px;
}

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
  background: rgba(0, 0, 0, 0.3);
  margin: 0 4px;
}

.custom-pagination :deep(.swiper-pagination-bullet-active) {
  background: #3683fd;
  width: 16px;
  border-radius: 8px;
}

/* CARD */
.erida-card {
  position: relative;
  border-radius: 20px;
  padding: 10px;
  height: 150px;

  color: #0f172a;

  /* glass base */
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  /* soft border glow */
  border: 1px solid rgba(255, 255, 255, 0.5);

  /* layered shadow (important for depth) */
  /* box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6); */

  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  transition: all 0.35s ease;
}

.erida-card::before {
  content: "";
  position: absolute;
  inset: 0;

  background: linear-gradient(
    120deg,
    rgba(59, 130, 246, 0.15),
    transparent,
    rgba(139, 92, 246, 0.15)
  );

  opacity: 0.6;
  pointer-events: none;
}

.erida-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.erida-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 20%;
  width: 60%;
  height: 2px;

  background: linear-gradient(
    to right,
    transparent,
    #3b82f6,
    #8b5cf6,
    transparent
  );

  opacity: 0.6;
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
  background: rgba(255, 255, 255, 0.3);
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
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.no-click {
  opacity: 0.7;
  cursor: default;
}
</style>
