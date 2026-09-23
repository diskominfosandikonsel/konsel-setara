<template>
  <q-page class="rup-page">
    <!-- Top Decorative Gradient & Waves -->
    <div class="rup-header-bg">
      <!-- Back Button -->
      <div class="header-action-bar">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          color="blue-grey-9"
          class="back-btn"
          @click="goBack"
        />
      </div>

      <!-- Banner Swiper Carousel -->
      <div class="banner-container">
        <swiper
          :modules="modules"
          :slides-per-view="1"
          :centered-slides="true"
          :space-between="16"
          :loop="true"
          :autoplay="{ delay: 4500, disableOnInteraction: false }"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
          class="rup-swiper"
        >
          <swiper-slide v-for="banner in banners" :key="banner.id">
            <div class="banner-card shadow-1">
              <img :src="banner.src" class="banner-img" :alt="banner.alt" />
            </div>
          </swiper-slide>
        </swiper>

        <!-- Custom Pagination Dots -->
        <div class="dots-wrapper q-mt-sm">
          <div
            v-for="n in banners.length"
            :key="'dot-' + n"
            class="dot-indicator"
            :class="{ active: (currentSlideIndex % banners.length) === (n - 1) }"
            @click="goToSlide(n - 1)"
          ></div>
        </div>
      </div>
    </div>

    <!-- Main Content Container (Rounded White Sheet) -->
    <div class="rup-content-sheet">
      <!-- Section Title & Subtitle -->
      <div class="section-header">
        <h2 class="section-title">Layanan Informasi</h2>
      </div>

      <!-- Card 1: Daftar RUP (Light Blue Card) -->
      <div class="menu-card card-rup q-mb-md" @click="goToDaftarRup">
        <div class="card-icon-col">
          <img src="/img/rup/rup-icon.svg" alt="Daftar RUP" class="service-icon" />
        </div>
        <div class="card-text-col">
          <div class="card-title">Daftar RUP</div>
          <div class="card-desc">
            Lihat dan akses Daftar Rencana Umum Pengadaan (RUP).
          </div>
        </div>
        <div class="card-action-col">
          <div class="action-circle bg-blue">
            <q-icon name="arrow_forward" size="18px" color="white" />
          </div>
        </div>
      </div>

      <!-- Card 2: Konsultasi Masyarakat (Light Green Card) -->
      <div class="menu-card card-konsultasi" @click="goToKonsultasi">
        <div class="card-icon-col">
          <img src="/img/rup/consultation-icon.svg" alt="Konsultasi Masyarakat" class="service-icon" />
        </div>
        <div class="card-text-col">
          <div class="card-title">Konsultasi Masyarakat</div>
          <div class="card-desc">
            Sampaikan pertanyaan, saran dan masukan terkait pengadaan.
          </div>
        </div>
        <div class="card-action-col">
          <div class="action-circle bg-green">
            <q-icon name="arrow_forward" size="18px" color="white" />
          </div>
        </div>
      </div>

      <!-- Quick Info / Statistik Singkat RUP -->
      <div class="q-mt-xl stats-box q-pa-md">
        <div class="row items-center justify-between">
          <div class="col-7">
            <div class="text-caption text-weight-bold text-grey-8">Transparansi Pengadaan</div>
            <div class="text-caption text-grey-6" style="font-size: 11px;">
              Terintegrasi dengan SiRUP LKPP & Pemkab Konawe Selatan
            </div>
          </div>
          <div class="col-5 text-right">
            <q-badge color="blue-1" text-color="blue-9" class="q-py-xs q-px-sm text-weight-bold">
              T.A. 2026 Aktif
            </q-badge>
          </div>
        </div>
      </div>
    </div>

    <!-- SKM Survey Float / Integration -->
    <Skm nama-aplikasi="RUP" />
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'
import Skm from 'src/components/Skm.vue'

export default {
  name: 'RupIndexPage',
  components: {
    Swiper,
    SwiperSlide,
    Skm
  },
  setup() {
    const router = useRouter()
    const swiperRef = ref(null)
    const currentSlideIndex = ref(0)

    const banners = ref([
      { id: 1, src: '/img/rup/banner-rup-1.jpg?v=4', alt: 'RUP UKPBJ Kabupaten Konawe Selatan' },
      { id: 2, src: '/img/rup/banner-rup-2.jpg?v=4', alt: 'Konsultasi & Partisipasi Publik Pengadaan' },
    ])

    const onSwiper = (swiper) => {
      swiperRef.value = swiper
    }

    const onSlideChange = (swiper) => {
      currentSlideIndex.value = swiper.realIndex
    }

    const goToSlide = (index) => {
      if (swiperRef.value) {
        swiperRef.value.slideToLoop(index)
      }
    }

    const goBack = () => {
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push('/')
      }
    }

    const goToDaftarRup = () => {
      router.push('/rup/daftar')
    }

    const goToKonsultasi = () => {
      router.push('/rup/konsultasi')
    }

    return {
      modules: [Autoplay],
      banners,
      currentSlideIndex,
      onSwiper,
      onSlideChange,
      goToSlide,
      goBack,
      goToDaftarRup,
      goToKonsultasi
    }
  }
}
</script>

<style scoped lang="scss">
.rup-page {
  min-height: 100vh;
  background-color: #f7faff;
  position: relative;
  padding-bottom: 80px; /* space for bottom nav */
}

/* Header Background with Soft Gradient Waves */
.rup-header-bg {
  background: linear-gradient(180deg, #cde6ff 0%, #e2f0ff 60%, #f7faff 100%);
  padding: 12px 16px 24px;
  position: relative;
}

.header-action-bar {
  display: flex;
  align-items: center;
  min-height: 44px;
  margin-bottom: 8px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: #ffffff;
    transform: scale(1.05);
  }
}

/* Swiper Banner */
.banner-container {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}

.rup-swiper {
  width: 100%;
  border-radius: 18px;
}

.banner-card {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  background: #f0f7ff;
  aspect-ratio: 1256 / 570;
  box-shadow: 0 4px 18px rgba(15, 60, 130, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Custom Dots Indicator */
.dots-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 16px;
}

.dot-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c3d7ea;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &.active {
    width: 22px;
    height: 8px;
    border-radius: 6px;
    background: #0288d1; /* Cyan / Teal blue */
  }
}

/* Main Content Sheet */
.rup-content-sheet {
  background: #ffffff;
  border-radius: 28px 28px 0 0;
  padding: 16px 20px 32px;
  margin-top: 10px;
  box-shadow: 0 -4px 20px rgba(0, 70, 150, 0.04);
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.section-header {
  margin-bottom: 10px;
}

.section-title {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.3px;
}

.section-subtitle {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.45;
}

/* Menu Cards */
.menu-card {
  display: flex;
  align-items: center;
  padding: 16px 18px;
  border-radius: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;

  &:active {
    transform: scale(0.98);
  }
}

/* Card 1: Blue Palette */
.card-rup {
  background: #eaf4fd;
  border: 1px solid #d7ebfc;

  &:hover {
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
  }
}

/* Card 2: Green Palette */
.card-konsultasi {
  background: #ecf8f1;
  border: 1px solid #d2f4e3;

  &:hover {
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.12);
  }
}

.card-icon-col {
  flex-shrink: 0;
  width: 58px;
  height: 58px;
  margin-right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-text-col {
  flex: 1;
  min-width: 0;
  padding-right: 10px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 3px;
}

.card-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

.card-action-col {
  flex-shrink: 0;
}

.action-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &.bg-blue {
    background: #0066eb;
    box-shadow: 0 4px 10px rgba(0, 102, 235, 0.35);
  }

  &.bg-green {
    background: #00a86b;
    box-shadow: 0 4px 10px rgba(0, 168, 107, 0.35);
  }

  .menu-card:hover & {
    transform: translateX(2px);
  }
}

/* Transparansi Info Box */
.stats-box {
  background: #f8fafc;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
}
</style>
