import { defineStore } from 'pinia'
import BansosService from 'src/services/bansos.service'

export const useBansosStore = defineStore('bansos', {
  state: () => ({
    kecamatan: [],

    jmlKelompok: 0,
    jmlBantuanIndividu: 0,
    jmlBantuanKelompok: 0,

    individu: [],
    kelompok: [],
    sektorBansos: [],

    individuKecamatan: [],
    kelompokKecamatan: [],

    searchResult: null,
    searchLoading: false,
    searched: false,

    loading: false,
    loadingUkt: false,

    // Global Filters
    tahunList: [],
    pilih_tahun: null,

    // UKT
    ukt: [],
    tahunUktList: [],
    pilih_tahun_ukt: null
  }),

  actions: {

    // =========================
    // MASTER
    // =========================
    async getKecamatan () {
      this.loading = true
      try {
        const res = await BansosService.getKecamatan()
        this.kecamatan = res.data?.data || []
        return this.kecamatan
      } catch (err) {
        console.error('GET KECAMATAN ERROR:', err)
        return []
      } finally {
        this.loading = false
      }
    },

    // =========================
    // SUMMARY
    // =========================
    async getSummary (payload = {}) {
      this.loading = true
      try {
        const [kelompok, individu, kelompokBantuan] = await Promise.all([
          BansosService.getJmlKelompok(payload),
          BansosService.getJmlBantuanIndividu(payload),
          BansosService.getJmlBantuanKelompok(payload)
        ])

        this.jmlKelompok = kelompok.data?.total || 0
        this.jmlBantuanIndividu = individu.data?.total || 0
        this.jmlBantuanKelompok = kelompokBantuan.data?.total || 0

        return {
          kelompok: this.jmlKelompok,
          individu: this.jmlBantuanIndividu,
          kelompok_bantuan: this.jmlBantuanKelompok
        }

      } catch (err) {
        console.error('SUMMARY ERROR:', err)
        return {
          kelompok: 0,
          individu: 0,
          kelompok_bantuan: 0
        }
      } finally {
        this.loading = false
      }
    },

    // =========================
    // PIE CHART
    // =========================
    async getIndividu (payload) {
      this.loading = true
      try {
        const res = await BansosService.getIndividu(payload)
        this.individu = res.data?.data || []
        return this.individu
      } catch (err) {
        console.error('INDIVIDU ERROR:', err)
        return []
      } finally {
        this.loading = false
      }
    },

    async getKelompok (payload) {
      this.loading = true
      try {
        const res = await BansosService.getKelompok(payload)
        this.kelompok = res.data?.data || []
        return this.kelompok
      } catch (err) {
        console.error('KELOMPOK ERROR:', err)
        return []
      } finally {
        this.loading = false
      }
    },

    async getSektorBansos (payload) {
      this.loading = true
      try {
        const res = await BansosService.getSektor(payload)
        this.sektorBansos = res.data?.data || []
        return this.sektorBansos
      } catch (err) {
        console.error('SEKTOR BANSOS ERROR:', err)
        return []
      } finally {
        this.loading = false
      }
    },

    // =========================
    // BAR CHART
    // =========================
    async getIndividuKecamatan (payload) {
      this.loading = true
      try {
        const res = await BansosService.getIndividuKecamatan(payload)
        this.individuKecamatan = res.data?.data || []
        return this.individuKecamatan
      } catch (err) {
        console.error('INDIVIDU KEC ERROR:', err)
        return []
      } finally {
        this.loading = false
      }
    },

    async getKelompokKecamatan (payload) {
      this.loading = true
      try {
        const res = await BansosService.getKelompokKecamatan(payload)
        this.kelompokKecamatan = res.data?.data || []
        return this.kelompokKecamatan
      } catch (err) {
        console.error('KELOMPOK KEC ERROR:', err)
        return []
      } finally {
        this.loading = false
      }
    },

    // =========================
    // LOAD ALL (OPTIONAL HELPER)
    // =========================
    async fetchAll (payload = {}) {
      this.loading = true
      try {
        // Fetch tahun list if empty
        if (this.tahunList.length === 0) {
          await this.getTahunAll()
        }

        // Apply global year filter to payload if selected
        if (this.pilih_tahun) {
          payload.tahun = this.pilih_tahun
        }

        await Promise.all([
          this.getKecamatan(),
          this.getSummary(payload),
          this.getIndividu(payload),
          this.getKelompok(payload),
          this.getSektorBansos(payload),
          this.getIndividuKecamatan(payload),
          this.getKelompokKecamatan(payload),
          this.getTahunUkt()
        ])
        
        // Sesudah tahun didapat, default tahun akan diset
        if (this.pilih_tahun_ukt) {
          payload.tahun = this.pilih_tahun_ukt
        }
        await this.getUkt(payload)

      } catch (err) {
        console.error('FETCH ALL ERROR:', err)
      } finally {
        this.loading = false
      }
    },

    // =========================
    // UKT
    // =========================
    async getUkt(payload) {
      this.loadingUkt = true;
      try {
        const res = await BansosService.getUkt(payload);
        this.ukt = res.data?.data || [];
        return this.ukt;
      } catch (err) {
        console.error('UKT ERROR:', err);
        return [];
      } finally {
        this.loadingUkt = false;
      }
    },

    async getTahunUkt() {
      try {
        const res = await BansosService.getTahunUkt();
        const dbYears = res.data?.data || [];
        
        // Ensure 2025 and 2024 etc are included as per user request
        const mandatoryYears = ['2025', '2024', '2023'];
        
        this.tahunUktList = [...new Set([...mandatoryYears, ...dbYears])].sort((a, b) => b - a);
        
        if (this.tahunUktList.length > 0 && !this.pilih_tahun_ukt) {
          this.pilih_tahun_ukt = this.tahunUktList[0];
        }
        return this.tahunUktList;
      } catch (err) {
        console.error('GET TAHUN UKT ERROR:', err);
        return [];
      }
    },

    async searchNik(payload) {
  this.searchLoading = true;
  this.searched = false;

  try {
    const res = await BansosService.searchNik(payload);

    console.log('RES FRONTEND:', res); // 🔥 cek ini

    this.searchResult = res.data.data || null;
    this.searched = true;

    return this.searchResult;

  } catch (err) {
    console.error("SEARCH NIK ERROR:", err);

    this.searchResult = null;
    this.searched = true;

    return null;

  } finally {
    this.searchLoading = false;
  }
  },

  async getTahunAll() {
    try {
      const res = await BansosService.getTahunAll();
      const dbYears = res.data?.data || [];
      
      // Generate years from current year down to 2022 to ensure 2024 etc exist
      const currentYear = new Date().getFullYear();
      const startYear = 2022;
      const years = [];
      for (let y = currentYear; y >= startYear; y--) {
        years.push(y.toString());
      }

      // Merge with dbYears and unique
      this.tahunList = [...new Set([...years, ...dbYears])].sort((a, b) => b - a);
      
      return this.tahunList;
    } catch (err) {
      console.error('GET TAHUN ALL ERROR:', err);
      return [];
    }
  },
}
})