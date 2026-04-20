import { apiErida } from 'src/api/erida'

const base = '/publish_manis'

export default {
  getRiset() {
    return apiErida.get(base + '/getRiset')
  },
  getDataRiset(payload) {
    return apiErida.post(base + '/riset', payload)
  },
  getKrenova() {
    return apiErida.get(base + '/getKrenova')
  },
  getDataKrenova(payload) {
    return apiErida.post(base + '/krenova', payload)
  },
  getAksi() {
    return apiErida.get(base + '/getAksi')
  },
  getDataAksi(payload) {
    return apiErida.post(base + '/aksi', payload)
  },
  getTeknologi() {
    return apiErida.get(base + '/getTeknologi')
  },
  getDataTeknologi(payload) {
    return apiErida.post(base + '/teknologi', payload)
  },
  getHaki() {
    return apiErida.get(base + '/getHaki')
  },
  getDataHaki(payload) {
    return apiErida.post(base + '/haki', payload)
  },
  getPenelitian() {
    return apiErida.get(base + '/getPenelitian')
  },
  getDataPenelitian(payload) {
    return apiErida.post(base + '/penelitian', payload)
  },
  getIid() {
    return apiErida.get(base + '/iid')
  },
  getIpkd() {
    return apiErida.get(base + '/ipkd')
  },
  getIdsd() {
    return apiErida.get(base + '/idsd')
  }
}