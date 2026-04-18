<template>
  <q-page class="dashboard-page">
    <div class="q-pa-md row items-center">
      <div class="col-4 text-white text-left">
        <q-icon name="r_close" size="30px" color="white" class="cursor-pointer" @click="goBack" />
      </div>

      <div class="col-4 text-white text-center flex flex-center">
        <img src="~assets/sapa/logo.svg" class="logo-shadow" width="45" />
      </div>

      <div class="col-4 text-white text-right">
      </div>
    </div>
    <div v-if="skeletonLoading" class="q-px-md row no-wrap overflow-hidden">
      <div v-for="n in 2" :key="n" class="shimmer-card q-mr-sm" style="min-width: 80%;"></div>
    </div>

    <!-- ✅ SWIPER -->
    <div v-else class="swiper-full">
      <swiper
        :modules="modules"
        :slides-per-view="1.1"
        :centered-slides="true"
        :loop="true"
        :looped-slides="images.length"
        :watch-slides-progress="true"
        :slides-offset-before="10"
        :slides-offset-after="10"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ el: '.custom-pagination', clickable: true }"
      >
        <swiper-slide v-for="item in images" :key="item.id">
          <div class="swiper-card">
            <img :src="item.img" class="swiper-img" />
          </div>
        </swiper-slide>
      </swiper>
      <div class="custom-pagination"></div>
    </div>
    <!-- HERO TEXT -->
    <div class="hero-wrapper q-px-md">
      <q-card class="hero-card no-shadow">

        <q-card-section class="text-center">

          <div class="hero-title fade-up">
            Sahabat <span class="highlight">Perempuan & Anak</span><br/>
            Konawe Selatan
          </div>

          <div class="hero-subtitle fade-up delay-1">
            Lindungi, Laporkan, dan Edukasi bersama<br/>
            untuk menciptakan lingkungan yang aman
          </div>

        </q-card-section>

      </q-card>
    </div>
    <div class="row q-col-gutter-md q-px-md q-pb-md text-center">
  <div class="col-6">
    <q-card class="menu-card bg-warning text-white full-width" style="border-radius: 15px; background-color: #FF8D00;" @click="darurat">
      <q-card-section>
        <q-icon name="eva-alert-triangle-outline" size="48px" class="q-mb-sm" />
          <div class="menu-label">Laporan Darurat</div>
      </q-card-section>
    </q-card>
  </div>
  <div class="col-6">
    <q-card class="menu-card text-white full-width" style="border-radius: 15px; background-color: #3683FD; opacity: 0.85;" @click="riwayat">
      <q-card-section>
        <q-icon name="history" size="48px" class="q-mb-sm" />
        <div class="menu-label">Riwayat Laporan</div>
      </q-card-section>
    </q-card>
  </div>
  <div class="col-6">
    <q-card class="menu-card text-white full-width cursor-pointer" style="border-radius: 15px; background-color: #3683FD; opacity: 0.85;" @click="edukasi">
      <q-card-section>
        <q-icon name="eva-file-text-outline" size="48px" class="q-mb-sm" />
        <div class="menu-label">Edukasi PPA</div>
      </q-card-section>
    </q-card>
  </div>
  <div class="col-6">
    <q-card class="menu-card text-white full-width cursor-pointer" style="border-radius: 15px; background-color: #E9F0FF;" @click="satgas">
      <q-card-section>
        <q-icon name="eva-people-outline" size="48px" style="color: #3683FD;" class="q-mb-sm" />
        <div class="menu-label" style="color: #3683FD;">Satgas PPA</div>
      </q-card-section>
    </q-card>
  </div>
</div>

  </q-page>
</template>

<script>
import { useSapaStore } from 'stores/sapa'
import { getImageUrl } from 'src/utils/helper'

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/pagination'

export default {
  name: 'SapaDashboard',
  components: {
    Swiper,
    SwiperSlide
  },
  data () {
    return {
      sapa: useSapaStore(),
      modules: [Autoplay, Pagination],
      skeletonLoading: true,
      images: []
    }
  },
  methods: {
    goBack () {
      this.$router.back()
    },
    async loadInfografis () {
      this.skeletonLoading = true

      await this.sapa.fetchInfografis()

      const data = this.sapa.infografis || []

      if (data.length > 0) {
        this.images = data.map(item => ({
          id: item.id,
          img: getImageUrl(item.foto)
        }))
      }

      this.skeletonLoading = false
    },
    darurat () {
      this.$router.push('/sapa_darurat')
    },
    satgas () {
      this.$router.push('/sapa_satgas')
    },
    riwayat () {
      this.$router.push('/sapa_riwayat')
    },
    edukasi () {
      this.$router.push('/sapa_edukasi')
    }
  },
  mounted () {
    this.loadInfografis()
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(
    to bottom,
    #3683FD 0%,
    #3683FD 20%,
    #78ACFE 40%,
    #e3f2fd 60%,
    #ffffff 80%
  );
}
.logo-shadow {
  filter: drop-shadow(0 0 2.5px #fff)
          drop-shadow(0 0 5px #fff);
}

.swiper-card {
  border-radius: 25px;
  overflow: hidden;
  height: 175px;
  margin: 0; /* 👈 no margin */
}

.swiper-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* full bleed container */
.swiper-full {
  width: 100%;
  overflow: visible; /* 👈 allow peek */
}

/* allow slides to overflow screen */
.swiper-full :deep(.swiper) {
  overflow: hidden;
}

.swiper-full :deep(.swiper-wrapper) {
  align-items: center;
}

/* slide behavior */
.swiper-full :deep(.swiper-slide) {
  transition: transform 0.3s ease;
}

/* center focus effect */
.swiper-full :deep(.swiper-slide-active) {
  transform: scale(1);
  z-index: 2;
}

.swiper-full :deep(.swiper-slide-next),
.swiper-full :deep(.swiper-slide-prev) {
  transform: scale(0.925);
  opacity: 0.8;
}

.custom-pagination {
  margin-top: 4px;
  text-align: center;
}

.custom-pagination :deep(.swiper-pagination-bullet) {
  background: rgba(0,0,0,0.3);
  opacity: 1;
}

.custom-pagination :deep(.swiper-pagination-bullet-active) {
  background: #3683FD;
  width: 16px;
  border-radius: 8px;
}

.title {
  font-size: 18px;
  font-weight: 400;
  color: #000000;
} 

.sub-title {
  font-size: 12px;
  font-weight: 250;
  color: #000000;
} 

.shimmer-card {
  height: 175px;
  border-radius: 25px;
  position: relative;
  overflow: hidden;
  background: #e0e0e0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* shimmer animation */
.shimmer-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  height: 100%;
  width: 150%;

  background: linear-gradient(
    90deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.5) 50%,
    rgba(255,255,255,0) 100%
  );

  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  100% {
    left: 150%;
  }
}

.hero-wrapper {
  margin: 16px 0;
  transform: translateY(-10px);
}

/* HERO CARD */
.hero-card {
  border-radius: 20px;
  padding: 8px 4px;
  background: rgba(255, 255, 255, 0.5);

  /* glass feel */
  backdrop-filter: blur(10px);

  /* premium shadow */
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);

  transition: all 0.3s ease;
}

/* subtle interaction */
.hero-card:active {
  transform: scale(0.98);
}

/* TITLE */
.hero-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: #1F1F1F;
}

.hero-card::before {
  content: '';
  display: block;
  height: 4px;
  width: 40px;
  margin: 0 auto;
  border-radius: 4px;
  background: linear-gradient(90deg, #3683FD, #6AA8FF);
}

/* HIGHLIGHT */
.highlight {
  background: linear-gradient(45deg, #3683FD, #6AA8FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* SUBTITLE */
.hero-subtitle {
  margin-top: 10px;
  font-size: 13px;
  color: #6B6B6B;
  line-height: 1.6;
}

.menu-card {
  border-radius: 18px;
  padding: 6px 0;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: all 0.25s ease;
  animation: fadeUp 0.5s ease forwards;
}

.menu-card:nth-child(1) { animation-delay: 0.1s }
.menu-card:nth-child(2) { animation-delay: 0.2s }
.menu-card:nth-child(3) { animation-delay: 0.3s }
.menu-card:nth-child(4) { animation-delay: 0.4s }

/* tekan efek (mobile feel) */
.menu-card:active {
  transform: scale(0.96);
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
}

.menu-label {
  font-size: 13px;
  font-weight: 500;
  margin-top: 4px;
}

</style>
