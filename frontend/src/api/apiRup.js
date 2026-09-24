import axios from 'axios'
import { api } from './api'

const BACKEND_BASE = '/api/v1/rup'
const INSTANSI_KONSEL = 'D438'
const JENIS_KLPD = '4'

// Fallback data lokal jika internet offline total
const DUMMY_DATA_2025 = [
  {
    kode_rup: '58301928', nama_paket: 'Pengadaan Perangkat Server dan Penyimpanan Data Center SPBE',
    opd: 'Dinas Komunikasi, Informatika dan Persandian', metode: 'E-Purchasing',
    pagu: 450000000, sumber_dana: 'APBD', tahun: '2025', jenis: 'Pengadaan Barang', pdn: 'Ya'
  },
  {
    kode_rup: '58301933', nama_paket: 'Peningkatan Jalan Poros Motaha - Alenggeo (Hotmix)',
    opd: 'Dinas Pekerjaan Umum dan Penataan Ruang', metode: 'Tender',
    pagu: 3200000000, sumber_dana: 'DAK Fisik 2025', tahun: '2025', jenis: 'Pekerjaan Konstruksi', pdn: 'Ya'
  },
  {
    kode_rup: '58301940', nama_paket: 'Pengadaan Obat-obatan dan Perbekalan Kesehatan Esensial Puskesmas',
    opd: 'Dinas Kesehatan', metode: 'E-Purchasing',
    pagu: 850000000, sumber_dana: 'APBD', tahun: '2025', jenis: 'Pengadaan Barang', pdn: 'Ya'
  },
  {
    kode_rup: '58301955', nama_paket: 'Rehabilitasi Ruang Kelas SDN 3 Kolono',
    opd: 'Dinas Pendidikan dan Kebudayaan', metode: 'Pengadaan Langsung',
    pagu: 180000000, sumber_dana: 'DAU 2025', tahun: '2025', jenis: 'Pekerjaan Konstruksi', pdn: 'Ya'
  },
  {
    kode_rup: '58301962', nama_paket: 'Pembangunan Jembatan Gantung Penghubung Antar Desa Landono',
    opd: 'Dinas Pekerjaan Umum dan Penataan Ruang', metode: 'Tender',
    pagu: 1450000000, sumber_dana: 'APBD', tahun: '2025', jenis: 'Pekerjaan Konstruksi', pdn: 'Ya'
  },
  {
    kode_rup: '58301977', nama_paket: 'Pemeliharaan Rutin Sarana Jaringan Fiber Optik Perkantoran',
    opd: 'Dinas Komunikasi, Informatika dan Persandian', metode: 'Swakelola',
    pagu: 75000000, sumber_dana: 'APBD', tahun: '2025', jenis: 'Jasa Lainnya', pdn: 'Ya'
  },
  {
    kode_rup: '58301985', nama_paket: 'Pengadaan Kendaraan Dinas Operasional Roda 4',
    opd: 'Sekretariat Daerah', metode: 'E-Purchasing',
    pagu: 380000000, sumber_dana: 'APBD', tahun: '2025', jenis: 'Pengadaan Barang', pdn: 'Ya'
  },
  {
    kode_rup: '58301992', nama_paket: 'Pembangunan Gedung Puskesmas Baito',
    opd: 'Dinas Kesehatan', metode: 'Tender',
    pagu: 2100000000, sumber_dana: 'DAK Fisik 2025', tahun: '2025', jenis: 'Pekerjaan Konstruksi', pdn: 'Ya'
  },
  {
    kode_rup: '58302010', nama_paket: 'Pengadaan Buku Teks Pelajaran SD dan SMP',
    opd: 'Dinas Pendidikan dan Kebudayaan', metode: 'E-Purchasing',
    pagu: 320000000, sumber_dana: 'APBD', tahun: '2025', jenis: 'Pengadaan Barang', pdn: 'Ya'
  },
  {
    kode_rup: '58302025', nama_paket: 'Pelatihan Kapasitas Aparatur Desa',
    opd: 'Dinas Pemberdayaan Masyarakat dan Desa', metode: 'Swakelola',
    pagu: 125000000, sumber_dana: 'APBD', tahun: '2025', jenis: 'Jasa Lainnya', pdn: 'Ya'
  }
]

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

  // Di dev web gunakan proxy Vite, di Capacitor Android bisa langsung
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
export async function getRupSummary(tahun = '2025') {
  // 1. Coba backend server
  try {
    const res = await api.get(`${BACKEND_BASE}/summary`, {
      params: { tahun },
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
    // continue to direct web
  }

  // 2. Coba direct web INAPROC
  try {
    const res = await fetchDirectInaproc('summary', {
      tahun: String(tahun),
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
    // continue to fallback
  }

  // Fallback summary
  return {
    success: true,
    source: 'lokal',
    total_rup: DUMMY_DATA_2025.length,
    total_pagu: DUMMY_DATA_2025.reduce((acc, curr) => acc + (curr.pagu || 0), 0)
  }
}

/**
 * Ambil daftar paket RUP Konawe Selatan
 */
export async function getDaftarRup({
  tahun = '2025',
  page = 1,
  limit = 20,
  cara = '',       // 'Penyedia' | 'Swakelola' | '' (semua)
  metode = '',     // 'Tender' | 'Pengadaan Langsung' | 'E-Purchasing' | 'Penunjukan Langsung' | ''
  jenis = '',      // 'Barang' | 'Pekerjaan Konstruksi' | 'Jasa Konsultansi' | 'Jasa Lainnya' | ''
  search = '',
  satker = ''
} = {}) {
  // 1. Coba backend server terlebih dahulu
  try {
    const res = await api.get(`${BACKEND_BASE}/paket-penyedia`, {
      params: { tahun, page, limit, cara, metode, jenis, search, satker },
      timeout: 6000
    })
    if (res.data?.success && Array.isArray(res.data.data)) {
      return {
        success: true,
        source: 'inaproc-live',
        ...res.data
      }
    }
  } catch {
    // Fallback ke direct web INAPROC
  }

  // 2. Coba langsung ke web INAPROC (didukung di dev server & Capacitor Android)
  try {
    const queryParams = {
      tahun: String(tahun),
      jenis_klpd: JENIS_KLPD,
      instansi: INSTANSI_KONSEL,
      page: String(page),
      limit: String(limit)
    }

    // cara pengadaan: 'Penyedia' | 'Swakelola' (parameter 'sumber' di INAPROC)
    if (cara && cara !== 'Semua') {
      queryParams.sumber = cara
    }

    // filter_metode hanya berlaku jika cara = Penyedia
    if (metode && metode !== 'Semua' && cara !== 'Swakelola') {
      queryParams.filter_metode = metode
    }

    // jenis pengadaan (filter_jenis)
    if (jenis && jenis !== 'Semua') {
      queryParams.filter_jenis = jenis
    }

    if (search && search.trim()) {
      queryParams.search_paket = search.trim()
    }
    if (satker && satker !== 'Semua OPD') {
      queryParams.satker = satker
    }

    const res = await fetchDirectInaproc('table', queryParams)

    if (res.data && Array.isArray(res.data.tableRows)) {
      const rows = res.data.tableRows
      const total = res.data.tableTotalRows || rows.length

      return {
        success: true,
        source: 'inaproc-live',
        tahun: String(tahun),
        total,
        page,
        limit,
        data: rows.map((item, idx) => ({
          id: item.kode_rup || `${page}-${idx + 1}`,
          kode_rup: String(item.kode_rup || ''),
          nama_paket: item.nama_paket || 'Tanpa Nama Paket',
          opd: item.nama_satker || item.nama_instansi || 'Pemerintah Kab. Konawe Selatan',
          metode: item.metode_pengadaan || item.cara_pengadaan_label || 'Penyedia',
          pagu: parseFloat(item.total_nilai || 0),
          sumber_dana: item.sumber_dana || 'APBD',
          tahun: String(item.tahun_anggaran || tahun),
          jenis: item.jenis_pengadaan || 'Pengadaan',
          cara_pengadaan: item.cara_pengadaan || '',
          pdn: item.produk_dalam_negeri || 'Ya',
          status: 'Aktif'
        }))
      }
    }
  } catch (err) {
    console.warn('Direct Inaproc fetch failed, using local fallback:', err.message)
  }

  // 3. Fallback ke data lokal jika semua koneksi gagal
  let filtered = DUMMY_DATA_2025.filter(d => !tahun || d.tahun === String(tahun))
  if (metode && metode !== 'Semua') {
    filtered = filtered.filter(d => (d.metode || '').toLowerCase().includes(metode.toLowerCase()))
  }
  if (search && search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(d => (d.nama_paket || '').toLowerCase().includes(q) || (d.opd || '').toLowerCase().includes(q))
  }

  const start = (page - 1) * limit
  const paged = filtered.slice(start, start + limit)

  return {
    success: true,
    source: 'lokal',
    tahun: String(tahun),
    total: filtered.length,
    page,
    limit,
    data: paged.map((d, i) => ({ ...d, id: d.kode_rup || i + 1 }))
  }
}
