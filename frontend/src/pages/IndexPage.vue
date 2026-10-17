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
        <div class="row q-col-gutter-y-lg justify-center menu-grid">
          <div class="menu-item text-center cursor-pointer" v-for="(item, index) in displayMenuItems" :key="index"
            @click="onSelectMenuItem(item)">
            <div :class="['menu-icon-wrap', item.isLainnya ? 'is-lainnya' : '', 'q-mb-sm']">
              <template v-if="item.img">
                <img :src="getMenuIconSrc(item.img)" class="menu-icon-img" />
              </template>
              <template v-else>
                <q-icon :name="item.icon || 'apps'" :color="item.isLainnya ? 'primary' : 'indigo-5'" class="menu-icon-q" />
              </template>
            </div>
            <div class="menu-label text-weight-bold text-grey-9">{{ item.label }}</div>
          </div>
        </div>
      </div>

      <!-- Video Konsel & Berita Daerah (Official & Daily) -->
      <div class="q-mb-lg">
        <div class="row items-center justify-between q-mb-xs">
          <div class="row items-center q-gutter-x-xs">
            <div class="text-subtitle1 text-weight-bold text-grey-9">Video Konsel</div>
          </div>
          <div class="text-caption text-primary cursor-pointer text-weight-bold" @click="showVideoSocials = true">
            Kanal Kami <q-icon name="chevron_right" />
          </div>
        </div>

        <!-- Filter Tab Pills: Semua | Official | Daily -->
        <div class="row items-center q-gutter-x-xs q-mb-sm">
          <q-btn
            dense
            rounded
            unelevated
            no-caps
            size="xs"
            :color="selectedTiktokCategory === 'all' ? 'primary' : 'grey-3'"
            :text-color="selectedTiktokCategory === 'all' ? 'white' : 'grey-8'"
            class="q-px-sm text-weight-bold"
            label="Semua"
            @click="setTiktokCategory('all')"
          />
          <q-btn
            dense
            rounded
            unelevated
            no-caps
            size="xs"
            :color="selectedTiktokCategory === 'official' ? 'blue-8' : 'grey-3'"
            :text-color="selectedTiktokCategory === 'official' ? 'white' : 'grey-8'"
            class="q-px-sm text-weight-bold"
            label="Official"
            @click="setTiktokCategory('official')"
          />
          <q-btn
            dense
            rounded
            unelevated
            no-caps
            size="xs"
            :color="selectedTiktokCategory === 'daily' ? 'amber-9' : 'grey-3'"
            :text-color="selectedTiktokCategory === 'daily' ? 'white' : 'grey-8'"
            class="q-px-sm text-weight-bold"
            label="Daily"
            @click="setTiktokCategory('daily')"
          />
        </div>

        <div class="video-scroll-container">
          <!-- Render videos dynamically -->
          <template v-if="displayedVideos.length > 0">
            <q-card v-for="(vid, idx) in displayedVideos" :key="'vid' + idx"
              class="video-card q-mr-sm no-shadow bordered-card cursor-pointer" @click="openVideoPlayer(vid)">
              <q-img :src="vid.cover_url || vid.img || getThumbnail(vid.video_url || vid.link)" height="190px" class="bg-dark rounded-borders">
                <!-- Play Icon Center -->
                <div class="absolute-center bg-transparent">
                  <div class="play-btn-circle">
                    <q-icon name="play_arrow" color="white" size="24px" />
                  </div>
                </div>

                <!-- Bottom Title Overlay -->
                <div class="absolute-bottom text-caption text-left text-white video-overlay">
                  <div class="line-clamp-2 text-weight-medium text-xxs">{{ vid.title }}</div>
                </div>
              </q-img>
            </q-card>
          </template>

          <!-- Shimmer loading state -->
          <template v-else-if="tiktokLoading">
            <q-card v-for="n in 3" :key="'skel-vid' + n" class="video-card q-mr-sm no-shadow bordered-card">
              <q-skeleton height="190px" square class="rounded-borders" />
            </q-card>
          </template>

          <!-- Fallback jika belum ada video di kategori tersebut -->
          <template v-else>
            <div class="q-pa-md text-caption text-grey-6 text-center full-width bg-grey-1 rounded-borders">
              Belum ada video di kategori ini
            </div>
          </template>
        </div>
      </div>

      <!-- Modal Pilihan Sosial Media Video -->
      <q-dialog v-model="showVideoSocials" position="bottom">
        <q-card class="q-pa-md q-pb-xl rounded-borders-top" style="width: 100%; border-radius: 24px 24px 0 0;">
          <div class="text-h6 text-center text-weight-bold q-mb-md text-grey-9">Kunjungi Media Resmi Kami</div>
          <div class="row justify-center q-gutter-x-lg q-mt-md">
            <!-- Pilihan YouTube -->
            <div class="column items-center cursor-pointer" @click="openSocialLink('youtube')">
              <q-avatar size="56px" class="bg-red-1 q-mb-xs shadow-2">
                <q-icon name="fab fa-youtube" color="red" size="28px" />
              </q-avatar>
              <div class="text-caption text-weight-bold text-grey-8">YouTube</div>
            </div>
            <!-- Pilihan TikTok Official -->
            <div class="column items-center cursor-pointer" @click="openSocialLink('tiktok')">
              <q-avatar size="56px" class="bg-blue-1 q-mb-xs shadow-2">
                <q-icon name="fab fa-tiktok" color="blue-9" size="28px" />
              </q-avatar>
              <div class="text-caption text-weight-bold text-grey-8">TikTok Official</div>
            </div>
            <!-- Pilihan TikTok Daily -->
            <div class="column items-center cursor-pointer" @click="openSocialLink('tiktok-daily')">
              <q-avatar size="56px" class="bg-amber-1 q-mb-xs shadow-2">
                <q-icon name="fab fa-tiktok" color="amber-9" size="28px" />
              </q-avatar>
              <div class="text-caption text-weight-bold text-grey-8">TikTok Daily</div>
            </div>
          </div>
        </q-card>
      </q-dialog>

      <!-- In-App Video Player Modal (Putar Langsung di Konsel Setara) -->
      <q-dialog v-model="showVideoPlayer" maximized transition-show="slide-up" transition-hide="slide-down">
        <q-card class="bg-black text-white column no-wrap" style="height: 100vh; width: 100vw;">
          <!-- Top Bar: Header info & Close Button -->
          <div class="row items-center justify-between q-pa-md" style="z-index: 10; background: linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%);">
            <div class="row items-center q-gutter-x-sm">
              <q-avatar size="34px" class="bg-blue-grey-9 text-white">
                <q-icon name="smart_display" size="18px" />
              </q-avatar>
              <div>
                <div class="text-weight-bold text-subtitle2" style="line-height: 1.2;">
                  {{ currentPlayingVideo?.category === 'daily' ? 'Daily Diskominfo' : 'Official Diskominfo' }}
                </div>
                <div class="text-caption text-grey-4">
                  {{ currentPlayingVideo?.category === 'daily' ? 'Daily' : 'Official' }}
                </div>
              </div>
            </div>
            <q-btn flat round dense icon="close" color="white" @click="showVideoPlayer = false" class="bg-grey-9 text-white" />
          </div>

          <!-- Video Body Player -->
          <div class="col column justify-center items-center relative-position overflow-hidden q-px-sm">
            <!-- Direct MP4 Player -->
            <video
              v-if="currentPlayingVideo?.play_url"
              :src="currentPlayingVideo.play_url"
              controls
              autoplay
              playsinline
              loop
              class="fit rounded-borders"
              style="object-fit: contain; max-height: 75vh;"
              @error="handleVideoError"
            ></video>

            <!-- Video Embed Player (jika tidak ada direct MP4) -->
            <iframe
              v-else-if="currentPlayingVideo?.tiktok_id"
              :src="'https://www.tiktok.com/embed/v2/' + currentPlayingVideo.tiktok_id"
              class="fit rounded-borders"
              style="border: none; max-width: 500px; height: 75vh; background: #000;"
              allow="fullscreen"
              allowfullscreen
            ></iframe>

            <!-- Fallback Thumbnail with Open External -->
            <div v-else class="column items-center justify-center q-pa-lg text-center">
              <q-img :src="currentPlayingVideo?.cover_url || currentPlayingVideo?.img" style="width: 220px; border-radius: 16px;" class="q-mb-md" />
              <div class="text-body2 q-mb-md">{{ currentPlayingVideo?.title }}</div>
              <q-btn unelevated rounded color="primary" icon="launch" label="Buka Video" @click="openVideoLink(currentPlayingVideo?.video_url || currentPlayingVideo?.link)" />
            </div>
          </div>

          <!-- Bottom Caption & Actions -->
          <div class="q-pa-md" style="z-index: 10; background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, transparent 100%);">
            <div class="text-caption text-weight-medium line-clamp-2 q-mb-sm text-white">
              {{ currentPlayingVideo?.title || 'Video Liputan Diskominfo Konawe Selatan' }}
            </div>
            <div class="row items-center justify-between">
              <div class="row items-center q-gutter-x-sm text-caption text-grey-4">
                <span v-if="currentPlayingVideo?.play_count"><q-icon name="visibility" size="14px" /> {{ formatNumber(currentPlayingVideo.play_count) }}</span>
                <span v-if="currentPlayingVideo?.digg_count"><q-icon name="favorite" size="14px" color="red-4" /> {{ formatNumber(currentPlayingVideo.digg_count) }}</span>
              </div>
              <q-btn flat dense no-caps color="cyan-3" icon-right="open_in_new" label="Buka Video" size="sm" @click="openVideoLink(currentPlayingVideo?.video_url || currentPlayingVideo?.link)" />
            </div>
          </div>
        </q-card>
      </q-dialog>

      <!-- Modal Menu Lainnya (Bottom Sheet) -->
      <q-dialog v-model="showLainnyaModal" position="bottom">
        <q-card class="q-pa-md q-pb-xl rounded-borders-top bg-white" style="width: 100%; max-width: 500px; margin: 0 auto; border-radius: 24px 24px 0 0;">
          <div class="row items-center justify-between q-mb-md">
            <div class="row items-center">
              <q-avatar size="36px" color="blue-1" text-color="primary" class="q-mr-sm">
                <q-icon name="apps" size="22px" />
              </q-avatar>
              <div>
                <div class="text-subtitle1 text-weight-bold text-grey-9 lh-tight">Layanan Lainnya</div>
                <div class="text-caption text-grey-6">Pilihan aplikasi & layanan publik lainnya</div>
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup color="grey-6" />
          </div>

          <q-separator class="q-mb-lg" />

          <!-- Grid Menu Tambahan -->
          <div class="row q-col-gutter-y-lg justify-start menu-grid">
            <div class="menu-item text-center cursor-pointer" v-for="(item, index) in overflowMenuItems" :key="'more-' + index"
              @click="onSelectMenuItem(item)">
              <div class="menu-icon-wrap q-mb-sm">
                <template v-if="item.img">
                  <img :src="getMenuIconSrc(item.img)" class="menu-icon-img" />
                </template>
                <template v-else>
                  <q-icon :name="item.icon || 'apps'" color="indigo-5" class="menu-icon-q" />
                </template>
              </div>
              <div class="menu-label text-weight-bold text-grey-9">{{ item.label }}</div>
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

      <!-- Statistik Pengunjung (Pelengkap / Subtle Minimalist Strip) -->
      <div class="q-mb-xl visitor-subtle-container">
        <div class="visitor-subtle-bar">
          <div class="subtle-item">
            <span class="subtle-label">Hari Ini</span>
            <span class="subtle-val text-primary">{{ formatNumber(visitorStats.today) }}</span>
          </div>
          <div class="subtle-sep"></div>
          <div class="subtle-item">
            <span class="subtle-label">Bulan Ini</span>
            <span class="subtle-val text-indigo-9">{{ formatNumber(visitorStats.thisMonth) }}</span>
          </div>
          <div class="subtle-sep"></div>
          <div class="subtle-item">
            <span class="subtle-label">Total Kunjungan</span>
            <span class="subtle-val text-dark">{{ formatNumber(visitorStats.total) }}</span>
          </div>
        </div>
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
import { useBeritaStore } from 'src/stores/berita'
import { useSliderStore } from 'src/stores/slider'
import { getImageBerita, formatDate } from 'src/utils/helper'
import { api } from 'src/api/api'
import { apiVisitors } from 'src/api/apiVisitors'
import { apiTiktok } from 'src/api/apiTiktok'

export default {
  name: 'IndexPage',
  components: {
    Swiper,
    SwiperSlide
  },
  setup() {
    const router = useRouter()
    const beritaStore = useBeritaStore()
    const sliderStore = useSliderStore()
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
        const res = await sliderStore.fetchSliders()
        const data = res?.data || []

        if (data.length > 0) {
          const baseUrl = api.defaults.baseURL.replace(/\/$/, '')
          carouselItems.value = data.map(item => ({
            img: item.img?.startsWith('http')
              ? item.img
              : `${baseUrl}/uploads/${item.img}`,
            link: item.link || ''
          }))
        } else {
          // Fallback jika database slider masih kosong
          carouselItems.value = [
            { img: 'img/card1.png', link: 'https://konaweselatankab.go.id' },
            { img: 'img/card2.png', link: 'https://appkonsel.konaweselatankab.go.id/' },
            { img: 'img/card4.png', link: 'https://play.google.com/store/apps/details?id=com.warga_bicara_mobile&pcampaignid=web_share' }
          ]
        }
      } catch (error) {
        console.error('Gagal mengambil gambar slider:', error)
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // Integrasi TikTok Multi-Akun (Resmi & Daily)
    // ═══════════════════════════════════════════════════════════════
    const tiktokVideos = ref([])
    const selectedTiktokCategory = ref('all')
    const tiktokLoading = ref(false)
    const tiktokLoaded = ref(false)
    const showVideoPlayer = ref(false)
    const currentPlayingVideo = ref(null)

    const displayedVideos = computed(() => {
      if (tiktokLoaded.value) {
        return tiktokVideos.value
      }
      return videoBerita.value
    })

    const fetchTiktokFeed = async () => {
      try {
        tiktokLoading.value = true
        const res = await apiTiktok.getFeed({
          category: selectedTiktokCategory.value,
          limit: 10
        })
        const data = res?.data?.data || []
        tiktokVideos.value = data
        tiktokLoaded.value = true
      } catch (err) {
        console.warn('Gagal memuat feed TikTok:', err)
      } finally {
        tiktokLoading.value = false
      }
    }

    const setTiktokCategory = (cat) => {
      selectedTiktokCategory.value = cat
      fetchTiktokFeed()
    }

    const openVideoPlayer = async (vid) => {
      currentPlayingVideo.value = { ...vid }
      showVideoPlayer.value = true

      // Validasi dan refresh play_url di background jika token CDN sudah expired
      if (vid?.id) {
        try {
          const res = await apiTiktok.getStreamInfo(vid.id)
          if (res.data?.success && res.data?.play_url) {
            if (currentPlayingVideo.value && currentPlayingVideo.value.id === vid.id) {
              currentPlayingVideo.value.play_url = res.data.play_url
            }
          }
        } catch (err) {
          console.warn('Refresh stream video notice:', err.message)
        }
      }
    }

    const handleVideoError = async () => {
      if (currentPlayingVideo.value?.id) {
        try {
          const res = await apiTiktok.getStreamInfo(currentPlayingVideo.value.id)
          if (res.data?.success && res.data?.play_url) {
            currentPlayingVideo.value.play_url = res.data.play_url
          }
        } catch (err) {
          console.warn('Gagal memuat ulang stream video:', err.message)
        }
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

    const menuItems = ref([
      { label: 'Realisasi', icon: 'military_tech', route: '/realisasi_dashboard' },
      { label: 'Firetap', img: 'icons/firetap_logo.png', route: '/firetap_dashboard' },
      { label: 'SapaKonsel', img: 'icons/sapa.svg', route: '/sapa_dashboard' },
      { label: 'PERAK', img: 'icons/Perak.png', route: '/perak_dashboard' },
      { label: 'PPID', img: 'icons/Ppid.png', route: 'http://ppid.konaweselatankab.go.id' },
      { label: 'JDIH', img: 'icons/Jdih.png', route: '/jdih_dashboard' },
      { label: 'SIPPADU', img: 'icons/logo_sippadu.png', route: '/sippadu_dashboard' },
      { label: 'SIMCARD', img: 'icons/Simcard.png', route: '/simcard_dashboard' },
      { label: 'E-Rida', img: 'icons/E-rida.png', route: '/erida_dashboard' },
      { label: 'CSR Setara', img: 'icons/Csr.png', route: '/csr_dashboard' },
      { label: 'BANSOS', img: 'icons/bansos.png', route: '/bansos_dashboard' },
      { label: 'Data', img: 'icons/data.png', route: '/data_dashboard' },
      { label: 'Koperasi & UMKM', img: 'icons/koperasi.png', route: '/koperasi_dashboard' },
      { label: 'RUP', img: 'icons/Logolpse.png', route: '/rup' },
    ])

    const getMenuIconSrc = (img) => {
      if (!img) return ''
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img
      }
      if (img.startsWith('uploads/') || img.startsWith('/uploads/')) {
        const cleanPath = img.startsWith('/') ? img.slice(1) : img
        const base = (api.defaults.baseURL || 'https://konsel-setara.konaweselatankab.go.id').replace(/\/$/, '')
        return `${base}/${cleanPath}`
      }
      return img.startsWith('/') ? img : `/${img}`
    }

    const fetchDynamicMenu = async () => {
      try {
        const res = await api.get('/api/v1/menu/list')
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          menuItems.value = res.data.data.map(item => ({
            label: item.label,
            img: item.img || ((item.route === '/rup' || item.label?.toLowerCase() === 'rup') ? 'icons/Logolpse.png' : ''),
            icon: item.icon || 'apps',
            route: item.route
          }))
        }
      } catch (err) {
        console.warn('Gagal memuat dynamic menu, menggunakan fallback:', err)
      }
    }

    const fetchVisitorStats = async () => {
      try {
        const res = await apiVisitors.getStats()
        if (res.data?.success && res.data?.data) {
          visitorStats.value = res.data.data
        }
      } catch (err) {
        console.warn('Gagal memuat statistik pengunjung:', err)
      }
    }

    onMounted(() => {
      fetchCarousel()
      fetchTiktokFeed()
      fetchVideoBerita()
      fetchBeritaTerbaru()
      fetchDynamicMenu()
      fetchVisitorStats()
    })

    const goToRoute = (route) => {
      if (!route) return

      // Cek apakah route adalah URL eksternal (dimulai dengan http:// atau https://)
      if (route.startsWith('http://') || route.startsWith('https://')) {
        // Buka di tab baru jika URL eksternal
        window.open(route, '_blank')
      } else {
        // Normalisasi route internal (pastikan ada leading slash)
        const targetRoute = route.startsWith('/') ? route : `/${route}`
        router.push(targetRoute)
      }
    }

    const showVideoSocials = ref(false)

    const openSocialLink = (platform) => {
      if (platform === 'youtube') {
        window.open('https://www.youtube.com/@diskominfokonsel', '_blank')
      } else if (platform === 'tiktok') {
        window.open('https://www.tiktok.com/@diskominfo.konsel', '_blank')
      } else if (platform === 'tiktok-daily') {
        window.open('https://www.tiktok.com/@dailydiskominfo.konsel', '_blank')
      }
      showVideoSocials.value = false
    }

    // Statistik Pengunjung (Terkoneksi Realtime ke API Database)
    const visitorStats = ref({
      today: 0,
      thisMonth: 0,
      total: 0
    })

    const formatNumber = (num) => {
      return new Intl.NumberFormat('id-ID').format(num || 0)
    }

    const showLainnyaModal = ref(false)

    // Jika total menu > 12: hanya 11 menu pertama yang tampil di home, slot ke-12 menjadi tombol "Lainnya"
    const displayMenuItems = computed(() => {
      if (menuItems.value.length <= 12) {
        return menuItems.value
      }
      return [
        ...menuItems.value.slice(0, 11),
        {
          label: 'Lainnya',
          icon: 'apps',
          isLainnya: true,
          route: ''
        }
      ]
    })

    // Menu yang tidak muat di beranda (mulai dari urutan ke-12 ke atas)
    const overflowMenuItems = computed(() => {
      if (menuItems.value.length <= 12) {
        return []
      }
      return menuItems.value.slice(11)
    })

    const onSelectMenuItem = (item) => {
      if (item.isLainnya) {
        showLainnyaModal.value = true
      } else {
        showLainnyaModal.value = false
        goToRoute(item.route)
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
      carouselItems,
      displayCarouselItems,
      videoBerita,
      beritaTerbaru,
      getThumbnail,
      openVideoLink,
      showVideoSocials,
      openSocialLink,
      search: ref(''),
      menuItems,
      showLainnyaModal,
      displayMenuItems,
      overflowMenuItems,
      onSelectMenuItem,
      visitorStats,
      formatNumber,
      getMenuIconSrc,
      tiktokVideos,
      selectedTiktokCategory,
      tiktokLoading,
      showVideoPlayer,
      currentPlayingVideo,
      displayedVideos,
      fetchTiktokFeed,
      setTiktokCategory,
      openVideoPlayer,
      handleVideoError
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
  aspect-ratio: 16 / 7;
  /* Menjaga rasio panorama secara otomatis di segala layar */
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
  background: #e0f2fe;
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.menu-icon-wrap.is-lainnya:active {
  transform: scale(0.92);
  background: #bae6fd;
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
  min-width: 135px;
  max-width: 135px;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.video-card:active {
  transform: scale(0.97);
}

.play-btn-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.text-xxs {
  font-size: 0.65rem;
  line-height: 1.25;
}

.video-overlay {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%);
  font-size: 10px;
  padding: 10px 8px;
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

/* ================= Visitor Statistics - Subtle Minimalist Strip ================= */
.visitor-subtle-container {
  margin-top: 14px;
}

.visitor-subtle-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.subtle-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
}

.subtle-label {
  font-size: 0.68rem;
  font-weight: 500;
  color: #64748b;
  line-height: 1.2;
  white-space: nowrap;
}

.subtle-val {
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 2px;
  white-space: nowrap;
}

.subtle-sep {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  flex-shrink: 0;
  margin: 0 4px;
}
</style>
