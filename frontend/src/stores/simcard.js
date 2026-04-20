import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { SimcardService } from 'src/services/simcardService'
import axios from 'axios'
import { list } from 'postcss'

var URL = 'https://server-simcard.konaweselatankab.go.id/'
// var URL = 'http://server-simcard.konaweselatankab.go.id/'
// var URL = 'http://10.91.178.2:5012/'

export const useSimcardStore = defineStore('simcard', {
  state: () => ({
    list_laporan: [],
    total: 0,
    page: 1,
    loading: false,
    cari: '',
    user: '',
    nama: null,
    data: null,
    list_data: [],


    url: {
      URL_APP: URL,
      URL_APPX: URL,
      AUTH : URL + "auth/signup",
      URL_DASHBOARD: URL + 'api/v1/dashboard/',
      URL_MENU_LIST: URL + 'api/v1/menuList/',
      URL_LEVEL_USERS: URL + 'api/v1/levelUsers/',
      URL_REGISTRASI: URL + 'api/v1/pengaturan_registrasi/',

      URL_DATAMASTER_WILAYAH            : URL + 'api/v1/m_provinsi/',
      URL_DATAMASTER_KAB_KOTA           : URL + 'api/v1/m_kabupaten/',
      URL_DATAMASTER_KECAMATAN          : URL + 'api/v1/m_kecamatan/',
      URL_DATAMASTER_DES_KEL            : URL + 'api/v1/m_desa_kelurahan/',

      URL_MASTER_PENDIDIKAN             : URL + 'api/v1/m_list_pendidikan/',
      URL_MASTER_PEKERJAAN              : URL + 'api/v1/m_list_pekerjaan/',
      URL_MASTER_AGAMA                  : URL + 'api/v1/m_list_agama/',

      URL_MASTER_SHDK                  : URL + 'api/v1/m_list_SHDK/',

      URL_MASTER_PKL_JENIS_KELAHIRAN    : URL + 'api/v1/m_pkl_jenis_kelahiran/',
      URL_MASTER_PKL_PENOLONG_KELAHIRAN : URL + 'api/v1/m_pkl_penolong_kelahiran/',
      URL_MASTER_PKL_TEMPAT_DILAHIRKAN  : URL + 'api/v1/m_pkl_tempat_dilahirkan/',

      URL_PERMOHONAN_KTP              : URL + 'api/v1/permohonanKTP/',

      URL_PERMOHONAN_KELAHIRAN        : URL + 'api/v1/permohonanKELAHIRAN/',
      URL_PERMOHONAN_KELAHIRAN_AYTDAU : URL + 'api/v1/permohonanKELAHIRAN_aytdau/',

      // LAPOR KEMATIAN
      URL_PELAPORAN_LAHIR_MATI  : URL + 'api/v1/pelaporan_LAHIR_MATI/',
      URL_PELAPORAN_MATI        : URL + 'api/v1/pelaporan_MATI/',
      // LAPOR KEMATIAN

      URL_PERMOHONAN_KK_BARU    : URL + 'api/v1/permohonan_KK_baru/',
      URL_PERMOHONAN_KK_WNI     : URL + 'api/v1/permohonan_KK_WNI/',
      URL_PERMOHONAN_KK_WNA     : URL + 'api/v1/permohonan_KK_WNA/',

      URL_PERMOHONAN_PPD1       : URL + 'api/v1/permohonan_PPD1/',
      URL_PERMOHONAN_PPD2       : URL + 'api/v1/permohonan_PPD2/',
      URL_PERMOHONAN_PPD3       : URL + 'api/v1/permohonan_PPD3/',
      URL_WA_API                : URL + 'api/v1/wa_api/',
    },    

     
    token: localStorage.token || null,

 

    listPekerjaan: [],
    listAgama: [],
    listPendidikan: [],
    listShdk: [],

    // Persyaratan untuk berbagai halaman/form
    persyaratan: {
      KK_BARU: {
        judul: 'Persyaratan Permohonan Kartu Keluarga Baru',
        umum: [
          'Seluruh Dokumen Harus di scan di satukan dalam bentuk pdf',
          'Kartu Tanda Penduduk (KTP) yang masih berlaku',
          'Surat Nikah (untuk yang sudah menikah)',
          'Akta Kelahiran dari kantor pencatatan sipil',
          'Pas Foto 4x6 cm (hitam putih atau berwarna)',
          'Surat Keterangan Domisili dari kelurahan setempat',
        ],
        khusus: [],
        jamLayanan: 'Senin - Jumat: 08:00 - 16:00 WIT'
      },
      KK_WNI: {
        judul: 'Persyaratan Permohonan Kartu Keluarga WNI',
        umum: [
          'Seluruh Dokumen Harus di scan di satukan dalam bentuk pdf',
          'Kartu Tanda Penduduk (KTP) yang masih berlaku',
          'Surat Nikah (untuk yang sudah menikah)',
          'Akta Kelahiran dari kantor pencatatan sipil',
          'Pas Foto 4x6 cm (hitam putih atau berwarna)',
          'Surat Keterangan Domisili dari kelurahan setempat',
        ],
        khusus: [
          'Bukti Kewarganegaraan Republik Indonesia',
        ],
        jamLayanan: 'Senin - Jumat: 08:00 - 16:00 WIT'
      },
      KK_WNA: {
        judul: 'Persyaratan Permohonan Kartu Keluarga WNA',
        umum: [
          'Seluruh Dokumen Harus di scan di satukan dalam bentuk pdf',
          'Paspor yang masih berlaku',
          'Surat Izin Tinggal Terbatas (KITAS) atau Surat Izin Tinggal Tetap (KITAP)',
          'Surat Nikah (untuk yang sudah menikah)',
          'Pas Foto 4x6 cm (hitam putih atau berwarna)',
          'Surat Keterangan Domisili dari kelurahan setempat',
        ],
        khusus: [
          'Bukti sponsor atau pihak yang menanggung',
        ],
        jamLayanan: 'Senin - Jumat: 08:00 - 16:00 WIT'
      },
      KTP: {
        judul: 'Persyaratan Permohonan KTP',
        umum: [
          'Kartu Keluarga (KK) asli atau fotokopi',
          'Akta Kelahiran atau Surat Keterangan Lahir',
          'Pas Foto 4x6 cm (hitam putih atau berwarna)',
          'Surat Keterangan Domisili (jika berbeda dengan KK)',
        ],
        khusus: [
          'Untuk perubahan data: bukti dokumen yang diperbarui',
        ],
        jamLayanan: 'Senin - Jumat: 08:00 - 16:00 WIT'
      },
      KELAHIRAN: {
        judul: 'Persyaratan Permohonan Akta Kelahiran',
        umum: [
          'Surat Keterangan Lahir dari bidan atau tenaga kesehatan',
          'KTP orang tua atau Kartu Keluarga',
          'Pas Foto 2x3 cm orang tua (masing-masing 2 lembar)',
          'Buku Nikah (untuk anak dari pernikahan yang sah)',
        ],
        khusus: [
          'Untuk anak di luar nikah: Surat Pengakuan Anak',
          'Untuk anak adopsi: Putusan Pengadilan tentang Adopsi',
        ],
        jamLayanan: 'Senin - Jumat: 08:00 - 16:00 WIT'
      },
      PPD1: {
        judul: 'Persyaratan Duplikat Akta Kelahiran',
        umum: [
          'Kartu Identitas (KTP/Paspor/SIM) pemohon',
          'Kartu Keluarga asli',
          'Pas Foto 2x3 cm',
          'Surat Permohonan Rangkap Akta',
        ],
        khusus: [
          'Bila tidak sendiri membawa surat kuasa yang dilegalisir',
        ],
        jamLayanan: 'Senin - Jumat: 08:00 - 16:00 WIT'
      },
      PPD2: {
        judul: 'Persyaratan Perubahan Data Akta Kelahiran',
        umum: [
          'Akta Kelahiran asli',
          'Kartu Tanda Penduduk (KTP)',
          'Kartu Keluarga (KK)',
          'Surat Permohonan dari yang bersangkutan',
        ],
        khusus: [
          'Bukti dokumen pendukung sesuai jenis perubahan data',
        ],
        jamLayanan: 'Senin - Jumat: 08:00 - 16:00 WIT'
      },
      PPD3: {
        judul: 'Persyaratan Penambahan Data Akta Kelahiran',
        umum: [
          'Akta Kelahiran asli',
          'Kartu Tanda Penduduk (KTP)',
          'Kartu Keluarga (KK)',
          'Surat Permohonan dari yang bersangkutan',
        ],
        khusus: [
          'Bukti dokumen pendukung untuk penambahan data',
        ],
        jamLayanan: 'Senin - Jumat: 08:00 - 16:00 WIT'
      },
    }



  }),

  actions: {

    getUser(){
      // console.log(localStorage.user);
      return this.user = localStorage.user
    },

    async getView(payload) {
        this.loading = true
        Loading.show()

        try {
            const res = await SimcardService.kk1_View(payload)
            return res 

        } catch (err) {
            console.error(err)

            Notify.create({
            message: 'Gagal ambil data KK1',
            color: 'negative'
            })
        } finally {
            this.loading = false
            Loading.hide()
        }
    },

    async cekAuth() {
        this.loading = true
        Loading.show()

        try {
            // console.log('Haloooooooooooooooooooooooooooooooooooo')
            
            const res = await SimcardService.cekAuth()
            // console.log('Haloooooooooooooooooooooooooooooooooooo')

            // console.log('Simcard:', res)


        } catch (err) {
            console.error(err)

            Notify.create({
            message: 'Gagal ambil data',
            color: 'negative'
            })
        } finally {
            this.loading = false
            Loading.hide()
        }
    },

    async pekerjaan() {
      this.loading = true
      Loading.show()
      try {
        const result = await axios.get(this.url.URL_MASTER_PEKERJAAN + 'list', {
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Simpan ke state 
        this.listPekerjaan = result.data || []
        
        // console.log('✓ Master Pekerjaan loaded:', this.listPekerjaan.length, 'items')
        return this.listPekerjaan
        
      } catch (err) {
        console.error('✗ Error loading pekerjaan:', err)
        
        Notify.create({
          message: 'Gagal mengambil data pekerjaan',
          color: 'negative'
        })
      } finally {
        this.loading = false
        Loading.hide()
      }
    },

    async agama() {
      this.loading = true
      Loading.show()
      try {
        const result = await axios.get(this.url.URL_MASTER_AGAMA + 'list1', {
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Simpan ke state 
        this.listAgama = result.data || []

        // console.log('✓ Master Agama loaded:', this.listAgama.length, 'items')
        return this.listAgama

      } catch (err) {
        console.error('✗ Error loading agama:', err)

        Notify.create({
          message: 'Gagal mengambil data agama',
          color: 'negative'
        })
      } finally {
        this.loading = false
        Loading.hide()
      } 
    },

    async pendidikan() {
      this.loading = true
      Loading.show()
      try {
        const result = await axios.get(this.url.URL_MASTER_PENDIDIKAN + 'list', {
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Simpan ke state 
        this.listPendidikan = result.data || []

        // console.log('✓ Master Pendidikan loaded:', this.listPendidikan.length, 'items')
        return this.listPendidikan

      } catch (err) {
        console.error('✗ Error loading pendidikan:', err)

        Notify.create({
          message: 'Gagal mengambil data pendidikan',
          color: 'negative'
        })
      } finally {
        this.loading = false
        Loading.hide()
      } 
    },    

    async shdk() {
      this.loading = true
      Loading.show()
      try {
        const result = await axios.get(this.url.URL_MASTER_SHDK + 'list', {
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Simpan ke state 
        this.listShdk = result.data || []

        // console.log('✓ Master SHDK loaded:', this.listShdk.length, 'items')
        return this.listShdk

      } catch (err) {
        console.error('✗ Error loading SHDK:', err)

        Notify.create({
          message: 'Gagal mengambil data SHDK',
          color: 'negative'
        })
      } finally {
        this.loading = false
        Loading.hide()
      } 
    },    


    tglConvert(tgl){
    var date = new Date(tgl);
    // console.log(date)
    var getBulan = date.getMonth() + 1; var bulan = '';
    if (getBulan == '1') {bulan = 'Jan'} 
    else if(getBulan == '2') {bulan = 'Feb'}
    else if(getBulan == '3') {bulan = 'Mar'}
    else if(getBulan == '4') {bulan = 'Apr'}
    else if(getBulan == '5') {bulan = 'Mei'}
    else if(getBulan == '6') {bulan = 'Jun'}
    else if(getBulan == '7') {bulan = 'Jul'}
    else if(getBulan == '8') {bulan = 'Agt'}
    else if(getBulan == '9') {bulan = 'Sep'}
    else if(getBulan == '10') {bulan = 'Okt'}
    else if(getBulan == '11') {bulan = 'Nov'}
    else if(getBulan == '12') {bulan = 'Des'}

    if (tgl == undefined || tgl == null || tgl == '') {
        var tglku = "-";
        var time = "-"
    } else {
        var tglku = date.getDate() + " " + bulan + " " + date.getFullYear();
        var time = date.getHours() +':'+date.getMinutes()+':'+date.getSeconds()
    }


    return {
        tgl : tglku,
        time : time
    };
},

async getnama(){

  try{

    var data = await JSON.parse(localStorage.user)
    this.nama = data.profile
    // return data
  }catch(err){
    // console.error('✗ Error getting nama:', err)
    this.nama = 'tidak di temukan'
    // return 'tidak di temukan'
  }

},

async getPersyaratan(tipe) {
  // Mengembalikan persyaratan berdasarkan tipe permohonan secara async
  // Jika tipe tidak ditemukan, kembalikan object kosong dengan struktur default
  try {
    const persyaratan = this.persyaratan[tipe] || {
      judul: 'Persyaratan Permohonan',
      umum: [],
      khusus: [],
      jamLayanan: 'Senin - Jumat: 08:00 - 16:00 WIT'
    }
    // Simulasi loading dengan delay minimal untuk memastikan data terupdate
    await new Promise(resolve => setTimeout(resolve, 0))
    return persyaratan
  } catch (err) {
    console.error('Error getting persyaratan:', err)
    return {
      judul: 'Persyaratan Permohonan',
      umum: [],
      khusus: [],
      jamLayanan: 'Senin - Jumat: 08:00 - 16:00 WIT'
    }
  }
}

 


  }
})