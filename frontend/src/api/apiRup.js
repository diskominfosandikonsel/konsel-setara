import axios from 'axios'
import { api } from './api'

const BACKEND_BASE = '/api/v1/rup'
const INSTANSI_KONSEL = 'D438'
const JENIS_KLPD = '4'

/**
 * Buat signature validasi untuk data.inaproc.id
 */
function createInaprocSignature() {
  const now = Date.now().toString()
  const secret = btoa(now.split('').reverse().join(''))
  return {
    'x-request-time': now,
    'x-secret': secret,
    'Accept': 'application/json, text/plain, */*'
  }
}

/**
 * Fetch langsung dari web INAPROC dashboard-api
 */
async function fetchDirectInaproc(path, params = {}) {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const isCapacitor = !!window.Capacitor?.isNativePlatform?.()

  // Di dev web gunakan proxy Vite, di Capacitor Android langsung ke INAPROC
  const baseUrl = (isDev && !isCapacitor)
    ? '/inaproc-proxy/dashboard-api/rup'
    : 'https://data.inaproc.id/dashboard-api/rup'

  const headers = createInaprocSignature()

  return axios.get(`${baseUrl}/${path}`, {
    params,
    headers,
    timeout: 10000
  })
}

/**
 * Ambil ringkasan pagu dan jumlah paket RUP
 */
export async function getRupSummary(tahun) {
  const currentYear = tahun || String(new Date().getFullYear())

  // 1. Coba backend server
  try {
    const res = await api.get(`${BACKEND_BASE}/summary`, {
      params: { tahun: currentYear },
      timeout: 5000
    })
    if (res.data?.success && res.data.summary) {
      return {
        success: true,
        source: 'inaproc-live',
        total_rup: res.data.summary.jumlah_rup || 0,
        total_pagu: res.data.summary.total_pagu || 0
      }
    }
  } catch {
    // lanjut ke direct web
  }

  // 2. Coba direct web INAPROC
  try {
    const res = await fetchDirectInaproc('summary', {
      tahun: currentYear,
      jenis_klpd: JENIS_KLPD,
      instansi: INSTANSI_KONSEL
    })
    if (res.data?.summary) {
      return {
        success: true,
        source: 'inaproc-live',
        total_rup: res.data.summary.jumlah_rup || 0,
        total_pagu: res.data.summary.total_pagu || 0
      }
    }
  } catch {
    // gagal
  }

  // Tidak ada data
  return { success: false, error: 'Tidak dapat terhubung ke data INAPROC' }
}

/**
 * Ambil daftar paket RUP Konawe Selatan
 */
export async function getDaftarRup({
  tahun,
  page = 1,
  limit = 20,
  cara = '',       // 'Penyedia' | 'Swakelola' | '' (semua)
  metode = '',     // 'Tender' | 'Pengadaan Langsung' | 'E-Purchasing' | 'Penunjukan Langsung' | ''
  jenis = '',      // 'Barang' | 'Pekerjaan Konstruksi' | 'Jasa Konsultansi' | 'Jasa Lainnya' | ''
  search = '',
  satker = ''
} = {}) {
  const currentYear = tahun || String(new Date().getFullYear())

  // 1. Coba backend server terlebih dahulu
  try {
    const res = await api.get(`${BACKEND_BASE}/paket-penyedia`, {
      params: { tahun: currentYear, page, limit, cara, metode, jenis, search, satker },
      timeout: 6000
    })
    if (res.data?.success && Array.isArray(res.data.data)) {
      return { success: true, source: 'inaproc-live', ...res.data }
    }
  } catch {
    // lanjut ke direct web
  }

  // 2. Coba langsung ke web INAPROC (proxy dev / Capacitor Android)
  try {
    const queryParams = {
      tahun: currentYear,
      jenis_klpd: JENIS_KLPD,
      instansi: INSTANSI_KONSEL,
      page: String(page),
      limit: String(limit)
    }

    if (cara && cara !== 'Semua') queryParams.sumber = cara
    if (metode && metode !== 'Semua' && cara !== 'Swakelola') queryParams.filter_metode = metode
    if (jenis && jenis !== 'Semua') queryParams.filter_jenis = jenis
    const querySearch = search ? String(search).trim() : ''
    const isNumericSearch = /^\d+$/.test(querySearch)

    if (querySearch) {
      if (isNumericSearch) {
        queryParams.search_rup = querySearch
      } else {
        queryParams.search_paket = querySearch
      }
    }
    if (satker && satker !== 'Semua OPD') queryParams.satker = satker

    let res = await fetchDirectInaproc('table', queryParams)

    // Jika pencarian angka dengan search_rup tidak menemukan hasil, coba fallback search_paket
    if (isNumericSearch && querySearch && (!res.data?.tableRows || res.data.tableRows.length === 0)) {
      const fallbackParams = { ...queryParams }
      delete fallbackParams.search_rup
      fallbackParams.search_paket = querySearch
      try {
        const fallbackRes = await fetchDirectInaproc('table', fallbackParams)
        if (fallbackRes.data?.tableRows?.length > 0) {
          res = fallbackRes
        }
      } catch {
        // Abaikan dan gunakan res awal
      }
    }

    if (res.data && Array.isArray(res.data.tableRows)) {
      const rows = res.data.tableRows
      const total = res.data.tableTotalRows || rows.length

      return {
        success: true,
        source: 'inaproc-live',
        tahun: currentYear,
        total,
        page,
        limit,
        data: rows.map((item, idx) => ({
          id: item.kode_rup || `${page}-${idx + 1}`,
          kode_rup: String(item.kode_rup || ''),
          nama_paket: item.nama_paket || '',
          opd: item.nama_satker || item.nama_instansi || '',
          metode: item.metode_pengadaan || item.cara_pengadaan_label || '',
          pagu: parseFloat(item.total_nilai || 0),
          sumber_dana: item.sumber_dana || 'APBD',
          tahun: String(item.tahun_anggaran || currentYear),
          jenis: item.jenis_pengadaan || '',
          cara_pengadaan: item.cara_pengadaan || '',
          pdn: item.produk_dalam_negeri || 'Ya',
          status: 'Aktif'
        }))
      }
    }
  } catch (err) {
    console.warn('Gagal fetch dari web INAPROC:', err.message)
  }

  // Semua koneksi gagal — kembalikan error, tidak ada data dummy
  return {
    success: false,
    error: 'Tidak dapat terhubung ke data INAPROC. Periksa koneksi internet Anda.'
  }
}

