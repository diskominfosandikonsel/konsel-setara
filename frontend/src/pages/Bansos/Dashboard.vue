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

        <div class="row q-col-gutter-sm q-mt-md">
          <div class="col-6">
            <q-select v-model="pilih_kecamatan" :options="kecamatan" option-label="uraian" option-value="kecamatan_id"
              emit-value map-options dense outlined bg-color="white" label="Pilih Kecamatan"
              @update:model-value="onFilterChange" clearable />
          </div>
          <div class="col-6">
            <q-select v-model="pilih_tahun" :options="tahunList"
              dense outlined bg-color="white" label="Pilih Tahun"
              @update:model-value="onFilterChange" clearable />
          </div>
        </div>
      </div>
      <div class="q-px-md q-pt-md">
        <div class="row q-col-gutter-sm">
          <div class="col-4" v-for="item in cards" :key="item.title">
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
            <div class="text-caption text-weight-medium text-grey-8 q-mt-xs text-center ellipsis-2-lines"
              style="font-size: 9.5px">
              {{ item.title }}
            </div>
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

      <!-- UKT SECTION -->
      <div class="q-pa-md">
        <div class="row items-center justify-between q-mb-sm">
          <div class="text-subtitle1 text-weight-bold">
            Mahasiswa Penerima UKT
          </div>
          <q-select v-model="pilih_tahun_ukt" :options="tahunUktList" dense outlined bg-color="white"
            style="min-width: 120px" label="Pilih Tahun" @update:model-value="onFilterUktChange" />
        </div>

        <q-card class="card-modern animate-slide" style="margin-top: 10px">
          <q-card-section>
            <q-skeleton v-if="loadingUkt" type="rect" height="300px" />
            <div v-else id="grafikUkt" style="width: 100%"></div>
          </q-card-section>
        </q-card>
      </div>

      <q-dialog v-model="dialogSearch" maximized="">
        <q-card style="width: 100%">
          <!-- HEADER -->
          <q-card-section class="row items-center">
            <div class="text-subtitle1 text-weight-bold">
              Verifikasi Penerima Bantuan
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <!-- INPUT -->
          <q-card-section>
            <q-input v-model="searchNik" label="Masukkan NIK Untuk Cek Data Anda" dense outlined debounce="500"
              @keyup.enter="searchData">
              <template v-slot:append>
                <q-icon name="search" class="cursor-pointer" @click="searchData" />
              </template>
            </q-input>
          </q-card-section>

          <q-inner-loading :showing="searchLoading" />

          <!-- RESULT -->
          <q-card-section v-if="searchResult">
            <q-card class="profile-card">
              <!-- HEADER -->
              <div class="profile-header">
                <q-avatar size="56px" class="bg-white text-primary shadow-2">
                  <q-icon name="mdi-account" size="30px" />
                </q-avatar>

                <div class="q-ml-md">
                  <div class="text-subtitle1 text-weight-bold">
                    {{ searchResult.nama_lgkp || "-" }}
                  </div>

                  <div class="text-caption text-white-7">
                    {{ formatNik(searchResult.nik_id) }}
                  </div>
                  <div class="status-chip bg-green text-white">
                    ✔ Terverifikasi
                  </div>
                </div>
              </div>

              <!-- BODY -->
              <q-card-section class="q-pt-md">
                <div class="info-row">
                  <div class="label">No KK</div>
                  <div class="value">{{ searchResult.no_kk || "-" }}</div>
                </div>

                <div class="info-row">
                  <div class="label">Jenis Kelamin</div>
                  <div class="value">
                    {{ formatGender(searchResult.jenis_klmin) }}
                  </div>
                </div>

                <div class="info-row">
                  <div class="label">Tempat / Tgl Lahir</div>
                  <div class="value">
                    {{ searchResult.tmpt_lhr || "-" }},
                    {{ searchResult.tgl_lhr || "-" }}
                  </div>
                </div>
                <div class="info-row">
                  <div class="label">No HP</div>
                  <div class="value">{{ searchResult.no_hp || "-" }}</div>
                </div>

                <div class="info-row">
                  <div class="label">Alamat</div>
                  <div class="value">{{ searchResult.alamat || "-" }}</div>
                </div>

                <div class="info-row">
                  <div class="label">Keterangan</div>
                  <div class="value">{{ searchResult.keterangan || "-" }}</div>
                </div>
                <div class="info-row">
                  <div class="label">Jenis Bantuan</div>
                  <div class="value">{{ searchResult.judul || "-" }}</div>
                </div>
              </q-card-section>

              <!-- FOOTER -->
              <div class="profile-footer">
                <q-icon name="check_circle" size="16px" class="q-mr-xs" />
                Data Terdaftar Sebagai Penerima Bantuan
              </div>
            </q-card>
          </q-card-section>

          <!-- NOT FOUND -->
          <q-card-section v-if="searched && !searchResult">
            <div class="text-negative text-center">Data tidak ditemukan</div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- FAB -->
      <q-page-sticky position="bottom-right" :offset="[16, 16]">
        <q-btn fab color="primary" icon="search" @click="dialogSearch = true" />
      </q-page-sticky>
    </q-pull-to-refresh>

    <!-- ════════════════════════════ -->
    <!-- SKM SURVEY BUTTON           -->
    <!-- ════════════════════════════ -->
    <Skm nama-aplikasi="Bansos" />

  </q-page>
</template>

<script>
import Highcharts from "highcharts";
import { useBansosStore } from "stores/bansos";
import { mapState } from "pinia";
import Skm from 'src/components/Skm.vue';

export default {
  name: "DashboardMobilePro",
  components: {
    Skm
  },

  data() {
    return {
      pilih_kecamatan: null,
      pilih_tahun: null,
      pilih_tahun_ukt: null,
      dialogSearch: false,
      searchNik: "",
    };
  },

  watch: {
    dialogSearch(val) {
      if (val) {
        const store = useBansosStore();
        store.searchResult = null;
        store.searched = false;
        this.searchNik = "";
      }
    },
  },

  computed: {
    ...mapState(useBansosStore, [
      "kecamatan",
      "jmlKelompok",
      "jmlBantuanIndividu",
      "jmlBantuanKelompok",
      "searchResult",
      "searchLoading",
      "searched",
      "loading",
      "loadingUkt",
      "ukt",
      "tahunUktList",
      "tahunList",
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
      return [
        { id: "grafikSektorIndividu" },
        { id: "grafikSektorKelompok" }
      ];
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

    formatNik(nik) {
      return nik.replace(/(\d{4})(?=\d)/g, "$1 ");
    },

    async searchData() {
      const store = useBansosStore();

      const cleanNik = this.searchNik.replace(/\s/g, "");

      await store.searchNik({
        nik: cleanNik,
      });
    },

    formatGender(val) {
      return val == 1 ? "Laki-laki" : "Perempuan";
    },

    async refreshAll(done) {
      const store = this.getStore();

      await store.fetchAll({
        kecamatan: this.pilih_kecamatan || "",
        tahun: this.pilih_tahun || "",
      });

      this.pilih_tahun = store.pilih_tahun;
      this.pilih_tahun_ukt = store.pilih_tahun_ukt;

      this.$nextTick(() => {
        this.renderAllCharts();
        if (done) done();
      });
    },

    async onFilterUktChange() {
      const store = this.getStore();
      store.pilih_tahun_ukt = this.pilih_tahun_ukt;
      await store.getUkt({
        kecamatan: this.pilih_kecamatan || "",
        tahun: this.pilih_tahun_ukt,
      });
      this.$nextTick(() => {
        this.renderUktChart();
      });
    },

    async onFilterChange() {
      const store = this.getStore();

      store.pilih_tahun = this.pilih_tahun;

      await store.fetchAll({
        kecamatan: this.pilih_kecamatan || "",
        tahun: this.pilih_tahun || "",
      });

      this.pilih_tahun = store.pilih_tahun;
      this.pilih_tahun_ukt = store.pilih_tahun_ukt;

      this.$nextTick(() => {
        this.renderAllCharts();
      });
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

      // PIE SEKTOR INDIVIDU
      const dataSektorIndividu = store.sektorBansos.map((item) => ({
        name: item.uraian,
        y: item.jmlIndividu || 0,
      })).sort((a, b) => b.y - a.y);
      
      this.renderPie(
        "grafikSektorIndividu",
        dataSektorIndividu,
        "Sektor Bantuan (Individu)",
      );

      // PIE SEKTOR KELOMPOK
      const dataSektorKelompok = store.sektorBansos.map((item) => ({
        name: item.uraian,
        y: item.jmlKelompok || 0,
      })).sort((a, b) => b.y - a.y);

      this.renderPie(
        "grafikSektorKelompok",
        dataSektorKelompok,
        "Sektor Bantuan (Kelompok)",
      );

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

      // UKT CHART
      this.renderUktChart();
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
          text: title,
          align: "center",
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#333"
          }
        },
        subtitle: {
          text: `Total Penerima: <b>${total}</b>`,
          align: "center",
          style: {
            fontSize: "12px",
            color: "#666"
          }
        },

        tooltip: {
          pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)",
        },

        plotOptions: {
          pie: {
            innerSize: "65%",
            showInLegend: true,
            dataLabels: {
              enabled: true,
              distance: -30,
              style: {
                fontSize: "11px",
                textOutline: "none",
                color: "black"
              },
              formatter() {
                if (this.percentage > 8) {
                  return `${this.percentage.toFixed(0)}%`;
                }
                return null;
              },
            },
          },
        },

        legend: {
          enabled: true,
          itemStyle: {
            fontSize: "10px",
            fontWeight: "normal"
          },
          labelFormatter: function() {
            return `${this.name}: ${this.y}`;
          }
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
          enabled: false, // 🔥 hilangkan "Series 1"
        },

        xAxis: {
          type: "category",
        },

        plotOptions: {
          series: {
            animation: { duration: 600 },
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

    renderUktChart() {
      const store = this.getStore();

      const el = document.getElementById("grafikUkt");
      if (!el) return;

      if (!store.ukt || store.ukt.length === 0) {
        el.innerHTML =
          '<div class="text-center text-grey q-pa-lg">Tidak ada data</div>';
        return;
      }

      // Sort data descending by jmlMahasiswa
      const sortedData = [...store.ukt].sort(
        (a, b) => b.jmlMahasiswa - a.jmlMahasiswa,
      );

      const categories = sortedData.map(
        (item) => item.namaKampus || item.judul,
      );

      const data = sortedData.map((item, index) => {
        // Gradient of blues based on value (or index)
        // To mimic the image, top 1 is very dark blue, then lighter.
        let color = "#dbeafe"; // default very light blue
        if (index === 0) color = "#1e3a8a";
        else if (index === 1) color = "#2563eb";
        else if (index === 2) color = "#3b82f6";
        else if (index === 3) color = "#60a5fa";
        else if (index === 4) color = "#93c5fd";
        else if (index === 5)
          color = "#1d4ed8"; // alternate dark blue for variety
        else if (index === 6) color = "#2563eb";
        else color = "#f3f4f6"; // faint grey-blue for the rest

        return {
          y: item.jmlMahasiswa,
          color: color,
        };
      });

      const chartHeight = Math.max(400, categories.length * 35 + 100);

      Highcharts.chart("grafikUkt", {
        chart: {
          type: "bar",
          height: chartHeight,
        },
        title: {
          text: "Grafik Jumlah Mahasiswa Penerima per Institusi",
          align: "left",
          style: { fontWeight: "bold", fontSize: "15px" },
        },
        subtitle: {
          text: `Berdasarkan data penerima UKT tahun ${this.pilih_tahun_ukt || "-"}`,
          align: "left",
        },
        xAxis: {
          categories: categories,
          title: { text: null },
          gridLineWidth: 0,
          lineWidth: 0,
          tickWidth: 0,
          labels: {
            style: {
              fontSize: "11px",
              fontWeight: "500",
              color: "#4b5563",
            },
          },
        },
        yAxis: {
          min: 0,
          title: { text: null },
          labels: { enabled: false },
          gridLineWidth: 0,
        },
        tooltip: {
          valueSuffix: " mhs",
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
              formatter: function () {
                return this.y + " mhs";
              },
              inside: false,
              style: {
                fontWeight: "600",
                fontSize: "11px",
                color: "#374151",
                textOutline: "none",
              },
            },
            borderRadius: 4,
            borderWidth: 0,
          },
        },
        legend: { enabled: false },
        credits: { enabled: false },
        series: [
          {
            name: "Jumlah Mahasiswa",
            data: data,
          },
        ],
      });
    },
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
  flex-direction: column;
  /* penting */
  justify-content: space-between;
  /* dorong atas & bawah */
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

#grafikSektorIndividu,
#grafikSektorKelompok {
  min-height: 450px;
}

#grafikIndividuKecamatan,
#grafikKelompokKecamatan {
  min-height: 300px;
}

/* CARD */
.profile-card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* HEADER */
.profile-header {
  display: flex;
  align-items: center;
  padding: 16px;

  background: linear-gradient(135deg, #176b87, #1f8ca8);
  color: white;
}

/* INFO LIST */
.info-row {
  margin-bottom: 10px;
}

.label {
  font-size: 11px;
  color: #888;
}

.value {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

/* FOOTER */
.profile-footer {
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 500;

  background: #f5f5f5;
  color: #4caf50;

  display: flex;
  align-items: center;
}

.status-chip {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 10px;
}
</style>
