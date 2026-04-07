<template>
  <q-page class="q-pa-md page-bg pb-xl">
    <!-- Top Carousel (Swiper) -->
    <swiper
      :modules="modules"
      :slides-per-view="1.15"
      :centered-slides="true"
      :space-between="16"
      :loop="true"
      :autoplay="{ delay: 4000, disableOnInteraction: false }"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
      class="q-mt-sm main-swiper"
    >
      <swiper-slide v-for="n in 6" :key="'slide-'+n">
        <img :src="`img/card${((n-1)%3)+1}.png`" class="slide-img shadow-2" />
      </swiper-slide>
    </swiper>

    <!-- Custom Navigation Dots for 3 Items -->
    <div class="row justify-center q-my-sm q-pb-sm">
      <div 
        v-for="n in 3" :key="'dot-'+n"
        class="nav-dot q-mx-xs cursor-pointer"
        :class="(activeIndex % 3) === (n - 1) ? 'dot-active' : 'dot-inactive'"
        @click="goToSlide(n - 1)"
      ></div>
    </div>

    <!-- Menu Section -->
    <div class="menu-container rounded-box q-pa-md q-mb-lg bg-grey-2">
      <div class="text-subtitle1 text-weight-bold q-mb-sm text-grey-9">Menu</div>
      
      <!-- Search Input -->
      <q-input 
        v-model="search" 
        outlined
        dense
        bg-color="white"
        placeholder="Cari sesuatu ?" 
        class="q-mb-md search-input"
        color="primary"
      >
        <template v-slot:append>
          <q-icon name="search" color="primary" />
        </template>
      </q-input>

      <!-- Menu Grid -->
      <div class="row q-col-gutter-y-lg justify-start menu-grid">
        <div class="menu-item text-center cursor-pointer" v-for="(item, index) in menuItems" :key="index" @click="goToRoute(item.route)">
          <div :class="['menu-icon-wrap', item.label === 'Lainnya' ? 'is-lainnya' : '', 'q-mb-sm']">
            <template v-if="item.img">
              <img :src="item.img" style="width: 44px; height: 44px; object-fit: contain;" />
            </template>
            <template v-else>
              <q-icon :name="item.icon" color="indigo-5" size="32px"/>
            </template>
          </div>
          <div class="text-xs text-weight-bold text-grey-9" style="font-size: 11px;">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- Video Berita -->
    <div class="q-mb-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-sm text-grey-9">Video Berita</div>
      <div class="video-scroll-container">
        <q-card v-for="n in 4" :key="'vid'+n" class="video-card q-mr-sm no-shadow bordered-card">
          <q-img src="https://picsum.photos/300/200?random=1" height="140px" class="bg-dark rounded-borders">
            <div class="absolute-center bg-transparent">
              <q-icon name="play_circle_outline" color="white" size="48px" />
            </div>
            <div class="absolute-bottom text-caption text-left text-white video-overlay">
              Lorem ipsum dolor sit amet, Consectetur adipiscing elit
            </div>
          </q-img>
        </q-card>
      </div>
    </div>

    <!-- Berita Terbaru -->
    <div class="q-mb-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-md text-grey-9">Berita terbaru</div>
      
      <div v-for="n in 3" :key="'news'+n" class="row q-mb-md news-item">
        <div class="col-4">
          <q-img :src="`https://picsum.photos/200/200?random=${n+1}`" class="rounded-borders news-img" ratio="1" />
        </div>
        <div class="col-8 q-pl-md column justify-between py-1">
          <div>
            <div class="text-subtitle2 text-weight-bold line-clamp-2 text-grey-9 lh-tight">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              Pemkab Konawe Selatan
            </div>
          </div>
          <div class="q-mt-xs">
            <q-chip color="blue-2" text-color="blue-8" size="sm" class="q-ma-none text-weight-bold" square>
              1 Years ago
            </q-chip>
          </div>
        </div>
      </div>
    </div>

  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import { Autoplay } from 'swiper/modules'

export default {
  name: 'IndexPage',
  components: {
    Swiper,
    SwiperSlide
  },
  setup () {
    const router = useRouter()
    const swiperRef = ref(null)
    const activeIndex = ref(0)
    
    const onSwiper = (swiper) => {
      swiperRef.value = swiper
    }
    const onSlideChange = (swiper) => {
      activeIndex.value = swiper.realIndex
    }
    const goToSlide = (index) => {
      if (swiperRef.value) {
        swiperRef.value.slideToLoop(index)
      }
    }

    const goToRoute = (route) => {
      if (route) {
        // Assume route doesn't have leading slash if it's named or path, let Vue Router handle resolution
        router.push(route)
      }
    }

    return {
      modules: [Autoplay],
      swiperRef,
      activeIndex,
      onSwiper,
      onSlideChange,
      goToSlide,
      goToRoute,
      search: ref(''),
      menuItems: [
        { label: 'Firetap', img: 'icons/Firetap.png', route: '' },
        { label: 'SapaKonsel', img: 'icons/Sapakonsel.png', route: '/sapa_dashboard' },
        { label: 'PERAK', img: 'icons/Perak.png', route: '/perak_dashboard' },
        { label: 'PPID', img: 'icons/Ppid.png', route: '' },
        { label: 'JDIH', img: 'icons/Jdih.png', route: '/jdih_dashboard' },
        { label: 'SIPADU', img: 'icons/Sipadu.png', route: '/sippadu_dashboard' },
        { label: 'SIMCARD', img: 'icons/Simcard.png', route: '/simcard_dashboard' },
        { label: 'E-Rida', img: 'icons/E-rida.png', route: '' },
        { label: 'Lainnya', icon: 'grid_view', color: 'black', route: '' }
      ]
    }
  }
}
</script>

<style scoped>
.pb-xl {
  padding-bottom: 80px; /* Space for bottom nav */
}
.page-bg {
  background: linear-gradient(180deg, #90caf9 0%, #e3f2fd 12%, #ffffff 25%);
  min-height: 100vh;
}
.main-swiper {
  width: 100%;
}
.nav-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}
.dot-inactive {
  background: #cfd8dc;
}
.dot-active {
  background: #1976D2; /* primary blue */
}
.main-swiper :deep(.swiper-slide) {
  height: 170px;
}
.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  display: block;
}
.rounded-edges {
  border-radius: 16px;
}
.img-banner-1 {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}
.img-banner-2 {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}
.img-banner-3 {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}
.rounded-box {
  border-radius: 20px;
}
.search-input :deep(.q-field__control) {
  border-radius: 12px;
}
.menu-grid {
  margin-top: 8px;
}
.menu-item {
  width: 20%;
  padding: 0 4px;
  margin-bottom: 12px;
}
.menu-icon-wrap {
  width: 55px;
  height: 55px;
  background: linear-gradient(180deg, #bbdefb 0%, #90caf9 100%);
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(144, 202, 249, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.menu-icon-wrap.is-lainnya {
  background: #e0e0e0;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.video-scroll-container {
  display: flex;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none; /* Firefox */
}
.video-scroll-container::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}
.video-card {
  min-width: 140px;
  max-width: 140px;
  border-radius: 12px;
}
.video-overlay {
  background: rgba(0,0,0,0.5);
  font-size: 10px;
  padding: 8px;
}
.bordered-card {
  border: 1px solid #e0e0e0;
}
.news-item {
  border-bottom: 1px solid #eeeeee;
  padding-bottom: 16px;
}
.news-img {
  border-radius: 8px;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.text-xs {
  font-size: 0.75rem;
}
.lh-tight {
  line-height: 1.2;
}
.py-1 {
  padding-top: 4px;
  padding-bottom: 4px;
}
</style>

