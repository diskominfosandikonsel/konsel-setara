<template>
  <q-page class="bg-grey-2">

    <!-- PULL TO REFRESH -->
    <q-pull-to-refresh @refresh="refreshAll">

      <!-- HEADER -->
      <div class="header-gradient q-pa-md">
        <div class="text-h6 text-weight-bold text-white">Dashboard</div>
        <div class="text-caption text-white-7">
          Penerima Bantuan Berdasarkan Kecamatan
        </div>

        <q-select
          v-model="pilih_kecamatan"
          :options="kecamatan"
          option-label="uraian"
          option-value="kecamatan_id"
          emit-value
          map-options
          dense
          outlined
          bg-color="white"
          class="q-mt-md"
          label="Pilih Kecamatan"
          @update:model-value="onFilterChange"
        />
      </div>

      <!-- SUMMARY CARDS -->
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">

          <div class="col-4" v-for="card in cards" :key="card.title">
  <q-card class="card-modern animate-fade card-touch">

    <q-card-section class="column items-start">

      <!-- ICON -->
      <div class="icon-box q-mb-sm">
        <q-icon :name="card.icon" size="20px" />
      </div>

      <!-- TITLE -->
      <div class="text-caption text-grey-6 ellipsis">
        {{ card.title }}
      </div>

      <!-- VALUE -->
      <div class="text-h6 text-weight-bold text-dark q-mt-xs">
        <q-skeleton v-if="loading" type="text" width="40px" />
        <span v-else class="number-animate">
          {{ formatNumber(card.value) }}
        </span>
      </div>

    </q-card-section>

  </q-card>
</div>

        </div>
      </div>

      <!-- CHARTS -->
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">

          <div class="col-12 col-md-6" v-for="chart in pieCharts" :key="chart.id">
            <q-card class="card-modern animate-slide">
              <q-card-section>
                <q-skeleton v-if="loading" type="rect" height="250px" />
                <div v-else :id="chart.id"></div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12" v-for="chart in barCharts" :key="chart.id">
            <q-card class="card-modern animate-slide">
              <q-card-section>
                <q-skeleton v-if="loading" type="rect" height="300px" />
                <div v-else :id="chart.id"></div>
              </q-card-section>
            </q-card>
          </div>

        </div>
      </div>

      <!-- FAB -->
      <q-page-sticky position="bottom-right" :offset="[16, 16]">
        <q-btn fab color="primary" icon="refresh" @click="refreshAll" />
      </q-page-sticky>

    </q-pull-to-refresh>

  </q-page>
</template>

<script>
import Highcharts from 'highcharts'
import { useBansosStore } from 'stores/bansos'
import { mapState } from 'pinia'

export default {
  name: 'DashboardMobilePro',

  data () {
    return {
      pilih_kecamatan: null
    }
  },

  computed: {
    ...mapState(useBansosStore, [
      'kecamatan',
      'jmlKelompok',
      'jmlBantuanIndividu',
      'jmlBantuanKelompok',
      'loading'
    ]),

    cards () {
      return [
        { title: 'Kelompok', value: this.jmlKelompok, icon: 'mdi-account', color: 'primary' },
        { title: 'Individu', value: this.jmlBantuanIndividu, icon: 'mdi-account-multiple', color: 'positive' },
        { title: 'Kelompok Bantuan', value: this.jmlBantuanKelompok, icon: 'mdi-account-group', color: 'green' }
      ]
    },

    pieCharts () {
      return [
        { id: 'grafikBantuanIndividu' },
        { id: 'grafikBantuanKelompok' }
      ]
    },

    barCharts () {
      return [
        { id: 'grafikIndividuKecamatan' },
        { id: 'grafikKelompokKecamatan' }
      ]
    }
  },

  methods: {

    getStore () {
      return useBansosStore()
    },

    async refreshAll (done) {
      const store = this.getStore()

      this.$nextTick(async () => {
        await store.fetchAll({
          kecamatan: this.pilih_kecamatan || ''
        })

        this.renderAllCharts()

        if (done) done()
      })
    },

    async onFilterChange () {
      const store = this.getStore()

      await store.fetchAll({
        kecamatan: this.pilih_kecamatan || ''
      })

      this.renderAllCharts()
    },

    formatNumber (val) {
    if (!val) return 0
    return new Intl.NumberFormat('id-ID').format(val)
  },

    renderAllCharts () {
      const store = this.getStore()

      // PIE INDIVIDU
      const individu = store.individu.map(i => ({
        name: i.judul,
        y: i.jmlPenerima
      }))

      this.renderPie('grafikBantuanIndividu', individu, 'Individu')

      // PIE KELOMPOK
      const kelompok = store.kelompok.map(i => [
        i.judul,
        i.jmlPenerima
      ])

      this.renderPie('grafikBantuanKelompok', kelompok, 'Kelompok')

      // BAR INDIVIDU
      const individuKec = store.individuKecamatan.map(i => [
        i.uraian,
        i.jmlPenerima
      ])

      this.renderBar('grafikIndividuKecamatan', individuKec, 'Individu Kecamatan')

      // BAR KELOMPOK
      const kelompokKec = store.kelompokKecamatan.map(i => [
        i.uraian,
        i.jmlPenerima
      ])

      this.renderBar('grafikKelompokKecamatan', kelompokKec, 'Kelompok Kecamatan')
    },

    // =========================
    // CHARTS
    // =========================
    renderPie (id, data, title) {
  const total = data.reduce((sum, i) => sum + (i.y || i[1] || 0), 0)

  Highcharts.chart(id, {
    chart: {
      type: 'pie'
    },

    title: {
      text: `<div style="text-align:center">
              <div style="font-size:12px; color:#999">${title}</div>
              <div style="font-size:20px; font-weight:bold">${total}</div>
            </div>`,
      useHTML: true,
      verticalAlign: 'middle'
    },

    tooltip: {
      pointFormat: '<b>{point.y}</b> ({point.percentage:.1f}%)'
    },

    plotOptions: {
      pie: {
        innerSize: '65%',
        dataLabels: {
          enabled: true,
          distance: -30,
          style: {
            fontSize: '11px',
            textOutline: 'none'
          },
          formatter() {
            // show ONLY if big enough (mobile friendly)
            if (this.percentage > 8) {
              return `${this.percentage.toFixed(0)}%`
            }
            return null
          }
        }
      }
    },

    series: [
      {
        name: 'Jumlah',
        data: data
      }
    ],

    credits: { enabled: false }
  })
},

    renderBar (id, data, title) {
      Highcharts.chart(id, {
        chart: { type: 'column' },
        title: { text: title },
        xAxis: { type: 'category' },
        plotOptions: {
          series: {
            animation: { duration: 600 }
          }
        },
        series: [{ data }]
      })
    }

  },

  async mounted () {
    await this.refreshAll()
  }
}
</script>

<style scoped>
.header-gradient {
  background: linear-gradient(135deg, #176B87, #1f8ca8);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
}

.card-modern {
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  transition: all 0.25s ease;
}

.card-modern:hover {
  transform: translateY(-4px);
}

.animate-fade {
  animation: fadeIn 0.6s ease;
}

.animate-slide {
  animation: slideUp 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0 }
  to { transform: translateY(0); opacity: 1 }
}

.card-modern {
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  background: white;
  transition: all 0.25s ease;
  height: 100%;
}

/* 👆 tap feel (important for mobile) */
.card-touch:active {
  transform: scale(0.96);
}

/* subtle hover (tablet / web) */
.card-modern:hover {
  transform: translateY(-3px);
}

/* ICON container (fintech style) */
.icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #176B87, #1f8ca8);
  color: white;
}

/* number animation feel */
.number-animate {
  display: inline-block;
  animation: fadeScale 0.4s ease;
}

@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

#grafikBantuanIndividu,
#grafikBantuanKelompok,
#grafikIndividuKecamatan,
#grafikKelompokKecamatan {
  min-height: 300px;
}
</style>
