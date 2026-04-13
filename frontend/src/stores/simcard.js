import { defineStore } from 'pinia'
import { Loading, Notify } from 'quasar'
import { SimcardService } from 'src/services/simcardService'
import axios from 'axios'

var URL = 'http://server-simcard.konaweselatankab.go.id/'
// var URL = 'http://10.91.178.2:5012/'

export const useSimcardStore = defineStore('simcard', {
  state: () => ({
    list_laporan: [],
    total: 0,
    page: 1,
    loading: false,
    cari: '',
    user: '',
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



  }),

  actions: {

    getUser(){
      console.log(localStorage.user);
      // return this.user = localStorage.user
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
            console.log('Haloooooooooooooooooooooooooooooooooooo')
            
            const res = await SimcardService.cekAuth()
            console.log('Haloooooooooooooooooooooooooooooooooooo')

            console.log('Simcard:', res)


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
        
        console.log('✓ Master Pekerjaan loaded:', this.listPekerjaan.length, 'items')
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

        console.log('✓ Master Agama loaded:', this.listAgama.length, 'items')
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

        console.log('✓ Master Pendidikan loaded:', this.listPendidikan.length, 'items')
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

        console.log('✓ Master SHDK loaded:', this.listShdk.length, 'items')
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

// async agama  ()  {
//   fetch(store.state.url.URL_MASTER_AGAMA + "list1", {
//     method: "GET",
//     headers: {
//       "content-type": "application/json",
//       authorization: "kikensbatara " + localStorage.token
//     }
//   })
//     .then(res => res.json())
//     .then(res_data => { 
//       store.state.listAgama = res_data
//     });
// }

// async pendidikan  ()  {
//   fetch(store.state.url.URL_MASTER_PENDIDIKAN + "list", {
//     method: "GET",
//     headers: {
//       "content-type": "application/json",
//       authorization: "kikensbatara " + localStorage.token
//     }
//   })
//     .then(res => res.json())
//     .then(res_data => { 
//       store.state.listPendidikan = res_data
//     });
// }
// async shdk  ()  {
//   fetch(store.state.url.URL_MASTER_SHDK + "list", {
//     method: "GET",
//     headers: {
//       "content-type": "application/json",
//       authorization: "kikensbatara " + localStorage.token
//     }
//   })
//     .then(res => res.json())
//     .then(res_data => { 
//       store.state.listShdk = res_data
//       console.log('aaaa', res_data);
//     });
// }


  }
})