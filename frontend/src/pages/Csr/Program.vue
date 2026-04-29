<template>
  <q-page class="program-bg">
    <!-- HEADER -->
    <div class="program-header">
      <div class="header-overlay"></div>
      <div class="row items-center q-pa-md relative-position z-top">
        <q-btn flat round icon="arrow_back" color="white" class="glass-btn" @click="$router.back()" />
        <div class="q-ml-md text-white text-weight-bold" style="font-size: 16px;">Program CSR</div>
      </div>
    </div>

    <div class="main-content">

      <!-- FILTER: Bidang CSR -->
      <div class="q-mb-md">
        <div class="text-weight-bold text-dark q-mb-sm" style="font-size: 14px;">Filter Bidang</div>
        <div class="filter-scroll">
          <q-chip
            :outline="!selectedBidang"
            :color="!selectedBidang ? 'teal' : 'grey-4'"
            :text-color="!selectedBidang ? 'white' : 'grey-7'"
            clickable
            @click="selectBidang(null)"
            class="filter-chip"
          >Semua</q-chip>
          <q-chip
            v-for="b in listBidang"
            :key="b.id"
            :outline="selectedBidang === b.id"
            :color="selectedBidang === b.id ? 'teal' : 'grey-4'"
            :text-color="selectedBidang === b.id ? 'white' : 'grey-7'"
            clickable
            @click="selectBidang(b.id)"
            class="filter-chip"
          >{{ b.uraian }}</q-chip>
        </div>
      </div>

      <!-- SEARCH -->
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Cari program CSR..."
        bg-color="white"
        class="q-mb-md search-input"
        @update:model-value="debouncedSearch"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey-5" />
        </template>
        <template v-slot:append>
          <q-icon v-if="searchQuery" name="close" class="cursor-pointer" color="grey-5" @click="searchQuery = ''; fetchPrograms(1)" />
        </template>
      </q-input>

      <!-- LOADING -->
      <div v-if="loading" class="q-mt-md">
        <div v-for="n in 3" :key="'skel-'+n" class="program-card-skeleton q-mb-md">
          <q-skeleton height="160px" class="rounded-borders" />
          <div class="q-pa-sm">
            <q-skeleton type="text" width="80%" />
            <q-skeleton type="text" width="50%" class="q-mt-xs" />
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="programs.length === 0" class="text-center q-py-xl">
        <q-icon name="eco" size="64px" color="grey-4" />
        <div class="text-grey-5 q-mt-md" style="font-size: 14px;">Belum ada program CSR</div>
      </div>

      <!-- PROGRAM LIST -->
      <div v-else>
        <div v-for="item in programs" :key="item.id" class="program-card q-mb-md" @click="goDetail(item.id)">
          <q-img
            :src="getImage(item)"
            height="160px"
            class="program-card-img"
          >
            <div class="absolute-bottom program-card-overlay">
              <q-chip
                :color="getStatusColor(item.status)"
                text-color="white"
                size="sm"
                dense
                class="q-ma-none"
              >{{ getStatusLabel(item.status) }}</q-chip>
            </div>
          </q-img>

          <div class="program-card-body">
            <div class="program-card-title">{{ item.nama_csr }}</div>
            <div class="program-card-meta">
              <span v-if="item.uraian_bidang_csr" class="meta-badge">{{ item.uraian_bidang_csr }}</span>
              <span v-if="item.uraian_bidang_sub_csr" class="meta-sub">{{ item.uraian_bidang_sub_csr }}</span>
            </div>
            <div class="program-card-info">
              <div class="info-item">
                <q-icon name="place" size="14px" color="grey-5" />
                <span>{{ item.nama_kecamatan || '-' }}, {{ item.nama_desa || '-' }}</span>
              </div>
              <div class="info-item" v-if="item.nilai">
                <q-icon name="payments" size="14px" color="teal" />
                <span class="text-teal-8 text-weight-bold">{{ formatRupiah(item.nilai) }} / {{ item.satuan }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PAGINATION -->
        <div class="row justify-center q-mt-md q-mb-xl" v-if="totalPages > 1">
          <q-btn flat round dense icon="chevron_left" :disable="currentPage <= 1" @click="fetchPrograms(currentPage - 1)" />
          <div class="row items-center q-mx-sm">
            <span class="text-grey-7" style="font-size: 13px;">{{ currentPage }} / {{ totalPages }}</span>
          </div>
          <q-btn flat round dense icon="chevron_right" :disable="currentPage >= totalPages" @click="fetchPrograms(currentPage + 1)" />
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
const programs = ref([])
const searchQuery = ref('')
const selectedBidang = ref(null)
const listBidang = ref([])
const currentPage = ref(1)
const totalPages = ref(0)
const pageLimit = 9

let debounceTimer = null
const debouncedSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchPrograms(1), 300)
}

const selectBidang = (id) => {
  selectedBidang.value = id
  fetchPrograms(1)
}

const fetchPrograms = async (page = 1) => {
  loading.value = true
  try {
    const payload = {
      page_limit: pageLimit,
      data_ke: page,
      cari_value: searchQuery.value || '',
      bidang_csr_id: selectedBidang.value || '',
    }
    const res = await CsrService.getKegiatanCSR(payload)
    const data = res.data
    programs.value = data.data || []
    totalPages.value = Math.ceil((data.total || 0) / pageLimit)
    currentPage.value = page
  } catch (err) {
    console.error('Gagal fetch program CSR:', err)
  } finally {
    loading.value = false
  }
}

const fetchBidang = async () => {
  try {
    const res = await CsrService.getBidangCSR()
    listBidang.value = res.data || []
  } catch (err) {
    console.error('Gagal fetch bidang CSR:', err)
  }
}

const getImage = (item) => {
  const url = CsrService.getImageUrl(item.file_name)
  return url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&auto=format'
}

const getStatusLabel = (status) => {
  const map = { 1: 'Program Baru', 2: 'Dalam Pengerjaan', 3: 'Sebagian', 4: 'Selesai' }
  return map[status] || 'Belum Diketahui'
}

const getStatusColor = (status) => {
  const map = { 1: 'amber-8', 2: 'blue', 3: 'blue-grey', 4: 'green' }
  return map[status] || 'grey'
}

const formatRupiah = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value)
}

const goDetail = (id) => {
  router.push('/csr_detail/' + id)
}

onMounted(() => {
  fetchBidang()
  fetchPrograms()
})
</script>

<style scoped>
.program-bg {
  background: #f0fdf4;
  min-height: 100vh;
}

.program-header {
  position: relative;
  background: linear-gradient(135deg, #065f46, #059669);
  padding-bottom: 12px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(6, 78, 59, 0.2), rgba(16, 185, 129, 0.1));
}

.glass-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
}

.main-content {
  padding: 16px;
}

.filter-scroll {
  display: flex;
  overflow-x: auto;
  gap: 6px;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.filter-scroll::-webkit-scrollbar { display: none; }

.filter-chip {
  flex-shrink: 0;
  font-weight: 600;
}

.search-input :deep(.q-field__control) {
  border-radius: 14px;
}

.program-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.program-card:active {
  transform: scale(0.98);
}

.program-card-img {
  border-radius: 18px 18px 0 0;
}

.program-card-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  padding: 10px 12px;
  display: flex;
  justify-content: flex-end;
}

.program-card-body {
  padding: 12px 14px 14px;
}

.program-card-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.program-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.meta-badge {
  background: #ecfdf5;
  color: #059669;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.meta-sub {
  color: #94a3b8;
  font-size: 11px;
}

.program-card-info {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.program-card-skeleton {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
</style>
