<template>
  <q-page class="bg-grey-custom pb-24">
    <!-- HEADER -->
    <div class="row items-center q-px-sm q-py-sm bg-white border-bottom sticky-header">
      <q-btn flat round dense icon="chevron_left" color="dark" size="16px" @click="$router.back()" />
      <div class="text-weight-bold q-ml-sm text-dark" style="font-size: 18px;">Detail Laporan</div>
    </div>

    <!-- STATUS BANNER -->
    <div class="bg-white q-pa-xl text-center q-mb-sm section-shadow">
      <div class="q-mb-md flex flex-center">
        <q-avatar size="80px" color="blue-1" text-color="primary">
          <q-icon name="sync" size="40px" />
        </q-avatar>
      </div>
      <div class="text-overline text-grey-6" style="letter-spacing: 1px">PERATURAN DAERAH</div>
      <div class="text-h5 text-weight-bold text-dark q-mt-xs q-mb-xs" style="line-height: 1.2;">Sedang Diproses</div>
      <div class="text-caption text-grey-5 q-mt-sm">Dilaporkan pada 6 Jan 2026</div>
    </div>

    <!-- DETAIL INFORMASI -->
    <div class="bg-white q-py-md q-px-lg q-mb-sm section-shadow">
      <div class="text-subtitle1 text-weight-bold q-mb-md text-dark">Informasi Pelapor</div>
      
      <div class="row items-center justify-between q-mb-md">
        <div class="text-grey-7 text-body2">Nama Pelapor</div>
        <div class="text-weight-bold text-dark text-body2">Humas Satpol</div>
      </div>
      
      <q-separator class="q-my-md custom-separator" />
      
      <div class="row items-center justify-between q-my-md">
        <div class="text-grey-7 text-body2">Nomor HP</div>
        <div class="text-weight-bold text-dark text-body2">0852-1254-1250</div>
      </div>
    </div>

    <!-- KETERANGAN & LAMPIRAN -->
    <div class="bg-white q-py-md q-px-lg q-mb-lg section-shadow">
      <div class="text-subtitle1 text-weight-bold q-mb-sm text-dark">Keterangan Laporan</div>
      <div class="text-body2 text-grey-8 q-mb-lg" style="line-height: 1.6;">
        Terdapat pelanggaran ketertiban umum oleh sekumpulan pedagang kaki lima di trotoar. Mohon segera ditindaklanjuti karena mengganggu pejalan kaki.
      </div>

      <div class="text-subtitle1 text-weight-bold q-mb-sm text-dark">Lampiran Foto</div>
      <div class="image-wrapper q-mt-sm">
        <q-img 
          src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=400&h=300&auto=format&fit=crop" 
          class="rounded-borders cursor-pointer"
          style="max-height: 200px; border-radius: 12px; width: 100%; border: 1px solid #f0f0f0;"
          fit="cover"
          @click="showImageFullscreen = true"
        />
        <div class="fullscreen-hint bg-black text-white absolute-bottom-right q-ma-sm q-px-sm q-py-xs rounded-borders" style="opacity: 0.7; font-size: 11px;">
          <q-icon name="fullscreen" /> Perbesar
        </div>
      </div>
    </div>

    <!-- ACTION BUTTON -->
    <div class="q-px-lg q-pb-xl">
      <q-btn 
        unelevated 
        color="primary" 
        label="Lihat Lokasi" 
        class="full-width text-weight-bold q-py-md"
        style="font-size: 15px; border-radius: 10px;"
        no-caps
      />
    </div>

    <!-- FULLSCREEN IMAGE DIALOG -->
    <q-dialog v-model="showImageFullscreen" maximized transition-show="fade" transition-hide="fade">
      <div class="bg-black relative-position column flex-center">
        <q-btn 
          round 
          flat 
          icon="close" 
          color="white" 
          class="absolute-top-right q-ma-md z-top" 
          v-close-popup 
        />
        <img 
          src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1200&auto=format&fit=crop" 
          style="max-width: 100vw; max-height: 100vh; object-fit: contain;"
        />
      </div>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const showImageFullscreen = ref(false)
</script>

<style scoped>
.bg-grey-custom {
  background-color: #f5f5f5; /* Match Figma F5F5F5 page background */
  min-height: 100vh;
}
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: 60px;
}
.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}
.section-shadow {
  /* Sangat tipis, khas desain modern minimalis */
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}
.custom-separator {
  background-color: #f0f0f0;
}
.pb-24 {
  padding-bottom: 24px;
}
.image-wrapper {
  position: relative;
}
</style>
