import { apiBansos } from 'src/api/bansos'

const base = 'public/v1/dashboard' // change if you later use prefix like '/public/v1'

export default {

  // =========================
  // MASTER
  // =========================
  getKecamatan () {
    return apiBansos.get(base + '/kecamatan')
  },

  // =========================
  // SUMMARY
  // =========================
  getJmlKelompok () {
    return apiBansos.post(base + '/jmlKelompok')
  },

  getJmlBantuanIndividu () {
    return apiBansos.post(base + '/jmlBantuanIndividu')
  },

  getJmlBantuanKelompok () {
    return apiBansos.post(base + '/jmlBantuanKelompok')
  },

  // =========================
  // PIE CHART
  // =========================
  getIndividu (payload) {
    return apiBansos.post(base + '/viewIndividu', payload)
  },

  getKelompok (payload) {
    return apiBansos.post(base + '/viewKelompok', payload)
  },

  // =========================
  // BAR CHART
  // =========================
  getIndividuKecamatan (payload) {
    return apiBansos.post(base + '/viewIndividuKecamatan', payload)
  },

  getKelompokKecamatan (payload) {
    return apiBansos.post(base + '/viewKelompokKecamatan', payload)
  },

  searchNik(payload) {
    return apiBansos.post(base + '/searchNik', payload)
  },

  // =========================
  // UKT
  // =========================
  getUkt (payload) {
    return apiBansos.post(base + '/viewUkt', payload)
  },

  getTahunUkt () {
    return apiBansos.get(base + '/tahunUkt')
  }

}