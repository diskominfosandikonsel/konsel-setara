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

    individuKecamatan: [],
    kelompokKecamatan: [],

    searchResult: null,
    searchLoading: false,
    searched: false,

    loading: false,

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
    async getSummary () {
      this.loading = true
      try {
        const [kelompok, individu, kelompokBantuan] = await Promise.all([
          BansosService.getJmlKelompok(),
          BansosService.getJmlBantuanIndividu(),
          BansosService.getJmlBantuanKelompok()
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
        await Promise.all([
          this.getKecamatan(),
          this.getSummary(),
          this.getIndividu(payload),
          this.getKelompok(payload),
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
      this.loading = true;
      try {
        const res = await BansosService.getUkt(payload);
        this.ukt = res.data?.data || [];
        return this.ukt;
      } catch (err) {
        console.error('UKT ERROR:', err);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async getTahunUkt() {
      try {
        const res = await BansosService.getTahunUkt();
        this.tahunUktList = res.data?.data || [];
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

  }
})