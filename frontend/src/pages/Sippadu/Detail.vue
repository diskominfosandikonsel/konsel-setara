<template>
  <q-page class="bg-grey-custom pb-24">
    <!-- HEADER -->
    <!-- TEAM STANDARD HEADER -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="text-h6 text-weight-regular q-ml-sm text-uppercase text-dark" style="letter-spacing: 1.5px;">DETAIL LAPORAN</div>
    </div>

    <!-- STATUS BANNER -->
    <div class="bg-white q-pa-xl text-center q-mb-sm section-shadow" v-if="item.id">
      <div class="q-mb-md flex flex-center">
        <q-avatar size="80px" :color="statusColor + '-1'" :text-color="statusColor">
          <q-icon :name="statusIcon" size="40px" />
        </q-avatar>
      </div>
      <div class="text-overline text-grey-6" style="letter-spacing: 1px">{{ itemJenis.toUpperCase() }}</div>
      <div class="text-h5 text-weight-bold text-dark q-mt-xs q-mb-xs" style="line-height: 1.2;">{{ statusLabel }}</div>
      <div class="text-caption text-grey-5 q-mt-sm">Dilaporkan pada {{ formatDate(item.createAt) }}</div>
    </div>
    
    <div v-else class="q-pa-xl flex flex-center">
        <q-spinner-dots size="40px" color="primary" />
    </div>

    <!-- DETAIL INFORMASI -->
    <div class="bg-white q-py-md q-px-lg q-mb-sm section-shadow" v-if="item.id">
      <div class="text-subtitle1 text-weight-bold q-mb-md text-dark">Informasi Pelapor</div>
      
      <div class="row items-center justify-between q-mb-md">
        <div class="text-grey-7 text-body2">Nama Pelapor</div>
        <div class="text-weight-bold text-dark text-body2">{{ authStore.user?.nama || 'Anonim' }}</div>
      </div>
      
      <q-separator class="q-my-md custom-separator" />
      
      <div class="row items-center justify-between q-my-md">
        <div class="text-grey-7 text-body2">Nomor HP</div>
        <div class="text-weight-bold text-dark text-body2">{{ authStore.user?.hp || '-' }}</div>
      </div>
    </div>

    <!-- KETERANGAN & LAMPIRAN -->
    <div class="bg-white q-py-md q-px-lg q-mb-lg section-shadow" v-if="item.id">
      <div class="text-subtitle1 text-weight-bold q-mb-sm text-dark">Keterangan / Uraian</div>
      <div class="text-body2 text-grey-8 q-mb-md" style="line-height: 1.6;">
        {{ item.uraian || '-' }}
      </div>
      
      <div v-if="item.status !== 'proses'" class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-xs text-dark">Pesan Tindak Lanjut:</div>
          <div class="text-body2 text-primary" style="line-height: 1.6;">
            {{ item.keterangan || '-' }}
          </div>
      </div>

      <div class="text-subtitle1 text-weight-bold q-mb-sm text-dark">Lampiran Foto</div>
      <div class="image-wrapper q-mt-sm">
        <q-img 
          :src="getImageUrl(item.file)" 
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
    <div class="q-px-lg q-pb-xl" v-if="item.id">
      <q-btn 
        unelevated 
        color="primary" 
        label="Lihat Lokasi" 
        class="full-width text-weight-bold q-py-md"
        style="font-size: 15px; border-radius: 10px;"
        no-caps
        @click="openLocation"
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
          :src="getImageUrl(item.file)" 
          style="max-width: 100vw; max-height: 100vh; object-fit: contain;"
        />
      </div>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSippaduStore } from 'stores/sippadu'
import { useAuthStore } from 'stores/auth'

const route = useRoute()
const router = useRouter()
const sippaduStore = useSippaduStore()
const authStore = useAuthStore()

const showImageFullscreen = ref(false)
const reportId = route.params.id

// Data Laporan
const item = computed(() => {
  return sippaduStore.list_riwayat.find(r => r.id === reportId) || {}
})

// Jika list kosong, fetch dulu (mungkin dari refresh langsung ke url detail)
onMounted(async () => {
  if (sippaduStore.list_riwayat.length === 0) {
    await sippaduStore.fetchRiwayat()
  }
  if (!item.value.id) {
    router.replace('/sippadu_riwayat')
  }
})

// MAPPING UTILS //
const itemJenis = computed(() => {
  return String(item.value.objek) === '1' ? 'Perkada' : 'Perda'
})

const statusLabel = computed(() => {
  const map = { proses: 'Sedang Diproses', selesai: 'Selesai', dikembalikan: 'Dikembalikan' }
  return map[item.value.status] || item.value.status || 'Memuat...'
})

const statusIcon = computed(() => {
  const map = { proses: 'sync', selesai: 'check_circle', dikembalikan: 'cancel' }
  return map[item.value.status] || 'info'
})

const statusColor = computed(() => {
  const map = { proses: 'warning', selesai: 'positive', dikembalikan: 'negative' }
  return map[item.value.status] || 'grey'
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const getImageUrl = (file) => {
  if (!file) return 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=400&h=300&auto=format&fit=crop'
  
  // Karena laporan SIPPADU dikelola di server-sippadu
  return `https://server-sippadu.konaweselatankab.go.id/uploads/${file}`
}

const openLocation = () => {
    if(item.value.lat && item.value.lng) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${item.value.lat},${item.value.lng}`, '_blank')
    } else if (item.value.lokasi) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.value.lokasi)}`, '_blank')
    }
}
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
