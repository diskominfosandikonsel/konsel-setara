<template>
  <q-page class="daftar-rup-page bg-grey-1">
    <!-- Header App Bar -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.back()" />
        <q-toolbar-title class="text-subtitle1 text-weight-bold">
          Daftar RUP Konsel
        </q-toolbar-title>
        <q-btn flat round dense icon="filter_alt" @click="showFilterDialog = true" />
      </q-toolbar>

      <!-- Search Bar -->
      <div class="q-px-md q-pb-md">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          bg-color="white"
          placeholder="Cari nama paket pengadaan..."
          class="search-input"
          clearable
          @update:model-value="onSearchChange"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" />
          </template>
        </q-input>
      </div>
    </q-header>

    <div class="q-pa-md content-container">
      <!-- Filter Chips -->
      <div class="row q-gutter-xs q-mb-md">
        <q-chip
          clickable
          :outline="selectedMetode !== 'Semua'"
          color="primary"
          text-color="white"
          @click="selectedMetode = 'Semua'"
          size="sm"
        >
          Semua
        </q-chip>
        <q-chip
          v-for="metode in metodeList"
          :key="metode"
          clickable
          :outline="selectedMetode !== metode"
          color="primary"
          text-color="white"
          @click="selectedMetode = metode"
          size="sm"
        >
          {{ metode }}
        </q-chip>
      </div>

      <!-- Info Sumber Data + Total -->
      <div class="row justify-between items-center q-mb-sm text-caption text-grey-7">
        <span>
          Menampilkan <strong>{{ filteredPaket.length }}</strong> Paket Pengadaan
        </span>
        <div class="row items-center q-gutter-xs">
          <q-badge
            v-if="dataSource === 'inaproc'"
            color="positive"
            class="text-weight-bold"
          >
            <q-icon name="cloud_done" size="10px" class="q-mr-xs" /> Live
          </q-badge>
          <q-badge
            v-else-if="dataSource === 'lokal'"
            color="orange-7"
            class="text-weight-bold"
          >
            <q-icon name="storage" size="10px" class="q-mr-xs" /> Lokal
          </q-badge>
          <span>T.A. {{ selectedTahun }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="q-gutter-y-sm">
        <q-card v-for="n in 5" :key="n" class="rup-item-card rounded-borders">
          <q-card-section class="q-pa-sm">
            <q-skeleton type="rect" height="16px" width="60%" class="q-mb-sm" />
            <q-skeleton type="rect" height="14px" width="100%" class="q-mb-xs" />
            <q-skeleton type="rect" height="14px" width="80%" class="q-mb-sm" />
            <q-skeleton type="rect" height="12px" width="50%" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="text-center q-pa-xl">
        <q-icon name="cloud_off" size="64px" color="orange-5" />
        <div class="text-subtitle2 text-weight-bold q-mt-sm text-grey-8">Gagal Memuat Data</div>
        <div class="text-caption text-grey-6 q-mb-md">{{ loadError }}</div>
        <q-btn unelevated color="primary" label="Coba Lagi" icon="refresh" @click="fetchData" />
      </div>

      <!-- List of RUP Packages -->
      <div v-else-if="filteredPaket.length > 0" class="q-gutter-y-sm">
        <q-card
          v-for="item in filteredPaket"
          :key="item.kode_rup || item.id"
          class="rup-item-card rounded-borders shadow-1"
          @click="openDetail(item)"
        >
          <q-card-section class="q-pa-sm">
            <div class="row justify-between items-start no-wrap q-mb-xs">
              <q-badge
                :color="getMetodeBadgeColor(item.metode)"
                class="q-px-sm q-py-xs text-weight-bold"
              >
                {{ item.metode || 'Penyedia' }}
              </q-badge>
              <span class="text-caption text-weight-bold text-primary">
                {{ formatRupiah(item.pagu) }}
              </span>
            </div>

            <div class="text-subtitle2 text-weight-bold text-grey-9 q-mt-xs line-clamp-2">
              {{ item.nama_paket }}
            </div>

            <div class="row items-center text-caption text-grey-7 q-mt-xs">
              <q-icon name="apartment" size="14px" class="q-mr-xs text-grey-6" />
              <span class="ellipsis">{{ item.opd }}</span>
            </div>

            <div class="row justify-between items-center text-caption text-grey-6 q-mt-sm pt-1 border-top">
              <span>Kode RUP: <strong>{{ item.kode_rup }}</strong></span>
              <span class="text-blue-8 text-weight-bold row items-center">
                Detail <q-icon name="chevron_right" size="14px" />
              </span>
            </div>
          </q-card-section>
        </q-card>

        <!-- Tombol Load More -->
        <div v-if="hasMore" class="text-center q-mt-md">
          <q-btn
            outline
            color="primary"
            :loading="isLoadingMore"
            label="Muat Lebih Banyak"
            @click="loadMore"
            class="full-width"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center q-pa-xl text-grey-6">
        <q-icon name="search_off" size="64px" color="grey-4" />
        <div class="text-subtitle2 text-weight-bold q-mt-sm">Paket tidak ditemukan</div>
        <div class="text-caption">Coba ubah kata kunci atau filter pencarian Anda.</div>
      </div>
    </div>

    <!-- Dialog Detail RUP -->
    <q-dialog v-model="detailDialog">
      <q-card v-if="selectedItem" style="min-width: 320px; max-width: 480px; width: 100%; border-radius: 16px;">
        <q-card-section class="bg-primary text-white row items-center justify-between">
          <div class="text-subtitle1 text-weight-bold">Detail Paket Pengadaan</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md q-gutter-y-sm">
          <div>
            <div class="text-caption text-grey-6">Nama Paket</div>
            <div class="text-subtitle2 text-weight-bold text-grey-9">{{ selectedItem.nama_paket }}</div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-6">Kode RUP</div>
              <div class="text-body2 text-weight-bold">{{ selectedItem.kode_rup }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Tahun Anggaran</div>
              <div class="text-body2 text-weight-bold">{{ selectedItem.tahun }}</div>
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-6">Satuan Kerja / OPD</div>
            <div class="text-body2 text-weight-medium">{{ selectedItem.opd }}</div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-6">Metode Pemilihan</div>
              <q-badge :color="getMetodeBadgeColor(selectedItem.metode)">
                {{ selectedItem.metode }}
              </q-badge>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Sumber Dana</div>
              <div class="text-body2 text-weight-bold">{{ selectedItem.sumber_dana }}</div>
            </div>
          </div>

          <div v-if="selectedItem.jenis" class="row">
            <div class="col-12">
              <div class="text-caption text-grey-6">Jenis Pengadaan</div>
              <div class="text-body2">{{ selectedItem.jenis }}</div>
            </div>
          </div>

          <div class="q-pa-sm bg-blue-1 rounded-borders q-mt-md">
            <div class="text-caption text-blue-9">Pagu Anggaran</div>
            <div class="text-h6 text-weight-bolder text-primary">
              {{ formatRupiah(selectedItem.pagu) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Tutup" color="grey-8" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            icon="open_in_new"
            label="Buka SiRUP LKPP"
            @click="openSirup(selectedItem.kode_rup)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Filter -->
    <q-dialog v-model="showFilterDialog">
      <q-card style="min-width: 300px; border-radius: 16px;">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold">Filter Paket RUP</div>
        </q-card-section>

        <q-card-section class="q-pt-none q-gutter-y-md">
          <q-select
            v-model="selectedTahun"
            :options="['2026', '2025', '2024', '2023', '2022']"
            label="Tahun Anggaran"
            outlined
            dense
            @update:model-value="onTahunChange"
          />
          <q-select
            v-model="selectedOpdFilter"
            :options="opdOptions"
            label="Satuan Kerja"
            outlined
            dense
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            @filter="filterOpd"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Reset" color="negative" @click="resetFilter" />
          <q-btn unelevated color="primary" label="Terapkan" v-close-popup @click="applyFilter" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getDaftarRup } from 'src/api/apiRup'

export default {
  name: 'DaftarRupPage',
  setup() {
    const searchQuery = ref('')
    const selectedMetode = ref('Semua')
    const selectedTahun = ref('2025')
    const selectedOpdFilter = ref('Semua OPD')
    const showFilterDialog = ref(false)
    const detailDialog = ref(false)
    const selectedItem = ref(null)
    const isLoading = ref(false)
    const isLoadingMore = ref(false)
    const loadError = ref('')
    const dataSource = ref('')
    const allPaket = ref([])
    const currentPage = ref(1)
    const hasMore = ref(false)
    const opdList = ref(['Semua OPD'])
    const opdOptions = ref(['Semua OPD'])

    const metodeList = ['E-Purchasing', 'Tender', 'Pengadaan Langsung', 'Swakelola']

    const filteredPaket = computed(() => {
      return allPaket.value.filter((item) => {
        const q = searchQuery.value?.toLowerCase() || ''
        const matchesQuery = !q ||
          (item.nama_paket || '').toLowerCase().includes(q) ||
          (item.opd || '').toLowerCase().includes(q) ||
          String(item.kode_rup || '').includes(q)

        const matchesMetode = selectedMetode.value === 'Semua' ||
          (item.metode || '').includes(selectedMetode.value)

        const matchesOpd = selectedOpdFilter.value === 'Semua OPD' ||
          (item.opd || '') === selectedOpdFilter.value

        return matchesQuery && matchesMetode && matchesOpd
      })
    })

    const fetchData = async (page = 1, append = false) => {
      if (page === 1) {
        isLoading.value = true
        loadError.value = ''
      } else {
        isLoadingMore.value = true
      }

      try {
        const result = await getDaftarRup({
          tahun: selectedTahun.value,
          page,
          limit: 20
        })

        if (result.success) {
          const newData = result.data || []
          if (append) {
            allPaket.value = [...allPaket.value, ...newData]
          } else {
            allPaket.value = newData
            // Build OPD list
            const opds = ['Semua OPD', ...new Set(newData.map(d => d.opd).filter(Boolean))]
            opdList.value = opds
            opdOptions.value = [...opds]
          }
          dataSource.value = result.source || 'lokal'
          currentPage.value = page
          hasMore.value = result.total > allPaket.value.length
        } else {
          loadError.value = result.error || 'Gagal memuat data RUP'
        }
      } catch (err) {
        loadError.value = err.message || 'Terjadi kesalahan saat memuat data'
      } finally {
        isLoading.value = false
        isLoadingMore.value = false
      }
    }

    const loadMore = () => {
      fetchData(currentPage.value + 1, true)
    }

    const onTahunChange = () => {
      selectedOpdFilter.value = 'Semua OPD'
      currentPage.value = 1
      fetchData(1, false)
    }

    const applyFilter = () => {
      fetchData(1, false)
    }

    const onSearchChange = () => {
      // Search dilakukan client-side, tidak perlu fetch ulang
    }

    const filterOpd = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        opdOptions.value = opdList.value.filter(v => v.toLowerCase().includes(needle))
      })
    }

    const getMetodeBadgeColor = (metode) => {
      const m = (metode || '').toLowerCase()
      if (m.includes('tender')) return 'deep-orange-7'
      if (m.includes('e-purchasing') || m.includes('epurchasing') || m.includes('e purchasing')) return 'primary'
      if (m.includes('langsung')) return 'teal-7'
      if (m.includes('swakelola')) return 'purple-7'
      return 'grey-7'
    }

    const formatRupiah = (val) => {
      if (!val) return 'Rp 0'
      const n = Number(val)
      if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`
      if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)} Jt`
      return 'Rp ' + n.toLocaleString('id-ID')
    }

    const openDetail = (item) => {
      selectedItem.value = item
      detailDialog.value = true
    }

    const openSirup = (kodeRup) => {
      const url = `https://sirup.lkpp.go.id/sirup/ro/cari?koderup=${kodeRup}`
      window.open(url, '_blank')
    }

    const resetFilter = () => {
      selectedTahun.value = '2025'
      selectedOpdFilter.value = 'Semua OPD'
      selectedMetode.value = 'Semua'
      showFilterDialog.value = false
      fetchData(1, false)
    }

    onMounted(() => {
      fetchData(1, false)
    })

    return {
      searchQuery,
      selectedMetode,
      selectedTahun,
      selectedOpdFilter,
      metodeList,
      filteredPaket,
      showFilterDialog,
      detailDialog,
      selectedItem,
      isLoading,
      isLoadingMore,
      loadError,
      dataSource,
      hasMore,
      opdOptions,
      getMetodeBadgeColor,
      formatRupiah,
      openDetail,
      openSirup,
      resetFilter,
      fetchData,
      loadMore,
      onTahunChange,
      applyFilter,
      onSearchChange,
      filterOpd
    }
  }
}
</script>

<style scoped lang="scss">
.daftar-rup-page {
  min-height: 100vh;
}

.content-container {
  max-width: 600px;
  margin: 0 auto;
}

.rup-item-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: scale(0.99);
  }
}

.border-top {
  border-top: 1px dashed #e2e8f0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
