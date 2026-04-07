<template>
  <q-page class="bg-grey-1">
    <div class="header q-pa-md">
      <div class="row items-center justify-between relative-position" style="min-height: 40px;">
        <q-btn flat round icon="arrow_back" color="white" @click="$router.back()" />
      </div>

      <div>
        <q-carousel
          v-model="slide"
          :arrows="false"
          animated infinite autoplay
          transition-prev="slide-right"
          transition-next="slide-left"
          height="160px"
          width="100%"
          class="bg-transparent"
        >
          <q-carousel-slide 
            v-for="banner in banners" 
            :key="banner.id" 
            :name="banner.id" 
            class="column no-wrap flex-center q-pa-sm"
          >
            <div class="bannerWrapper">
              <img :src="banner.src" class="banner-img" :alt="banner.alt" />
            </div>
          </q-carousel-slide>
        </q-carousel>
      </div>

      <div class="header-fade"></div>
    </div>

    <div class="content q-pa-md">
      <q-card class="q-pa-md q-mb-md cardJdih">
        <div class="judulCard">Produk Hukum</div>
        <div class="row q-col-gutter-xs">
          <div class="col-3">
            <div>
              <q-card-section class="menuSection">
                <div class="cardx flex flex-center">
                  <q-img src="" class="card-icon" />
                </div>
                <div class="judul">Peraturan Daerah</div>
              </q-card-section>
            </div>
          </div>
          <div class="col-3">
            <div>
              <q-card-section class="menuSection">
                <div class="cardx">
                  <q-img src="" class="card-icon" />
                </div>
                <div class="judul">Peraturan Bupati</div>
              </q-card-section>
            </div>
          </div>
          <div class="col-3">
            <div>
              <q-card-section class="menuSection">
                <div class="cardx">
                  <q-img src="" class="card-icon" />
                </div>
                <div class="judul">Keputusan Bupati</div>
              </q-card-section>
            </div>
          </div>
          <div class="col-3">
            <div>
              <q-card-section class="menuSection">
                <div class="cardx">
                  <q-img src="" class="card-icon" />
                </div>
                <div class="judul">Instruksi Bupati</div>
              </q-card-section>
            </div>
          </div>
          <div class="col-3">
            <div>
              <q-card-section class="menuSection">
                <div class="cardx">
                  <q-img src="" class="card-icon" />
                </div>
                <div class="judul">Keputusan Kepala OPD</div>
              </q-card-section>
            </div>
          </div>
          <div class="col-3">
            <div>
              <q-card-section class="menuSection">
                <div class="cardx">
                  <q-img src="" class="card-icon" />
                </div>
                <div class="judul">Pemerintah Desa</div>
              </q-card-section>
            </div>
          </div>
        </div>
      </q-card>

      <!-- LATEST NEWS SECTION -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle2 text-weight-bold text-grey-9">Berita Terbaru</div>
        <div class="text-caption text-primary text-weight-bold cursor-pointer">Lihat Semua</div>
      </div>

      <div class="news-list q-gutter-y-md">
        <q-card v-for="news in beritaList" :key="news.id" flat bordered
          class="news-card rounded-card shadow-mini overflow-hidden">
          <div class="row no-wrap">
            <q-img :src="news.img" class="col-4 news-img" />
            <q-card-section class="col-8 q-pa-sm">
              <div class="news-title ellipsis-2-lines q-mb-xs">
                {{ news.judul }}
              </div>
              <div class="news-date row items-center text-grey-6">
                <q-icon name="event" size="14px" class="q-mr-xs" />
                {{ news.tanggal }}
              </div>
            </q-card-section>
          </div>
        </q-card>
      </div>

    </div>

    <!-- HIDDEN CAMERA INPUT -->
    <input 
      type="file" 
      accept="image/*" 
      capture="environment" 
      ref="cameraInput" 
      style="display: none" 
      @change="onCameraCapture"
    />

    <!-- FULLSCREEN LAPORAN DIALOG -->
    <q-dialog v-model="showLaporDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="bg-dark text-white relative-position">
        <q-img 
          v-if="capturedImage"
          :src="capturedImage" 
          class="absolute-full"
          fit="cover"
        />
        
        <!-- Header area for close icon -->
        <div class="absolute-top row items-center q-pa-md z-max" style="background: linear-gradient(rgba(0,0,0,0.6), transparent);">
          <q-btn round flat dense icon="arrow_back" color="white" @click="closeLaporDialog" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold" style="text-shadow: 1px 1px 2px black;">SIPPADU Aduan {{ selectedType.toUpperCase() }}</div>
        </div>
        
        <!-- Bottom Overlay -->
        <div class="absolute-bottom q-pa-md z-top" style="background: linear-gradient(transparent, rgba(0,0,0,0.7) 30%, rgba(0,0,0,0.9)); padding-top: 60px;">
          <q-input 
            v-model="laporanText" 
            outlined 
            bg-color="white" 
            color="primary"
            placeholder="Tulis keterangan..."
            class="q-mb-md"
            dense
          />
          <q-btn 
            unelevated 
            color="primary" 
            class="full-width text-weight-bold" 
            label="KIRIM LAPORAN"
            style="border-radius: 8px; padding: 12px 0;"
            @click="kirimLaporan"
          />
        </div>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>

export default {
  name: 'JdihDashboard',
  data() {
    return {
      slide: 1,
      banners: [
        { id: 1, src: '/img/jdih/banner-1.png', alt: 'Layanan Lapor Bupati' },
        { id: 2, src: '/img/jdih/banner-2.png', alt: 'Layanan Lapor Bupati' },
      ]
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    goAdd() {
      this.$router.push('/tambahBiodata');
    },
    goEdit() {
      this.$router.push('/editBiodata');
    }
  }
}
</script>

<style scoped>
/* GLOBAL STYLES */

</style>
