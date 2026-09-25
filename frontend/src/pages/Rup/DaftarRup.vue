<template>
  <q-page class="daftar-rup-page bg-grey-1">
    <!-- Header App Bar -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.back()" />
        <q-toolbar-title class="text-subtitle1 text-weight-bold">
          Daftar RUP Konsel
        </q-toolbar-title>
        <q-btn flat round dense icon="refresh" :loading="isLoading" @click="refreshPage">
          <q-tooltip>Refresh Data RUP</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="filter_alt" @click="showFilterDialog = true">
          <q-badge
            v-if="isFilterActive"
            color="amber-7"
            floating
            rounded
          />
        </q-btn>
      </q-toolbar>

      <!-- Search Bar -->
      <div class="q-px-md q-pb-md">
        <q-input
          v-model="searchQuery"
          dense
          outlined
          bg-color="white"
          placeholder="Cari nama paket atau kode RUP (cth: 58616940)..."
          class="search-input"
          clearable
          @update:model-value="onSearchInput"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="grey-6" />
          </template>
          <template v-slot:append v-if="isSearching">
            <q-spinner color="primary" size="18px" />
          </template>
        </q-input>
      </div>
    </q-header>

    <q-pull-to-refresh @refresh="onPullRefresh">
      <div class="q-pa-md content-container">
        <!-- Stat Ringkasan Card -->
        <q-card class="stat-card q-mb-md text-white shadow-2">
          <q-card-section class="q-pa-md">
            <div class="row justify-between items-center q-mb-xs">
              <div class="row items-center q-gutter-x-xs">
                <span class="pulse-indicator"></span>
                <span class="text-caption text-weight-bold uppercase tracking-wider text-blue-1">
                  DATA LIVE INAPROC
                </span>
              </div>
              <q-badge color="white" text-color="primary" class="text-weight-bold q-px-sm">
                T.A. {{ selectedTahun }}
              </q-badge>
            </div>

            <div class="row q-col-gutter-sm q-mt-xs items-end">
              <div class="col-7">
                <div class="text-caption text-blue-2">Total Pagu Anggaran</div>
                <div class="text-h6 text-weight-bolder text-white stat-number">
                  {{ formatRupiahSingkat(summaryData.total_pagu) }}
                </div>
              </div>
              <div class="col-5 text-right">
                <div class="text-caption text-blue-2">Total Paket</div>
                <div class="text-h6 text-weight-bolder text-white stat-number">
                  {{ (summaryData.total_rup || totalItems).toLocaleString('id-ID') }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>


        <!-- Info Hasil Filter + Active Filter Badges -->
        <div class="row justify-between items-center q-mb-sm text-caption text-grey-7">
          <span>
            Menampilkan <strong>{{ allPaket.length }}</strong> dari
            <strong>{{ totalItems.toLocaleString('id-ID') }}</strong> paket
          </span>
          <div class="row q-gutter-xs items-center">
            <q-badge v-if="selectedCara !== 'Semua'" color="indigo-2" text-color="indigo-9" class="text-weight-medium">
              {{ selectedCara }}
            </q-badge>
            <q-badge v-if="selectedMetode !== 'Semua'" color="blue-2" text-color="blue-9" class="text-weight-medium">
              {{ selectedMetode }}
            </q-badge>
            <q-badge v-if="selectedJenis !== 'Semua'" color="orange-2" text-color="orange-9" class="text-weight-medium">
              {{ jenisList.find(j => j.kode === selectedJenis)?.nama || selectedJenis }}
            </q-badge>
            <q-btn
              v-if="selectedCara !== 'Semua' || selectedMetode !== 'Semua' || selectedJenis !== 'Semua'"
              flat round dense size="xs" icon="close" color="grey-7"
              @click="resetFilter"
            >
              <q-tooltip>Reset filter</q-tooltip>
            </q-btn>
          </div>
        </div>


        <!-- Loading State Skeletons -->
        <div v-if="isLoading" class="q-gutter-y-sm">
          <q-card v-for="n in 6" :key="n" class="rup-item-card rounded-borders">
            <q-card-section class="q-pa-md">
              <div class="row justify-between q-mb-sm">
                <q-skeleton type="rect" height="20px" width="90px" />
                <q-skeleton type="rect" height="18px" width="100px" />
              </div>
              <q-skeleton type="rect" height="16px" width="100%" class="q-mb-xs" />
              <q-skeleton type="rect" height="16px" width="75%" class="q-mb-sm" />
              <q-skeleton type="rect" height="14px" width="60%" />
            </q-card-section>
          </q-card>
        </div>

        <!-- Error State -->
        <div v-else-if="loadError" class="text-center q-pa-xl">
          <q-icon name="cloud_off" size="56px" color="negative" />
          <div class="text-subtitle1 text-weight-bold q-mt-sm text-grey-9">Data RUP Tidak Dapat Dimuat</div>
          <div class="text-caption text-grey-6 q-mb-md">{{ loadError }}</div>
          <q-btn
            unelevated
            color="primary"
            label="Refresh Halaman"
            icon="refresh"
            class="q-px-lg shadow-1"
            :loading="isLoading"
            @click="refreshPage"
          />
        </div>

        <!-- List of RUP Packages -->
        <div v-else-if="allPaket.length > 0" class="q-gutter-y-sm">
          <q-card
            v-for="item in allPaket"
            :key="item.kode_rup || item.id"
            class="rup-item-card rounded-borders shadow-1"
            @click="openDetail(item)"
          >
            <q-card-section class="q-pa-md">
              <!-- Top Row: Cara + Metode Badge + PDN Badge + Pagu -->
              <div class="row justify-between items-start no-wrap q-mb-xs">
                <div class="row items-center q-gutter-x-xs no-wrap ellipsis badge-row">
                  <q-badge
                    :color="item.cara_pengadaan === 'Swakelola' ? 'teal-7' : getMetodeBadgeColor(item.metode)"
                    class="q-px-sm q-py-xs text-weight-bold metode-badge"
                  >
                    {{ item.cara_pengadaan === 'Swakelola' ? 'Swakelola' : (item.metode || 'Penyedia') }}
                  </q-badge>
                  <q-badge
                    v-if="item.jenis"
                    :color="getJenisBadgeColor(item.jenis)"
                    outline
                    class="text-weight-medium jenis-badge ellipsis"
                  >
                    {{ item.jenis }}
                  </q-badge>
                </div>
                <div class="text-right harga-container">
                  <span class="text-subtitle2 text-weight-bolder text-primary no-wrap harga-text">
                    {{ formatRupiah(item.pagu) }}
                  </span>
                </div>
              </div>

              <!-- Nama Paket -->
              <div class="text-subtitle2 text-weight-bold text-grey-9 q-mt-xs line-clamp-2">
                {{ item.nama_paket }}
              </div>

              <!-- OPD / Satker -->
              <div class="row items-center text-caption text-grey-7 q-mt-xs">
                <q-icon name="apartment" size="14px" class="q-mr-xs text-grey-5 flex-shrink-0" />
                <span class="ellipsis">{{ item.opd }}</span>
              </div>

              <!-- Footer Bar -->
              <div class="row justify-between items-center text-caption text-grey-6 q-mt-sm pt-2 border-top">
                <span>Kode RUP: <strong class="text-grey-8">{{ item.kode_rup }}</strong></span>
                <span class="text-primary text-weight-bold row items-center">
                  Detail <q-icon name="chevron_right" size="16px" />
                </span>
              </div>
            </q-card-section>
          </q-card>

          <!-- Tombol Muat Lebih Banyak (Load More) -->
          <div v-if="hasMore" class="text-center q-mt-md q-mb-lg">
            <q-btn
              outline
              color="primary"
              :loading="isLoadingMore"
              label="Muat Lebih Banyak"
              icon-right="expand_more"
              @click="loadMore"
              class="full-width load-more-btn"
            />
          </div>
          <div v-else class="text-center text-caption text-grey-5 q-mt-md q-mb-lg">
            Semua paket telah ditampilkan ({{ totalItems.toLocaleString('id-ID') }} paket)
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center q-pa-xl text-grey-6">
          <q-icon name="search_off" size="64px" color="grey-4" />
          <div class="text-subtitle2 text-weight-bold q-mt-sm">Paket Tidak Ditemukan</div>
          <div class="text-caption q-mb-md">
            {{ searchQuery ? `Tidak ditemukan paket atau kode RUP "${searchQuery}" pada T.A. ${selectedTahun}.` : 'Coba ubah kata kunci atau ganti filter kategori.' }}
          </div>
          <q-btn flat color="primary" label="Reset Pencarian" @click="resetFilter" />
        </div>
      </div>
    </q-pull-to-refresh>

    <!-- Dialog Detail RUP -->
    <q-dialog v-model="detailDialog" position="bottom" class="detail-dialog">
      <q-card v-if="selectedItem" class="detail-sheet-card">
        <q-card-section class="bg-primary text-white row items-center justify-between q-py-sm">
          <div class="text-subtitle1 text-weight-bold">Detail Paket RUP</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-md q-gutter-y-sm">
          <div>
            <div class="text-caption text-grey-6">Nama Paket</div>
            <div class="text-subtitle1 text-weight-bold text-grey-9 q-mt-xs">
              {{ selectedItem.nama_paket }}
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-6">Kode RUP</div>
              <div class="row items-center q-gutter-x-xs q-mt-xs">
                <span class="text-body2 text-weight-bold text-grey-9">{{ selectedItem.kode_rup }}</span>
                <q-btn flat round dense size="xs" icon="content_copy" @click="copyKodeRup(selectedItem.kode_rup)">
                  <q-tooltip>Salin Kode RUP</q-tooltip>
                </q-btn>
              </div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Tahun Anggaran</div>
              <div class="text-body2 text-weight-bold text-grey-9 q-mt-xs">
                {{ selectedItem.tahun }}
              </div>
            </div>
          </div>

          <div>
            <div class="text-caption text-grey-6">Satuan Kerja / OPD</div>
            <div class="text-body2 text-weight-medium text-grey-9 q-mt-xs">
              {{ selectedItem.opd }}
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-6">Metode Pemilihan</div>
              <q-badge :color="getMetodeBadgeColor(selectedItem.metode)" class="q-mt-xs text-weight-bold">
                {{ selectedItem.metode }}
              </q-badge>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Sumber Dana</div>
              <div class="text-body2 text-weight-bold text-grey-9 q-mt-xs">
                {{ selectedItem.sumber_dana }}
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-6">Jenis Pengadaan</div>
              <div class="text-body2 text-grey-9 q-mt-xs">
                {{ selectedItem.jenis || '-' }}
              </div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6">Produk Dalam Negeri</div>
              <div class="text-body2 text-weight-bold text-grey-9 q-mt-xs">
                {{ selectedItem.pdn === 'Ya' ? 'Ya (PDN)' : 'Tidak' }}
              </div>
            </div>
          </div>

          <!-- Highlight Pagu -->
          <div class="q-pa-md bg-blue-1 rounded-borders q-mt-sm">
            <div class="text-caption text-blue-9 font-weight-medium">Pagu Anggaran Paket</div>
            <div class="text-h6 text-weight-bolder text-primary">
              {{ formatRupiahLengkap(selectedItem.pagu) }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="between" class="q-pa-md border-top">
          <q-btn flat label="Tutup" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            icon="open_in_new"
            label="Buka di SiRUP LKPP"
            @click="openSirup(selectedItem.kode_rup)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog Filter -->
    <q-dialog v-model="showFilterDialog">
      <q-card style="min-width: 320px; max-width: 400px; width: 100%; border-radius: 16px;">
        <q-card-section class="row justify-between items-center q-pb-none">
          <div class="text-subtitle1 text-weight-bold">Filter Paket RUP</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-y-md q-pt-md">
          <q-select
            v-model="tempTahun"
            :options="opsiTahun"
            label="Tahun Anggaran"
            outlined
            dense
          />

          <q-select
            v-model="tempCara"
            :options="caraPengadaanList.map(c => ({ label: c.nama, value: c.kode }))"
            label="Cara Pengadaan"
            outlined
            dense
            emit-value
            map-options
          />

          <q-select
            v-if="tempCara !== 'Swakelola'"
            v-model="tempMetode"
            :options="['Semua', ...metodeList]"
            label="Metode Pemilihan"
            outlined
            dense
          />

          <q-select
            v-model="tempJenis"
            :options="[{ label: 'Semua Jenis', value: 'Semua' }, ...jenisList.map(j => ({ label: j.nama, value: j.kode }))]"
            label="Jenis Pengadaan"
            outlined
            dense
            emit-value
            map-options
          />

          <q-select
            v-model="tempOpdFilter"
            :options="opdOptions"
            label="Satuan Kerja / OPD"
            outlined
            dense
            use-input
            fill-input
            hide-selected
            input-debounce="0"
            @filter="filterOpdOptions"
          />
        </q-card-section>

        <q-card-actions align="between" class="q-pa-md">
          <q-btn flat label="Reset" color="negative" @click="resetFilter" />
          <q-btn unelevated color="primary" label="Terapkan" @click="applyFilterDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useQuasar, copyToClipboard } from 'quasar'
import { getDaftarRup, getRupSummary } from 'src/api/apiRup'

export default {
  name: 'DaftarRupPage',
  setup() {
    const $q = useQuasar()

    const currentYear = String(new Date().getFullYear())
    const tahunSekarangNum = new Date().getFullYear()
    const opsiTahun = [
      String(tahunSekarangNum),
      String(tahunSekarangNum - 1),
      String(tahunSekarangNum - 2),
      String(tahunSekarangNum - 3),
      String(tahunSekarangNum - 4)
    ]

    const searchQuery = ref('')
    const isSearching = ref(false)
    let searchDebounceTimer = null

    const selectedCara = ref('Semua')   // Semua | Penyedia | Swakelola
    const selectedMetode = ref('Semua') // Semua | Tender | Pengadaan Langsung | E-Purchasing | Penunjukan Langsung
    const selectedJenis = ref('Semua')  // Semua | Barang | Jasa Konsultansi | Jasa Lainnya | Pekerjaan Konstruksi
    const selectedTahun = ref(currentYear)
    const tempCara = ref('Semua')
    const tempTahun = ref(currentYear)
    const tempMetode = ref('Semua')
    const tempJenis = ref('Semua')
    const selectedOpdFilter = ref('Semua OPD')
    const tempOpdFilter = ref('Semua OPD')

    const isFilterActive = computed(() => {
      return selectedTahun.value !== currentYear ||
        selectedOpdFilter.value !== 'Semua OPD' ||
        selectedCara.value !== 'Semua' ||
        selectedMetode.value !== 'Semua' ||
        selectedJenis.value !== 'Semua'
    })

    const showFilterDialog = ref(false)
    const detailDialog = ref(false)
    const selectedItem = ref(null)

    const isLoading = ref(false)
    const isLoadingMore = ref(false)
    const loadError = ref('')
    const dataSource = ref('inaproc-live')

    const allPaket = ref([])
    const totalItems = ref(0)
    const currentPage = ref(1)
    const hasMore = ref(false)

    // Nilai default 0 — tidak menggunakan data dummy
    const summaryData = ref({
      total_rup: 0,
      total_pagu: 0
    })

    const opdList = ref(['Semua OPD'])
    const opdOptions = ref(['Semua OPD'])

    // Cara pengadaan: dua pilihan utama di INAPROC
    const caraPengadaanList = [
      { kode: 'Semua', nama: 'Semua' },
      { kode: 'Penyedia', nama: 'Pengadaan Penyedia' },
      { kode: 'Swakelola', nama: 'Pengadaan Swakelola' }
    ]

    // Metode pemilihan hanya berlaku untuk Penyedia (tidak ada di Swakelola)
    const metodeList = ['Tender', 'Pengadaan Langsung', 'E-Purchasing', 'Penunjukan Langsung']

    // Jenis pengadaan berdasarkan data nyata INAPROC Konawe Selatan
    const jenisList = [
      { kode: 'Pekerjaan Konstruksi', nama: 'Konstruksi' },
      { kode: 'Barang', nama: 'Barang' },
      { kode: 'Jasa Konsultansi', nama: 'Jasa Konsultansi' },
      { kode: 'Jasa Lainnya', nama: 'Jasa Lainnya' }
    ]

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
          limit: 20,
          cara: selectedCara.value === 'Semua' ? '' : selectedCara.value,
          metode: selectedMetode.value === 'Semua' ? '' : selectedMetode.value,
          jenis: selectedJenis.value === 'Semua' ? '' : selectedJenis.value,
          search: searchQuery.value || '',
          satker: selectedOpdFilter.value === 'Semua OPD' ? '' : selectedOpdFilter.value
        })

        if (result.success) {
          const newData = result.data || []
          if (append) {
            allPaket.value = [...allPaket.value, ...newData]
          } else {
            allPaket.value = newData

            // Ekstrak daftar unik Satker jika belum terisi banyak
            if (opdList.value.length <= 1) {
              const opds = ['Semua OPD', ...new Set(newData.map(d => d.opd).filter(Boolean))]
              opdList.value = opds
              opdOptions.value = [...opds]
            }
          }

          dataSource.value = result.source || 'inaproc-live'
          totalItems.value = result.total || allPaket.value.length
          currentPage.value = page
          hasMore.value = allPaket.value.length < totalItems.value
        } else {
          allPaket.value = []
          totalItems.value = 0
          const errMsg = result.error || 'Gagal memuat data RUP dari INAPROC. Periksa koneksi internet Anda.'
          loadError.value = errMsg
          $q.notify({
            type: 'negative',
            message: errMsg,
            caption: 'Ketuk tombol Refresh untuk mencoba memuat kembali',
            position: 'top',
            icon: 'wifi_off',
            timeout: 6000,
            actions: [
              {
                label: 'Refresh',
                color: 'white',
                class: 'text-weight-bold',
                handler: () => {
                  refreshPage()
                }
              }
            ]
          })
        }
      } catch (err) {
        allPaket.value = []
        totalItems.value = 0
        const errMsg = err.message || 'Terjadi kesalahan saat memuat data RUP'
        loadError.value = errMsg
        $q.notify({
          type: 'negative',
          message: errMsg,
          caption: 'Ketuk tombol Refresh untuk mencoba memuat kembali',
          position: 'top',
          icon: 'error_outline',
          timeout: 6000,
          actions: [
            {
              label: 'Refresh',
              color: 'white',
              class: 'text-weight-bold',
              handler: () => {
                refreshPage()
              }
            }
          ]
        })
      } finally {
        isLoading.value = false
        isLoadingMore.value = false
        isSearching.value = false
      }
    }

    const refreshPage = async () => {
      loadError.value = ''
      await Promise.all([
        fetchData(1, false),
        loadSummary()
      ])
      if (!loadError.value) {
        $q.notify({
          type: 'positive',
          message: 'Data RUP berhasil dimuat ulang',
          position: 'top',
          timeout: 1500
        })
      }
    }

    const loadSummary = async () => {
      try {
        const res = await getRupSummary(selectedTahun.value)
        if (res && res.success) {
          summaryData.value = {
            total_rup: res.total_rup || 0,
            total_pagu: res.total_pagu || 0
          }
        } else {
          summaryData.value = { total_rup: 0, total_pagu: 0 }
        }
      } catch (e) {
        summaryData.value = { total_rup: 0, total_pagu: 0 }
        console.warn('Gagal memuat summary RUP:', e)
      }
    }

    const loadMore = () => {
      if (!isLoadingMore.value && hasMore.value) {
        fetchData(currentPage.value + 1, true)
      }
    }

    const onPullRefresh = async (done) => {
      await Promise.all([fetchData(1, false), loadSummary()])
      done()
    }

    const onSearchInput = () => {
      isSearching.value = true
      clearTimeout(searchDebounceTimer)
      searchDebounceTimer = setTimeout(() => {
        currentPage.value = 1
        fetchData(1, false)
      }, 450)
    }

    const onSelectCara = (cara) => {
      if (selectedCara.value === cara) return
      selectedCara.value = cara
      // Reset metode saat ganti cara
      if (cara === 'Swakelola') selectedMetode.value = 'Semua'
      currentPage.value = 1
      fetchData(1, false)
    }

    const onSelectMetode = (metode) => {
      if (selectedMetode.value === metode) return
      selectedMetode.value = metode
      currentPage.value = 1
      fetchData(1, false)
    }

    const onSelectJenis = (jenis) => {
      if (selectedJenis.value === jenis) return
      selectedJenis.value = jenis
      currentPage.value = 1
      fetchData(1, false)
    }

    const applyFilterDialog = () => {
      selectedTahun.value = tempTahun.value
      selectedCara.value = tempCara.value
      selectedMetode.value = tempCara.value === 'Swakelola' ? 'Semua' : tempMetode.value
      selectedJenis.value = tempJenis.value
      selectedOpdFilter.value = tempOpdFilter.value
      showFilterDialog.value = false
      currentPage.value = 1
      fetchData(1, false)
      loadSummary()
    }

    const resetFilter = () => {
      selectedTahun.value = currentYear
      tempTahun.value = currentYear
      selectedCara.value = 'Semua'
      tempCara.value = 'Semua'
      selectedMetode.value = 'Semua'
      tempMetode.value = 'Semua'
      selectedJenis.value = 'Semua'
      tempJenis.value = 'Semua'
      selectedOpdFilter.value = 'Semua OPD'
      tempOpdFilter.value = 'Semua OPD'
      searchQuery.value = ''
      showFilterDialog.value = false
      currentPage.value = 1
      fetchData(1, false)
      loadSummary()
    }

    const filterOpdOptions = (val, update) => {
      update(() => {
        const needle = (val || '').toLowerCase()
        opdOptions.value = opdList.value.filter(v => v.toLowerCase().includes(needle))
      })
    }

    const getMetodeBadgeColor = (metode) => {
      const m = (metode || '').toLowerCase()
      if (m.includes('tender')) return 'deep-orange-8'
      if (m.includes('e-purchasing') || m.includes('epurchasing') || m.includes('purchasing')) return 'blue-8'
      if (m.includes('langsung') && m.includes('penunjukan')) return 'amber-8'
      if (m.includes('langsung')) return 'teal-8'
      return 'grey-8'
    }

    const getJenisBadgeColor = (jenis) => {
      const j = (jenis || '').toLowerCase()
      if (j.includes('konstruksi')) return 'brown-7'
      if (j.includes('barang')) return 'blue-grey-7'
      if (j.includes('konsultansi')) return 'purple-8'
      if (j.includes('lainnya')) return 'cyan-8'
      return 'grey-7'
    }

    // Menggunakan non-breaking space (\u00a0) agar nominal angka dan satuan (Jt, M) tidak pernah terpisah baris
    const formatRupiah = (val) => {
      if (!val) return 'Rp\u00a00'
      const n = Number(val)
      if (n >= 1_000_000_000) {
        return `Rp\u00a0${(n / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}\u00a0M`
      }
      if (n >= 1_000_000) {
        return `Rp\u00a0${(n / 1_000_000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}\u00a0Jt`
      }
      return 'Rp\u00a0' + n.toLocaleString('id-ID')
    }

    const formatRupiahSingkat = (val) => {
      if (!val) return 'Rp\u00a00'
      const n = Number(val)
      if (n >= 1_000_000_000_000) return `Rp\u00a0${(n / 1_000_000_000_000).toFixed(2)}\u00a0T`
      if (n >= 1_000_000_000) return `Rp\u00a0${(n / 1_000_000_000).toFixed(1)}\u00a0Miliar`
      return 'Rp\u00a0' + n.toLocaleString('id-ID')
    }

    const formatRupiahLengkap = (val) => {
      if (!val) return 'Rp\u00a00'
      return 'Rp\u00a0' + Number(val).toLocaleString('id-ID')
    }

    const openDetail = (item) => {
      selectedItem.value = item
      detailDialog.value = true
    }

    const copyKodeRup = (kodeRup) => {
      copyToClipboard(kodeRup)
        .then(() => {
          $q.notify({
            type: 'positive',
            message: `Kode RUP ${kodeRup} disalin ke clipboard!`,
            position: 'top',
            timeout: 1500
          })
        })
        .catch(() => {})
    }

    const openSirup = (kodeRup) => {
      const url = `https://sirup.lkpp.go.id/sirup/ro/cari?koderup=${kodeRup}`
      window.open(url, '_blank')
    }

    onMounted(() => {
      selectedTahun.value = currentYear
      tempTahun.value = currentYear
      tempOpdFilter.value = selectedOpdFilter.value
      fetchData(1, false)
      loadSummary()
    })

    return {
      searchQuery,
      isSearching,
      selectedCara,
      selectedMetode,
      selectedJenis,
      selectedTahun,
      tempCara,
      tempTahun,
      tempMetode,
      tempJenis,
      selectedOpdFilter,
      tempOpdFilter,
      isFilterActive,
      opsiTahun,
      caraPengadaanList,
      metodeList,
      jenisList,
      allPaket,
      totalItems,
      summaryData,
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
      getJenisBadgeColor,
      formatRupiah,
      formatRupiahSingkat,
      formatRupiahLengkap,
      openDetail,
      copyKodeRup,
      openSirup,
      resetFilter,
      refreshPage,
      fetchData,
      loadMore,
      onPullRefresh,
      onSearchInput,
      onSelectCara,
      onSelectMetode,
      onSelectJenis,
      applyFilterDialog,
      filterOpdOptions
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

.stat-card {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.stat-number {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.5px;
}

.pulse-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #22c55e;
  box-shadow: 0 0 8px #22c55e;
  animation: pulse-glow 2s infinite;
  display: inline-block;
}

@keyframes pulse-glow {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.metode-scroll-container {
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-chip {
  font-weight: 600;
  transition: all 0.2s ease;
}

.rup-item-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  &:active {
    transform: scale(0.985);
  }
}

.metode-badge {
  font-size: 11px;
  border-radius: 6px;
}

.border-top {
  border-top: 1px dashed #e2e8f0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.load-more-btn {
  border-radius: 10px;
  font-weight: bold;
}

.detail-sheet-card {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

.badge-row {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.harga-container {
  flex-shrink: 0 !important;
  white-space: nowrap !important;
  margin-left: 8px;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
}

.harga-text {
  white-space: nowrap !important;
  word-break: keep-all !important;
  overflow-wrap: normal !important;
  display: inline-block !important;
  letter-spacing: -0.2px;
}
</style>
