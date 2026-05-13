import { apiData } from 'src/api/apiData'

const base = 'api/public'

export default {

  // =========================
  // OPD LIST
  // =========================
  getOpd () {
    return apiData.get(base + '/opd')
  },

  // =========================
  // DASHBOARD (ALL INDIKATOR)
  // =========================
  getDashboard (params = {}) {
    return apiData.get(base + '/dashboard', { params })
  },

  // =========================
  // INFO DAERAH
  // =========================
  getDaerah () {
    return apiData.get(base + '/daerah')
  }
}
