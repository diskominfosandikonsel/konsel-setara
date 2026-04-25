<template>
  <q-page class="dashboard-pages q-pb-md">
    <!-- HEADER -->
    <div class="row items-center justify-between q-pa-md">
      <div class="text-subtitle2 text-weight-bold" style="color: #23303b">
        Elektronik Riset & Inovasi Daerah
      </div>
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
        :slides-per-view="1.15"
        :centered-slides="true"
        :slides-offset-before="10"
        :slides-offset-after="10"
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
            :class="({ 'no-click': !item.route }, item.route)"
            clickable
            v-ripple
            @click="goPages(item.route)"
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
      <div class="row justify-between q-mb-sm">
        <div class="text-subtitle2 text-weight-bold" style="color: #23303b">
          Layanan
        </div>
        <q-icon
          size="20px"
          style="color: #456efe"
          name="eva-info-outline"
          clickable
          v-ripple
          @click="showAlur = true"
        />
      </div>

      <div class="row q-col-gutter-md">
        <div
          class="col-3"
          v-for="item in services"
          :key="item.label"

        >
          <div class="icon-box" clickable v-ripple @click="goPages(item.route)">
            <q-icon :name="item.icon" style="color: #456efe" size="25px" />
          </div>
          <div clickable v-ripple @click="goPages(item.route)" class="text-caption text-weight-medium text-grey-6 q-mt-xs text-center">
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- KEGIATAN -->
    <!-- ========================= -->
    <div class="q-px-md q-mt-lg">
      <div class="row justify-between items-center">
        <div class="text-subtitle2 text-weight-bold" style="color: #23303b">
          Kegiatan
        </div>
        <div clickable v-ripple @click="goPages('erida-kegiatan')" class="text-caption text-grey-6 cursor-pointer" style="font-size: 10px">
          Lihat Semua >
        </div>
      </div>

      <!-- LOADING -->
      <div v-if="loadingKegiatan" class="row no-wrap q-gutter-sm q-mt-sm">
        <q-skeleton
          v-for="n in 3"
          :key="n"
          type="rect"
          width="125px"
          height="125px"
        />
      </div>

      <div v-else class="scroll-horizontal q-mt-sm">
        <div class="row no-wrap q-gutter-sm">
          <div
            v-for="(img, i) in images"
            :key="i"
            class="image-card"
            @click="openImage(img)"
          >
            <img :src="img.image" class="image-thumb" />
          </div>
        </div>
      </div>

      <!-- MODAL -->
      <q-dialog v-model="showDialog">
        <q-card style="background-color: #3b82f6;">
          <q-card-section class="q-pa-none">
            <img :src="selectedImage" class="full-image" />
            <div class="text-caption text-white text-center q-mb-sm q-px-md py-1" style="font-size: 11px;">
              {{ selectedImageTitle }}
            </div>
          </q-card-section>

          <q-btn
            icon="close"
            flat
            round
            dense
            class="absolute-top-right q-ma-sm bg-white"
            style="color: #3b82f6;"
            @click="showDialog = false"
          />
        </q-card>
      </q-dialog>
    </div>

    <!-- ========================= -->
    <!-- RIDA NEWS -->
    <!-- ========================= -->
    <div class="q-px-md q-mt-lg">
      <div class="row justify-between items-center">
        <div class="text-subtitle2 text-weight-bold" style="color: #23303b">
          Rida News
        </div>
        <div
          class="text-caption text-grey-6 cursor-pointer"
          style="font-size: 10px"
          clickable v-ripple
          @click="goPages('erida-news')"
        >
          Lihat Semua >
        </div>
      </div>

      <!-- LOADING -->
      <div v-if="loadingNews" class="q-mt-sm">
        <div v-for="n in 3" :key="n" class="row q-mb-md">
          <q-skeleton
            type="rect"
            width="100px"
            height="75px"
            class="rounded-borders"
          />
          <div class="q-ml-sm col">
            <q-skeleton type="text" width="80%" />
            <q-skeleton type="text" width="60%" />
          </div>
        </div>
      </div>

      <!-- DATA -->
      <div v-else class="q-mt-sm">
        <div
          v-for="(news, i) in newsList"
          :key="i"
          clickable v-ripple
          class="news-card row items-center q-mb-md cursor-pointer"
          @click="openNews(news.id)"
        >
          <img :src="news.image" class="news-img" />

          <div class="q-ml-sm col">
            <div class="text-caption text-grey-5">
              {{ news.date }}
            </div>
            <div class="text-subtitle2 text-weight-medium line-2">
              {{ news.title }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-dialog
      v-model="showAlur"
      position="bottom"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card
        class="alur-sheet"
        @touchstart="startDrag"
        @touchmove="onDrag"
        @touchend="endDrag"
      >
        <!-- HANDLE -->
        <div class="drag-handle"></div>

        <!-- CLOSE -->
        <q-btn
          icon="close"
          flat
          round
          dense
          clickable
          v-ripple
          class="close-btn"
          @click="showAlur = false"
        />

        <!-- HEADER -->
        <!-- <div class="header-icon">
          <q-icon name="assignment_turned_in" size="30px" />
        </div> -->

        <div class="text-h6 text-center text-weight-medium q-mt-sm">
          ALUR <span class="text-teal-6">IZIN</span> PENELITIAN
        </div>

        <div class="text-caption text-grey-6 text-center q-mt-xs q-px-md">
          Ikuti langkah-langkah berikut untuk mengajukan usulan penelitian
        </div>

        <!-- GRID -->
        <div class="step-grid q-mt-md">
          <div
            v-for="(item, i) in steps"
            :key="i"
            class="step-card"
            :class="'c-' + i"
          >
            <!-- ICON -->
            <div class="icon-circle">
              <q-icon :name="item.icon" size="22px" />
            </div>

            <!-- BADGE -->
            <div class="badge">
              {{ (i + 1).toString().padStart(2, "0") }}
            </div>

            <!-- TITLE -->
            <div class="title">
              {{ item.title }}
            </div>

            <!-- LINE -->
            <div class="line"></div>

            <!-- DESC -->
            <div class="desc">
              {{ item.desc }}
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="row bg-teal-1 q-mt-md q-pa-md py-2 justify-between" style="border-radius: 15px; border: 1px solid #d1f2eb;">
          <div class="col-2">
            <q-img src="icons/check.png" width="50px" />
          </div>
          <div class="col-10 q-pl-sm">
            <div class="text-weight-medium text-teal-10" style="font-size: 14px;">
              Pastikan setiap langkah dilakukan dengan benar.
            </div>
            <div class="text-caption text-grey-7" style="font-size: 11px;">
              Terima kasih atas partisipasi Anda
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import VueApexCharts from "vue3-apexcharts";
import { useEridaStore } from "stores/erida";
import { getFileErida, formatDate } from 'src/utils/helper'

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
        {
          label: "Izin Penelitian",
          icon: "far fa-copy",
          route: "erida-izin",
        },
        {
          label: "Kreatifitas Inovasi",
          icon: "far fa-lightbulb",
          route: "erida-inovasi",
        },
        {
          label: "Tema Penelitian",
          icon: "far fa-folder-open",
          route: "erida-usulan",
        },
        {
          label: "Dokumen Lainnya",
          icon: "far fa-file-alt",
          route: "erida-dokumen",
        },
      ],
      showAlur: false,
      startY: 0,
      currentY: 0,
      isDragging: false,

      steps: [
        {
          title: "Register Akun",
          desc: "Daftarkan akun untuk masuk ke sistem ERIDA.",
          icon: "person_add",
        },
        {
          title: "Input Form Izin",
          desc: "Isi dan upload data penelitian.",
          icon: "description",
        },
        {
          title: "Status Izin Penelitian",
          desc: "Pantau status melalui dashboard.",
          icon: "eva-checkmark-square-outline",
        },
        {
          title: "Mengisi Survey IKM",
          desc: "Isi survey setelah verifikasi.",
          icon: "fas fa-tasks",
        },
        {
          title: "Unduh Surat Rekomendasi",
          desc: "Download surat rekomendasi.",
          icon: "eva-download",
        },
        {
          title: "Unggah Laporan Akhir",
          desc: "Upload laporan hasil penelitian.",
          icon: "eva-upload",
        },
      ],
      loadingKegiatan: true,
      loadingNews: true,

      showDialog: false,
      selectedImage: null,
      selectedImageTitle: '',

      images: [],
      newsList: [],
    };
  },

  async mounted() {
    await this.erida.fetchDashboard();
    await this.getImages()
    await this.getLatestNews()
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

    startDrag(e) {
      this.dragging = true;
      this.startY = e.touches[0].clientY;
    },

    onDrag(e) {
      if (!this.dragging) return;
      this.currentY = e.touches[0].clientY;
      const diff = this.currentY - this.startY;

      if (diff > 0) {
        this.$el.querySelector(".alur-sheet").style.transform =
          `translateY(${diff}px)`;
      }
    },

    endDrag() {
      const diff = this.currentY - this.startY;

      if (diff > 120) {
        this.showAlur = false;
      } else {
        this.$el.querySelector(".alur-sheet").style.transform = `translateY(0)`;
      }

      this.dragging = false;
    },

    async getImages() {
      this.loadingKegiatan = true

      try {
        const res = await this.erida.fetchImage({
          data_ke: 1,
          cari_value: ''
        })

        const data = res.data || []

        this.images = data.slice(0, 5).map(item =>({
          image: getFileErida(item.foto),
          title: item.judul
        }))

      } catch (err) {
        console.error(err)
      } finally {
        this.loadingKegiatan = false
      }
    },

    openImage(img) {
      this.selectedImage = img.image;
      this.selectedImageTitle = img.title;
      this.showDialog = true;
    },

    async getLatestNews() {
      this.loadingNews = true

      try {

        const res = await this.erida.fetchBeritaPage({
          data_ke: 1,
          cari_value: ''
        })

        const data = res.data || []

        this.newsList = data.map(item => ({
          id: item.id,
          title: item.judul,
          date: formatDate(item.createAt),
          image: getFileErida(item.foto),
          author: item.createBy,
          content: item.isi
        }))

      } catch (err) {
        console.error(err)
      } finally {
        this.loadingNews = false
      }
    },

    openNews(id) {
      this.$router.push({
        name: 'detail-berita',
        params: { id }
      })
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
        "#8b5cf6", // purple
        "#ef4444", // red
        "#eab308", // red
        "#06b6d4", // red
        "#ec4899", // red
        "#6366f1", // red
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
  background: linear-gradient(180deg, #e7ecff 0%, #f8fafc 100%);
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
    radial-gradient(
      circle at 20% 30%,
      rgba(59, 130, 246, 0.45),
      transparent 60%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(37, 99, 235, 0.35),
      transparent 60%
    ),
    linear-gradient(
      120deg,
      rgba(59, 130, 246, 0.25),
      transparent,
      rgba(37, 99, 235, 0.25)
    );
}

/* 🟢 KRENOVA */
.erida-krenova::before {
  background:
    radial-gradient(
      circle at 25% 25%,
      rgba(34, 197, 94, 0.45),
      transparent 60%
    ),
    radial-gradient(
      circle at 75% 75%,
      rgba(16, 185, 129, 0.35),
      transparent 60%
    ),
    linear-gradient(
      120deg,
      rgba(34, 197, 94, 0.25),
      transparent,
      rgba(16, 185, 129, 0.25)
    );
}

/* 🟠 AKSI */
.erida-aksi::before {
  background:
    radial-gradient(
      circle at 20% 40%,
      rgba(249, 115, 22, 0.45),
      transparent 60%
    ),
    radial-gradient(
      circle at 80% 60%,
      rgba(251, 146, 60, 0.35),
      transparent 60%
    ),
    linear-gradient(
      120deg,
      rgba(249, 115, 22, 0.25),
      transparent,
      rgba(251, 146, 60, 0.25)
    );
}

/* 🟣 TEKNOLOGI */
.erida-teknologi::before {
  background:
    radial-gradient(
      circle at 30% 30%,
      rgba(139, 92, 246, 0.45),
      transparent 60%
    ),
    radial-gradient(
      circle at 70% 70%,
      rgba(168, 85, 247, 0.35),
      transparent 60%
    ),
    linear-gradient(
      120deg,
      rgba(139, 92, 246, 0.25),
      transparent,
      rgba(168, 85, 247, 0.25)
    );
}

/* 🔴 HAKI */
.erida-haki::before {
  background:
    radial-gradient(
      circle at 25% 35%,
      rgba(239, 68, 68, 0.45),
      transparent 60%
    ),
    radial-gradient(
      circle at 75% 65%,
      rgba(220, 38, 38, 0.35),
      transparent 60%
    ),
    linear-gradient(
      120deg,
      rgba(239, 68, 68, 0.25),
      transparent,
      rgba(220, 38, 38, 0.25)
    );
}

/* 🟡 PENELITIAN */
.erida-penelitian::before {
  background:
    radial-gradient(
      circle at 30% 30%,
      rgba(234, 179, 8, 0.45),
      transparent 60%
    ),
    radial-gradient(
      circle at 70% 70%,
      rgba(250, 204, 21, 0.35),
      transparent 60%
    ),
    linear-gradient(
      120deg,
      rgba(234, 179, 8, 0.25),
      transparent,
      rgba(250, 204, 21, 0.25)
    );
}

/* 🧊 IID */
.erida-iid::before {
  background:
    radial-gradient(
      circle at 25% 25%,
      rgba(6, 182, 212, 0.45),
      transparent 60%
    ),
    radial-gradient(
      circle at 75% 75%,
      rgba(34, 211, 238, 0.35),
      transparent 60%
    ),
    linear-gradient(
      120deg,
      rgba(6, 182, 212, 0.25),
      transparent,
      rgba(34, 211, 238, 0.25)
    );
}

/* 🌸 IPKD */
.erida-ipkd::before {
  background:
    radial-gradient(
      circle at 20% 30%,
      rgba(236, 72, 153, 0.45),
      transparent 60%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(244, 114, 182, 0.35),
      transparent 60%
    ),
    linear-gradient(
      120deg,
      rgba(236, 72, 153, 0.25),
      transparent,
      rgba(244, 114, 182, 0.25)
    );
}

/* 🩶 IDSD */
.erida-idsd::before {
  background:
    radial-gradient(
      circle at 25% 25%,
      rgba(99, 102, 241, 0.45),
      transparent 60%
    ),
    radial-gradient(
      circle at 75% 75%,
      rgba(79, 70, 229, 0.35),
      transparent 60%
    ),
    linear-gradient(
      120deg,
      rgba(99, 102, 241, 0.25),
      transparent,
      rgba(79, 70, 229, 0.25)
    );
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

.alur-sheet {
  border-radius: 28px 28px 0 0;
  padding: 16px;
  background: #f6f8fb;
  max-height: 100vh;
  overflow-y: auto;
  transition: transform 0.25s ease;
}

/* HANDLE */
.drag-handle {
  width: 50px;
  height: 5px;
  background: #ddd;
  border-radius: 10px;
  margin: 0 auto 10px;
}

/* CLOSE */
.close-btn {
  position: absolute;
  right: 10px;
  top: 10px;
}

/* GRID */
.step-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* CARD */
.step-card {
  border-radius: 18px;
  padding: 14px;
  position: relative;
  background: white;
  border: 1px solid #eef2f7;
}

/* ICON */
.icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* BADGE */
.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  border-radius: 50%;
  padding: 5px 6px;
  font-size: 9px;
  font-weight: 600;
}

/* TEXT */
.title {
  margin-top: 10px;
  font-weight: 600;
  font-size: 12px;
}

.desc {
  font-size: 10px;
  color: #6b7280;
}

/* LINE */
.line {
  width: 25px;
  height: 3px;
  border-radius: 5px;
  margin: 6px 0;
}

/* 🎨 WARNA (MENDEKATI GAMBAR) */
.c-0 {
  background: #eefaf8;
  border-color: #d1f2eb;
}
.c-0 .icon-circle {
  background: #14b8a6;
}
.c-0 .badge {
  background: #d1f2eb;
  color: #14b8a6;
}
.c-0 .title {
  color: #14b8a6;
}
.c-0 .line {
  background: #14b8a6;
}

.c-1 {
  background: #eef3ff;
  border-color: #dbe7ff;
}
.c-1 .icon-circle {
  background: #3b82f6;
}
.c-1 .badge {
  background: #dbe7ff;
  color: #3b82f6;
}
.c-1 .title {
  color: #3b82f6;
}
.c-1 .line {
  background: #3b82f6;
}

.c-2 {
  background: #f4efff;
  border-color: #e4d9ff;
}
.c-2 .icon-circle {
  background: #8b5cf6;
}

.c-2 .line {
  background: #8b5cf6;
}
.c-2 .badge {
  background: #e4d9ff;
  color: #8b5cf6;
}
.c-2 .title {
  color: #8b5cf6;
}
.c-3 {
  background: #ecfdf5;
  border-color: #d1fae5;
}
.c-3 .icon-circle {
  background: #22c55e;
}
.c-3 .badge {
  background: #d1fae5;
  color: #22c55e;
}
.c-3 .title {
  color: #22c55e;
}
.c-3 .line {
  background: #22c55e;
}

.c-4 {
  background: #fff7ed;
  border-color: #fde68a;
}
.c-4 .icon-circle {
  background: #f59e0b;
}
.c-4 .badge {
  background: #fde68a;
  color: #f59e0b;
}
.c-4 .title {
  color: #f59e0b;
}
.c-4 .line {
  background: #f59e0b;
}

.c-5 {
  background: #fff1f5;
  border-color: #fecdd3;
}
.c-5 .icon-circle {
  background: #ec4899;
}
.c-5 .badge {
  background: #fecdd3;
  color: #ff60af;
}
.c-5 .title {
  color: #ff60af;
}
.c-5 .line {
  background: #ec4899;
}


/* ✨ ANIMASI */
.animate-card {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  animation: cardIn 0.5s ease forwards;
}

@keyframes cardIn {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-pop {
  animation: pop 0.4s ease;
}

@keyframes pop {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade {
  animation: fade 0.6s ease;
}

@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* IMAGE */
.image-card {
  width: 125px;
  height: 125px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}

.image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* FULL IMAGE */
.full-image {
  width: 100%;
  max-height: 100vh;
  object-fit: contain;
}

/* NEWS */
.news-card {
  border-radius: 12px;
}

.news-img {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: 10px;
}

/* TEXT LIMIT */
.line-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* HIDE SCROLL */
.scroll-horizontal {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;

  /* 🔥 hide scrollbar semua browser */
  scrollbar-width: none;
}

.scroll-horizontal::-webkit-scrollbar {
  display: none;
}
</style>
