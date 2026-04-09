<template>
  <q-page class="bg-grey-1 column">
    <q-header class="bg-white text-dark shadow-1" elevated>
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" color="orange-8" @click="$router.back()" />
        <q-toolbar-title class="text-weight-bold" style="font-size: 16px;">
          DETAIL BERITA
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="col scroll q-pa-md pb-10">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-center q-my-xl">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <!-- Jika data kosong / gagal diload -->
      <div v-else-if="!berita" class="text-center text-grey-6 q-mt-xl">
        <q-icon name="warning" size="40px" class="q-mb-md" />
        <div>Berita tidak ditemukan</div>
      </div>

      <!-- Detail Konten -->
      <div v-else>
        <!-- Judul Berita -->
         <h1 class="text-h5 text-weight-bold text-dark q-mb-sm lh-1-4">
           {{ berita.judul }}
         </h1>

        <!-- Meta Info (Pembuat & Tanggal) -->
        <div class="row items-center q-gutter-x-sm text-grey-7 q-mb-md text-caption">
          <q-icon name="person" size="14px" />
          <span class="text-weight-medium">
            <!-- Menampilkan siapa yang upload (createBy) dan jika kosong fallback ke SIPPADU Admin -->
            {{ berita.createBy ? berita.createBy : 'Admin SIPPADU' }}
          </span>
          <span>&bull;</span>
          <q-icon name="calendar_today" size="14px" />
          <span>{{ formatDate(berita.createAt) }}</span>
        </div>

        <!-- Thumbnail Image -->
        <q-img
          :src="getImageUrl(berita.foto)"
          class="rounded-card shadow-1 q-mb-lg full-width"
          style="height: 220px; object-fit: cover;"
        >
          <template v-slot:error>
            <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
              <q-icon name="image_not_supported" size="32px" />
            </div>
          </template>
        </q-img>

        <!-- Isi Berita -->
        <q-card flat class="q-pa-md bg-white rounded-card shadow-mini">
          <!-- Gunakan v-html untuk merender tag HTML secara native dari database -->
          <div class="berita-content text-body1 text-grey-9 text-justify lh-1-6" v-html="berita.isi"></div>
          
          <div v-if="berita.sumber" class="q-mt-lg text-caption text-grey-6 text-italic">
            Sumber: {{ berita.sumber }}
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SippaduService } from 'src/services/sippadu.service'
import { useQuasar } from 'quasar'

const route = useRoute()
const $q = useQuasar()

const loading = ref(true)
const berita = ref(null)

onMounted(async () => {
  const beritaId = route.params.id
  if (!beritaId) return

  try {
    const res = await SippaduService.getDetailBerita({ id: beritaId })
    
    // Asumsi balikan server: [{ ...data }] atau { data: [...] } atau object single
    let dataOutput = null
    if (Array.isArray(res.data) && res.data.length > 0) {
      dataOutput = res.data[0]
    } else if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      dataOutput = res.data.data[0]
    } else if (typeof res.data === 'object' && res.data !== null && Object.keys(res.data).length > 0) {
      dataOutput = res.data
    }

    berita.value = dataOutput
  } catch (err) {
    console.error(err)
    $q.notify({
      color: 'negative',
      message: 'Gagal memuat detail berita',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
})

// Formatting method string dates
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

// Convert image url
const getImageUrl = (foto) => {
  if (!foto) return 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=400&h=300&auto=format&fit=crop'
  return `https://server-web.konaweselatankab.go.id/uploads/${foto}` 
}
</script>

<style scoped>
.rounded-card {
  border-radius: 12px;
}
.shadow-mini {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.lh-1-4 {
  line-height: 1.4;
}
.lh-1-6 {
  line-height: 1.6;
}
.pb-10 {
  padding-bottom: 40px;
}

/* Mempercantik konten HTML dari database CKEditor/TinyMCE */
.berita-content :deep(p) {
  margin-bottom: 1rem;
}
.berita-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
}
</style>
