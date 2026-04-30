<template>
  <q-page class="bg-grey-2">
    <!-- PULL TO REFRESH -->
    <q-pull-to-refresh @refresh="refreshAll">
      <!-- HEADER -->
      <div class="header-gradient q-pa-md">
        <div class="text-h6 text-weight-bold text-white">Bantuan & Hibah</div>
        <div class="text-caption text-grey-4">
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
      <div class="q-px-md q-pt-md">
      <div class="row q-col-gutter-sm">
        <div
          class="col-4"
          v-for="item in cards"
          :key="item.title"
        >
          <!-- ICON BOX -->
          <div class="icon-box-menu column justify-between items-center">
  <!-- ICON (atas) -->
  <q-icon :name="item.icon" size="20px" class="icon-main" />

  <!-- VALUE (bawah) -->
  <div class="value-mini">
    {{ formatNumber(item.value) }}
  </div>
</div>

          <!-- TITLE -->
          <div
            class="text-caption text-weight-medium text-grey-8 q-mt-xs text-center ellipsis-2-lines" style="font-size: 9.5px;"
          >
            {{ item.title }}
          </div>
        </div>
      </div>
      </div>

      <!-- CHARTS -->
      <div class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div
            class="col-12 col-md-6"
            v-for="chart in pieCharts"
            :key="chart.id"
          >
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
import Highcharts from "highcharts";
import { useBansosStore } from "stores/bansos";
import { mapState } from "pinia";

export default {
  name: "DashboardMobilePro",

  data() {
    return {
      pilih_kecamatan: null,
    };
  },

  computed: {
    ...mapState(useBansosStore, [
      "kecamatan",
      "jmlKelompok",
      "jmlBantuanIndividu",
      "jmlBantuanKelompok",
      "loading",
    ]),

    cards() {
      return [
        {
          title: "Jumlah Kelompok Masyarakat",
          value: this.jmlKelompok,
          icon: "fas fa-users",
          color: "white",
        },
        {
          title: "Individu Penerima Bantuan",
          value: this.jmlBantuanIndividu,
          icon: "fas fa-user",
          color: "white",
        },
        {
          title: "Kelompok Penerima Bantuan",
          value: this.jmlBantuanKelompok,
          icon: "fas fa-user-friends",
          color: "white",
        },
      ];
    },

    pieCharts() {
      return [{ id: "grafikBantuanIndividu" }, { id: "grafikBantuanKelompok" }];
    },

    barCharts() {
      return [
        { id: "grafikIndividuKecamatan" },
        { id: "grafikKelompokKecamatan" },
      ];
    },
  },

  methods: {
    getStore() {
      return useBansosStore();
    },

    async refreshAll(done) {
      const store = this.getStore();

      this.$nextTick(async () => {
        await store.fetchAll({
          kecamatan: this.pilih_kecamatan || "",
        });

        this.renderAllCharts();

        if (done) done();
      });
    },

    async onFilterChange() {
      const store = this.getStore();

      await store.fetchAll({
        kecamatan: this.pilih_kecamatan || "",
      });

      this.renderAllCharts();
    },

    formatNumber(val) {
      if (!val) return 0;
      return new Intl.NumberFormat("id-ID").format(val);
    },

    getPercentage(val) {
      const max = Math.max(
        this.jmlKelompok,
        this.jmlBantuanIndividu,
        this.jmlBantuanKelompok,
      );

      if (!max) return 0;
      return Math.round((val / max) * 100);
    },

    renderAllCharts() {
      const store = this.getStore();

      // PIE INDIVIDU
      const individu = store.individu.map((i) => ({
        name: i.judul,
        y: i.jmlPenerima,
      }));

      this.renderPie("grafikBantuanIndividu", individu, "Individu Penerima Bantuan");

      // PIE KELOMPOK
      const kelompok = store.kelompok.map((i) => [i.judul, i.jmlPenerima]);

      this.renderPie("grafikBantuanKelompok", kelompok, "Kelompok Penerima Bantuan");

      // BAR INDIVIDU
      const individuKec = store.individuKecamatan.map((i) => [
        i.uraian,
        i.jmlPenerima,
      ]);

      this.renderBar(
        "grafikIndividuKecamatan",
        individuKec,
        "Individu Penerima Bantuan",
      );

      // BAR KELOMPOK
      const kelompokKec = store.kelompokKecamatan.map((i) => [
        i.uraian,
        i.jmlPenerima,
      ]);

      this.renderBar(
        "grafikKelompokKecamatan",
        kelompokKec,
        "Kelompok Penerima Bantuan",
      );
    },

    // =========================
    // CHARTS
    // =========================
    renderPie(id, data, title) {
      const total = data.reduce((sum, i) => sum + (i.y || i[1] || 0), 0);

      Highcharts.chart(id, {
        chart: {
          type: "pie",
        },

        title: {
          text: `<div style="text-align:center">
              <div style="font-size:12px; color:#999">${title}</div>
              <div style="font-size:20px; font-weight:bold">${total}</div>
            </div>`,
          useHTML: true,
          verticalAlign: "middle",
        },

        tooltip: {
          pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)",
        },

        plotOptions: {
          pie: {
            innerSize: "65%",
            dataLabels: {
              enabled: true,
              distance: -30,
              style: {
                fontSize: "11px",
                textOutline: "none",
              },
              formatter() {
                // show ONLY if big enough (mobile friendly)
                if (this.percentage > 8) {
                  return `${this.percentage.toFixed(0)}%`;
                }
                return null;
              },
            },
          },
        },

        series: [
          {
            name: "Jumlah",
            data: data,
          },
        ],

        credits: { enabled: false },
      });
    },

    renderBar(id, data, title) {
  Highcharts.chart(id, {
    chart: { type: "column" },

    title: { text: title },

    legend: {
      enabled: false // 🔥 hilangkan "Series 1"
    },

    xAxis: {
      type: "category"
    },

    plotOptions: {
      series: {
        animation: { duration: 600 }
      }
    },

    series: [
      {
        data
      }
    ],

    credits: { enabled: false }
  });
}
  },

  async mounted() {
    await this.refreshAll();
  },
};
</script>

<style scoped>
.header-gradient {
  background: linear-gradient(135deg, #456efe, #6fa4ff);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
}

.card-modern {
  border-radius: 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.icon-box-menu {
  width: 100%;
  height: 75px;
  margin: 0 auto;

  border-radius: 25px;
  display: flex;
  flex-direction: column;   /* penting */
  justify-content: space-between; /* dorong atas & bawah */
  align-items: center;

  padding: 8px 6px;

  background: linear-gradient(135deg, #456efe, #6fa4ff);
  color: white;

  box-shadow: 0 6px 16px rgba(69, 110, 254, 0.25);
}

/* tap feel */
.icon-box-menu:active {
  transform: scale(0.9);
}

/* icon center */
.icon-main {
  opacity: 0.95;
}

/* angka kecil di bawah */
.value-mini {
  font-size: 20px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 2 line title */
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
