import { defineStore } from "pinia";
import eridaService from "src/services/erida.service";

export const useEridaStore = defineStore("erida", {
  state: () => ({
    swiperData: [],
    riset: [],
    krenova: [],
    aksi: [],
    teknologi: [],
    haki: [],
    penelitian: [],
    dataLastPage: 1,
    loading: false,
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true;

      try {
        const [
          riset,
          krenova,
          aksi,
          teknologi,
          haki,
          penelitian,
          iid,
          ipkd,
          idsd,
        ] = await Promise.all([
          eridaService.getRiset(),
          eridaService.getKrenova(),
          eridaService.getAksi(),
          eridaService.getTeknologi(),
          eridaService.getHaki(),
          eridaService.getPenelitian(),
          eridaService.getIid(),
          eridaService.getIpkd(),
          eridaService.getIdsd(),
        ]);

        const normalizeData = (res) => {
          const raw = res?.data?.data || [];

          return raw.map((i) => ({
            tahun: i.tahun ?? null,
            label: i.uraian ?? i.tahun ?? "",
            jumlah: isNaN(Number(i.jumlah)) ? 0 : Number(i.jumlah),
          }));
        };

        const mapChart = (res) => {
          const data = normalizeData(res);

          const currentYear = new Date().getFullYear();
          const years = Array.from(
            { length: 10 },
            (_, i) => currentYear - 9 + i,
          );

          const dataMap = {};

          data.forEach((i) => {
            if (i.tahun !== null) {
              dataMap[i.tahun] = i.jumlah;
            }
          });

          return {
            values: years.map((y) => dataMap[y] || 0),
            labels: years,
          };
        };

        const mapCategoryChart = (res) => {
          const data = normalizeData(res);

          return {
            values: data.map((i) => i.jumlah),
            labels: data.map((i) => i.label),
          };
        };

        const getLatestValue = (res) => {
          const data = normalizeData(res)
            .filter((i) => i.tahun !== null)
            .sort((a, b) => a.tahun - b.tahun);

          return data.length ? data[data.length - 1].jumlah : 0;
        };

        const sumData = (data) => {
          return (data || []).reduce((t, i) => t + (Number(i.jumlah) || 0), 0);
        };
        
        this.swiperData = [
          {
            id: 1,
            title: "Data Riset",
            status: "Riset",
            value: "-",
            route: "erida-riset", // no need total
            type: "area",
            ...mapChart(riset),
          },
          {
            id: 2,
            title: "Krenova",
            status: "Krenova",
            value: "-",
            route: "erida-krenova",
            type: "bar",
            ...mapChart(krenova),
          },
          {
            id: 3,
            title: "Aksi",
            status: "Aksi",
            route: "erida-aksi",
            value: "-",
            type: "line",
            ...mapChart(aksi),
          },
          {
            id: 4,
            title: "Teknologi",
            status: "Teknologi",
            value: "-",
            route: "erida-teknologi",
            type: "area",
            ...mapChart(teknologi),
          },
          {
            id: 5,
            title: "HAKI",
            status: "HAKI",
            value: "-",
            route: "erida-haki",
            type: "bar",
            ...mapChart(haki),
          },
          {
            id: 6,
            title: "Penelitian",
            status: "Penelitian",
            route: "erida-penelitian",
            value: "-",
            type: "bar",
            ...mapCategoryChart(penelitian),
          },
          {
            id: 7,
            title: "IID",
            status: "IID",
            value: getLatestValue(iid),
            route: null,
            type: "line",
            ...mapChart(iid),
          },
          {
            id: 8,
            title: "IPKD",
            status: "IPKD",
            value: getLatestValue(ipkd),
            route: null,
            type: "area",
            ...mapChart(ipkd),
          },
          {
            id: 9,
            title: "IDSD",
            status: "IDSD",
            value: getLatestValue(idsd),
            route: null,
            type: "line",
            ...mapChart(idsd),
          },
        ];
      } catch (err) {
        console.error("STORE ERROR:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchRiset(payload, append = true) {
      this.loading = true;

      try {
        const res = await eridaService.getDataRiset(payload);

        const data = res.data?.data || [];
        const lastPage = res.data?.jml_data || 1;

        if (append) {
          this.riset = [...this.riset, ...data];
        } else {
          this.riset = data;
        }

        this.dataLastPage = lastPage;
        this.lastFetchedCount = data.length; // 🔥 important
      } catch (err) {
        console.error("RISET ERROR:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchKrenova(payload, append = true) {
      this.loading = true;

      try {
        const res = await eridaService.getDataKrenova(payload);

        const data = res.data?.data || [];
        const lastPage = res.data?.jml_data || 1;

        if (append) {
          this.krenova = [...this.krenova, ...data];
        } else {
          this.krenova = data;
        }

        this.dataLastPage = lastPage;
        this.lastFetchedCount = data.length; // 🔥 important
      } catch (err) {
        console.error("KRENOVA ERROR:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchAksi(payload, append = true) {
      this.loading = true;

      try {
        const res = await eridaService.getDataAksi(payload);

        const data = res.data?.data || [];
        const lastPage = res.data?.jml_data || 1;

        if (append) {
          this.aksi = [...this.aksi, ...data];
        } else {
          this.aksi = data;
        }

        this.dataLastPage = lastPage;
        this.lastFetchedCount = data.length; // 🔥 important
      } catch (err) {
        console.error("AKSI ERROR:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchTeknologi(payload, append = true) {
      this.loading = true;

      try {
        const res = await eridaService.getDataTeknologi(payload);

        const data = res.data?.data || [];
        const lastPage = res.data?.jml_data || 1;

        if (append) {
          this.teknologi = [...this.teknologi, ...data];
        } else {
          this.teknologi = data;
        }

        this.dataLastPage = lastPage;
        this.lastFetchedCount = data.length; // 🔥 important
      } catch (err) {
        console.error("TEKNOLOGI ERROR:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchHaki(payload, append = true) {
      this.loading = true;

      try {
        const res = await eridaService.getDataHaki(payload);

        const data = res.data?.data || [];
        const lastPage = res.data?.jml_data || 1;

        if (append) {
          this.haki = [...this.haki, ...data];
        } else {
          this.haki = data;
        }

        this.dataLastPage = lastPage;
        this.lastFetchedCount = data.length; // 🔥 important
      } catch (err) {
        console.error("HAKI ERROR:", err);
      } finally {
        this.loading = false;
      }
    },

    async fetchPenelitian(payload, append = true) {
      this.loading = true;

      try {
        const res = await eridaService.getDataPenelitian(payload);

        const data = res.data?.data || [];
        const lastPage = res.data?.jml_data || 1;

        if (append) {
          this.penelitian = [...this.penelitian, ...data];
        } else {
          this.penelitian = data;
        }

        this.dataLastPage = lastPage;
        this.lastFetchedCount = data.length; // 🔥 important
      } catch (err) {
        console.error("PENELITIAN ERROR:", err);
      } finally {
        this.loading = false;
      }
    },
  },
});
