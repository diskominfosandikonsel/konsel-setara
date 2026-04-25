<template>
  <q-page class="dashboard-page">
    

    <div class="containerOne ">
        <div class="itemsContainer">
            <div>
                <q-btn flat round icon="arrow_back" color="white" class="glass-btn" @click="$router.back()" />
            </div>
            <div>
                <p class="text-white text-right">{{ nama}}</p>
            </div>
            <div>
                <img src="~assets/simcard/FotoProfile.png" alt="" style="height: 40px; width: 40px;">
            </div>
        </div> 
    </div>

    <div class="containerOne" style="padding-top:0px !important;">
      <div class="itemsContainer" style="padding: 0px 20px !important;">
        <div>
          <p class="text-white" style="font-size: 14px; margin-bottom: 0;"><b>{{ $route.name }}</b></p>
          <!-- <p class="text-white" style="font-size: 12px; margin-bottom: 0;">Sistem Informasi Pencatatan dan Pendaftaran Penduduk</p> -->
        </div>
        <div>
          <img src="~assets/simcard/firetap4.png" style="width: 90px; height: 90px;" alt="">
        </div>
      </div>
    </div>

    <div class="containerOne" style="padding-top:0px !important;">
      <q-card class="text-white full-width" style="border-radius: 15px; background-color: #FFFFFF; opacity: 0.85;">

        <div class="full-width row wrap justify-between items-center content-center" style="justify-content: space-between;">
          <div class="col-10 self-center items-center" style="padding: 10px 10px 0px 20px;">
            <input type="text" v-model="cari_value" @input="getview" style="width: 100%; padding: 10px 10px ;border-radius: 8px;border: 1px solid #C4C4C4;"  placeholder="Pencarian" />
          </div>
          <div class="col-2 self-center text-center items-center" style="margin-top: 10px;">
            <q-btn round flat icon="info" color="primary" @click="modal_syarat = true" >
              <q-tooltip>Lihat Persyaratan Permohonan</q-tooltip>
            </q-btn>            
          </div>

        </div>

        <!-- DAFTAR PERMOHONAN -->
        <div style="margin-left: 10px; margin-right: 10px;">  
 
            <div v-for="(item, index) in list_data" :key="index" style="padding:10px 0px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
              <div class="row items-center no-wrap">

                <div v-if="item.pelaporan_LAHIR_MATI.status === 0" style="color:#6C7278;">
                  <img src="~assets/simcard/wait.png" style="width: 100%; height: 56px;" alt="">
                </div>

                <div v-if="item.pelaporan_LAHIR_MATI.status === 1" style="color:#6C7278;">
                  <img src="~assets/simcard/succes.png" style="width: 100%; height: 56px;" alt="">
                </div>

                <div v-if="item.pelaporan_LAHIR_MATI.status === 2" style="color:#6C7278;">
                  <img src="~assets/simcard/fail.png" style="width: 100%; height: 56px;" alt="">
                </div>

                <div class="flex-break col self-center" style="margin-left: 11px;">
                  <div v-if="item.pelaporan_LAHIR_MATI.status === 0" style="color:#000000;font-size: 12px;font-weight: bold;">
                    Mohon bersabar, data masih diverifikasi
                  </div>
                  <div v-if="item.pelaporan_LAHIR_MATI.status === 1" style="color:#000000;font-size: 12px;font-weight: bold;">
                    Permohonan Diterima
                  </div>
                  <div v-if="item.pelaporan_LAHIR_MATI.status === 2" style="color:#000000;font-size: 12px;font-weight: bold;">
                    Permohonan Dikembalikan
                  </div>
                  <div style="color:#6C7278;font-size: 11px;">
                    Nama : {{ item.pelaporan_LAHIR_MATI.nama }}
                  </div>
 
                </div>
                <div class="" style="margin-left: 11px;">

                  <div class="text-right" style="margin: 0px 0px 0px 0px ;">

                    <!-- Button Icon -->
                    <q-btn class="text-right" v-show="item.pelaporan_LAHIR_MATI.email_file !== null && item.pelaporan_LAHIR_MATI.status_kabupaten == 1" color="primary" icon="attach_file">
                      <q-menu>
                        <q-list>
                          <q-item clickable v-close-popup @click="selectData(item), bukaLink(item.pelaporan_LAHIR_MATI.email_file)">
                            <q-item-section avatar>
                              <q-icon name="source" color="primary" />
                            </q-item-section>
                            <q-item-section>Lihat Hasil Permohonan</q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup @click="selectData(item), modal_lihat = true ">
                            <q-item-section avatar>
                              <q-icon name="remove_red_eye" color="primary" />
                            </q-item-section>
                            <q-item-section>Detail</q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup @click="selectData(item), modal_alur = true ">
                            <q-item-section avatar>
                              <q-icon name="timeline" color="primary" />
                            </q-item-section>
                            <q-item-section>Alur Permohonan</q-item-section>
                          </q-item>

                        </q-list>
                      </q-menu>
                    </q-btn>

                    <q-btn class="text-right" v-show="item.pelaporan_LAHIR_MATI.email_file == null && item.pelaporan_LAHIR_MATI.status_kabupaten == '' || item.pelaporan_LAHIR_MATI.status_kabupaten == 2" color="primary" icon="settings">
                      <q-menu>
                        <q-list>
                          <q-item clickable v-close-popup @click="selectData(item), modal_lihat = true ">
                            <q-item-section avatar>
                              <q-icon name="remove_red_eye" color="primary" />
                            </q-item-section>
                            <q-item-section>Detail</q-item-section>
                          </q-item>
                          <q-item clickable v-show="item.pelaporan_LAHIR_MATI.status === 2" v-close-popup @click="selectData(item), modal_lihat_status = true ">
                            <q-item-section avatar>
                              <q-icon name="circle_notifications" color="red" />
                            </q-item-section>
                            <q-item-section>Alasan Pengembalian</q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup @click="selectData(item), modal_alur = true ">
                            <q-item-section avatar>
                              <q-icon name="timeline" color="primary" />
                            </q-item-section>
                            <q-item-section>Alur Permohonan</q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup v-bind:disable="cekButton_status_kecamatan(item)" @click="selectData(item), modal_edit = true ">
                            <q-item-section avatar>
                              <q-icon name="edit" color="warning" />
                            </q-item-section>
                            <q-item-section>Edit</q-item-section>
                          </q-item>
                          <q-item clickable v-close-popup v-bind:disable="cekButton_status_kecamatan(item)" @click="selectData(item), modal_delete = true ">
                            <q-item-section avatar>
                              <q-icon name="delete" color="negative" />
                            </q-item-section>
                            <q-item-section>delete</q-item-section>
                          </q-item> 
                        </q-list>
                      </q-menu>
                    </q-btn>

                  </div>
                </div>
              </div>
            </div>
 

            <div class="q-pa-lg flex flex-center">
              <q-pagination v-model="page_first"  :max="page_last" @update:model-value="getview" input/>
            </div>
        
            <!-- Empty State -->
            <div v-if="list_data.length === 0" style="text-align: center; padding: 40px; color: #999;">
              <q-icon name="inbox" size="64px" style="opacity: 0.3; display: block; margin-bottom: 16px;" />
              <p style="font-size: 16px; font-weight: 500;">Tidak ada data permohonan</p>
              <p style="font-size: 12px;">Silakan tambah permohonan baru dengan klik tombol (+)</p>
            </div>

        </div>
        

      </q-card>
    </div>

    <div class="q-pa-md">
      <!-- <q-btn v-touch-repeat.mouse="handleRepeat" class="fab" round color="primary" icon="add"  @click="modal_add = true" /> -->
      <q-btn class="fab" round color="primary" icon="add" @click="modal_add = true" />
    </div>


    <q-dialog v-model="modal_add" full-width full-height>
      <q-card>
        <q-toolbar>
          <q-toolbar-title><span class="text-weight-bold">Formulir</span> Permohonan</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section>
          <q-stepper v-model="step" ref="stepper" color="primary" vertical animated>
            <q-step :name="1" title="Pilih Daerah Administratif" icon="settings" :done="step > 1">
            <!-- {{ form.m_provinsi }} -->
              <q-select
                filled
                v-model="form.m_provinsi"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_provinsi"
                @filter="provinsi1"
                label="Provinsi"
                option-value="id"
                option-label="uraian"
                emit-value
                map-options
                style="width: 100%; padding-bottom: 32px"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
                  </q-item>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.uraian }}</q-item-label>
                      <q-item-label caption>Kode: {{ scope.opt.kd_provinsi }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                  <span v-if="scope.opt">{{ scope.opt.uraian }}</span>
                </template>
              </q-select>

              <q-select
                filled
                v-model="form.m_kabupaten"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_kabupaten"
                @filter="(val, update) => kabupaten1(val, update, form.m_provinsi)"
                label="Kabupaten"
                option-value="id"
                option-label="uraian"
                emit-value
                map-options
                style="width: 100%; padding-bottom: 32px"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
                  </q-item>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.uraian }}</q-item-label>
                      <q-item-label caption>Kode: {{ scope.opt.kd_kabupaten }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                  <span v-if="scope.opt">{{ scope.opt.uraian }}</span>
                </template>
              </q-select>

              <q-select
                filled
                v-model="form.m_kecamatan"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_kecamatan"
                @filter="(val, update) => kecamatan1(val, update, form.m_kabupaten)"
                label="Kecamatan"
                option-value="id"
                option-label="uraian"
                emit-value
                map-options
                style="width: 100%; padding-bottom: 32px"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
                  </q-item>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.uraian }}</q-item-label>
                      <q-item-label caption>Kode: {{ scope.opt.kd_kecamatan }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                  <span v-if="scope.opt">{{ scope.opt.uraian }}</span>
                </template>
              </q-select>

              <q-select
                filled
                v-model="form.m_desa_kelurahan"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_desa_kelurahan"
                @filter="(val, update) => desa_kelurahan1(val, update, form.m_kecamatan)"
                label="Desa/Kelurahan"
                option-value="id"
                option-label="uraian"
                emit-value
                map-options
                style="width: 100%; padding-bottom: 32px"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
                  </q-item>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.uraian }}</q-item-label>
                      <q-item-label caption>Kode: {{ scope.opt.kd_desa_kelurahan }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                  <span v-if="scope.opt">{{ scope.opt.uraian }}</span>
                </template>
              </q-select>

              <br> 

            </q-step>

            <q-step :name="2" title="Yang bertandatangan di bawah ini" caption="" icon="create_new_folder" :done="step > 2">
              <label class="text-labelku col-12 col-md-12">Nomor Kartu Keluarga</label>
              <input v-model="form.no_kk" class="input-form col-12 col-md-12" placeholder="Masukan Nomor Kartu Keluarga" type="text">
              <label class="col-12 col-md-12 text-labelku ">Nama</label>
              <input v-model="form.nama" class="input-form col-12 col-md-12" placeholder="Masukan Nama" type="text">     
              <label class="col-12 col-md-12 text-labelku ">Umur</label>
              <input v-model="form.umur" class="input-form col-12 col-md-12" placeholder="Ex: 30" type="number">     
              <label class="col-12 col-md-12 text-labelku ">Pekerjaan</label>
              <input v-model="form.pekerjaan" placeholder="Ex: Petani (Sesuai KTP)" class="input-form col-12 col-md-12" type="text">     
              <label class="col-12 col-md-12 text-labelku ">HUBUNGAN DENGAN SI BAYI</label>
              <input v-model="form.hub_dengan_si_bayi" placeholder="Ex: Bapak" class="input-form col-12 col-md-12" type="text">     
            </q-step> 

            <q-step :name="3" title="Melaporkan Bahwa" caption="" icon="create_new_folder" :done="step > 3">

              <label class="col-12 col-md-12 text-labelku ">Hari Lahir</label> 
              <select v-model="form.hari" class="input-form col-12 col-md-12">
                <option v-for="(namaHari, index) in simcard.form.nama_hari" :key="index" v-bind:value="namaHari"> {{ namaHari }} </option>
              </select>                

              <label class="col-12 col-md-12 text-labelku ">Tanggal</label>
              <input v-model="form.tanggal" placeholder="Ex: 01" class="input-form col-12 col-md-12" type="date">     

              <label class="col-12 col-md-12 text-labelku ">Pukul</label>
              <input v-model="form.pukul" placeholder="Ex: 01" class="input-form col-12 col-md-12" type="time">     

              <label class="col-12 col-md-12 text-labelku ">Tempat</label>
              <input v-model="form.tempat" placeholder="Ex: RSUD" class="input-form col-12 col-md-12" type="text">     
              
              <hr class="q-mt-md">
              <label class="col-12 col-md-12 text-labelku text-center"><b>TELAH LAHIR BAYI</b></label>
              <hr>

              <label class="text-labelku">Jenis Kelamin</label>   
              <div class="custom-select" >
                <select v-model="form.jenis_kelamin_bayi"> 
                  <option >Laki-Laki</option>
                  <option >Perempuan</option> 
                </select>
              </div>
              
              <label class="col-12 col-md-12 text-labelku ">Jenis Kelahiran</label> 
              <div class="custom-select" >
                <select v-model="form.jenis_lahir"> 
                  <option >Tunggal</option>
                  <option >Kembar 2</option> 
                  <option >Kembar 3</option> 
                  <option >Kembar 4</option> 
                  <option >Lainnya</option> 
                </select>
              </div>
              <template v-if="form.jenis_lahir == 'Lainnya'">
                <input required v-model="form.jenis_lahir_lainnya" type="text" placeholder="Masukan Tempat Dilahirkan Lainnya">   
              </template>   

              <hr class="q-mt-md">
              <label class="col-12 col-md-12 text-labelku text-center"><b>Dalam Keadaan Mati Setelah Dikandungnya Selama</b></label>
              <hr>              



              <label class="text-labelku col-12 col-md-12">Lama Mengandung (Bulan)</label>
              <input v-model="form.lama_mengandung" class="input-form col-12 col-md-12" type="number" placeholder="Masukan Lama Mengandung (Bulan)">    

              <label class="text-labelku col-12 col-md-12">Disebabkan karena</label>
              <input v-model="form.sebab_kematian" placeholder="Masukan Sebab Kematian" class="input-form col-12 col-md-12" type="text">    
 
            </q-step> 

            <q-step :name="4" title="Dari Seorang Ibu" caption="" icon="create_new_folder" :done="step > 4">
                <label class="text-labelku">NIK</label>   
                <input class="input-form" required v-model="form.nik_ibu" type="number" placeholder="NIK">          
                <label class="text-labelku">Nama</label>   
                <input class="input-form" required v-model="form.nama_ibu" type="text" placeholder="Nama">          
                <label class="text-labelku">Tanggal Lahir</label>   
                <input class="input-form" required v-model="form.tgl_lahir_ibu" type="date" placeholder="Tanggal Lahir">          
                <label class="text-labelku">Pekerjaan</label>   
                <input class="input-form" required v-model="form.pekerjaan_ibu" type="text" placeholder="Pekerjaan">
                
                  

                <label class="text-labelku">Kewarganegaraan</label>   
                <div class="custom-select" >
                  <select v-model="form.kewarganegaraan_ibu"> 
                    <option >Warga Negara Indonesia (WNI)</option> 
                    <option >Lainnya</option> 
                  </select>
                </div>
                <template v-if="form.kewarganegaraan_ibu == 'Lainnya'">
                  <input class="input-form" required v-model="form.kewarganegaraan_ibu_lainnya" type="text" placeholder="Kewarganegaraan">   
                </template>          
                <label class="text-labelku">Tanggal Pencatatan Perkawinan</label>   
                <input class="input-form" required v-model="form.tgl_catatan_perkawinan" type="date" placeholder="Tanggal Pencatatan Perkawinan">  

              <!-- ================= Alamat ===================== -->

              <label class="text-labelku">Alamat </label>
                <AdministrativeSelect
                  :model-value="form.provinsi_ibu"
                  @update:model-value="form.provinsi_ibu = $event"
                  label="Provinsi"
                  :options="list_data_provinsi_ibu"
                  :on-filter="(val, update) => provinsi2(val, update)"
                  code-field-name="kd_provinsi"
                />

                <AdministrativeSelect
                  :model-value="form.kabupaten_ibu"
                  @update:model-value="form.kabupaten_ibu = $event"
                  label="Kabupaten"
                  :options="list_data_kabupaten_ibu"
                  :on-filter="(val, update) => kabupaten2(val, update, form.provinsi_ibu)"
                  code-field-name="kd_kabupaten"
                />

                <AdministrativeSelect
                  :model-value="form.kecamatan_ibu"
                  @update:model-value="form.kecamatan_ibu = $event"
                  label="Kecamatan"
                  :options="list_data_kecamatan_ibu"
                  :on-filter="(val, update) => kecamatan2(val, update, form.kabupaten_ibu)"
                  code-field-name="kd_kecamatan"
                />

                <AdministrativeSelect
                  :model-value="form.des_kel_ibu"
                  @update:model-value="form.des_kel_ibu = $event"
                  label="Desa/Kelurahan"
                  :options="list_data_desa_kelurahan_ibu"
                  :on-filter="(val, update) => desa_kelurahan2(val, update, form.kecamatan_ibu)"
                  code-field-name="kd_desa_kelurahan"
                />

                <label class="text-labelku">Alamat</label>   
                <input class="input-form" required v-model="form.alamat_ibu" type="text" placeholder="Alamat Ex: Jl. Raya No. 123">

            </q-step> 

            <q-step :name="5" title="Istri dari (Data Suami) " caption="" icon="create_new_folder" :done="step > 5">
                <label class="text-labelku">NIK</label>   
                <input class="input-form" required v-model="form.nik_ayah" type="number" placeholder="NIK">          
                <label class="text-labelku">Nama</label>   
                <input class="input-form" required v-model="form.nama_ayah" type="text" placeholder="Nama">          
                <label class="text-labelku">Tanggal Lahir</label>   
                <input class="input-form" required v-model="form.tgl_lahir_ayah" type="date" placeholder="Tanggal Lahir">          
                <label class="text-labelku">Pekerjaan</label>   
                <input class="input-form" required v-model="form.pekerjaan_ayah" type="text" placeholder="Pekerjaan">
                
                  

                <label class="text-labelku">Kewarganegaraan</label>   
                <div class="custom-select" >
                  <select v-model="form.kewarganegaraan_ayah"> 
                    <option >Warga Negara Indonesia (WNI)</option> 
                    <option >Lainnya</option> 
                  </select>
                </div>
                <template v-if="form.kewarganegaraan_ayah == 'Lainnya'">
                  <input class="input-form" required v-model="form.kewarganegaraan_ayah_lainnya" type="text" placeholder="Kewarganegaraan">   
                </template>

              <!-- ================= Alamat ===================== -->

              <label class="text-labelku">Alamat </label>
                <AdministrativeSelect
                  :model-value="form.provinsi_ayah"
                  @update:model-value="form.provinsi_ayah = $event"
                  label="Provinsi"
                  :options="list_data_provinsi_ayah"
                  :on-filter="(val, update) => provinsi3(val, update)"
                  code-field-name="kd_provinsi"
                />

                <AdministrativeSelect
                  :model-value="form.kabupaten_ayah"
                  @update:model-value="form.kabupaten_ayah = $event"
                  label="Kabupaten"
                  :options="list_data_kabupaten_ayah"
                  :on-filter="(val, update) => kabupaten3(val, update, form.provinsi_ayah)"
                  code-field-name="kd_kabupaten"
                />

                <AdministrativeSelect
                  :model-value="form.kecamatan_ayah"
                  @update:model-value="form.kecamatan_ayah = $event"
                  label="Kecamatan"
                  :options="list_data_kecamatan_ayah"
                  :on-filter="(val, update) => kecamatan3(val, update, form.kabupaten_ayah)"
                  code-field-name="kd_kecamatan"
                />

                <AdministrativeSelect
                  :model-value="form.des_kel_ayah"
                  @update:model-value="form.des_kel_ayah = $event"
                  label="Desa/Kelurahan"
                  :options="list_data_desa_kelurahan_ayah"
                  :on-filter="(val, update) => desa_kelurahan3(val, update, form.kecamatan_ayah)"
                  code-field-name="kd_desa_kelurahan"
                />

                <label class="text-labelku">Alamat</label>   
                <input class="input-form" required v-model="form.alamat_ayah" type="text" placeholder="Alamat Ex: Jl. Raya No. 123">
            </q-step> 

 

            <q-step :name="6" title="Data Dukung" icon="add_comment">
              <label class="text-labelku">Lampiran file (*Bila ada tambahan file)</label>
              <div v-if="form.file_lampiranOld && !form.file_lampiran" style="margin-bottom: 16px; padding: 12px; background-color: #f5f5f5; border-radius: 8px;">
                <div style="font-size: 12px; font-weight: 500; color: #666; margin-bottom: 8px;">File Lama:</div>
                <div style="font-size: 13px; color: #333;">{{ form.file_lampiranOld }}</div>
              </div>
              <q-file outlined square :dense="true" v-model="file_lampiran_new" @update:model-value="onFileLampiranChange" label="Lampiran" filled>
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </q-step> 

            <template v-slot:navigation>
              <q-stepper-navigation>
                <q-btn v-if="step < 6" @click="$refs.stepper.next()" color="primary" label="Continue" />
                <q-btn v-if="step === 6" @click="addData()" color="positive" label="Submit" :loading="loading" />
                <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Back"
                  class="q-ml-sm" />
              </q-stepper-navigation>
            </template>
          </q-stepper>

        </q-card-section>
      </q-card>
    </q-dialog>


    <q-dialog v-model="modal_edit" full-width full-height>
      <q-card>
        <q-toolbar>
          <q-toolbar-title><span class="text-weight-bold">Formulir</span> Permohonan</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section>
          <q-stepper v-model="step" ref="stepper" color="primary" vertical animated>
            <q-step :name="1" title="Pilih Daerah Administratif" icon="settings" :done="step > 1">
            <!-- {{ form.m_provinsi }} -->
              <q-select
                filled
                v-model="form.m_provinsi"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_provinsi"
                @filter="provinsi1"
                label="Provinsi"
                option-value="id"
                option-label="uraian"
                emit-value
                map-options
                style="width: 100%; padding-bottom: 32px"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
                  </q-item>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.uraian }}</q-item-label>
                      <q-item-label caption>Kode: {{ scope.opt.kd_provinsi }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                  <span v-if="scope.opt">{{ scope.opt.uraian }}</span>
                </template>
              </q-select>

              <q-select
                filled
                v-model="form.m_kabupaten"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_kabupaten"
                @filter="(val, update) => kabupaten1(val, update, form.m_provinsi)"
                label="Kabupaten"
                option-value="id"
                option-label="uraian"
                emit-value
                map-options
                style="width: 100%; padding-bottom: 32px"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
                  </q-item>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.uraian }}</q-item-label>
                      <q-item-label caption>Kode: {{ scope.opt.kd_kabupaten }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                  <span v-if="scope.opt">{{ scope.opt.uraian }}</span>
                </template>
              </q-select>

              <q-select
                filled
                v-model="form.m_kecamatan"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_kecamatan"
                @filter="(val, update) => kecamatan1(val, update, form.m_kabupaten)"
                label="Kecamatan"
                option-value="id"
                option-label="uraian"
                emit-value
                map-options
                style="width: 100%; padding-bottom: 32px"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
                  </q-item>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.uraian }}</q-item-label>
                      <q-item-label caption>Kode: {{ scope.opt.kd_kecamatan }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                  <span v-if="scope.opt">{{ scope.opt.uraian }}</span>
                </template>
              </q-select>

              <q-select
                filled
                v-model="form.m_desa_kelurahan"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_desa_kelurahan"
                @filter="(val, update) => desa_kelurahan1(val, update, form.m_kecamatan)"
                label="Desa/Kelurahan"
                option-value="id"
                option-label="uraian"
                emit-value
                map-options
                style="width: 100%; padding-bottom: 32px"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">Tidak ada hasil</q-item-section>
                  </q-item>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.uraian }}</q-item-label>
                      <q-item-label caption>Kode: {{ scope.opt.kd_desa_kelurahan }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template v-slot:selected-item="scope">
                  <span v-if="scope.opt">{{ scope.opt.uraian }}</span>
                </template>
              </q-select>

              <br> 

            </q-step>

            <q-step :name="2" title="Yang bertandatangan di bawah ini" caption="" icon="create_new_folder" :done="step > 2">
              <label class="text-labelku col-12 col-md-12">Nomor Kartu Keluarga</label>
              <input v-model="form.no_kk" class="input-form col-12 col-md-12" placeholder="Masukan Nomor Kartu Keluarga" type="text">
              <label class="col-12 col-md-12 text-labelku ">Nama</label>
              <input v-model="form.nama" class="input-form col-12 col-md-12" placeholder="Masukan Nama" type="text">     
              <label class="col-12 col-md-12 text-labelku ">Umur</label>
              <input v-model="form.umur" class="input-form col-12 col-md-12" placeholder="Ex: 30" type="number">     
              <label class="col-12 col-md-12 text-labelku ">Pekerjaan</label>
              <input v-model="form.pekerjaan" placeholder="Ex: Petani (Sesuai KTP)" class="input-form col-12 col-md-12" type="text">     
              <label class="col-12 col-md-12 text-labelku ">HUBUNGAN DENGAN SI BAYI</label>
              <input v-model="form.hub_dengan_si_bayi" placeholder="Ex: Bapak" class="input-form col-12 col-md-12" type="text">     
            </q-step> 

            <q-step :name="3" title="Melaporkan Bahwa" caption="" icon="create_new_folder" :done="step > 3">

              <label class="col-12 col-md-12 text-labelku ">Hari Lahir</label> 
              <select v-model="form.hari" class="input-form col-12 col-md-12">
                <option v-for="(namaHari, index) in simcard.form.nama_hari" :key="index" v-bind:value="namaHari"> {{ namaHari }} </option>
              </select>                

              <label class="col-12 col-md-12 text-labelku ">Tanggal</label>
              <input v-model="form.tanggal" placeholder="Ex: 01" class="input-form col-12 col-md-12" type="date">     

              <label class="col-12 col-md-12 text-labelku ">Pukul</label>
              <input v-model="form.pukul" placeholder="Ex: 01" class="input-form col-12 col-md-12" type="time">     

              <label class="col-12 col-md-12 text-labelku ">Tempat</label>
              <input v-model="form.tempat" placeholder="Ex: RSUD" class="input-form col-12 col-md-12" type="text">     
              
              <hr class="q-mt-md">
              <label class="col-12 col-md-12 text-labelku text-center"><b>TELAH LAHIR BAYI</b></label>
              <hr>

              <label class="text-labelku">Jenis Kelamin</label>   
              <div class="custom-select" >
                <select v-model="form.jenis_kelamin_bayi"> 
                  <option >Laki-Laki</option>
                  <option >Perempuan</option> 
                </select>
              </div>
              
              <label class="col-12 col-md-12 text-labelku ">Jenis Kelahiran</label> 
              <div class="custom-select" >
                <select v-model="form.jenis_lahir"> 
                  <option >Tunggal</option>
                  <option >Kembar 2</option> 
                  <option >Kembar 3</option> 
                  <option >Kembar 4</option> 
                  <option >Lainnya</option> 
                </select>
              </div>
              <template v-if="form.jenis_lahir == 'Lainnya'">
                <input required v-model="form.jenis_lahir_lainnya" type="text" placeholder="Masukan Tempat Dilahirkan Lainnya">   
              </template>   

              <hr class="q-mt-md">
              <label class="col-12 col-md-12 text-labelku text-center"><b>Dalam Keadaan Mati Setelah Dikandungnya Selama</b></label>
              <hr>              



              <label class="text-labelku col-12 col-md-12">Lama Mengandung (Bulan)</label>
              <input v-model="form.lama_mengandung" class="input-form col-12 col-md-12" type="number" placeholder="Masukan Lama Mengandung (Bulan)">    

              <label class="text-labelku col-12 col-md-12">Disebabkan karena</label>
              <input v-model="form.sebab_kematian" placeholder="Masukan Sebab Kematian" class="input-form col-12 col-md-12" type="text">    
 
            </q-step> 

            <q-step :name="4" title="Dari Seorang Ibu" caption="" icon="create_new_folder" :done="step > 4">
                <label class="text-labelku">NIK</label>   
                <input class="input-form" required v-model="form.nik_ibu" type="number" placeholder="NIK">          
                <label class="text-labelku">Nama</label>   
                <input class="input-form" required v-model="form.nama_ibu" type="text" placeholder="Nama">          
                <label class="text-labelku">Tanggal Lahir</label>   
                <input class="input-form" required v-model="form.tgl_lahir_ibu" type="date" placeholder="Tanggal Lahir">          
                <label class="text-labelku">Pekerjaan</label>   
                <input class="input-form" required v-model="form.pekerjaan_ibu" type="text" placeholder="Pekerjaan">
                
                  

                <label class="text-labelku">Kewarganegaraan</label>   
                <div class="custom-select" >
                  <select v-model="form.kewarganegaraan_ibu"> 
                    <option >Warga Negara Indonesia (WNI)</option> 
                    <option >Lainnya</option> 
                  </select>
                </div>
                <template v-if="form.kewarganegaraan_ibu == 'Lainnya'">
                  <input class="input-form" required v-model="form.kewarganegaraan_ibu_lainnya" type="text" placeholder="Kewarganegaraan">   
                </template>          
                <label class="text-labelku">Tanggal Pencatatan Perkawinan</label>   
                <input class="input-form" required v-model="form.tgl_catatan_perkawinan" type="date" placeholder="Tanggal Pencatatan Perkawinan">  

              <!-- ================= Alamat ===================== -->

              <label class="text-labelku">Alamat </label>
                <AdministrativeSelect
                  :model-value="form.provinsi_ibu"
                  @update:model-value="form.provinsi_ibu = $event"
                  label="Provinsi"
                  :options="list_data_provinsi_ibu"
                  :on-filter="(val, update) => provinsi2(val, update)"
                  code-field-name="kd_provinsi"
                />

                <AdministrativeSelect
                  :model-value="form.kabupaten_ibu"
                  @update:model-value="form.kabupaten_ibu = $event"
                  label="Kabupaten"
                  :options="list_data_kabupaten_ibu"
                  :on-filter="(val, update) => kabupaten2(val, update, form.provinsi_ibu)"
                  code-field-name="kd_kabupaten"
                />

                <AdministrativeSelect
                  :model-value="form.kecamatan_ibu"
                  @update:model-value="form.kecamatan_ibu = $event"
                  label="Kecamatan"
                  :options="list_data_kecamatan_ibu"
                  :on-filter="(val, update) => kecamatan2(val, update, form.kabupaten_ibu)"
                  code-field-name="kd_kecamatan"
                />

                <AdministrativeSelect
                  :model-value="form.des_kel_ibu"
                  @update:model-value="form.des_kel_ibu = $event"
                  label="Desa/Kelurahan"
                  :options="list_data_desa_kelurahan_ibu"
                  :on-filter="(val, update) => desa_kelurahan2(val, update, form.kecamatan_ibu)"
                  code-field-name="kd_desa_kelurahan"
                />

                <label class="text-labelku">Alamat</label>   
                <input class="input-form" required v-model="form.alamat_ibu" type="text" placeholder="Alamat Ex: Jl. Raya No. 123">

            </q-step> 

            <q-step :name="5" title="Istri dari (Data Suami) " caption="" icon="create_new_folder" :done="step > 5">
                <label class="text-labelku">NIK</label>   
                <input class="input-form" required v-model="form.nik_ayah" type="number" placeholder="NIK">          
                <label class="text-labelku">Nama</label>   
                <input class="input-form" required v-model="form.nama_ayah" type="text" placeholder="Nama">          
                <label class="text-labelku">Tanggal Lahir</label>   
                <input class="input-form" required v-model="form.tgl_lahir_ayah" type="date" placeholder="Tanggal Lahir">          
                <label class="text-labelku">Pekerjaan</label>   
                <input class="input-form" required v-model="form.pekerjaan_ayah" type="text" placeholder="Pekerjaan">
                
                  

                <label class="text-labelku">Kewarganegaraan</label>   
                <div class="custom-select" >
                  <select v-model="form.kewarganegaraan_ayah"> 
                    <option >Warga Negara Indonesia (WNI)</option> 
                    <option >Lainnya</option> 
                  </select>
                </div>
                <template v-if="form.kewarganegaraan_ayah == 'Lainnya'">
                  <input class="input-form" required v-model="form.kewarganegaraan_ayah_lainnya" type="text" placeholder="Kewarganegaraan">   
                </template>

              <!-- ================= Alamat ===================== -->

              <label class="text-labelku">Alamat </label>
                <AdministrativeSelect
                  :model-value="form.provinsi_ayah"
                  @update:model-value="form.provinsi_ayah = $event"
                  label="Provinsi"
                  :options="list_data_provinsi_ayah"
                  :on-filter="(val, update) => provinsi3(val, update)"
                  code-field-name="kd_provinsi"
                />

                <AdministrativeSelect
                  :model-value="form.kabupaten_ayah"
                  @update:model-value="form.kabupaten_ayah = $event"
                  label="Kabupaten"
                  :options="list_data_kabupaten_ayah"
                  :on-filter="(val, update) => kabupaten3(val, update, form.provinsi_ayah)"
                  code-field-name="kd_kabupaten"
                />

                <AdministrativeSelect
                  :model-value="form.kecamatan_ayah"
                  @update:model-value="form.kecamatan_ayah = $event"
                  label="Kecamatan"
                  :options="list_data_kecamatan_ayah"
                  :on-filter="(val, update) => kecamatan3(val, update, form.kabupaten_ayah)"
                  code-field-name="kd_kecamatan"
                />

                <AdministrativeSelect
                  :model-value="form.des_kel_ayah"
                  @update:model-value="form.des_kel_ayah = $event"
                  label="Desa/Kelurahan"
                  :options="list_data_desa_kelurahan_ayah"
                  :on-filter="(val, update) => desa_kelurahan3(val, update, form.kecamatan_ayah)"
                  code-field-name="kd_desa_kelurahan"
                />

                <label class="text-labelku">Alamat</label>   
                <input class="input-form" required v-model="form.alamat_ayah" type="text" placeholder="Alamat Ex: Jl. Raya No. 123">
            </q-step> 

 

            <q-step :name="6" title="Data Dukung" icon="add_comment">
              <label class="text-labelku">Lampiran file (*Bila ada tambahan file)</label>
              <div v-if="form.file_lampiranOld && !form.file_lampiran" style="margin-bottom: 16px; padding: 12px; background-color: #f5f5f5; border-radius: 8px;">
                <div style="font-size: 12px; font-weight: 500; color: #666; margin-bottom: 8px;">File Lama:</div>
                <div style="font-size: 13px; color: #333;">{{ form.file_lampiranOld }}</div>
              </div>
              <q-file outlined square :dense="true" v-model="file_lampiran_new" @update:model-value="onFileLampiranChange" label="Lampiran" filled>
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </q-step> 

            <template v-slot:navigation>
              <q-stepper-navigation>
                <q-btn v-if="step < 6" @click="$refs.stepper.next()" color="primary" label="Continue" />
                <q-btn v-if="step === 6" @click="editData()" color="positive" label="Submit" :loading="loading" />
                <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Back"
                  class="q-ml-sm" />
              </q-stepper-navigation>
            </template>
          </q-stepper>

        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modal_delete" persistent>
      <q-card style="min-width: 60%;">
        <q-card-section class="row items-center">
          <q-icon name="warning" color="negative" size="lg" class="q-mr-md" />
          <span class="text-h6">Konfirmasi Hapus Data</span>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <p class="text-body2">Apakah Anda yakin ingin menghapus data permohonan ini?</p>
          <p class="text-caption text-grey">Data yang dihapus tidak dapat dipulihkan kembali.</p>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Batal" color="grey-7" v-close-popup />
          <q-btn flat label="Hapus" color="negative" @click="confirmDelete()" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modal_lihat">
      <q-card style="min-width: 95%; max-width: 95%;">
        <q-toolbar>
          <q-toolbar-title>
            <q-icon name="visibility" color="primary" class="q-mr-md" />
            <span class="text-weight-bold">Detail Permohonan Kematian Bayi/Anak</span>
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-separator />

        <q-scroll-area style="height: 600px; width: 100%;">
          <q-card-section>
            <div class="q-gutter-lg">
              <!-- Bagian 1: Data Daerah Administratif (Alamat Permohonan) -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  🏘️ Daerah Administratif
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Provinsi</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ wilayah.uraian_provinsi || '-' }}</div>
                    <div style="font-size: 11px; color: #A0AEC0; margin-top: 2px;">Kode: {{ wilayah.kd_provinsi || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kabupaten</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ wilayah.uraian_kabupaten || '-' }}</div>
                    <div style="font-size: 11px; color: #A0AEC0; margin-top: 2px;">Kode: {{ wilayah.kd_kabupaten || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kecamatan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ wilayah.uraian_kecamatan || '-' }}</div>
                    <div style="font-size: 11px; color: #A0AEC0; margin-top: 2px;">Kode: {{ wilayah.kd_kecamatan || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Desa/Kelurahan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ wilayah.uraian_desa_kelurahan || '-' }}</div>
                    <div style="font-size: 11px; color: #A0AEC0; margin-top: 2px;">Kode: {{ wilayah.kd_desa_kelurahan || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Bagian 2: Data Pelapor -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #0097A7; border-bottom: 2px solid #0097A7; padding-bottom: 8px;">
                  � Yang Bertandatangan
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Nomor Kartu Keluarga</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.no_kk || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Nama</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.nama || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Umur</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.umur || '-' }} Tahun</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Pekerjaan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.pekerjaan || '-' }}</div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Hubungan dengan Bayi</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.hub_dengan_si_bayi || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Bagian 3: Data Kematian Bayi -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #E91E63; border-bottom: 2px solid #E91E63; padding-bottom: 8px;">
                  👶 Laporan Kematian Bayi/Anak
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Hari Lahir</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.hari || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Tanggal Lahir</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.tanggal || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Waktu Lahir</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.pukul || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Tempat Lahir</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.tempat || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Jenis Kelamin</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.jenis_kelamin_bayi || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Jenis Kelahiran</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.jenis_lahir || '-' }}</div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Lama Mengandung (Bulan)</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.lama_mengandung || '-' }} Bulan</div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Sebab Kematian</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.sebab_kematian || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Bagian 4: Data Ibu -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #FF6F00; border-bottom: 2px solid #FF6F00; padding-bottom: 8px;">
                  👩 Data Ibu
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">NIK</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.nik_ibu || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Nama</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.nama_ibu || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Tanggal Lahir</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.tgl_lahir_ibu || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Pekerjaan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.pekerjaan_ibu || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kewarganegaraan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.kewarganegaraan_ibu || '-' }}</div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Alamat</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.alamat_ibu || '-' }}</div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Alamat</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ wilayahIbu.uraian_provinsi || '-' }}, {{ wilayahIbu.uraian_kabupaten || '-' }}, {{ wilayahIbu.uraian_kecamatan || '-' }}, {{ wilayahIbu.uraian_desa_kelurahan || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Bagian 5: Data Ayah/Suami -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  👨 Data Ayah/Suami
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">NIK</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.nik_ayah || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Nama</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.nama_ayah || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Tanggal Lahir</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.tgl_lahir_ayah || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Pekerjaan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.pekerjaan_ayah || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kewarganegaraan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.kewarganegaraan_ayah || '-' }}</div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Alamat</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.alamat_ayah || '-' }}</div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Alamat</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ wilayahAyah.uraian_provinsi || '-' }}, {{ wilayahAyah.uraian_kabupaten || '-' }}, {{ wilayahAyah.uraian_kecamatan || '-' }}, {{ wilayahAyah.uraian_desa_kelurahan || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Bagian 6: File Lampiran -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #1565C0; border-bottom: 2px solid #1565C0; padding-bottom: 8px;">
                  📎 File Lampiran
                </h5>
                <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
                  <div v-if="form.file_lampiranOld" style="padding: 16px; background-color: #E3F2FD; border-radius: 8px; border-left: 4px solid #1976D2;">
                    <div style="font-size: 12px; font-weight: 500; color: #1565C0; margin-bottom: 8px;">📄 File Lampiran</div>
                    <div style="font-size: 13px; color: #1976D2; word-break: break-all;">{{ form.file_lampiranOld }}</div>
                    <div style="margin-top: 8px;">
                      <q-btn 
                        size="sm" 
                        color="primary" 
                        label="Download" 
                        icon="download" 
                        @click="bukaLink(form.file_lampiranOld)"
                        outline
                      />
                    </div>
                  </div>
                  <div v-else style="padding: 16px; background-color: #F5F5F5; border-radius: 8px; text-align: center; color: #999;">
                    <q-icon name="info" size="32px" style="opacity: 0.5; display: block; margin-bottom: 8px;" />
                    <p style="margin: 0; font-size: 13px;">Tidak ada file lampiran</p>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-scroll-area>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Tutup" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modal_alur">
      <q-card style="min-width: 95%; max-width: 95%;">
        <q-toolbar>
          <q-toolbar-title>
            <q-icon name="visibility" color="primary" class="q-mr-md" />
            <span class="text-weight-bold">Alur Permohonan</span>
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-separator />

        <q-scroll-area style="height: 500px; width: 100%;">
          <q-card-section>
            <div class="q-gutter-lg">
              <!-- Bagian 1: Data Daerah Administratif -->
              <div>
 
                             
                <q-list bordered padding separator>
                          <q-item>
                            <q-item-section>
                              <q-item-label overline>INPUT DATA</q-item-label>
                              <q-item-label caption>Tahap pertama berhasil</q-item-label>
                              <q-item-label> 
                                <div>
                                  <q-icon color="green-8" size="2em" name="fa fa-check-square" /> <label>Selesai </label>
                                </div>    
                              </q-item-label>
                            </q-item-section>

                            <q-item-section side top>
                              <q-item-label caption>{{simcard.tglConvert(form.createdAt).time}}</q-item-label>
                              <q-item-label caption>{{simcard.tglConvert(form.createdAt).tgl}}</q-item-label>
                            </q-item-section>
                          </q-item>                  
                          
                          <q-item>
                            <q-item-section>                     
                              <q-item-label overline>TAHAPAN KECAMATAN</q-item-label>
                              <q-item-label caption>Tahap Kedua berhasil</q-item-label>
                              <q-item-label>
                                  <template v-if="form.status_kecamatan == 0"> 
                                    <q-spinner-pie size="2em" title="Proses" color="orange" /> <label>Menunggu Verifikasi Kecamatan</label>
                                  </template>
                                  <template v-if="form.status_kecamatan == 1"> 
                                    <q-icon color="green-8" size="2em" name="fa fa-check-square" /> <label>Data Telah Diverifikasi </label>
                                  </template>
                                  <template v-if="form.status_kecamatan == 2"> 
                                    <q-icon color="red-8" size="2em" name="fas fa-window-close" /> <label>Dikembalikan </label>
                                  </template>
 
                              </q-item-label>
                            </q-item-section>

                            <q-item-section side top>
                              <q-item-label caption>{{simcard.tglConvert(form.createdAt_kecamatan).time}}</q-item-label>
                              <q-item-label caption>{{simcard.tglConvert(form.createdAt_kecamatan).tgl}}</q-item-label>
                            </q-item-section>
                          </q-item>                  
                          <q-item  v-if="form.status_kecamatan == 1">
                            <q-item-section>
                              <q-item-label overline>TAHAPAN KECAMATAN</q-item-label>
                                <q-item-label> 
                                  <div>
                                    <q-icon color="blue-8" size="2em" name="fa fa-share-alt-square" /> <label>Telah Diteruskan Ke Kabupaten</label>
                                  </div>                             
                                </q-item-label>
                              <q-item-label caption>{{form.keterangan_kecamatan}}</q-item-label>
                            </q-item-section> 
                            <q-item-section side top>
                              <q-item-label caption>{{simcard.tglConvert(form.createdAt_kecamatan).time}}</q-item-label>
                              <q-item-label caption>{{simcard.tglConvert(form.createdAt_kecamatan).tgl}}</q-item-label>
                            </q-item-section>
                          </q-item>    

                          <q-item> 
                            <q-item-section>
                              <q-item-label overline>TAHAPAN KABUPATEN</q-item-label>
                              <q-item-label> 
                                  <template v-if="form.status_kabupaten == 0">  
                                    <q-spinner-pie  size="2em" title="Proses" color="orange" /> <label>Menunggu Verifikasi Kabupaten</label>
                                  </template>
   
                                  <template v-if="form.status_kabupaten == 1">  
                                    <q-icon color="green-8" size="2em" name="fa fa-check-square" /> <label>Data Telah Diverifikasi </label>
                                  </template> 
                                  <template v-if="form.status_kabupaten == 2">  
                                  <q-icon color="red-8" size="2em" name="fa fa-check-square" /> <label>Dikembalikan </label>
                                  </template>                          
                              </q-item-label>
                                <template v-if="form.status_kabupaten == 1">  
                                  <q-item-label caption>{{form.keterangan_kabupaten}}</q-item-label>
                                </template>
                            </q-item-section>

                            <q-item-section side top>
                              <q-item-label caption>{{simcard.tglConvert(form.createdAt_kabupaten).time}}</q-item-label>
                              <q-item-label caption>{{simcard.tglConvert(form.createdAt_kabupaten).tgl}}</q-item-label>
                            </q-item-section>
                          </q-item>                  
                          
                          <q-item class="bg-teal text-white"  v-if="form.status_kabupaten == 1">
                            <q-item-section side>
                                  <q-icon color="indigo-1" size="2em" name="fa fa-laptop-house" />
                            </q-item-section>
                            <q-item-section>
                              <!-- <q-item-label style="color:#ffffff" overline>SEMUA TAHAPAN SELESAI</q-item-label> -->
                              <q-item-label style="color:#fadadab3" caption>{{form.keterangan_kabupaten}}.</q-item-label>
                            </q-item-section>
                            <q-item-section side top style="color:#ffffff">
                              <q-item-label caption>{{simcard.tglConvert(form.createdAt_kabupaten).time}}</q-item-label>
                              <q-item-label caption>{{simcard.tglConvert(form.createdAt_kabupaten).tgl}}</q-item-label>
                            </q-item-section>
                          </q-item>   
                    

                </q-list>
                 
              </div>

 

 

 
            </div>
          </q-card-section>
        </q-scroll-area>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Tutup" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Lihat Status Component -->
    <ModalLihatStatus
      v-model="modal_lihat_status"
      :status-kecamatan="form.status_kecamatan"
      :status-kabupaten="form.status_kabupaten"
      :keterangan-kecamatan="form.keterangan_kecamatan"
      :keterangan-kabupaten="form.keterangan_kabupaten"
      title="Alasan Pengembalian Permohonan"
      kecamatan-label="Keterangan dari Tingkat Kecamatan"
      kabupaten-label="Keterangan dari Tingkat Kabupaten"
      help-text="Silakan perbaiki data sesuai dengan keterangan di atas dan ajukan kembali permohonan Anda. Gunakan menu <strong>Edit</strong> untuk memperbaiki data."
    />

    <!-- Modal Syarat Component -->
    <ModalSyarat
      v-model="modal_syarat"
      title="Persyaratan Dokumen"
      header-title="Dokumen Persyaratan Lampiran"
      header-subtitle="@disdukcapil.konaweselatankab.go.id | 31 Januari 2020"
    />

  </q-page>
</template>

<script>
import { useSimcardStore } from '../../../../src/stores/simcard';
import AutocompleteInput from 'src/components/AutocompleteInput.vue'
import AdministrativeSelect from 'src/components/AdministrativeSelect.vue'
import ModalSyarat from 'src/components/ModalSyarat.vue'
import ModalLihatStatus from 'src/components/ModalLihatStatus.vue'
import FetchingUmum from 'src/utils/simcard_library'


import { Loading, Notify } from 'quasar'
import axios from 'axios'

export default {
  components: { AutocompleteInput, AdministrativeSelect, ModalSyarat, ModalLihatStatus },
  name: 'pelaporan_LAHIR_MATI_list',
  data() {
    return {
      FetchingUmum: FetchingUmum,
      nama_form:'pelaporan_LAHIR_MATI',
      nama:'',
      step: 1,
      modal_lihat   : false,
      modal_add   : false,
      modal_edit  : false,
      modal_alur  : false,
      modal_delete  : false,
      modal_syarat : false,
      modal_lihat_status : false,
      modal_alasan : false,
      loading: false,
      isLoadingData: false, // Flag untuk menandai apakah sedang load data dari edit
      file_lampiran_new: null, // State untuk file baru
      options: [],
      options2: [],
      token: localStorage.getItem('token') || '',

 
            form: { 
              file_lampiran     :null,
              file_lampiranOld  :null,       
              id:'',
              modul:'lapor_lahir_mati',

              m_provinsi  : '74',
              m_kabupaten : '7405',
              m_kecamatan : '',
              m_desa_kelurahan : '', 
              
              no_kk: '',
              nama: '',
              umur: '',
              pekerjaan: '',
              alamat: '',
              hub_dengan_si_bayi: '',

              // MELAPORKAN BAHWA 
              hari: '',
              tanggal: '',
              pukul: '',
              tempat: '',
              // TELAH LAHIR BAYI 
              jenis_kelamin_bayi: '',
              jenis_lahir:'',
              jenis_lahir_lainnya:'',
              lama_mengandung: '',
              sebab_kematian: '',



              nik_ibu:'',
              nama_ibu:'',
              tgl_lahir_ibu:'',
              pekerjaan_ibu:'',

              provinsi_ibu:'',
              kabupaten_ibu:'',
              kecamatan_ibu:'',
              des_kel_ibu:'',
              alamat_ibu:'',
              kewarganegaraan_ibu:'',
              kewarganegaraan_ibu_lainnya:'',

              tgl_catatan_perkawinan:'',


              nik_ayah:'',
              nama_ayah:'',
              tgl_lahir_ayah:'',
              pekerjaan_ayah:'',

              provinsi_ayah:'',
              kabupaten_ayah:'',
              kecamatan_ayah:'',
              des_kel_ayah:'',
              alamat_ayah:'',
              kewarganegaraan_ayah:'',
              kewarganegaraan_ayah_lainnya:'',

              status : 0,
              keterangan : 0,
              
              keterangan_deskel:'',
              keterangan_kecamatan:'',
              keterangan_kabupaten  :'',

              status_deskel:0,
              status_kecamatan:0,
              status_kabupaten  :0,
              
              createdAt_deskel:'',
              createdAt_kecamatan:'',
              createdAt_kabupaten  :'',               

              file_terbitan   : null,
              emailPemohon    : '',
              email_file      : null,
              email_fileOld   : '',
              email_from      : '',
              email_to        : '',
              email_subject   : '',
              email_html      : '',

              createdBy      : '',

            },

            list_data:[],
            list_data_provinsi:[],            
            list_data_kabupaten:[],            
            list_data_kecamatan:[],
            list_data_desa_kelurahan:[],

            list_data_provinsi_ibu:[],            
            list_data_kabupaten_ibu:[],            
            list_data_kecamatan_ibu:[],
            list_data_desa_kelurahan_ibu:[],

            list_data_provinsi_ayah:[],            
            list_data_kabupaten_ayah:[],            
            list_data_kecamatan_ayah:[],
            list_data_desa_kelurahan_ayah:[],

            list_data_provinsi_pelapor:[],            
            list_data_kabupaten_pelapor:[],            
            list_data_kecamatan_pelapor:[],
            list_data_desa_kelurahan_pelapor:[],
            
            list_data_provinsi_saksi1:[],            
            list_data_kabupaten_saksi1:[],            
            list_data_kecamatan_saksi1:[],
            list_data_desa_kelurahan_saksi1:[],

            list_data_provinsi_saksi2:[],            
            list_data_kabupaten_saksi2:[],            
            list_data_kecamatan_saksi2:[],
            list_data_desa_kelurahan_saksi2:[],


      listShdk: [],
      listAgama: [],
      listPekerjaan: [],
      listPendidikan: [],

      anggota_keluarga: { 
        nama: '',
        nik: '',
        jenis_kelamin: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        shdk: '',
        shdk_lainnya: '',
        tglKTP_dari : '',
        tglKTP_hingga : '',         
        agama: '',
        agama_lainnya: '',
        pekerjaan: '',
        pekerjaan_lainnya: '',
        pendidikan: '',
        pendidikan_lainnya: '',
        KKref: ''
      },       
      
      // State untuk edit
      editingIndex: -1,
      isEditing: false,

      // State untuk menampilkan uraian alamat pada edit mode
      wilayah: {
        uraian_provinsi: '',
        kd_provinsi: '',
        uraian_kabupaten: '',
        kd_kabupaten: '',
        uraian_kecamatan: '',
        kd_kecamatan: '',
        uraian_desa_kelurahan: '',
        kd_desa_kelurahan: ''
      },
      wilayahIbu: {
        uraian_provinsi: '',
        kd_provinsi: '',
        uraian_kabupaten: '',
        kd_kabupaten: '',
        uraian_kecamatan: '',
        kd_kecamatan: '',
        uraian_desa_kelurahan: '',
        kd_desa_kelurahan: ''
      },
      wilayahAyah: {
        uraian_provinsi: '',
        kd_provinsi: '',
        uraian_kabupaten: '',
        kd_kabupaten: '',
        uraian_kecamatan: '',
        kd_kecamatan: '',
        uraian_desa_kelurahan: '',
        kd_desa_kelurahan: ''
      },
      wilayahPelapor: {
        uraian_provinsi: '',
        kd_provinsi: '',
        uraian_kabupaten: '',
        kd_kabupaten: '',
        uraian_kecamatan: '',
        kd_kecamatan: '',
        uraian_desa_kelurahan: '',
        kd_desa_kelurahan: ''
      },
      wilayahSaksi1: {
        uraian_provinsi: '',
        kd_provinsi: '',
        uraian_kabupaten: '',
        kd_kabupaten: '',
        uraian_kecamatan: '',
        kd_kecamatan: '',
        uraian_desa_kelurahan: '',
        kd_desa_kelurahan: ''
      },
      wilayahSaksi2: {
        uraian_provinsi: '',
        kd_provinsi: '',
        uraian_kabupaten: '',
        kd_kabupaten: '',
        uraian_kecamatan: '',
        kd_kecamatan: '',
        uraian_desa_kelurahan: '',
        kd_desa_kelurahan: ''
      },

      page_first: 1,
      page_limit: 10,
      page_last: 0,
      cari_value: '',
      totalPage: 1,
      totalData: 0,
      allDataLoaded: false,
      searchTimeout: null,

      itemsx : [{}, {}, {}, {}, {}, {}, {}]

    }
  },
  computed: {
    simcard() {
      return useSimcardStore()
    },
  },
  methods: {


 


    goBack() {
      this.$router.back()
    },

    bukaLink(file) {
      if (file) {
        window.open(this.simcard.url.URL_APP+"uploads/"+file, '_blank')
      }
    },

    onFileLampiranChange(newFile) {
      // Set file baru ke form.file_lampiran
      this.form.file_lampiran = newFile
    },
 

 

 
    getview() {
      this.loading = true;
 
      const payload = {
        data_ke: this.page_first,
        page_limit: this.page_limit,
        cari_value: this.cari_value,
        createdBy: this.form.createdBy
      }

 

      axios.post(
        this.simcard.url.URL_PELAPORAN_LAHIR_MATI + "view",
        payload,
        {
          headers: {
            authorization: "kikensbatara " + this.token
          }
        }
      )
      .then(response => {
        this.list_data = response.data.data
        this.page_last = response.data.jmlData
        this.loading = false;
 
      })
 


    },

    // Fungsi validasi form
    validateForm() {
      // Field-field yang wajib diisi
      const requiredFields = {
        // Step 1: Daerah Administratif
        m_provinsi: 'Provinsi harus dipilih',
        m_kabupaten: 'Kabupaten harus dipilih',
        m_kecamatan: 'Kecamatan harus dipilih',
        m_desa_kelurahan: 'Desa/Kelurahan harus dipilih',
        
        // Step 2: Data Pelapor
        no_kk: 'Nomor Kartu Keluarga harus diisi',
        nama: 'Nama harus diisi',
        umur: 'Umur harus diisi',
        pekerjaan: 'Pekerjaan harus diisi',
        hub_dengan_si_bayi: 'Hubungan dengan bayi harus diisi',
        
        // Step 3: Laporan Kelahiran
        hari: 'Hari lahir harus dipilih',
        tanggal: 'Tanggal lahir harus diisi',
        pukul: 'Waktu lahir harus diisi',
        tempat: 'Tempat lahir harus diisi',
        jenis_kelamin_bayi: 'Jenis kelamin bayi harus dipilih',
        jenis_lahir: 'Jenis kelahiran harus dipilih',
        lama_mengandung: 'Lama mengandung harus diisi',
        sebab_kematian: 'Sebab kematian harus diisi',
        
        // Step 4: Data Ibu
        nik_ibu: 'NIK Ibu harus diisi',
        nama_ibu: 'Nama Ibu harus diisi',
        tgl_lahir_ibu: 'Tanggal lahir Ibu harus diisi',
        pekerjaan_ibu: 'Pekerjaan Ibu harus diisi',
        provinsi_ibu: 'Provinsi Ibu harus dipilih',
        kabupaten_ibu: 'Kabupaten Ibu harus dipilih',
        kecamatan_ibu: 'Kecamatan Ibu harus dipilih',
        des_kel_ibu: 'Desa/Kelurahan Ibu harus dipilih',
        alamat_ibu: 'Alamat Ibu harus diisi',
        kewarganegaraan_ibu: 'Kewarganegaraan Ibu harus dipilih',
        
        // Step 5: Data Ayah/Suami
        nik_ayah: 'NIK Ayah/Suami harus diisi',
        nama_ayah: 'Nama Ayah/Suami harus diisi',
        tgl_lahir_ayah: 'Tanggal lahir Ayah/Suami harus diisi',
        pekerjaan_ayah: 'Pekerjaan Ayah/Suami harus diisi',
        provinsi_ayah: 'Provinsi Ayah/Suami harus dipilih',
        kabupaten_ayah: 'Kabupaten Ayah/Suami harus dipilih',
        kecamatan_ayah: 'Kecamatan Ayah/Suami harus dipilih',
        des_kel_ayah: 'Desa/Kelurahan Ayah/Suami harus dipilih',
        alamat_ayah: 'Alamat Ayah/Suami harus diisi',
        kewarganegaraan_ayah: 'Kewarganegaraan Ayah/Suami harus dipilih',
      }

      // Cek setiap field
      for (const [field, message] of Object.entries(requiredFields)) {
        const value = this.form[field]
        
        // Validasi nilai kosong
        if (value === '' || value === null || value === undefined) {
          return {
            valid: false,
            message: message
          }
        }

        // Validasi number fields
        if ((field === 'umur' || field === 'lama_mengandung') && value <= 0) {
          return {
            valid: false,
            message: requiredFields[field] + ' harus lebih dari 0'
          }
        }
      }

      // Validasi kewarganegaraan ibu jika "Lainnya"
      if (this.form.kewarganegaraan_ibu === 'Lainnya' && !this.form.kewarganegaraan_ibu_lainnya) {
        return {
          valid: false,
          message: 'Kewarganegaraan Ibu (Lainnya) harus diisi'
        }
      }

      // Validasi kewarganegaraan ayah jika "Lainnya"
      if (this.form.kewarganegaraan_ayah === 'Lainnya' && !this.form.kewarganegaraan_ayah_lainnya) {
        return {
          valid: false,
          message: 'Kewarganegaraan Ayah/Suami (Lainnya) harus diisi'
        }
      }

      // Validasi jenis kelahiran jika "Lainnya"
      if (this.form.jenis_lahir === 'Lainnya' && !this.form.jenis_lahir_lainnya) {
        return {
          valid: false,
          message: 'Jenis Kelahiran (Lainnya) harus diisi'
        }
      }

      return {
        valid: true,
        message: 'Semua field valid'
      }
    },

    addData() {
      // Validasi form terlebih dahulu
      const validationResult = this.validateForm()
      if (!validationResult.valid) {
        Notify.create({
          message: validationResult.message,
          color: 'warning',
          position: 'top'
        })
        return
      }

      this.loading = true;

      const formData = new FormData();
      formData.append("data", JSON.stringify(this.form));
      formData.append("file", this.form.file);
      
      // Hanya append file_lampiran jika ada file baru
      if (this.form.file_lampiran && this.form.file_lampiran instanceof File) {
        formData.append("file_lampiran", this.form.file_lampiran);
      }

      axios.post(
        this.simcard.url.URL_PELAPORAN_LAHIR_MATI + "addData",
        formData,
        {
          headers: {
            authorization: "kikensbatara " + this.token
          }
        }
      )
      .then(response => {
        this.loading = false;
        Notify.create({
          message: 'Data berhasil dikirim',
          color: 'positive'
        })
        this.getview();
        this.file_lampiran_new = null; // Reset file state
      })
      .catch(error => {
        // this.loading = false;
        console.error('Error:', error)
        Notify.create({
          message: 'Gagal mengirim data: ' + (error.response?.data?.message || error.message),
          color: 'negative'
        })
      })
    },


    editData() {
      // Validasi form terlebih dahulu
      const validationResult = this.validateForm()
      if (!validationResult.valid) {
        Notify.create({
          message: validationResult.message,
          color: 'warning',
          position: 'top'
        })
        return
      }

      this.loading = true;

      const formData = new FormData();
      formData.append("data", JSON.stringify(this.form));
      formData.append("file", this.form.file);
      
      // Hanya append file_lampiran jika ada file baru
      if (this.form.file_lampiran && this.form.file_lampiran instanceof File) {
        formData.append("file_lampiran", this.form.file_lampiran);
      }

      axios.post(
        this.simcard.url.URL_PELAPORAN_LAHIR_MATI + "editData_mobile",
        formData,
        {
          headers: {
            authorization: "kikensbatara " + this.token
          }
        }
      )
      .then(response => {
        this.loading = false;
        Notify.create({
          message: 'Data berhasil diperbarui',
          color: 'positive'
        })
        this.getview();
        this.modal_edit = false;
        this.file_lampiran_new = null; // Reset file state
      })
      .catch(error => {
        this.loading = false;
        console.error('Error:', error)
        Notify.create({
          message: 'Gagal memperbarui data: ' + (error.response?.data?.message || error.message),
          color: 'negative'
        })
      })
    },

    removeData() {
      this.loading = true;

      const body = JSON.stringify({
        id        : this.form.id,
        KKref     : this.form.KKref
      });

      axios.post(
        this.simcard.url.URL_PELAPORAN_LAHIR_MATI + "removeData",
        body,
        {
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + this.token
          },
        }
      )
      .then(response => {
        this.loading = false;
        Notify.create({
          message: 'Data berhasil dihapus',
          color: 'positive'
        })
        this.getview();
        this.modal_delete = false;
        // Reset form
        this.resetForm();
      })
      .catch(error => {
        this.loading = false;
        console.error('Error:', error)
        Notify.create({
          message: 'Gagal menghapus data: ' + (error.response?.data?.message || error.message),
          color: 'negative'
        })
      })
    },

    confirmDelete() {
      this.removeData();
    },

    resetForm() {
      this.form = {
        id: '',
        KKref: '',
        id_dari_form: '',
        m_provinsi: '74',
        m_kabupaten: '7405',
        m_kecamatan: '',
        m_desa_kelurahan: '',
        permohonan: '',
        permohonan_lainnya: '',
        nama: '',
        nik: '',
        no_kk: '',
        agama: '',
        agama_lainnya: '',
        pekerjaan: '',
        pekerjaan_lainnya: '',
        pendidikan: '',
        pendidikan_lainnya: '',
        jenis_kelamin: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        status_hubungan_dl_keluarga: '',
        alamat: '',
        rt: '',
        rw: '',
        kode_pos: '',
        provinsi: '',
        kabupaten: '',
        kecamatan: '',
        desa_kelurahan: '',
        file_lampiran_kecamatan: null,
        file_lampiran_kabupaten: null,
        status: 0,
        keterangan: 0,
        keterangan_deskel: '',
        keterangan_kecamatan: '',
        keterangan_kabupaten: '',
        status_deskel: 0,
        status_kecamatan: 0,
        status_kabupaten: 0,
        createdBy: '',
        createdAt: '',
        createdAt_deskel: '',
        createdAt_kecamatan: '',
        createdAt_kabupaten: '',
        file_terbitan: null,
        emailPemohon: '',
        email_file: null,
        email_fileOld: '',
        email_from: '',
        email_to: '',
        email_subject: '',
        email_html: '',
        file: null,
        fileThumb: null,
        file_lampiran: null,
        file_lampiranOld: null,
        anggota_keluarga: []
      }
    },


    selectData(data){
      // Set flag untuk tidak trigger reset di watcher
      this.isLoadingData = true

          this.form.id                            = data.pelaporan_LAHIR_MATI.id
        this.form.m_provinsi                    = data.pelaporan_LAHIR_MATI.m_provinsi
        this.form.m_kabupaten                   = data.pelaporan_LAHIR_MATI.m_kabupaten
        this.form.m_kecamatan                   = data.pelaporan_LAHIR_MATI.m_kecamatan
        this.form.m_desa_kelurahan              = data.pelaporan_LAHIR_MATI.m_desa_kelurahan
        this.form.no_kk                         = data.pelaporan_LAHIR_MATI.no_kk
        this.form.nama                          = data.pelaporan_LAHIR_MATI.nama
        this.form.umur                          = data.pelaporan_LAHIR_MATI.umur
        this.form.pekerjaan                     = data.pelaporan_LAHIR_MATI.pekerjaan
        this.form.alamat                        = data.pelaporan_LAHIR_MATI.alamat
        this.form.hub_dengan_si_bayi            = data.pelaporan_LAHIR_MATI.hub_dengan_si_bayi
        this.form.hari                          = data.pelaporan_LAHIR_MATI.hari
        this.form.tanggal                       = data.pelaporan_LAHIR_MATI.tanggal
        this.form.pukul                         = data.pelaporan_LAHIR_MATI.pukul
        this.form.tempat                        = data.pelaporan_LAHIR_MATI.tempat
        this.form.jenis_kelamin_bayi            = data.pelaporan_LAHIR_MATI.jenis_kelamin_bayi
        this.form.jenis_lahir                   = data.pelaporan_LAHIR_MATI.jenis_lahir
        this.form.jenis_lahir_lainnya           = data.pelaporan_LAHIR_MATI.jenis_lahir_lainnya
        this.form.lama_mengandung               = data.pelaporan_LAHIR_MATI.lama_mengandung
        this.form.sebab_kematian                = data.pelaporan_LAHIR_MATI.sebab_kematian
        this.form.nik_ibu                       = data.pelaporan_LAHIR_MATI.nik_ibu
        this.form.nama_ibu                      = data.pelaporan_LAHIR_MATI.nama_ibu
        this.form.tgl_lahir_ibu                 = data.pelaporan_LAHIR_MATI.tgl_lahir_ibu
        this.form.pekerjaan_ibu                 = data.pelaporan_LAHIR_MATI.pekerjaan_ibu
        this.form.provinsi_ibu                  = data.pelaporan_LAHIR_MATI.provinsi_ibu
        this.form.kabupaten_ibu                 = data.pelaporan_LAHIR_MATI.kabupaten_ibu
        this.form.kecamatan_ibu                 = data.pelaporan_LAHIR_MATI.kecamatan_ibu
        this.form.des_kel_ibu                   = data.pelaporan_LAHIR_MATI.des_kel_ibu
        this.form.alamat_ibu                    = data.pelaporan_LAHIR_MATI.alamat_ibu
        this.form.kewarganegaraan_ibu           = data.pelaporan_LAHIR_MATI.kewarganegaraan_ibu
        this.form.kewarganegaraan_ibu_lainnya   = data.pelaporan_LAHIR_MATI.kewarganegaraan_ibu_lainnya
        this.form.tgl_catatan_perkawinan        = data.pelaporan_LAHIR_MATI.tgl_catatan_perkawinan
        this.form.nik_ayah                      = data.pelaporan_LAHIR_MATI.nik_ayah
        this.form.nama_ayah                     = data.pelaporan_LAHIR_MATI.nama_ayah
        this.form.tgl_lahir_ayah                = data.pelaporan_LAHIR_MATI.tgl_lahir_ayah
        this.form.pekerjaan_ayah                = data.pelaporan_LAHIR_MATI.pekerjaan_ayah
        this.form.provinsi_ayah                 = data.pelaporan_LAHIR_MATI.provinsi_ayah
        this.form.kabupaten_ayah                = data.pelaporan_LAHIR_MATI.kabupaten_ayah
        this.form.kecamatan_ayah                = data.pelaporan_LAHIR_MATI.kecamatan_ayah
        this.form.des_kel_ayah                  = data.pelaporan_LAHIR_MATI.des_kel_ayah
        this.form.alamat_ayah                   = data.pelaporan_LAHIR_MATI.alamat_ayah
        this.form.kewarganegaraan_ayah          = data.pelaporan_LAHIR_MATI.kewarganegaraan_ayah
        this.form.kewarganegaraan_ayah_lainnya  = data.pelaporan_LAHIR_MATI.kewarganegaraan_ayah_lainnya

 

        this.form.status                        = data.pelaporan_LAHIR_MATI.status
        this.form.keterangan                    = data.pelaporan_LAHIR_MATI.keterangan
        this.form.keterangan_deskel             = data.pelaporan_LAHIR_MATI.keterangan_deskel
        this.form.keterangan_kecamatan          = data.pelaporan_LAHIR_MATI.keterangan_kecamatan
        this.form.keterangan_kabupaten          = data.pelaporan_LAHIR_MATI.keterangan_kabupaten
        this.form.status_deskel                 = data.pelaporan_LAHIR_MATI.status_deskel
        this.form.status_kecamatan              = data.pelaporan_LAHIR_MATI.status_kecamatan
        this.form.status_kabupaten              = data.pelaporan_LAHIR_MATI.status_kabupaten
        this.form.createdAt_deskel              = data.pelaporan_LAHIR_MATI.createdAt_deskel
        this.form.createdAt_kecamatan           = data.pelaporan_LAHIR_MATI.createdAt_kecamatan
        this.form.createdAt_kabupaten           = data.pelaporan_LAHIR_MATI.createdAt_kabupaten

        this.form.file_lampiran           = data.pelaporan_LAHIR_MATI.file_lampiran
        this.form.file_lampiranOld           = data.pelaporan_LAHIR_MATI.file_lampiranOld

        this.form.createdBy           = data.pelaporan_LAHIR_MATI.createdBy
        


        this.form.emailPemohon  = data.pelaporan_LAHIR_MATI.emailPemohon;
        this.form.email_fileOld = data.pelaporan_LAHIR_MATI.email_file;
        this.form.email_from    = this.form.email_from;
        this.form.email_to      = this.form.emailPemohon;
        this.form.email_subject = data.pelaporan_LAHIR_MATI.email_subject;
        if (data.pelaporan_LAHIR_MATI.email_html == undefined || data.pelaporan_LAHIR_MATI.email_html == null || data.pelaporan_LAHIR_MATI.email_html == '') {
          this.form.email_html    = ''
        } else {
          this.form.email_html    = data.pelaporan_LAHIR_MATI.email_html; 
        }

        this.wilayah = {
          uraian_provinsi        : data.m_provinsi.uraian,
          kd_provinsi            : data.m_provinsi.kd_provinsi,
          uraian_kabupaten       : data.m_kabupaten.uraian,
          kd_kabupaten           : data.m_kabupaten.kd_kabupaten,
          uraian_kecamatan       : data.m_kecamatan.uraian,
          kd_kecamatan           : data.m_kecamatan.kd_kecamatan,
          uraian_desa_kelurahan  : data.m_desa_kelurahan.uraian,
          kd_desa_kelurahan      : data.m_desa_kelurahan.kd_desa_kelurahan,
        }; 
        this.wilayahIbu = {
          uraian_provinsi       : data.wilayah_provinsi_ibu.uraian,
          kd_provinsi           : data.wilayah_provinsi_ibu.kd_provinsi,
          uraian_kabupaten      : data.wilayah_kabupaten_ibu.uraian,
          kd_kabupaten          : data.wilayah_kabupaten_ibu.kd_kabupaten,
          uraian_kecamatan      : data.wilayah_kecamatan_ibu.uraian,
          kd_kecamatan          : data.wilayah_kecamatan_ibu.kd_kecamatan,
          uraian_desa_kelurahan : data.wilayah_deskel_ibu.uraian,
          kd_desa_kelurahan     : data.wilayah_deskel_ibu.kd_desa_kelurahan,
        }; 
        this.wilayahAyah = {
          uraian_provinsi       : data.wilayah_provinsi_ayah.uraian,
          kd_provinsi           : data.wilayah_provinsi_ayah.kd_provinsi,
          uraian_kabupaten      : data.wilayah_kabupaten_ayah.uraian,
          kd_kabupaten          : data.wilayah_kabupaten_ayah.kd_kabupaten,
          uraian_kecamatan      : data.wilayah_kecamatan_ayah.uraian,
          kd_kecamatan          : data.wilayah_kecamatan_ayah.kd_kecamatan,
          uraian_desa_kelurahan : data.wilayah_deskel_ayah.uraian,
          kd_desa_kelurahan     : data.wilayah_deskel_ayah.kd_desa_kelurahan,
        }; 
      
      // Reset file state untuk modal edit
      this.file_lampiran_new = null
      this.form.file_lampiran = null

      // Load initial data untuk alamat berdasarkan provinsi, kabupaten, kecamatan yang ada
      this.$nextTick(async () => {
        // Load kabupaten2 terlebih dahulu
 
        await this.loadInitialProvinsi()
        await this.loadInitialKabupaten()
        await this.loadInitialKecamatan()
        await this.loadInitialDesaKelurahan()

        await this.loadDaerahIbu()
        // Tunggu kabupaten loaded, lalu load kecamatan2
        await this.loadDaerahAyah()
        // Tunggu kecamatan loaded, lalu load desa_kelurahan2
        await this.loadDaerahPelapor()

        await this.loadDaerahSaksi1()

        await this.loadDaerahSaksi2()

        // Reset flag setelah loading selesai
        this.isLoadingData = false
      })

    },    



    // FILTER DAERAH ADMINISTRATIF
    provinsi1(val, update, abort) {
      update( async () => {
        if (!val) {
          this.options = this.list_data_provinsi
          return
        }

        // this.list_data_provinsi = await this.FetchingUmum.provinsi(this.token, val)

        axios.get(this.simcard.url.URL_APP+'api/v1/m_provinsi/list', {
          params: {
            q: val  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // Simpan original data
          this.list_data_provinsi = response.data || []
          this.options = response.data || []
        })
        .catch(error => {
          console.error('Error fetching provinsi:', error)
        })
      })
    },
    kabupaten1(val, update, m_provinsi, abort) {
      update(() => {
        if (!val) {
          this.options = this.list_data_kabupaten
          return
        }

        axios.get(this.simcard.url.URL_DATAMASTER_KAB_KOTA+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_provinsi: m_provinsi  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // console.log('Kabupaten response:', response)
          // Simpan original data
          this.list_data_kabupaten = response.data || []
          this.options = response.data || []
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })
      })
    },
    kecamatan1(val, update, m_kabupaten, abort) {
      update(() => {
        if (!val) {
          this.options = this.list_data_kecamatan
          return
        }

        axios.get(this.simcard.url.URL_DATAMASTER_KECAMATAN+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_kabupaten: m_kabupaten  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // console.log('Kecamatan response:', response)
          // Simpan original data
          this.list_data_kecamatan = response.data || []
          this.options = response.data || []
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })
      })
    },
    desa_kelurahan1(val, update, m_kecamatan, abort) {
      update(() => {
        if (!val) {
          this.options = this.list_data_desa_kelurahan
          return
        }

        axios.get(this.simcard.url.URL_DATAMASTER_DES_KEL+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_kecamatan: m_kecamatan  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // console.log('Kecamatan response:', response)
          // Simpan original data
          this.list_data_desa_kelurahan = response.data || []
          this.options = response.data || []
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })
      })
    },

    // ===== NEW: Wrapper methods yang menggunakan store untuk lebih efisien =====
    provinsi2(val, update, abort) {
      update(async () => {
        
        
        if (!val) {
          this.options2 = this.list_data_provinsi_ibu
          return
        }

        var data  = await this.FetchingUmum.provinsi(this.token, val)
        this.list_data_provinsi_ibu = data
        // this.options2 = data 
      })
    },

    kabupaten2(val, update, provinsi, abort) {
      update(async () => { 
        if (!val) {
          this.options2 = this.list_data_kabupaten_ibu
          return
        }
        var data  = await this.FetchingUmum.kabupaten(this.token, val, provinsi)
        this.list_data_kabupaten_ibu = data 
      })
    },

    kecamatan2(val, update, kabupaten, abort) {
      update(async () => {
        if (!val) {
          this.options2 = this.list_data_kecamatan_ibu
          return
        }
        var data  = await this.FetchingUmum.kecamatan(this.token, val, kabupaten)
        this.list_data_kecamatan_ibu = data 
      })
    },

    desa_kelurahan2(val, update, kecamatan, abort) {
      update(async () => {
        if (!val) {
          this.options2 = this.list_data_desa_kelurahan_ibu
          return
        }

        var data  = await this.FetchingUmum.desa_kelurahan(this.token, val, kecamatan)
        this.list_data_desa_kelurahan_ibu = data         
      })
    },

    // ========= AYAH ========
    provinsi3(val, update, abort) {
      update(async () => {
        
        
        if (!val) {
          this.options2 = this.list_data_provinsi_ayah
          return
        }

        var data  = await this.FetchingUmum.provinsi(this.token, val)
        this.list_data_provinsi_ayah = data
        // this.options2 = data 
      })
    },

    kabupaten3(val, update, provinsi, abort) {
      update(async () => { 
        if (!val) {
          this.options2 = this.list_data_kabupaten_ayah
          return
        }
        var data  = await this.FetchingUmum.kabupaten(this.token, val, provinsi)
        this.list_data_kabupaten_ayah = data
      })
    },

    kecamatan3(val, update, kabupaten, abort) {
      update(async () => {
        if (!val) {
          this.options2 = this.list_data_kecamatan_ayah
          return
        }
        var data  = await this.FetchingUmum.kecamatan(this.token, val, kabupaten)
        this.list_data_kecamatan_ayah = data
      })
    },

    desa_kelurahan3(val, update, kecamatan, abort) {
      update(async () => {
        if (!val) {
          this.options2 = this.list_data_desa_kelurahan_ayah
          return
        }

        var data  = await this.FetchingUmum.desa_kelurahan(this.token, val, kecamatan)
        this.list_data_desa_kelurahan_ayah = data         
      })
    },
    // ========= AYAH ========

    // ========= PELAPOR ========
    provinsi4(val, update, abort) {
      update(async () => {
        
        
        if (!val) {
          this.options2 = this.list_data_provinsi_pelapor
          return
        }

        var data  = await this.FetchingUmum.provinsi(this.token, val)
        this.list_data_provinsi_pelapor = data
        // this.options2 = data 
      })
    },

    kabupaten4(val, update, provinsi, abort) {
      update(async () => { 
        if (!val) {
          this.options2 = this.list_data_kabupaten_pelapor
          return
        }
        var data  = await this.FetchingUmum.kabupaten(this.token, val, provinsi)
        this.list_data_kabupaten_pelapor = data
      })
    },

    kecamatan4(val, update, kabupaten, abort) {
      update(async () => {
        if (!val) {
          this.options2 = this.list_data_kecamatan_pelapor
          return
        }
        var data  = await this.FetchingUmum.kecamatan(this.token, val, kabupaten)
        this.list_data_kecamatan_pelapor = data
      })
    },

    desa_kelurahan4(val, update, kecamatan, abort) {
      update(async () => {
        if (!val) {
          this.options2 = this.list_data_desa_kelurahan_pelapor
          return
        }

        var data  = await this.FetchingUmum.desa_kelurahan(this.token, val, kecamatan)
        this.list_data_desa_kelurahan_pelapor = data         
      })
    },
    // ========= PELAPOR ========

    // ========= SAKSI 1 ========
    provinsi5(val, update, abort) {
      update(async () => {
        
        
        if (!val) {
          this.options2 = this.list_data_provinsi_saksi1
          return
        }

        var data  = await this.FetchingUmum.provinsi(this.token, val)
        this.list_data_provinsi_saksi1 = data
        // this.options2 = data 
      })
    },

    kabupaten5(val, update, provinsi, abort) {
      update(async () => { 
        if (!val) {
          this.options2 = this.list_data_kabupaten_saksi1
          return
        }
        var data  = await this.FetchingUmum.kabupaten(this.token, val, provinsi)
        this.list_data_kabupaten_saksi1 = data
      })
    },

    kecamatan5(val, update, kabupaten, abort) {
      update(async () => {
        if (!val) {
          this.options2 = this.list_data_kecamatan_saksi1
          return
        }
        var data  = await this.FetchingUmum.kecamatan(this.token, val, kabupaten)
        this.list_data_kecamatan_saksi1 = data
      })
    },

    desa_kelurahan5(val, update, kecamatan, abort) {
      update(async () => {
        if (!val) {
          this.options2 = this.list_data_desa_kelurahan_saksi1
          return
        }

        var data  = await this.FetchingUmum.desa_kelurahan(this.token, val, kecamatan)
        this.list_data_desa_kelurahan_saksi1 = data         
      })
    },
    // ========= SAKSI 1 ========

    // ========= SAKSI 2 ========
    provinsi6(val, update, abort) {
      update(async () => {
        
        
        if (!val) {
          this.options2 = this.list_data_provinsi_saksi2
          return
        }

        var data  = await this.FetchingUmum.provinsi(this.token, val)
        this.list_data_provinsi_saksi2 = data
        // this.options2 = data 
      })
    },

    kabupaten6(val, update, provinsi, abort) {
      update(async () => { 
        if (!val) {
          this.options2 = this.list_data_kabupaten_saksi2
          return
        }
        var data  = await this.FetchingUmum.kabupaten(this.token, val, provinsi)
        this.list_data_kabupaten_saksi2 = data
      })
    },

    kecamatan6(val, update, kabupaten, abort) {
      update(async () => {
        if (!val) {
          this.options2 = this.list_data_kecamatan_saksi2
          return
        }
        var data  = await this.FetchingUmum.kecamatan(this.token, val, kabupaten)
        this.list_data_kecamatan_saksi2 = data
      })
    },

    desa_kelurahan6(val, update, kecamatan, abort) {
      update(async () => {
        if (!val) {
          this.options2 = this.list_data_desa_kelurahan_saksi2
          return
        }

        var data  = await this.FetchingUmum.desa_kelurahan(this.token, val, kecamatan)
        this.list_data_desa_kelurahan_saksi2 = data         
      })
    },
    // ========= SAKSI 2 ========


 

    async getmasterData(){
      // Panggil action pekerjaan dari Pinia store
      await this.simcard.pekerjaan()
      await this.simcard.agama()
      await this.simcard.pendidikan()
      await this.simcard.shdk() 
    },

 



    cekButton_status_kecamatan: function(data){  
      var a = data.pelaporan_LAHIR_MATI.status 
      var status_kab = data.pelaporan_LAHIR_MATI.status_kabupaten  

        if (a == 1) {
          return true
        }else{
          return false
        }
      
    },    

    pindahKe(halaman) {
      this.$router.push(halaman)
    },

    // Methods untuk Anggota Keluarga=================
    tambahAnggotaKeluarga() {
      // Validasi input
      if (!this.anggota_keluarga.nama || !this.anggota_keluarga.nik || !this.anggota_keluarga.jenis_kelamin || 
          !this.anggota_keluarga.tanggal_lahir || !this.anggota_keluarga.shdk || !this.anggota_keluarga.agama ||
          !this.anggota_keluarga.pekerjaan || !this.anggota_keluarga.pendidikan) {
        Notify.create({
          message: 'Semua field harus diisi',
          color: 'warning'
        })
        return
      }

      // Jika dalam mode edit, update data
      if (this.isEditing && this.editingIndex >= 0) {
        this.form.anggota_keluarga[this.editingIndex] = {
          nama: this.anggota_keluarga.nama,
          nik: this.anggota_keluarga.nik,
          jenis_kelamin: this.anggota_keluarga.jenis_kelamin,
          tanggal_lahir: this.anggota_keluarga.tanggal_lahir,
          // status_hubungan_dl_keluarga: this.anggota_keluarga.status_hubungan_dl_keluarga,
          shdk                    :this.anggota_keluarga.shdk,
          shdk_lainnya            :this.anggota_keluarga.shdk_lainnya,
          tglKTP_dari             :this.anggota_keluarga.tglKTP_dari,
          tglKTP_hingga           :this.anggota_keluarga.tglKTP_hingga,

          agama: this.anggota_keluarga.agama,
          agama_lainnya: this.anggota_keluarga.agama_lainnya,
          pekerjaan: this.anggota_keluarga.pekerjaan,
          pekerjaan_lainnya: this.anggota_keluarga.pekerjaan_lainnya,
          pendidikan: this.anggota_keluarga.pendidikan,
          pendidikan_lainnya: this.anggota_keluarga.pendidikan_lainnya,
          tempat_lahir: this.anggota_keluarga.tempat_lahir,
          KKref: this.anggota_keluarga.KKref
        }

        Notify.create({
          message: 'Anggota keluarga berhasil diperbarui',
          color: 'positive',
          position: 'top'
        })

        this.cancelEdit()
        return
      }

      // Tambah ke array (mode tambah baru)
      this.form.anggota_keluarga.push({
        nama: this.anggota_keluarga.nama,
        nik: this.anggota_keluarga.nik,
        jenis_kelamin: this.anggota_keluarga.jenis_kelamin,
        tanggal_lahir: this.anggota_keluarga.tanggal_lahir,
          shdk                    :this.anggota_keluarga.shdk,
          shdk_lainnya            :this.anggota_keluarga.shdk_lainnya,
          tglKTP_dari             :this.anggota_keluarga.tglKTP_dari,
          tglKTP_hingga           :this.anggota_keluarga.tglKTP_hingga,          
        
        agama: this.anggota_keluarga.agama,
        agama_lainnya: this.anggota_keluarga.agama_lainnya,
        pekerjaan: this.anggota_keluarga.pekerjaan,
        pekerjaan_lainnya: this.anggota_keluarga.pekerjaan_lainnya,
        pendidikan: this.anggota_keluarga.pendidikan,
        pendidikan_lainnya: this.anggota_keluarga.pendidikan_lainnya,
        tempat_lahir: this.anggota_keluarga.tempat_lahir,
        KKref: this.anggota_keluarga.KKref
      })

      // Reset form
      this.anggota_keluarga = {
        nama: '',
        nik: '',
        jenis_kelamin: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        status_hubungan_dl_keluarga: '',
        agama: '',
        agama_lainnya: '',
        pekerjaan: '',
        pekerjaan_lainnya: '',
        pendidikan: '',
        pendidikan_lainnya: '',
        KKref: ''
      }

      Notify.create({
        message: 'Anggota keluarga berhasil ditambahkan',
        color: 'positive',
        position: 'top'
      })
    },

    editAnggotaKeluarga(index) {
      // Populate form dengan data yang akan diedit
      const anggota = this.form.anggota_keluarga[index]
      this.anggota_keluarga = {
        nama: anggota.nama,
        nik: anggota.nik,
        jenis_kelamin: anggota.jenis_kelamin,
        tempat_lahir: anggota.tempat_lahir,
        tanggal_lahir: anggota.tanggal_lahir,
         

        shdk                    :anggota.shdk,
        shdk_lainnya            :anggota.shdk_lainnya,
        tglKTP_dari             :anggota.tglKTP_dari,
        tglKTP_hingga           :anggota.tglKTP_hingga,

        agama: anggota.agama,
        agama_lainnya: anggota.agama_lainnya,
        pekerjaan: anggota.pekerjaan,
        pekerjaan_lainnya: anggota.pekerjaan_lainnya,
        pendidikan: anggota.pendidikan,
        pendidikan_lainnya: anggota.pendidikan_lainnya,
        KKref: anggota.KKref
      }

      this.isEditing = true
      this.editingIndex = index

      Notify.create({
        message: 'Mode edit - Ubah data dan klik "Simpan Perubahan" untuk simpan',
        color: 'info',
        position: 'top'
      })

      // Scroll ke form
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    cancelEdit() {
      this.isEditing = false
      this.editingIndex = -1
      this.anggota_keluarga = {
        nama: '',
        nik: '',
        jenis_kelamin: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        status_hubungan_dl_keluarga: '',
        agama: '',
        agama_lainnya: '',
        pekerjaan: '',
        pekerjaan_lainnya: '',
        pendidikan: '',
        pendidikan_lainnya: '',
        KKref: ''
      }
    },

    hapusAnggotaKeluarga(index) {
      this.$q.dialog({
        title: 'Konfirmasi Hapus',
        message: 'Apakah Anda yakin ingin menghapus anggota keluarga ini?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.form.anggota_keluarga.splice(index, 1)
        this.cancelEdit()
        Notify.create({
          message: 'Anggota keluarga berhasil dihapus',
          color: 'positive'
        })
      })
    },
    // Methods untuk Anggota Keluarga=================

    // Generic function untuk load initial data
    async loadInitialData(dataKey, endpoint, parentValue = null) {
      // Jika ada parent value yang di-require, check dulu
      if (parentValue !== null && !parentValue) return

      try {
        const params = { q: '' }
        
        // Tambahkan parent filter jika ada
        if (dataKey === 'kabupaten') params.m_provinsi = this.form.m_provinsi
        if (dataKey === 'kecamatan') params.m_kabupaten = this.form.m_kabupaten
        if (dataKey === 'desa_kelurahan') params.m_kecamatan = this.form.m_kecamatan

        if (dataKey === 'kabupaten2') params.m_provinsi = this.form.provinsi_ibu
        if (dataKey === 'kecamatan2') params.m_kabupaten = this.form.kabupaten_ibu
        if (dataKey === 'desa_kelurahan2') params.m_kecamatan = this.form.kecamatan_ibu

        if (dataKey === 'kabupaten_ibu') params.m_provinsi = this.form.provinsi_ibu
        if (dataKey === 'kecamatan_ibu') params.m_kabupaten = this.form.kabupaten_ibu
        if (dataKey === 'desa_kelurahan_ibu') params.m_kecamatan = this.form.kecamatan_ibu

        if (dataKey === 'kabupaten_ayah') params.m_provinsi = this.form.provinsi_ayah
        if (dataKey === 'kecamatan_ayah') params.m_kabupaten = this.form.kabupaten_ayah
        if (dataKey === 'desa_kelurahan_ayah') params.m_kecamatan = this.form.kecamatan_ayah

        if (dataKey === 'kabupaten_pelapor') params.m_provinsi = this.form.provinsi_pelapor
        if (dataKey === 'kecamatan_pelapor') params.m_kabupaten = this.form.kabupaten_pelapor
        if (dataKey === 'desa_kelurahan_pelapor') params.m_kecamatan = this.form.kecamatan_pelapor

        if (dataKey === 'kabupaten_saksi1') params.m_provinsi = this.form.provinsi_saksi1
        if (dataKey === 'kecamatan_saksi1') params.m_kabupaten = this.form.kabupaten_saksi1
        if (dataKey === 'desa_kelurahan_saksi1') params.m_kecamatan = this.form.kecamatan_saksi1

        if (dataKey === 'kabupaten_saksi2') params.m_provinsi = this.form.provinsi_saksi2
        if (dataKey === 'kecamatan_saksi2') params.m_kabupaten = this.form.kabupaten_saksi2
        if (dataKey === 'desa_kelurahan_saksi2') params.m_kecamatan = this.form.kecamatan_saksi2

        const response = await axios.get(endpoint, {
          params,
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })

        // Set data ke state yang sesuai
        const stateKey = `list_data_${dataKey}`
        this[stateKey] = response.data || []
        // console.log(`✓ Initial ${dataKey} loaded:`, this[stateKey].length, 'items')
      } catch (error) {
        console.error(`✗ Error loading initial ${dataKey}:`, error)
      }
    },

    async loadInitialProvinsi() {
      await this.loadInitialData('provinsi', this.simcard.url.URL_APP + 'api/v1/m_provinsi/list')
    },

    async loadInitialKabupaten() {
      await this.loadInitialData('kabupaten', this.simcard.url.URL_DATAMASTER_KAB_KOTA + 'autocomplete', this.form.m_provinsi)
    },

    async loadInitialKecamatan() {
      await this.loadInitialData('kecamatan', this.simcard.url.URL_DATAMASTER_KECAMATAN + 'autocomplete', this.form.m_kabupaten)
    },

    async loadInitialDesaKelurahan() {
      await this.loadInitialData('desa_kelurahan', this.simcard.url.URL_DATAMASTER_DES_KEL + 'autocomplete', this.form.m_kecamatan)
    },

    async loadDaerahIbu() {
      await this.loadInitialData('provinsi_ibu', this.simcard.url.URL_DATAMASTER_WILAYAH + 'list')
      await this.loadInitialData('kabupaten_ibu', this.simcard.url.URL_DATAMASTER_KAB_KOTA + 'autocomplete', this.form.provinsi_ibu)
      await this.loadInitialData('kecamatan_ibu', this.simcard.url.URL_DATAMASTER_KECAMATAN + 'autocomplete', this.form.kabupaten_ibu)
      await this.loadInitialData('desa_kelurahan_ibu', this.simcard.url.URL_DATAMASTER_DES_KEL + 'autocomplete', this.form.kecamatan_ibu)
    },

    async loadDaerahAyah() {
      await this.loadInitialData('provinsi_ayah', this.simcard.url.URL_DATAMASTER_WILAYAH + 'list')
      await this.loadInitialData('kabupaten_ayah', this.simcard.url.URL_DATAMASTER_KAB_KOTA + 'autocomplete', this.form.provinsi_ayah)
      await this.loadInitialData('kecamatan_ayah', this.simcard.url.URL_DATAMASTER_KECAMATAN + 'autocomplete', this.form.kabupaten_ayah)
      await this.loadInitialData('desa_kelurahan_ayah', this.simcard.url.URL_DATAMASTER_DES_KEL + 'autocomplete', this.form.kecamatan_ayah)
    },

    async loadDaerahPelapor() {
      await this.loadInitialData('provinsi_pelapor', this.simcard.url.URL_DATAMASTER_WILAYAH + 'list')
      await this.loadInitialData('kabupaten_pelapor', this.simcard.url.URL_DATAMASTER_KAB_KOTA + 'autocomplete', this.form.provinsi_pelapor)
      await this.loadInitialData('kecamatan_pelapor', this.simcard.url.URL_DATAMASTER_KECAMATAN + 'autocomplete', this.form.kabupaten_pelapor)
      await this.loadInitialData('desa_kelurahan_pelapor', this.simcard.url.URL_DATAMASTER_DES_KEL + 'autocomplete', this.form.kecamatan_pelapor)
    },

    async loadDaerahSaksi1() {
      await this.loadInitialData('provinsi_saksi1', this.simcard.url.URL_DATAMASTER_WILAYAH + 'list')
      await this.loadInitialData('kabupaten_saksi1', this.simcard.url.URL_DATAMASTER_KAB_KOTA + 'autocomplete', this.form.provinsi_saksi1)
      await this.loadInitialData('kecamatan_saksi1', this.simcard.url.URL_DATAMASTER_KECAMATAN + 'autocomplete', this.form.kabupaten_saksi1)
      await this.loadInitialData('desa_kelurahan_saksi1', this.simcard.url.URL_DATAMASTER_DES_KEL + 'autocomplete', this.form.kecamatan_saksi1)
    },

    async loadDaerahSaksi2() {
      await this.loadInitialData('provinsi_saksi2', this.simcard.url.URL_DATAMASTER_WILAYAH + 'list')
      await this.loadInitialData('kabupaten_saksi2', this.simcard.url.URL_DATAMASTER_KAB_KOTA + 'autocomplete', this.form.provinsi_saksi2)
      await this.loadInitialData('kecamatan_saksi2', this.simcard.url.URL_DATAMASTER_KECAMATAN + 'autocomplete', this.form.kabupaten_saksi2)
      await this.loadInitialData('desa_kelurahan_saksi2', this.simcard.url.URL_DATAMASTER_DES_KEL + 'autocomplete', this.form.kecamatan_saksi2)
    },


    async loadInitialProvinsi3() {
      await this.loadInitialData('provinsi3', this.simcard.url.URL_DATAMASTER_WILAYAH + 'list')
    },

    async loadInitialKabupaten3() {
      await this.loadInitialData('kabupaten3', this.simcard.url.URL_DATAMASTER_KAB_KOTA + 'autocomplete', this.form.provinsi_lama)
    },

    async loadInitialKecamatan3() {
      await this.loadInitialData('kecamatan3', this.simcard.url.URL_DATAMASTER_KECAMATAN + 'autocomplete', this.form.kabupaten_lama)
    },

    async loadInitialDesaKelurahan3() {
      await this.loadInitialData('desa_kelurahan3', this.simcard.url.URL_DATAMASTER_DES_KEL + 'autocomplete', this.form.kecamatan_lama)
    },

    loadfilter() {
          this.loadInitialProvinsi()
          this.loadInitialKabupaten()
          this.loadInitialKecamatan()
          this.loadInitialDesaKelurahan()

          // this.loadInitialProvinsi2()
          // this.loadInitialKabupaten2()
          // this.loadInitialKecamatan2()
          // this.loadInitialDesaKelurahan2()
          this.loadDaerahIbu()
          this.loadDaerahAyah()
          this.loadDaerahPelapor()
          this.loadDaerahSaksi1()
          this.loadDaerahSaksi2()

          this.loadInitialProvinsi3()
          this.loadInitialKabupaten3()
          this.loadInitialKecamatan3()
          this.loadInitialDesaKelurahan3()
    },
 

 







  },

  watch: {
    'form.m_provinsi': function(newVal) {
      // Ketika provinsi berubah, load ulang kabupaten dan reset kecamatan
      if (newVal) {
        this.loadInitialKabupaten()
        this.form.m_kecamatan = ''
        this.form.m_desa_kelurahan = ''
        this.list_data_kecamatan = []
        this.list_data_desa_kelurahan = []
      }
    },
    'form.m_kabupaten': function(newVal) {
      // Ketika kabupaten berubah, load ulang kecamatan dan reset desa
      if (newVal) {
        this.loadInitialKecamatan()
        this.form.m_desa_kelurahan = ''
        this.list_data_desa_kelurahan = []
      }
    },
    'form.m_kecamatan': function(newVal) {
      // Ketika kecamatan berubah, load ulang desa
      if (newVal) {
        this.loadInitialDesaKelurahan()
      }
    },

    'form.provinsi_ibu': function(newVal) {
      // Ketika provinsi berubah, load ulang kabupaten dan reset kecamatan
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahIbu()
        this.form.kecamatan_ibu = ''
        this.form.des_kel_ibu = ''
        this.list_data_kecamatan_ibu = []
        this.list_data_desa_kelurahan_ibu = []
      }
    },
    'form.kabupaten_ibu': function(newVal) {
      // Ketika kabupaten berubah, load ulang kecamatan dan reset desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahIbu()
        this.form.des_kel_ibu = ''
        this.list_data_desa_kelurahan_ibu = []
      }
    },
    'form.kecamatan_ibu': function(newVal) {
      // Ketika kecamatan berubah, load ulang desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahIbu()
      }
    },

    'form.provinsi_ayah': function(newVal) {
      // Ketika provinsi berubah, load ulang kabupaten dan reset kecamatan
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahAyah()
        this.form.kecamatan_ayah = ''
        this.form.des_kel_ayah = ''
        this.list_data_kecamatan_ayah = []
        this.list_data_desa_kelurahan_ayah = []
      }
    },
    'form.kabupaten_ayah': function(newVal) {
      // Ketika kabupaten berubah, load ulang kecamatan dan reset desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahAyah()
        this.form.des_kel_ayah = ''
        this.list_data_desa_kelurahan_ayah = []
      }
    },
    'form.kecamatan_ayah': function(newVal) {
      // Ketika kecamatan berubah, load ulang desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahAyah()
      }
    },

    'form.provinsi_pelapor': function(newVal) {
      // Ketika provinsi berubah, load ulang kabupaten dan reset kecamatan
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahPelapor()
        this.form.kecamatan_pelapor = ''
        this.form.des_kel_pelapor = ''
        this.list_data_kecamatan_pelapor = []
        this.list_data_desa_kelurahan_pelapor = []
      }
    },
    'form.kabupaten_pelapor': function(newVal) {
      // Ketika kabupaten berubah, load ulang kecamatan dan reset desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahPelapor()
        this.form.des_kel_pelapor = ''
        this.list_data_desa_kelurahan_pelapor = []
      }
    },
    'form.kecamatan_pelapor': function(newVal) {
      // Ketika kecamatan berubah, load ulang desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahPelapor()
      }
    },

    'form.provinsi_saksi1': function(newVal) {
      // Ketika provinsi berubah, load ulang kabupaten dan reset kecamatan
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahSaksi1()
        this.form.kecamatan_saksi1 = ''
        this.form.des_kel_saksi1 = ''
        this.list_data_kecamatan_saksi1 = []
        this.list_data_desa_kelurahan_saksi1 = []
      }
    },
    'form.kabupaten_saksi1': function(newVal) {
      // Ketika kabupaten berubah, load ulang kecamatan dan reset desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahSaksi1()
        this.form.des_kel_saksi1 = ''
        this.list_data_desa_kelurahan_saksi1 = []
      }
    },
    'form.kecamatan_saksi1': function(newVal) {
      // Ketika kecamatan berubah, load ulang desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahSaksi1()
      }
    },

    'form.provinsi_saksi2': function(newVal) {
      // Ketika provinsi berubah, load ulang kabupaten dan reset kecamatan
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahSaksi2()
        this.form.kecamatan_saksi2 = ''
        this.form.des_kel_saksi2 = ''
        this.list_data_kecamatan_saksi2 = []
        this.list_data_desa_kelurahan_saksi2 = []
      }
    },
    'form.kabupaten_saksi2': function(newVal) {
      // Ketika kabupaten berubah, load ulang kecamatan dan reset desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahSaksi2()
        this.form.des_kel_saksi2 = ''
        this.list_data_desa_kelurahan_saksi2 = []
      }
    },
    'form.kecamatan_saksi2': function(newVal) {
      // Ketika kecamatan berubah, load ulang desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadDaerahSaksi2()
      }
    },







    'form.provinsi_lama': function(newVal) {
      // Ketika provinsi berubah, load ulang kabupaten dan reset kecamatan
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadInitialKabupaten3()
        this.form.kecamatan_lama = ''
        this.form.desa_kelurahan_lama = ''
        this.list_data_kecamatan2 = []
        this.list_data_desa_kelurahan2 = []
      }
    },
    'form.kabupaten_lama': function(newVal) {
      // Ketika kabupaten berubah, load ulang kecamatan dan reset desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadInitialKecamatan3()
        this.form.desa_kelurahan_lama = ''
        this.list_data_desa_kelurahan3 = []
      }
    },
    'form.kecamatan_lama': function(newVal) {
      // Ketika kecamatan berubah, load ulang desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadInitialDesaKelurahan3()
      }
    },

    modal_add(newVal) {
      // Reset file state saat modal ditutup
      if (!newVal) {
        this.file_lampiran_new = null
      }
    },

    modal_edit(newVal) {
      // Reset file state saat modal ditutup
      if (!newVal) {
        this.file_lampiran_new = null
      }
    }
  },  

  mounted() {
    var user = JSON.parse(localStorage.getItem('user') || '')
    // var profile = user
    this.form.emailPemohon  = user.email;
    this.form.email_from    = user.email;
    this.form.createdBy     = user._id; 
    this.nama  = user.nama;

    

    this.getview()
    this.loadfilter()
    this.getmasterData()

    console.log(this.form.createdBy);
    // console.log(this.simcard.getUser());
    // this.form.createdBy     = this.user; 
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
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
  background: linear-gradient(to bottom,
      #3683FD 0%,
      #3683FD 15%,
      #78ACFE 30%,
      #e3f2fd 45%,
      #ffffff 85%);
}

.logo-shadow {
  filter: drop-shadow(0 0 2.5px #fff) drop-shadow(0 0 5px #fff);
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

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
  max-height: 90%;
  overflow-y: auto !important;
  overflow-x: visible !important;
}

/* kalau autocomplete ketutup  */
</style>
