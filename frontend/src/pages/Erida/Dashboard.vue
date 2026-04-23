<template>
  <q-page class="dashboard-pages">
    <!-- HEADER -->
    <div class="row items-center justify-between q-pa-md">
      <div class="text-subtitle2 text-weight-bold" style="color: #23303B;">Elektronik Riset & Inovasi Daerah</div>
      <q-icon
        name="close"
        color="grey-8"
        size="25px"
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
        :slides-offset-before="20"
        :slides-offset-after="20"
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
            :class="{ 'no-click': !item.route }, item.route"
            clickable
            v-ripple
            @click="goDetail(item)"
          >
            <!-- HEADER -->
            <div class="row justify-between items-center">
              <div class="text-caption text-weight-medium text-grey-8">
                {{ item.title }}
              </div>
              <q-icon
                flat
                round
                name="fas fa-angle-right"
                color="grey-7"
                size="18px"
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
    <div class="q-px-md q-mt-md">
      <div class="text-subtitle2 text-weight-bold" style="color: #23303B;">Layanan</div>

      <div class="row q-col-gutter-md q-mt-xs">
        <div class="col-3" clickable v-ripple v-for="item in services" :key="item.label" @click="goPages(item.route)">
            <div class="icon-box">
              <q-icon :name="item.icon" style="color: #456EFE" size="25px" />
            </div>
            <div class="text-caption text-weight-medium text-grey-6 q-mt-xs text-center">
              {{ item.label }}
            </div>
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

      services: [
        { label: "Izin Penelitian", icon: "far fa-copy", route: "erida-izin" },
        { label: "Kreatifitas Inovasi", icon: "far fa-lightbulb", route: "erida-inovasi" },
        { label: "Tema Penelitian", icon: "far fa-folder-open", route: "erida-usulan" },
        { label: "Dokumen Lainnya", icon: "far fa-file-alt", route: "erida-dokumen" },
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

    goPages(item) {
      console.log("CLICK ITEM:", item);

      if (!item) {
        console.warn("No route for:", item);
        return;
      }

      this.$router.push({ name: item });
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
.dashboard-pages {
  /* background: linear-gradient(180deg, #94adff 0%, #f8fafc 100%); */
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
  background: rgba(255, 255, 255, 0.75);
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
    rgba(59, 130, 246, 0.35),
    transparent,
    rgba(139, 92, 246, 0.35)
  );

  opacity: 0.75;
  pointer-events: none;
}

/* 🔵 RISET */
.erida-riset::before {
  background:
    radial-gradient(circle at 20% 30%, rgba(59,130,246,0.45), transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(37,99,235,0.35), transparent 60%),
    linear-gradient(120deg, rgba(59,130,246,0.25), transparent, rgba(37,99,235,0.25));
}

/* 🟢 KRENOVA */
.erida-krenova::before {
  background:
    radial-gradient(circle at 25% 25%, rgba(34,197,94,0.45), transparent 60%),
    radial-gradient(circle at 75% 75%, rgba(16,185,129,0.35), transparent 60%),
    linear-gradient(120deg, rgba(34,197,94,0.25), transparent, rgba(16,185,129,0.25));
}

/* 🟠 AKSI */
.erida-aksi::before {
  background:
    radial-gradient(circle at 20% 40%, rgba(249,115,22,0.45), transparent 60%),
    radial-gradient(circle at 80% 60%, rgba(251,146,60,0.35), transparent 60%),
    linear-gradient(120deg, rgba(249,115,22,0.25), transparent, rgba(251,146,60,0.25));
}

/* 🟣 TEKNOLOGI */
.erida-teknologi::before {
  background:
    radial-gradient(circle at 30% 30%, rgba(139,92,246,0.45), transparent 60%),
    radial-gradient(circle at 70% 70%, rgba(168,85,247,0.35), transparent 60%),
    linear-gradient(120deg, rgba(139,92,246,0.25), transparent, rgba(168,85,247,0.25));
}

/* 🔴 HAKI */
.erida-haki::before {
  background:
    radial-gradient(circle at 25% 35%, rgba(239,68,68,0.45), transparent 60%),
    radial-gradient(circle at 75% 65%, rgba(220,38,38,0.35), transparent 60%),
    linear-gradient(120deg, rgba(239,68,68,0.25), transparent, rgba(220,38,38,0.25));
}

/* 🟡 PENELITIAN */
.erida-penelitian::before {
  background:
    radial-gradient(circle at 30% 30%, rgba(234,179,8,0.45), transparent 60%),
    radial-gradient(circle at 70% 70%, rgba(250,204,21,0.35), transparent 60%),
    linear-gradient(120deg, rgba(234,179,8,0.25), transparent, rgba(250,204,21,0.25));
}

/* 🧊 IID */
.erida-iid::before {
  background:
    radial-gradient(circle at 25% 25%, rgba(6,182,212,0.45), transparent 60%),
    radial-gradient(circle at 75% 75%, rgba(34,211,238,0.35), transparent 60%),
    linear-gradient(120deg, rgba(6,182,212,0.25), transparent, rgba(34,211,238,0.25));
}

/* 🌸 IPKD */
.erida-ipkd::before {
  background:
    radial-gradient(circle at 20% 30%, rgba(236,72,153,0.45), transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(244,114,182,0.35), transparent 60%),
    linear-gradient(120deg, rgba(236,72,153,0.25), transparent, rgba(244,114,182,0.25));
}

/* 🩶 IDSD */
.erida-idsd::before {
  background:
    radial-gradient(circle at 25% 25%, rgba(99,102,241,0.45), transparent 60%),
    radial-gradient(circle at 75% 75%, rgba(79,70,229,0.35), transparent 60%),
    linear-gradient(120deg, rgba(99,102,241,0.25), transparent, rgba(79,70,229,0.25));
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
  background-color: rgba(164, 169, 174, 0.15);
  width: 100%;
  height: 75px;
  border-radius: 10px;
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
