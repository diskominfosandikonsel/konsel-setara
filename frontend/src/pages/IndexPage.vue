<template>
  <q-page class="q-pt-md page-bg pb-xl">
    <!-- Top Carousel (Swiper) -->
    <swiper v-if="displayCarouselItems.length > 0" :modules="modules" :slides-per-view="1.2" :centered-slides="true"
      :space-between="12" :loop="true" :autoplay="{ delay: 4000, disableOnInteraction: false }" @swiper="onSwiper"
      @slideChange="onSlideChange" class="q-mt-sm main-swiper">
      <swiper-slide v-for="(item, idx) in displayCarouselItems" :key="'slide-' + idx">
        <img :src="item.img" class="slide-img shadow-2 cursor-pointer" @click="openVideoLink(item.link)" />
      </swiper-slide>
    </swiper>

    <!-- Shimmer/Skeleton if loading -->
    <div v-else class="q-mt-sm q-px-md row justify-center">
      <q-skeleton width="100%" class="carousel-skeleton rounded-edges shadow-2" />
    </div>

    <div class="q-px-md">
      <!-- Custom Navigation Dots -->
      <div class="row justify-center q-my-sm q-pb-sm" v-if="carouselItems.length > 0">
        <div v-for="(item, idx) in carouselItems" :key="'dot-' + idx" class="nav-dot q-mx-xs cursor-pointer"
          :class="(activeIndex % carouselItems.length) === idx ? 'dot-active' : 'dot-inactive'" @click="goToSlide(idx)">
        </div>
      </div>

      <!-- Menu Section -->
      <div class="menu-container rounded-box q-pa-md q-mb-lg bg-grey-2">
        <div class="text-subtitle1 text-weight-bold q-mb-sm text-grey-9">Menu</div>

        <!-- Search Input -->
        <!-- <q-input 
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
          </q-input> -->

      <!-- Menu Grid -->
      <div class="row q-col-gutter-y-lg justify-start menu-grid">
        <div class="menu-item text-center cursor-pointer" v-for="(item, index) in menuItems" :key="index" @click="goToRoute(item.route)">
          <div :class="['menu-icon-wrap', item.label === 'Lainnya' ? 'is-lainnya' : '', 'q-mb-sm']">
            <template v-if="item.img">
              <img :src="item.img" class="menu-icon-img" />
            </template>
            <template v-else>
              <q-icon :name="item.icon" color="indigo-5" class="menu-icon-q"/>
            </template>
          </div>
          <div class="menu-label text-weight-bold text-grey-9">{{ item.label }}</div>
        </div>
      </div>
      </div>

      <!-- Video Berita -->
      <div class="q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold text-grey-9">Video Berita</div>
          <div class="text-caption text-primary cursor-pointer text-weight-bold" @click="showVideoSocials = true">
            Video lainnya <q-icon name="chevron_right" />
          </div>
        </div>
        <div class="video-scroll-container">
          <!-- Render videos dynamically or show skeleton/dummy -->
          <template v-if="videoBerita.length > 0">
            <q-card v-for="(vid, idx) in videoBerita" :key="'vid' + idx"
              class="video-card q-mr-sm no-shadow bordered-card cursor-pointer" @click="openVideoLink(vid.link)">
              <q-img :src="vid.img || getThumbnail(vid.link)" height="140px" class="bg-dark rounded-borders">
                <div class="absolute-center bg-transparent">
                  <q-icon name="play_circle_outline" color="white" size="40px" />
                </div>
                <div class="absolute-bottom text-caption text-left text-white video-overlay">
                  <div class="line-clamp-2">{{ vid.title }}</div>
                </div>
              </q-img>
            </q-card>
          </template>
          <!-- Shimmer loading state -->
          <template v-else>
            <q-card v-for="n in 3" :key="'skel-vid' + n" class="video-card q-mr-sm no-shadow bordered-card">
              <q-skeleton height="140px" square class="rounded-borders" />
            </q-card>
          </template>
        </div>
      </div>

      <!-- Modal Pilihan Sosial Media Video -->
      <q-dialog v-model="showVideoSocials" position="bottom">
        <q-card class="q-pa-md q-pb-xl rounded-borders-top" style="width: 100%; border-radius: 24px 24px 0 0;">
          <div class="text-h6 text-center text-weight-bold q-mb-md text-grey-9">Kunjungi Channel Kami</div>
          <div class="row justify-center q-gutter-x-xl q-mt-md">
            <!-- Pilihan YouTube -->
            <div class="column items-center cursor-pointer" @click="openSocialLink('youtube')">
              <q-avatar size="64px" class="bg-red-1 q-mb-sm shadow-2">
                <q-icon name="fab fa-youtube" color="red" size="32px"/>
              </q-avatar>
              <div class="text-caption text-weight-bold text-grey-8">YouTube</div>
            </div>
            <!-- Pilihan TikTok -->
            <div class="column items-center cursor-pointer" @click="openSocialLink('tiktok')">
              <q-avatar size="64px" class="bg-grey-2 q-mb-sm shadow-2">
                <q-icon name="fab fa-tiktok" color="dark" size="32px"/>
              </q-avatar>
              <div class="text-caption text-weight-bold text-grey-8">TikTok</div>
            </div>
          </div>
        </q-card>
      </q-dialog>

      <!-- Berita Terbaru -->
      <div class="q-mb-sm">
        <div class="text-subtitle1 text-weight-bold q-mb-md text-grey-9">Berita terbaru</div>

        <template v-if="beritaTerbaru.length > 0">
          <div v-for="(news, idx) in beritaTerbaru" :key="'news' + idx" class="row q-mb-md news-item news-clickable"
            @click="$router.push({ path: `/news/${news.id}`, state: { img: news.img, title: news.title, author: news.author, date: news.date, content: news.content } })">
            <div class="col-4">
              <q-img :src="news.img" class="rounded-borders news-img" ratio="1" />
            </div>
            <div class="col-8 q-pl-md column justify-between py-1">
              <div>
                <div class="text-subtitle2 text-weight-bold line-clamp-2 text-grey-9 lh-tight">
                  {{ news.title }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ news.author }}
                </div>
              </div>
              <div class="q-mt-xs">
                <q-chip color="blue-2" text-color="blue-8" size="sm" class="q-ma-none text-weight-bold" square>
                  {{ news.date }}
                </q-chip>
              </div>
            </div>
          </div>
        </template>

        <!-- Skeleton Loading State -->
        <template v-else>
          <div v-for="n in 3" :key="'skel-news' + n" class="row q-mb-md news-item">
            <div class="col-4">
              <q-skeleton type="rect" height="100px" class="rounded-borders" />
            </div>
            <div class="col-8 q-pl-md column justify-between">
              <div>
                <q-skeleton type="text" class="text-subtitle2" />
                <q-skeleton type="text" width="60%" class="q-mt-xs" />
              </div>
              <q-skeleton type="QChip" width="80px" />
            </div>
          </div>
        </template>
      </div>

    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import { Autoplay } from 'swiper/modules'
import { api } from 'src/api/api'
import { useBeritaStore } from 'src/stores/berita'
import { getImageBerita, formatDate } from 'src/utils/helper'

export default {
  name: 'IndexPage',
  components: {
    Swiper,
    SwiperSlide
  },
  setup() {
    const router = useRouter()
    const beritaStore = useBeritaStore()
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

    const carouselItems = ref([])

    // Duplikasi item agar efek loop Swiper tetap berjalan mulus
    const displayCarouselItems = computed(() => {
      if (carouselItems.value.length > 0) {
        return [...carouselItems.value, ...carouselItems.value]
      }
      return carouselItems.value
    })

    const fetchCarousel = async () => {
      try {

        // DUMMY DATA SEMENTARA (Hapus bagian ini jika API sudah terpasang)
        carouselItems.value = [
          { img: 'img/card1.png', link: '' },
          { img: 'img/card2.png', link: 'https://appkonsel.konaweselatankab.go.id/' },
          { img: 'img/card3.png', link: '' },
          { img: 'img/card4.png', link: 'https://play.google.com/store/apps/details?id=com.warga_bicara_mobile&pcampaignid=web_share' }
        ]
      } catch (error) {
        console.error('Gagal mengambil gambar carousel:', error)
      }
    }

    const videoBerita = ref([])

    const getThumbnail = (url) => {
      if (!url) return 'https://picsum.photos/300/200?random=1'

      // Deteksi Youtube
      const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = url.match(ytRegExp)
      if (match && match[2].length === 11) {
        return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
      }

      // Deteksi Tiktok Placeholder
      if (url.includes('tiktok.com')) {
        // Menggunakan abu-abu gelap Inline SVG agar menjadi watermark dan tak menabrak ikon play putih
        return "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'%3E%3Cg transform='translate(116, 96) scale(0.6)'%3E%3Cpath fill='%23383838' d='M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z'/%3E%3C/g%3E%3C/svg%3E"
      }
      return 'https://picsum.photos/300/200?random=1'
    }

    const openVideoLink = (url) => {
      if (url) window.open(url, '_blank')
    }

    const fetchVideoBerita = async () => {
      try {
        const payload = {
          data_ke: 1,
          cari_value: "",
          kategori_id: "" // WAJIB DIHADIRKAN agar tidak terbaca undefined di SQL Backend
        }
        
        const response = await beritaStore.fetchVideo(payload)
        const dataApi = response?.data || []
        
        // Pemetaan struktur balikan Video dari tabel gallery_video (web_konsel)
        const mappedVideo = dataApi.map(item => ({
          title: item.keterangan || 'Video Konsel',
          // Menangkap embel-embel huruf besar/kecil 'link', 'url', 'tautan'
          link: item.isi || 'https://www.youtube.com/watch?v=gGAv8Xyo2Ro',
        }))

        // Membatasi hanya 5 video saja yang tampil di layar depan
        const slicedData = mappedVideo.slice(0, 8)
        videoBerita.value = slicedData

        // Fetch Tiktok thumbnail secara asinkron menggunakan TikWM API langsung
        // Mengubah dari "forEach" paralel menjadi "for" biasa yang berfase, untuk mencegah penolakan API ganda (Rate Limit) oleh TikWM
        for (let i = 0; i < slicedData.length; i++) {
          const vid = slicedData[i]
          if (vid.link.includes('tiktok.com')) {
            try {
              // Jeda aman 1,5 detik untuk menembus proteksi anti-spam / Rate-limit TikWM API
              await new Promise(resolve => setTimeout(resolve, 1500))

              // TikWM API bersifat public dan terbuka terhadap CORS
              const res = await fetch(`https://tikwm.com/api/?url=${vid.link}`)
              const dataInfo = await res.json()

              if (dataInfo.code === 0 && dataInfo.data && dataInfo.data.cover) {
                // Menimpa indeks lama secara mutasi aman agar antarmuka Vue terbaharui
                videoBerita.value[i] = { ...videoBerita.value[i], img: dataInfo.data.cover }
              }
            } catch (e) {
              console.error('Gagal mengambil thumbnail tiktok', e)
            }
          }
        }
      } catch (error) {
        console.error('Gagal mengambil data video:', error)
      }
    }

    const beritaTerbaru = ref([])

    const fetchBeritaTerbaru = async () => {
      try {
        const payload = {
          data_ke: 1,
          cari_value: ""
        }
        
        const response = await beritaStore.fetchBerita(payload)
        const dataApi = response?.data || []
        
        const mappedBerita = dataApi.map((item) => ({
          id: item.id,
          title: item.judul || 'Tanpa Judul',
          author: item.createBy || 'Admin',
          date: formatDate(item.createAt) || 'Waktu Tidak Diketahui',
          img: getImageBerita(item.foto),
          content: item.isi || 'Tidak Ada Konten'
        }))

        // Membatasi hanya 5 berita saja yang tampil
        beritaTerbaru.value = mappedBerita.slice(0, 6)
      } catch (error) {
        console.error('Gagal mengambil data berita:', error)
      }
    }

    onMounted(() => {
      fetchCarousel()
      fetchVideoBerita()
      fetchBeritaTerbaru()
    })

    const goToRoute = (route) => {
      if (route) {
        // Assume route doesn't have leading slash if it's named or path, let Vue Router handle resolution
        router.push(route)
      }
    }

    const showVideoSocials = ref(false)

    const openSocialLink = (platform) => {
      if (platform === 'youtube') {
        window.open('https://www.youtube.com/@diskominfokonsel', '_blank')
      } else if (platform === 'tiktok') {
        window.open('https://www.tiktok.com/@diskominfo.konsel', '_blank')
      }
      showVideoSocials.value = false
    }

    return {
      modules: [Autoplay],
      swiperRef,
      activeIndex,
      onSwiper,
      onSlideChange,
      goToSlide,
      goToRoute,
      carouselItems,
      displayCarouselItems,
      videoBerita,
      beritaTerbaru,
      getThumbnail,
      openVideoLink,
      showVideoSocials,
      openSocialLink,
      search: ref(''),
      menuItems: [
        { label: 'Firetap', img: 'icons/firetap_logo.png', route: '/firetap_dashboard' },
        { label: 'SapaKonsel', img: 'icons/sapa.svg', route: '/sapa_dashboard' },
        { label: 'PERAK', img: 'icons/Perak.png', route: '/perak_dashboard' },
        { label: 'PPID', img: 'icons/Ppid.png', route: '' },
        { label: 'JDIH', img: 'icons/Jdih.png', route: '/jdih_dashboard' },
        { label: 'SIPPADU', img: 'icons/logo_sippadu.png', route: '/sippadu_dashboard' },
        { label: 'SIMCARD', img: 'icons/Simcard.png', route: '/simcard_dashboard' },
        { label: 'E-Rida', img: 'icons/E-rida.png', route: '' },
        // { label: 'Lainnya', icon: 'grid_view', color: 'black', route: '' }
      ]
    }
  }
}
</script>

<style scoped>
.pb-xl {
  padding-bottom: 10px;
  /* Space for bottom nav */
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
  background: #1976D2;
  /* primary blue */
}

.main-swiper :deep(.swiper-slide),
.carousel-skeleton {
  width: 100%;
  aspect-ratio: 16 / 7; /* Menjaga rasio panorama secara otomatis di segala layar */
  height: auto;
}

.slide-img {
  width: 100%;
  height: 100%;
  /* Gunakan contain jika ingin garansi 100% utuh, atau biarkan cover dengan aspect-ratio yang benar */
  object-fit: cover; 
  border-radius: 16px;
  display: block;
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
  width: 25%;
  padding: 4px 4px;
  margin-bottom: 8px;
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
  overflow: hidden;
}

.menu-icon-img {
  width: 35px;
  height: 35px;
  object-fit: contain;
  border-radius: 10px;
}
.menu-icon-q {
  font-size: 32px;
}
.menu-label {
  font-size: 11px;
}
.menu-icon-wrap.is-lainnya {
  background: #e0e0e0;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.video-scroll-container {
  display: flex;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
  /* Firefox */
}

.video-scroll-container::-webkit-scrollbar {
  display: none;
  /* Safari and Chrome */
}

.video-card {
  min-width: 140px;
  max-width: 140px;
  border-radius: 12px;
}

.video-overlay {
  background: rgba(0, 0, 0, 0.5);
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

.news-clickable {
  cursor: pointer;
  transition: background 0.15s ease;
  border-radius: 6px;
}

.news-clickable:active {
  background-color: #f5f5f5;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
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

/* Tablet responsive — berita thumbnail kecilkan, video card besarkan, menu besarkan */
@media (min-width: 600px) {
  .news-item .col-4 {
    max-width: 150px;
    flex: 0 0 150px;
  }
  .news-item .col-8 {
    flex: 1;
    max-width: none;
  }
  .video-card {
    min-width: 200px;
    max-width: 200px;
  }
  .video-card .q-img {
    height: 180px !important;
  }
  /* Menu tablet */
  .menu-icon-wrap {
    width: 68px;
    height: 68px;
    border-radius: 18px;
  }
  .menu-icon-img {
    width: 42px;
    height: 42px;
  }
  .menu-icon-q {
    font-size: 38px;
  }
  .menu-label {
    font-size: 13px;
  }
  .menu-container .text-subtitle1 {
    font-size: 1.1rem;
  }
}

@media (min-width: 900px) {
  .news-item .col-4 {
    max-width: 180px;
    flex: 0 0 180px;
  }
  .video-card {
    min-width: 240px;
    max-width: 240px;
  }
  .video-card .q-img {
    height: 200px !important;
  }

  /* Menu tablet besar */
  .menu-icon-wrap {
    width: 90px;
    height: 90px;
    border-radius: 20px;
  }
  .menu-icon-img {
    width: 60px;
    height: 60px;
  }
  .menu-icon-q {
    font-size: 50px;
  }
  .menu-label {
    font-size: 18px;
  }
  .menu-container .text-subtitle1 {
    font-size: 1.2rem;
  }
}
</style>
