<template>
  <q-page class="berita-bg">
    <!-- HEADER -->
    <!-- TEAM STANDARD HEADER (Clean Style) -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="header-title q-ml-sm text-uppercase text-dark">Berita CSR</div>
    </div>

    <div class="main-content">
      <!-- SEARCH -->
      <q-input
        v-model="searchQuery"
        outlined dense
        placeholder="Cari berita..."
        bg-color="white"
        class="q-mb-md search-input"
        @update:model-value="debouncedSearch"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey-5" />
        </template>
      </q-input>

      <!-- LOADING -->
      <div v-if="loading">
        <div v-for="n in 3" :key="'skel-'+n" class="row q-mb-md news-skel">
          <div class="col-4">
            <q-skeleton type="rect" height="90px" class="rounded-borders" />
          </div>
          <div class="col-8 q-pl-md">
            <q-skeleton type="text" width="80%" />
            <q-skeleton type="text" width="50%" class="q-mt-xs" />
          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div v-else-if="newsList.length === 0" class="text-center q-py-xl">
        <q-icon name="article" size="64px" color="grey-4" />
        <div class="text-grey-5 q-mt-md">Belum ada berita CSR</div>
      </div>

      <!-- NEWS LIST -->
      <div v-else>
        <div v-for="item in newsList" :key="item.id" class="news-card q-mb-md" @click="goDetail(item.id)">
          <div class="row items-start">
            <div class="col-4">
              <q-img
                :src="getImage(item)"
                ratio="1"
                class="news-img"
              />
            </div>
            <div class="col-8 q-pl-md column justify-between" style="min-height: 90px;">
              <div>
                <div class="news-title">{{ item.judul }}</div>
                <div class="news-source" v-if="item.sumber">{{ item.sumber }}</div>
              </div>
              <div class="q-mt-xs">
                <q-chip color="teal-1" text-color="teal-8" size="sm" class="q-ma-none text-weight-bold" square>
                  {{ formatDate(item.createAt) }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>

        <!-- PAGINATION -->
        <div class="row justify-center q-mt-md q-mb-xl" v-if="totalPages > 1">
          <q-btn flat round dense icon="chevron_left" :disable="currentPage <= 1" @click="fetchBerita(currentPage - 1)" />
          <div class="row items-center q-mx-sm">
            <span class="text-grey-7" style="font-size: 13px;">{{ currentPage }} / {{ totalPages }}</span>
          </div>
          <q-btn flat round dense icon="chevron_right" :disable="currentPage >= totalPages" @click="fetchBerita(currentPage + 1)" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CsrService } from 'src/services/csr.service'

const router = useRouter()

const loading = ref(false)
const newsList = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(0)
const pageLimit = 10

let debounceTimer = null
const debouncedSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchBerita(1), 300)
}

const fetchBerita = async (page = 1) => {
  loading.value = true
  try {
    const res = await CsrService.getBeritaCSR({
      data_ke: page,
      page_limit: pageLimit,
      cari_value: searchQuery.value || ''
    })
    const data = res.data
    newsList.value = data.data || []
    totalPages.value = Math.ceil((data.total || 0) / pageLimit)
    currentPage.value = page
  } catch(err) {
    console.error('Gagal fetch berita CSR:', err)
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
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

const goDetail = (id) => {
  router.push('/csr_berita_detail/' + id)
}

onMounted(() => {
  fetchBerita()
})
</script>

<style scoped>
.berita-bg {
  background: #f0fdf4;
  min-height: 100vh;
}

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

.main-content {
  padding: 16px;
}

.search-input :deep(.q-field__control) {
  border-radius: 14px;
}

.news-card {
  background: white;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s;
}
.news-card:active {
  transform: scale(0.98);
}

.news-img {
  border-radius: 10px;
}

.news-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-source {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}
</style>
