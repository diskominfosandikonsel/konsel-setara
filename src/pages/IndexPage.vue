<template>
  <q-page class="q-pa-md page-bg pb-xl">
    <!-- Top Carousel -->
    <q-carousel
      v-model="slide"
      transition-prev="slide-right"
      transition-next="slide-left"
      swipeable
      animated
      padding
      height="180px"
      class="rounded-edges q-mt-sm"
    >
      <q-carousel-slide name="1" class="column no-wrap flex-center img-banner-1">
        <div class="text-white text-h5 font-weight-bold">Konawe Selatan</div>
      </q-carousel-slide>
      <q-carousel-slide name="2" class="column no-wrap flex-center img-banner-2">
        <div class="text-white text-h5 font-weight-bold">Portal Resmi</div>
      </q-carousel-slide>
      <q-carousel-slide name="3" class="column no-wrap flex-center img-banner-3">
        <div class="text-white text-h5 font-weight-bold">Menuju Masyarakat Sejahtera</div>
      </q-carousel-slide>
    </q-carousel>

    <!-- Custom Navigation Dots -->
    <div class="row justify-center q-my-md">
      <div 
        v-for="n in 3" :key="n"
        class="nav-dot q-mx-xs cursor-pointer"
        :class="slide === String(n) ? 'bg-primary' : 'bg-grey-4'"
        @click="slide = String(n)"
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
      <div class="row q-col-gutter-y-md q-col-gutter-x-xs justify-start">
        <div class="col-3 text-center cursor-pointer" v-for="(item, index) in menuItems" :key="index">
          <q-btn
            round
            unelevated
            class="menu-btn shadow-2 q-mb-xs"
            size="22px"
          >
            <q-icon :name="item.icon" :color="item.color" size="28px"/>
          </q-btn>
          <div class="text-xs text-weight-medium text-grey-9" style="font-size: 11px;">{{ item.label }}</div>
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

export default {
  name: 'IndexPage',
  setup () {
    return {
      slide: ref('1'),
      search: ref(''),
      menuItems: [
        { label: 'Firetap', icon: 'local_fire_department', color: 'red-8' },
        { label: 'SapaKonsel', icon: 'support_agent', color: 'pink-6' },
        { label: 'PERAK', icon: 'description', color: 'green-8' },
        { label: 'PPID', icon: 'computer', color: 'purple-6' },
        { label: 'JDIH', icon: 'gavel', color: 'brown-6' },
        { label: 'SIPADU', icon: 'menu_book', color: 'orange-8' },
        { label: 'SIMCARD', icon: 'badge', color: 'teal-7' },
        { label: 'E-Rida', icon: 'assignment', color: 'blue-8' },
        { label: 'Lainnya', icon: 'grid_view', color: 'primary' }
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
.nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
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
.menu-btn {
  background: linear-gradient(180deg, #bbdefb 0%, #90caf9 100%);
  border-radius: 14px;
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

