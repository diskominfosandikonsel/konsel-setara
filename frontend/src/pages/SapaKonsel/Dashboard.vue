<template>
  <q-page class="dashboard-page">
    <div class="q-pa-md row items-center">
      <div class="col-4 text-white text-left">
        <q-icon name="r_close" size="35px" color="white" class="cursor-pointer" @click="goBack" />
      </div>

      <div class="col-4 text-white text-center flex flex-center">
        <img src="~assets/sapa/logo.svg" class="logo-shadow" width="52" />
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
        :slides-per-view="1.18"
        :space-between="12"
        :centered-slides="true"
        :loop="true"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
      >
        <swiper-slide v-for="item in images" :key="item.id">
          <div class="swiper-card">
            <img :src="item.img" class="swiper-img" />
          </div>
        </swiper-slide>
      </swiper>
    </div>
    <div class="q-pa-md">
          <div class="text-center title">Selamat Datang di Sahabat<br/>Perempuan & Anak Konawe Selatan</div>
          <div class="text-center q-mt-xs sub-title">
            Platform Digital Pelaporan dan Edukasi Perlindungan
            <br />
            Perempuan & Anak Kabupaten Konawe Selatan
          </div>
    </div>
    <div class="row q-col-gutter-md q-px-md q-py-lg text-center">
  <div class="col-6">
    <q-card class="bg-warning text-white full-width" style="border-radius: 15px; background-color: #FF8D00;" @click="darurat">
      <q-card-section>
        <q-icon name="eva-alert-triangle-outline" size="61px" color="white" class="cursor-pointer q-py-md" />
        <div class="text-subtitle2">Laporan Darurat</div>
      </q-card-section>
    </q-card>
  </div>
  <div class="col-6">
    <q-card class="text-white full-width" style="border-radius: 15px; background-color: #3683FD; opacity: 0.85;" @click="edukasi">
      <q-card-section>
        <q-icon name="eva-message-square-outline" size="61px" color="white" class="cursor-pointer q-py-md" />
        <div class="text-subtitle2">Edukasi PPA</div>
      </q-card-section>
    </q-card>
  </div>
  <div class="col-6">
    <q-card class="text-white full-width cursor-pointer" style="border-radius: 15px; background-color: #3683FD; opacity: 0.85;" @click="satgas">
      <q-card-section>
        <q-icon name="eva-people-outline" size="61px" color="white" class="cursor-pointer q-py-md" />
        <div class="text-subtitle2">Satgas PPA</div>
      </q-card-section>
    </q-card>
  </div>
  <div class="col-6">
    <q-card class="text-white full-width cursor-pointer" style="border-radius: 15px; background-color: #E9F0FF;" @click="riwayat">
      <q-card-section>
        <q-icon name="eva-file-text-outline" size="61px" style="color: #3683FD;" class="cursor-pointer q-py-md" />
        <div class="text-subtitle2" style="color: #3683FD;">Riwayat Laporan</div>
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
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'

export default {
  name: 'SapaDashboard',
  components: {
    Swiper,
    SwiperSlide
  },
  data () {
    return {
      sapa: useSapaStore(),
      modules: [Autoplay],
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
    #3683FD 15%,
    #78ACFE 30%,
    #e3f2fd 45%,
    #ffffff 85%
  );
}
.logo-shadow {
  filter: drop-shadow(0 0 2.5px #fff)
          drop-shadow(0 0 5px #fff);
}

.swiper-card {
  border-radius: 20px;
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
  overflow: visible !important;
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
  transform: scale(0.92);
  opacity: 0.8;
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

</style>
