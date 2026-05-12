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
  getJmlKelompok (payload) {
    return apiBansos.post(base + '/jmlKelompok', payload)
  },

  getJmlBantuanIndividu (payload) {
    return apiBansos.post(base + '/jmlBantuanIndividu', payload)
  },

  getJmlBantuanKelompok (payload) {
    return apiBansos.post(base + '/jmlBantuanKelompok', payload)
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

  getSektor (payload) {
    return apiBansos.post(base + '/viewSektor', payload)
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
  },

  getTahunAll () {
    return apiBansos.get(base + '/tahunAll')
  }

}