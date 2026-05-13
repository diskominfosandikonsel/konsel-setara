import { defineStore } from 'pinia'
import DataService from 'src/services/data.service'

export const useDataStore = defineStore('data', {
  state: () => ({
    opds: [],
    dashboard: [],
    daerah: null,
    loading: false,
    loadingDetail: false
  }),

  actions: {
    // =========================
    // OPD LIST
    // =========================
    async fetchOpd () {
      try {
        const res = await DataService.getOpd()
        this.opds = res.data?.opds || []
        return this.opds
      } catch (err) {
        console.error('FETCH OPD ERROR:', err)
        return []
      }
    },

    // =========================
    // DASHBOARD
    // =========================
    async fetchDashboard (params = {}) {
      this.loadingDetail = true
      try {
        const res = await DataService.getDashboard(params)
        this.dashboard = res.data?.data || []
        return this.dashboard
      } catch (err) {
        console.error('FETCH DASHBOARD ERROR:', err)
        return []
      } finally {
        this.loadingDetail = false
      }
    },

    // =========================
    // INFO DAERAH
    // =========================
    async fetchDaerah () {
      try {
        const res = await DataService.getDaerah()
        this.daerah = res.data?.daerah || null
        return this.daerah
      } catch (err) {
        console.error('FETCH DAERAH ERROR:', err)
        return null
      }
    },

    // =========================
    // FETCH ALL INITIAL DATA
    // =========================
    async fetchAll () {
      // Optimasi: Jika data sudah ada di store (cache memori), jangan tampilkan loading
      // Biarkan aplikasi menggunakan data lama sambil memuat data baru secara diam-diam (Stale-While-Revalidate)
      if (this.opds.length === 0 || this.dashboard.length === 0) {
        this.loading = true
      }
      
      try {
        await Promise.all([
          this.fetchOpd(),
          this.fetchDashboard(),
          this.fetchDaerah()
        ])

        // Always ensure we have all 37 OPDs (merge with API response or override)
        const fullOpds = [
          { kode_opd: '5.03.5.04.0.00.01.0000', nama_opd: 'Badan Kepegawaian Dan Pengembangan Sumber Daya Manusia' },
          { kode_opd: '8.01.0.00.0.00.01.0000', nama_opd: 'Badan Kesatuan Bangsa Dan Politik' },
          { kode_opd: '5.02.0.00.0.00.01.0000', nama_opd: 'Badan Keuangan Dan Aset Daerah' },
          { kode_opd: '1.08.1.05.0.00.02.0000', nama_opd: 'Badan Penanggulangan Bencana Daerah' },
          { kode_opd: '5.04.0.00.0.00.02.0000', nama_opd: 'Badan Pendapatan Daerah' },
          { kode_opd: '5.01.0.00.0.00.01.0000', nama_opd: 'Badan Perencanaan Pembangunan Daerah' },
          { kode_opd: '5.05.0.00.0.00.01.0000', nama_opd: 'Badan Riset Dan Inovasi Daerah' },
          { kode_opd: '7405.0.00.0.00.01.0000', nama_opd: 'BPS Konawe Selatan' },
          { kode_opd: '2.19.0.00.0.00.01.0000', nama_opd: 'Dinas Kepemudaan Dan Olahraga' },
          { kode_opd: '2.12.0.00.0.00.01.0000', nama_opd: 'Dinas Kependudukan Dan Pencatatan Sipil' },
          { kode_opd: '1.02.0.00.0.00.01.0000', nama_opd: 'Dinas Kesehatan' },
          { kode_opd: '2.09.0.00.0.00.01.0000', nama_opd: 'Dinas Ketahanan Pangan' },
          { kode_opd: '2.16.2.21.2.20.01.0000', nama_opd: 'Dinas Komunikasi, Informatika Dan Persandian' },
          { kode_opd: '2.17.0.00.0.00.01.0000', nama_opd: 'Dinas Koperasi Usaha Mikro, Kecil Dan Menengah' },
          { kode_opd: '2.11.0.00.0.00.01.0000', nama_opd: 'Dinas Lingkungan Hidup' },
          { kode_opd: '3.26.0.00.0.00.01.0000', nama_opd: 'Dinas Pariwisata' },
          { kode_opd: '1.03.0.00.0.00.01.0000', nama_opd: 'Dinas Pekerjaan Umum Dan Tata Ruang' },
          { kode_opd: '1.05.0.00.0.00.02.0000', nama_opd: 'Dinas Pemadam Kebakaran Dan Penyelamatan' },
          { kode_opd: '2.13.0.00.0.00.01.0000', nama_opd: 'Dinas Pemberdayaan Masyarakat Dan Desa' },
          { kode_opd: '2.08.0.00.0.00.01.0000', nama_opd: 'Dinas Pemberdayaan Perempuan Dan Perlindungan Anak' },
          { kode_opd: '2.18.0.00.0.00.01.0000', nama_opd: 'Dinas Penanaman Modal Dan Pelayanan Terpadu Satu Pintu' },
          { kode_opd: '1.01.2.22.0.00.01.0000', nama_opd: 'Dinas Pendidikan Dan Kebudayaan' },
          { kode_opd: '2.14.0.00.0.00.01.0000', nama_opd: 'Dinas Pengendalian Penduduk Dan Keluarga Berencana' },
          { kode_opd: '2.15.0.00.0.00.01.0000', nama_opd: 'Dinas Perhubungan' },
          { kode_opd: '3.25.0.00.0.00.01.0000', nama_opd: 'Dinas Perikanan' },
          { kode_opd: '3.31.3.30.0.00.01.0000', nama_opd: 'Dinas Perindustrian Dan Perdagangan' },
          { kode_opd: '2.23.2.24.0.00.01.0000', nama_opd: 'Dinas Perpustakaan Dan Arsip Daerah' },
          { kode_opd: '1.04.2.10.0.00.01.0000', nama_opd: 'Dinas Perumahan, Kawasan Permukiman Dan Pertanahan' },
          { kode_opd: '3.28.0.00.0.00.02.0000', nama_opd: 'Dinas Peternakan Dan Kesehatan Hewan' },
          { kode_opd: '1.06.0.00.0.00.01.0000', nama_opd: 'Dinas Sosial' },
          { kode_opd: '3.27.0.00.0.00.01.0000', nama_opd: 'Dinas Tanaman Pangan, Hortikultura Dan Perkebunan' },
          { kode_opd: '2.07.3.32.0.00.01.0000', nama_opd: 'Dinas Tenaga Kerja Dan Transmigrasi' },
          { kode_opd: '6.01.0.00.0.00.01.0000', nama_opd: 'Inspektorat Daerah' },
          { kode_opd: '1.09.0.00.0.00.01.0000', nama_opd: 'Rumah Sakit Daerah' },
          { kode_opd: '1.07.0.00.0.00.01.0000', nama_opd: 'Satuan Polisi Pamong Praja' },
          { kode_opd: '4.01.0.00.0.00.01.0000', nama_opd: 'Sekretariat Daerah' },
          { kode_opd: '4.02.0.00.0.00.01.0000', nama_opd: 'Sekretariat DPRD' }
        ]
        
        // Merge the hardcoded list with API response to ensure no OPD is missing
        const opdMap = new Map()
        fullOpds.forEach(opd => opdMap.set(opd.kode_opd, opd))
        this.opds.forEach(opd => opdMap.set(opd.kode_opd, opd))
        this.opds = Array.from(opdMap.values())
      } catch (err) {
        console.error('FETCH ALL DATA ERROR:', err)
      } finally {
        this.loading = false
      }
    }
  }
})
