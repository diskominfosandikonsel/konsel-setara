<template>
  <q-page class="data-page">
    <!-- HEADER -->
    <div class="data-header">
      <div class="header-content">
        <div class="header-title-row">
          <div>
            <div class="text-h5 text-weight-bold text-white" style="line-height: 1.2">
              Dashboard Data
            </div>
            <div class="text-caption text-blue-2 q-mt-xs">
              {{ daerah ? daerah.nama_daerah : 'Kabupaten Konawe Selatan' }}
            </div>
          </div>
          <q-chip
            v-if="daerah && daerah.slogan"
            dense
            color="white"
            text-color="indigo-8"
            class="text-weight-bold slogan-chip"
          >
            {{ daerah.slogan }}
          </q-chip>
        </div>

        <!-- SEARCH -->
        <q-input
          v-model="searchQuery"
          dense
          outlined
          bg-color="white"
          placeholder="Cari OPD..."
          class="q-mt-md search-box"
          color="indigo"
          debounce="300"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="indigo-4" />
          </template>
          <template v-slot:append>
            <q-icon
              v-if="searchQuery"
              name="close"
              color="grey-5"
              class="cursor-pointer"
              @click="searchQuery = ''"
            />
          </template>
        </q-input>

        <!-- SUMMARY CARDS -->
        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-4" v-for="(stat, idx) in summaryCards" :key="idx">
            <div class="stat-card">
              <q-icon :name="stat.icon" size="22px" class="stat-icon" />
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- OPD LIST -->
    <div class="q-px-md q-pt-lg q-pb-xl">
      <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-sm">
        <q-icon name="domain" color="indigo-5" class="q-mr-xs" />
        Daftar OPD ({{ filteredOpds.length }})
      </div>

      <!-- Loading State -->
      <template v-if="loading">
        <div v-for="n in 5" :key="'skel-' + n" class="opd-card q-mb-sm">
          <div class="row items-center no-wrap q-pa-md">
            <q-skeleton type="QAvatar" size="42px" />
            <div class="col q-ml-md">
              <q-skeleton type="text" width="70%" />
              <q-skeleton type="text" width="40%" class="q-mt-xs" />
            </div>
          </div>
        </div>
      </template>

      <!-- OPD Cards -->
      <template v-else>
        <transition-group name="list" tag="div">
          <div
            v-for="(opd, idx) in filteredOpds"
            :key="opd.kode_opd"
            class="opd-card q-mb-sm cursor-pointer"
            @click="goDetail(opd)"
            :style="{ animationDelay: idx * 40 + 'ms' }"
          >
            <div class="row items-center no-wrap q-pa-md">
              <!-- ICON -->
              <q-avatar
                size="44px"
                class="opd-avatar"
                :style="{ background: getGradient(idx) }"
              >
                <q-icon :name="getOpdIcon(opd.nama_opd)" color="white" size="22px" />
              </q-avatar>

              <!-- INFO -->
              <div class="col q-ml-md" style="min-width: 0">
                <div class="text-subtitle2 text-weight-bold text-grey-9 ellipsis-opd">
                  {{ opd.nama_opd }}
                </div>
                <div class="text-caption text-grey-5 q-mt-xs" style="font-size: 11px">
                  {{ opd.kode_opd }}
                </div>
              </div>

              <!-- ARROW -->
              <q-icon name="chevron_right" color="indigo-3" size="24px" />
            </div>

            <!-- Indikator count badge -->
            <div class="indicator-badge" v-if="getIndikatorCount(opd.kode_opd) > 0">
              {{ getIndikatorCount(opd.kode_opd) }} indikator
            </div>
          </div>
        </transition-group>

        <!-- Empty Search Result -->
        <div v-if="filteredOpds.length === 0 && searchQuery" class="text-center q-pa-xl">
          <q-icon name="search_off" size="56px" color="grey-4" />
          <div class="text-grey-5 q-mt-md text-body2">
            Tidak ada OPD yang cocok dengan pencarian <b>"{{ searchQuery }}"</b>
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script>
import { useDataStore } from 'stores/data'
import { mapState } from 'pinia'

export default {
  name: 'DataDashboard',

  data () {
    return {
      searchQuery: ''
    }
  },

  computed: {
    ...mapState(useDataStore, ['opds', 'dashboard', 'daerah', 'loading']),

    filteredOpds () {
      let list = [...this.opds]
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase()
        list = list.filter(opd =>
          opd.nama_opd.toLowerCase().includes(q) ||
          opd.kode_opd.toLowerCase().includes(q)
        )
      }
      return list.sort((a, b) => {
        const aIsBps = a.nama_opd.toLowerCase().includes('bps')
        const bIsBps = b.nama_opd.toLowerCase().includes('bps')
        if (aIsBps && !bIsBps) return -1
        if (!aIsBps && bIsBps) return 1
        return a.nama_opd.localeCompare(b.nama_opd)
      })
    },

    summaryCards () {
      const totalOpd = this.opds.length
      const totalIndikator = this.dashboard.length

      // Count unique years across all indicators
      const yearSet = new Set()
      this.dashboard.forEach(d => {
        if (d.years) d.years.forEach(y => yearSet.add(y))
      })

      return [
        { icon: 'domain', value: totalOpd, label: 'OPD' },
        { icon: 'bar_chart', value: totalIndikator, label: 'Indikator' },
        { icon: 'date_range', value: yearSet.size, label: 'Periode' }
      ]
    }
  },

  methods: {
    getStore () {
      return useDataStore()
    },

    getIndikatorCount (kodeOpd) {
      return this.dashboard.filter(d => d.kode_opd === kodeOpd).length
    },

    goDetail (opd) {
      this.$router.push({
        path: '/data_detail',
        query: { kode: opd.kode_opd, nama: opd.nama_opd }
      })
    },

    getGradient (idx) {
      const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
        'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        'linear-gradient(135deg, #f5576c 0%, #ff6a88 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      ]
      return gradients[idx % gradients.length]
    },

    getOpdIcon (nama) {
      const n = nama.toLowerCase()
      if (n.includes('kesehatan') || n.includes('rumah sakit')) return 'local_hospital'
      if (n.includes('pendidikan')) return 'school'
      if (n.includes('pekerjaan umum') || n.includes('tata ruang')) return 'engineering'
      if (n.includes('sosial')) return 'volunteer_activism'
      if (n.includes('kependudukan')) return 'people'
      if (n.includes('komunikasi') || n.includes('informatika')) return 'wifi'
      if (n.includes('peternakan')) return 'pets'
      if (n.includes('pertanian') || n.includes('pangan') || n.includes('tanaman')) return 'grass'
      if (n.includes('perikanan')) return 'set_meal'
      if (n.includes('lingkungan')) return 'park'
      if (n.includes('pariwisata')) return 'beach_access'
      if (n.includes('perdagangan') || n.includes('perindustrian')) return 'storefront'
      if (n.includes('perhubungan')) return 'directions_bus'
      if (n.includes('perumahan')) return 'home'
      if (n.includes('penanaman modal')) return 'trending_up'
      if (n.includes('keuangan') || n.includes('pendapatan')) return 'account_balance'
      if (n.includes('inspektorat')) return 'policy'
      if (n.includes('kepegawaian')) return 'badge'
      if (n.includes('perencanaan')) return 'assignment'
      if (n.includes('bps')) return 'analytics'
      if (n.includes('satuan polisi') || n.includes('satpol')) return 'shield'
      if (n.includes('pemadam') || n.includes('kebakaran')) return 'local_fire_department'
      if (n.includes('bencana')) return 'warning'
      if (n.includes('perpustakaan')) return 'menu_book'
      if (n.includes('pemuda') || n.includes('olahraga')) return 'sports_soccer'
      if (n.includes('perempuan') || n.includes('anak')) return 'family_restroom'
      if (n.includes('tenaga kerja') || n.includes('transmigrasi')) return 'work'
      if (n.includes('koperasi')) return 'groups'
      if (n.includes('keluarga berencana') || n.includes('penduduk')) return 'escalator_warning'
      if (n.includes('sekretariat')) return 'apartment'
      if (n.includes('riset') || n.includes('inovasi')) return 'biotech'
      if (n.includes('kesatuan bangsa') || n.includes('politik')) return 'gavel'
      if (n.includes('pemberdayaan masyarakat') || n.includes('desa')) return 'holiday_village'
      return 'account_balance'
    }
  },

  async mounted () {
    const store = this.getStore()
    await store.fetchAll()
  }
}
</script>

<style scoped>
.data-page {
  background: #f4f6fb;
  min-height: 100vh;
}

.data-header {
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%);
  border-bottom-left-radius: 28px;
  border-bottom-right-radius: 28px;
  padding-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.data-header::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
}

.data-header::after {
  content: '';
  position: absolute;
  bottom: -30px;
  left: -20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 20px 16px 0;
}

.header-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.slogan-chip {
  font-size: 10px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.search-box :deep(.q-field__control) {
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

/* STAT CARDS */
.stat-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 12px 8px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.2);
}

.stat-icon {
  color: rgba(255,255,255,0.8);
}

.stat-value {
  font-size: 22px;
  font-weight: 800;
  color: white;
  margin-top: 4px;
}

.stat-label {
  font-size: 10px;
  color: rgba(255,255,255,0.7);
  font-weight: 500;
}

/* OPD CARDS */
.opd-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  animation: slideIn 0.4s ease forwards;
  opacity: 0;
}

.opd-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.opd-avatar {
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.ellipsis-opd {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.indicator-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #4338ca;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}

/* TRANSITIONS */
.list-enter-active {
  transition: all 0.4s ease;
}

.list-leave-active {
  transition: all 0.2s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* TABLET */
@media (min-width: 600px) {
  .stat-value {
    font-size: 28px;
  }

  .stat-label {
    font-size: 12px;
  }

  .opd-avatar {
    width: 52px !important;
    height: 52px !important;
  }
}
</style>
