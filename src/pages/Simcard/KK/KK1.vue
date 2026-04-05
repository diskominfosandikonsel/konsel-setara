<template>
  <q-page class="dashboard-page">
    


    <div class="containerOne ">
        <div class="itemsContainer">
            <div>
                <p class="text-white">Eleanor Pena</p>
            </div>
            <div>
                <img src="~assets/simcard/FotoProfile.png" alt="">
            </div>
        </div> 
    </div>

    <div class="containerOne" style="padding-top:0px !important;" >
        <div class="itemsContainer" style="padding: 0px 20px !important;">
            <div>
                <p class="text-white" style="font-size: 20px; margin-bottom: 0;">{{$route.name}}</p>
                <p class="text-white" style="font-size: 12px; margin-bottom: 0;">Sistem Informasi Pencatatan dan Pendaftaran Penduduk</p>
            </div>
            <div>
                <img src="~assets/simcard/firetap.png" style="width: 92px; height: 92px;" alt="">
            </div>
        </div> 
    </div>

    <div class="containerOne" style="padding-top:0px !important;" >
        <q-card class="text-white full-width" style="border-radius: 15px; background-color: #FFFFFF; opacity: 0.85;">
        <!-- <q-card-section> 
            <div class="text-black text-left">Halaman Login Aplikasi Simcard</div> 
        </q-card-section> -->
 

          <div class="text-black text-left" style="padding:10px 10px 0px 15px; font-weight: bold;">Daftar Permohonan</div>

          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('simcard_login')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/wait.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Menunggu
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Nama pemohon : Fajar Syahputra
                </div>
              </div>
            </div>
          </div> 
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('simcard_login')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/succes.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Selesai
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Nama pemohon : Jumadi
                </div>
              </div>
            </div>
          </div> 
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('simcard_login')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/fail.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Dikembalikan
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Nama pemohon : Lukman
                </div>
              </div>
            </div>
          </div> 
             


 
 
        </q-card>
    </div>

    <div class="q-pa-md">
      <!-- <q-btn v-touch-repeat.mouse="handleRepeat" class="fab" round color="primary" icon="add"  @click="modal_add = true" /> -->
      <q-btn class="fab" round color="primary" icon="add"  @click="modal_add = true" />
    </div>


    <q-dialog v-model="modal_add">
      <q-card>
        <q-toolbar> 

          <q-toolbar-title ><span class="text-weight-bold">Formulir</span> Permohonan</q-toolbar-title >

          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section>
        <q-stepper v-model="step" ref="stepper" color="primary" vertical animated>
        <q-step
            :name="1"
            title="Pilih Daerah Administratif"
            icon="settings"
            :done="step > 1"
        >

<AutocompleteInput
  v-model="query1"
  :items="items1"
  placeholder="Pilih Provinsi"
  @select="onSelectProvinsi" />
<AutocompleteInput
  v-model="query2"
  :items="items1"
  placeholder="Pilih Kabupaten"
  @select="onSelectKabupaten" />
<AutocompleteInput
  v-model="query3"
  :items="items1"
  placeholder="Pilih Kecamatan"
  @select="onSelectKecamatan" />
<AutocompleteInput
  v-model="query4"
  :items="items1"
  placeholder="Pilih desa/kelurahan"
  @select="onSelectDesaKelurahan" />


  <br><br><br><br>

        </q-step>

        <q-step
            :name="2"
            title="Data Pemohon"
            caption=""
            icon="create_new_folder"
            :done="step > 2"
        >
                      <div class="q-pa-md">
                          <div class="txkecil">
                              Alasan Permohonan: <strong> {{ form.permohonan }}</strong>
                          </div>
                          <div class="q-gutter-sm txkecil" inline>
                              <q-radio size="xs" v-model="form.permohonan" val="Karena Membentuk Rumah Tangga Baru" label="Karena Membentuk Rumah Tangga Baru" />
                              <q-radio size="xs" v-model="form.permohonan" val="Karena Kartu Keluarga Hilang/Rusak " label="Karena Kartu Keluarga Hilang/Rusak " />
                              <q-radio size="xs" v-model="form.permohonan" val="Lainnya" label="Lainnya" />
                          </div> 
                          <div v-if="form.permohonan == 'Lainnya'">
                              <input v-model="form.permohonan_lainnya" type="text" placeholder="Lainnya" class="input-form">                      
                          </div>
                      </div>   
      
                      <label class="text-labelku">NO KK Pemohon</label>   
                      <input v-model="form.no_kk" type="number" placeholder="NO KK" class="input-form">
                      <label class="text-labelku">NIK Pemohon</label>   
                      <input v-model="form.nik" type="number" placeholder="NIK" class="input-form">
                  
                      <label class="text-labelku">Nama Lengkap Pemohon</label>   
                      <input v-model="form.nama" type="text" placeholder="NAMA LENGKAP" class="input-form">
                      <label class="text-labelku">Jenis Kelamin {{ form.jenis_kelamin }}</label>  
                      <select v-model="form.jenis_kelamin" class="input-form">
                        <option disabled value="">Pilih Jenis Kelamin</option>
                        <option>Laki - Laki</option>
                        <option>Perempuan</option> 
                      </select>
                      <label class="text-labelku">Tempat Lahir</label>   
                      <input v-model="form.tempat_lahir" type="text" placeholder="TEMPAT LAHIR (Ex: Kendari)" class="input-form">                  
                      <label class="text-labelku">Tanggal Lahir</label>   
                      <input v-model="form.tanggal_lahir" type="date" placeholder="TANGGAL LAHIR" class="input-form">

                <label class="text-labelku">Status Hubungan Dalam Keluarga {{ form.status_hubungan_dl_keluarga }}</label>  
                <select v-model="form.status_hubungan_dl_keluarga" class="input-form">
                  <option disabled value="">- Pilih Status Hubungan -</option>
                  <option v-for="(data, index) in listShdk" :key="index" v-bind:value="data.uraian">{{data.uraian}}</option>
                </select>                  

                <!-- ================= Agama ===================== -->
                  <label class="text-labelku">Agama</label>                   
                  <select v-model="form.agama" class="input-form"> 
                    <option disabled value=""> - Pilih Agama - </option>
                    <option v-for="(data, index) in listAgama" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                  </select>                
                  <template v-if="form.agama == 'Lainnya'">
                      <label class="text-labelku">Agama / Kepercayaan Lainnya</label> 
                      <input v-model="form.agama_lainnya" type="text" placeholder="Agama / Kepercayaan Lainnya" class="input-form">
                  </template>
                <!-- ================= Agama ===================== -->           
                <!-- ================= Pekerjaan ===================== -->
                  <label class="text-labelku">PEKERJAAN</label>                  
                  <select v-model="form.pekerjaan" class="input-form"> 
                    <option value="" disabled> - Pilih PEKERJAAN - </option>
                    <option v-for="(data, index) in listPekerjaan" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                  </select>                
                  <template v-if="form.pekerjaan == 'Lainnya'">
                      <label class="text-labelku">Pekerjaan Lainnya</label> 
                      <input v-model="form.pekerjaan_lainnya" type="text" placeholder="Pekerjaan Lainnya" class="input-form">
                  </template>
                <!-- ================= Pekerjaan ===================== -->
                <!-- ================= Pendidikan ===================== -->
                  <label class="text-labelku">Pendidikan Terakhir</label>                   
                  <select v-model="form.pendidikan" class="input-form"> 
                    <option value="" disabled> - Pilih Pendidikan - </option>
                    <option v-for="(data, index) in listPendidikan" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                  </select>                
                  <template v-if="form.pendidikan == 'Lainnya'">
                      <label class="text-labelku">Pendidikan Lainnya</label> 
                      <input v-model="form.pendidikan_lainnya" type="text" placeholder="Pendidikan Lainnya" class="input-form">
                  </template>
                <!-- ================= Pendidikan ===================== -->                      
        </q-step>

        <!-- <q-step :name="3" title="Ad template" icon="assignment" :done="step > 3">
            This step won't show up because it is disabled.
        </q-step> -->

        <q-step :name="3" title="Data Dukung" icon="add_comment">
                <label class="text-labelku">Lampiran file (*Bila ada tambahan file)</label>   
                <q-file outlined square :dense="true" v-model="form.file_lampiran" label="Lampiran" filled >
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file> 
        </q-step>

        <template v-slot:navigation>
            <q-stepper-navigation>
            <q-btn
                @click="$refs.stepper.next()"
                color="primary"
                :label="step === 3 ? 'Finish' : 'Continue'"
            />
            <q-btn
                v-if="step > 1"
                flat
                color="primary"
                @click="$refs.stepper.previous()"
                label="Back"
                class="q-ml-sm"
            />
            </q-stepper-navigation>
        </template>
        </q-stepper>

        </q-card-section>
      </q-card>
    </q-dialog>


  </q-page>
</template>

<script>
import AutocompleteInput from 'src/components/AutocompleteInput.vue'
export default {
    components: { AutocompleteInput },
  name: 'KK1_list',
  data () {
    return {
        step:1,
        modal_add :false, 
        slide: 1,
        images: [
            'https://cdn.quasar.dev/img/mountains.jpg',
            'https://cdn.quasar.dev/img/parallax1.jpg',
            'https://cdn.quasar.dev/img/parallax2.jpg',
            'https://cdn.quasar.dev/img/quasar.jpg'
        ],
 
    query1: "",
    query2: "",
    query3: "",
    query4: "",
    show1: false,
    show2: false,
    show3: false,
    show4: false,
    items1: [ 
      "Sulawesi Utara",
      "Sulawesi Tengah",
      "Sulawesi Selatan",
      "Sulawesi Tenggara",
      "Sulawesi Barat"
    ],
    filtered1: [],
    filtered2: [],
    filtered3: [],
    filtered4: [],

    form: {
      permohonan: "",
      permohonan_lainnya: "",
      no_kk: "",
      nik: "",
      nama: "",
      jenis_kelamin: "",
      tempat_lahir: "",
      tanggal_lahir: "",
        status_hubungan_dl_keluarga: "",
        agama: "",
        agama_lainnya: "",
        pekerjaan: "",
        pekerjaan_lainnya: "",
            pendidikan: "",
            pendidikan_lainnya: "", 
    },

    listShdk: [],
    listAgama: [],
    listPekerjaan: [],
    listPendidikan: [],

    info :null,
  }
  },
  methods: {
  goBack () {
    this.$router.back()
  },
  pindahKe(halaman){
    this.$router.push(halaman)
  },

  handleRepeat({ evt, ...newInfo }) {
        info.value = newInfo

        // native Javascript event
        console.log(evt)
  },






    onSelectProvinsi(item) {
      // item adalah string atau object sesuai items
      console.log('dipilih:', item)
    },
    onSelectKabupaten(item) {
      // item adalah string atau object sesuai items
      console.log('dipilih:', item)
    },
    onSelectKecamatan(item) {
      // item adalah string atau object sesuai items
      console.log('dipilih:', item)
    },
    onSelectDesaKelurahan(item) {
      // item adalah string atau object sesuai items
      console.log('dipilih:', item)
    },



 



  },
 
}
</script>

<style>

/* Tombol FAB (Floating Action Button) untuk tambah data */
.fab {
  z-index: 99;
  position: fixed;
  bottom: 80px;
  right: 20px;

  width: 60px;
  height: 60px;
  border-radius: 50%;

  background-color: #007bff;
  color: white;
  font-size: 16px;
  border: none;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3); 
  transition: all 0.3s ease;
}

.fab:hover {
  background-color: #0056b3;
  transform: scale(1.1);
}

.fab:active {
  transform: scale(0.95);
}
/* Tombol FAB (Floating Action Button) untuk tambah data */


.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(
    to bottom,
    #3683FD 0%,
    #3683FD 15%,
    #78ACFE 30%,
    #e3f2fd 45%,
    #ffffff 85%
  );
}
.logo-shadow {
  filter: drop-shadow(0 0 2.5px #fff)
          drop-shadow(0 0 5px #fff);
}

.mobile-carousel {
  padding: 0 20px;
}

.carousel-slide {
  border-radius: 25px;
  overflow: hidden;
  transition: transform 0.35s ease;
}

.title {
  font-size: 18px;
  font-weight: 400;
  color: #000000;
} 

.sub-title {
  font-size: 12px;
  font-weight: 250;
  color: #000000;
}

.text-labelku {
  display: block;
  margin-top: 12px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #333;
} 




/* autocomplete  */
.autocomplete {
  position: relative;
  width: 100%;
}

/* INPUT SESUAI REQUEST */
.input-custom,
.input-form,
select {
  margin-top: 16px;
  border-radius: 8px;
  height: 56px;
  width: 100%;
  padding: 0 16px;
  border: 1px solid #C4C4C4;
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  background-color: #fff;
  cursor: pointer;
}

.input-custom:focus,
.input-form:focus,
select:focus {
  border-color: #007bff;
}

select option {
  padding: 8px 0;
  background-color: #fff;
  color: #333;
}

/* DROPDOWN */
.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;

  background: #fff;
  border: 1px solid #C4C4C4;
  border-radius: 8px;

  max-height: 200px;
  overflow-y: auto;

  list-style: none;
  padding: 8px 0;
  margin: 0;

  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  /* z-index: 99999; */
  /* position: absolute; */
  z-index: 9999;  
}

.dropdown li {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
}

.dropdown li:hover {
  background-color: #f5f5f5;
}


/* autocomplete  */


/* kalau autocomplete ketutup  */
.q-dialog__inner,
.q-card {
  overflow: visible !important;
}

.q-card__section {
  max-height: 70vh;
  overflow-y: auto !important;
  overflow-x: visible !important;
}
/* kalau autocomplete ketutup  */


</style>
