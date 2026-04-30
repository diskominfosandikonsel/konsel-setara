<template>
  <q-page class="detail-bg">
    <!-- TEAM STANDARD HEADER (Clean Style) -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="header-title q-ml-sm text-uppercase text-dark">Detail Berita</div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="q-pa-md">
      <q-skeleton height="200px" class="rounded-borders q-mb-md" />
      <q-skeleton type="text" width="80%" />
      <q-skeleton type="text" width="60%" />
    </div>

    <!-- DATA -->
    <div v-else-if="berita" class="q-pa-md">
      <q-img
        :src="getImage(berita)"
        height="200px"
        class="rounded-borders q-mb-md"
        style="border-radius: 18px;"
      />

      <div class="berita-title">{{ berita.judul }}</div>

      <div class="row items-center q-mt-xs q-mb-md q-gutter-sm">
        <q-chip color="teal-1" text-color="teal-8" size="sm" dense square>
          {{ formatDate(berita.createAt) }}
        </q-chip>
        <span v-if="berita.sumber" class="text-grey-5" style="font-size: 12px;">{{ berita.sumber }}</span>
        <span v-if="berita.createdBy" class="text-grey-5" style="font-size: 12px;">• {{ berita.createdBy }}</span>
      </div>

      <div v-if="berita.deskripsi" class="berita-desc q-mb-md">{{ berita.deskripsi }}</div>

      <div v-if="berita.isi" class="berita-content" v-html="berita.isi"></div>
    </div>

    <div v-else class="text-center q-pa-xl">
      <q-icon name="error_outline" size="64px" color="grey-4" />
      <div class="text-grey-5 q-mt-md">Berita tidak ditemukan</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CsrService } from 'src/services/csr.service'

const route = useRoute()
const loading = ref(true)
const berita = ref(null)

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await CsrService.getDetailBerita(route.params.id)
    berita.value = res.data?.data || null
  } catch(err) {
    console.error('Gagal fetch detail berita:', err)
  } finally {
    loading.value = false
  }
}

const getImage = (item) => {
  const url = CsrService.getImageUrl(item.file_name)
  return url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&auto=format'
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return dateStr }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.detail-bg { background: #f0fdf4; min-height: 100vh; }

/* ─── HEADER STANDAR (Clean Style) ─── */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}

.header-title {
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 1.5px;
}

.berita-title {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.4;
}

.berita-desc {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
  line-height: 1.5;
}

.berita-content {
  font-size: 14px;
  color: #334155;
  line-height: 1.7;
}

.berita-content :deep(img) {
  max-width: 100%;
  border-radius: 12px;
  margin: 8px 0;
}
</style>
