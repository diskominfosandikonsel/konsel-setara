import { api } from './api'

const BASE = '/api/v1/rup'

// Data dummy lokal sebagai fallback ketika API inaproc tidak tersedia
const DUMMY_DATA_2025 = [
  {
    kode_rup: '58301928', nama_paket: 'Pengadaan Perangkat Server dan Penyimpanan Data Center SPBE',
    opd: 'Dinas Komunikasi, Informatika dan Persandian', metode: 'E-Purchasing',
    pagu: 450000000, sumber_dana: 'APBD Kab. Konsel', tahun: '2025'
  },
  {
    kode_rup: '58301933', nama_paket: 'Peningkatan Jalan Poros Motaha - Alenggeo (Hotmix)',
    opd: 'Dinas Pekerjaan Umum dan Penataan Ruang', metode: 'Tender',
    pagu: 3200000000, sumber_dana: 'DAK Fisik 2025', tahun: '2025'
  },
  {
    kode_rup: '58301940', nama_paket: 'Pengadaan Obat-obatan dan Perbekalan Kesehatan Esensial Puskesmas',
    opd: 'Dinas Kesehatan', metode: 'E-Purchasing',
    pagu: 850000000, sumber_dana: 'APBD Kab. Konsel', tahun: '2025'
  },
  {
    kode_rup: '58301955', nama_paket: 'Rehabilitasi Ruang Kelas SDN 3 Kolono',
    opd: 'Dinas Pendidikan dan Kebudayaan', metode: 'Pengadaan Langsung',
    pagu: 180000000, sumber_dana: 'DAU 2025', tahun: '2025'
  },
  {
    kode_rup: '58301962', nama_paket: 'Pembangunan Jembatan Gantung Penghubung Antar Desa Landono',
    opd: 'Dinas Pekerjaan Umum dan Penataan Ruang', metode: 'Tender',
    pagu: 1450000000, sumber_dana: 'APBD Kab. Konsel', tahun: '2025'
  },
  {
    kode_rup: '58301977', nama_paket: 'Pemeliharaan Rutin Sarana Jaringan Fiber Optik Perkantoran',
    opd: 'Dinas Komunikasi, Informatika dan Persandian', metode: 'Swakelola',
    pagu: 75000000, sumber_dana: 'APBD Kab. Konsel', tahun: '2025'
  },
  {
    kode_rup: '58301985', nama_paket: 'Pengadaan Kendaraan Dinas Operasional Roda 4',
    opd: 'Sekretariat Daerah', metode: 'E-Purchasing',
    pagu: 380000000, sumber_dana: 'APBD Kab. Konsel', tahun: '2025'
  },
  {
    kode_rup: '58301992', nama_paket: 'Pembangunan Gedung Puskesmas Baito',
    opd: 'Dinas Kesehatan', metode: 'Tender',
    pagu: 2100000000, sumber_dana: 'DAK Fisik 2025', tahun: '2025'
  },
  {
    kode_rup: '58302010', nama_paket: 'Pengadaan Buku Teks Pelajaran SD dan SMP',
    opd: 'Dinas Pendidikan dan Kebudayaan', metode: 'E-Purchasing',
    pagu: 320000000, sumber_dana: 'APBD Kab. Konsel', tahun: '2025'
  },
  {
    kode_rup: '58302025', nama_paket: 'Pelatihan Kapasitas Aparatur Desa',
    opd: 'Dinas Pemberdayaan Masyarakat dan Desa', metode: 'Swakelola',
    pagu: 125000000, sumber_dana: 'APBD Kab. Konsel', tahun: '2025'
  }
]

/**
 * Ambil daftar paket penyedia RUP Konawe Selatan
 * - Jika API inaproc tersedia melalui backend proxy, gunakan data real
 * - Jika tidak, gunakan data dummy lokal
 */
export async function getDaftarRup({ tahun, page = 1, limit = 20 } = {}) {
  try {
    const res = await api.get(`${BASE}/paket-penyedia`, {
      params: { tahun, page, limit },
      timeout: 12000
    })
    if (res.data?.success) {
      return { success: true, source: 'inaproc', ...res.data }
    }
    throw new Error(res.data?.error || 'API tidak tersedia')
  } catch {
    // Fallback ke data dummy
    const filtered = DUMMY_DATA_2025.filter(d => !tahun || d.tahun === String(tahun))
    return {
      success: true,
      source: 'lokal',
      tahun: tahun || '2025',
      total: filtered.length,
      data: filtered.map((d, i) => ({ ...d, id: i + 1 }))
    }
  }
}

/**
 * Cek status koneksi ke API inaproc
 */
export async function pingInaproc() {
  try {
    const res = await api.get(`${BASE}/ping`, { timeout: 10000 })
    return res.data
  } catch {
    return { connected: false, error: 'Tidak dapat terhubung ke backend' }
  }
}
