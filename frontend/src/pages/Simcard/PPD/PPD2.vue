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
          <img src="~assets/simcard/firetap2.png" style="width: 90px; height: 90px;" alt="">
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

                <div v-if="item.PPD2.status === 0" style="color:#6C7278;">
                  <img src="~assets/simcard/wait.png" style="width: 100%; height: 56px;" alt="">
                </div>

                <div v-if="item.PPD2.status === 1" style="color:#6C7278;">
                  <img src="~assets/simcard/succes.png" style="width: 100%; height: 56px;" alt="">
                </div>

                <div v-if="item.PPD2.status === 2" style="color:#6C7278;">
                  <img src="~assets/simcard/fail.png" style="width: 100%; height: 56px;" alt="">
                </div>

                <div class="flex-break col self-center" style="margin-left: 11px;">
                  <div v-if="item.PPD2.status === 0" style="color:#000000;font-size: 12px;font-weight: bold;">
                    Mohon bersabar, data masih diverifikasi
                  </div>
                  <div v-if="item.PPD2.status === 1" style="color:#000000;font-size: 12px;font-weight: bold;">
                    Permohonan Diterima
                  </div>
                  <div v-if="item.PPD2.status === 2" style="color:#000000;font-size: 12px;font-weight: bold;">
                    Permohonan Dikembalikan
                  </div>
                  <div style="color:#6C7278;font-size: 11px;">
                    Nama pemohon : {{ item.PPD2.nama }}
                  </div>
                </div>
                <div class="" style="margin-left: 11px;">

                  <div class="text-right" style="margin: 0px 0px 0px 0px ;">

                    <!-- Button Icon -->
                    <q-btn class="text-right" v-show="item.PPD2.email_file !== null && item.PPD2.status_kabupaten == 1" color="primary" icon="attach_file">
                      <q-menu>
                        <q-list>
                          <q-item clickable v-close-popup @click="selectData(item), bukaLink(item.PPD2.email_file)">
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

                    <q-btn class="text-right" v-show="item.PPD2.email_file == null && item.PPD2.status_kabupaten == ''" color="primary" icon="settings">
                      <q-menu>
                        <q-list>
                          <q-item clickable v-close-popup @click="selectData(item), modal_lihat = true ">
                            <q-item-section avatar>
                              <q-icon name="remove_red_eye" color="primary" />
                            </q-item-section>
                            <q-item-section>Detail</q-item-section>
                          </q-item>
                          <q-item clickable v-show="item.PPD2.status === 2" v-close-popup @click="selectData(item), modal_lihat_status = true ">
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

            <q-step :name="2" title="DATA DAERAH ASAL" caption="" icon="create_new_folder" :done="step > 2">

              <label class="text-labelku col-12 col-md-12">1. Nomor Kartu Keluarga</label>
              <input v-model="form.no_kk" class="input-form col-12 col-md-12" type="text">
              <label class="col-12 col-md-12 text-labelku ">2. Nama Kepala Keluarga</label>
              <input v-model="form.nama_kepalaKeluarga" class="input-form col-12 col-md-12" type="text">
              <!-- <label class="q-gutter-xs col-12 col-md-12 col-sm-12 text-labelku">3. Alamat </label> -->
              <!-- <input v-model="form.alamat" class="input-form col-md-6 col-sm-6 col-xs-12" type="text" placeholder="Jl. Jend. Sudirman"> -->
              <!-- <input v-model="form.rt" class="input-form col-md-3 col-sm-3 col-xs-6" type="text" placeholder="RT"> -->
              <!-- <input v-model="form.rw" class="input-form col-md-3 col-sm-3 col-xs-6" type="text" placeholder="RW">               -->

              <!-- ================= Alamat ===================== -->
              <label class="text-labelku">Alamat </label>
              <q-select
                filled
                v-model="form.provinsi"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_provinsi2"
                @filter="provinsi2"
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
                v-model="form.kabupaten"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_kabupaten2"
                @filter="(val, update) => kabupaten2(val, update, form.provinsi)"
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
                v-model="form.kecamatan"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_kecamatan2"
                @filter="(val, update) => kecamatan2(val, update, form.kabupaten)"
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
                v-model="form.desa_kelurahan"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_desa_kelurahan2"
                @filter="(val, update) => desa_kelurahan2(val, update, form.kecamatan)"
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

              <label class="text-labelku">Alamat Pemohon</label>
              <input v-model="form.alamat" type="text" placeholder="Alamat Ex: Jl. Raya No. 123" class="input-form">
              <label class="text-labelku">RT</label>
              <input v-model="form.rt" type="number" placeholder="RT" class="input-form">
              <label class="text-labelku">RW</label>
              <input v-model="form.rw" type="number" placeholder="RW" class="input-form">
              <label class="text-labelku">Kode Pos</label>
              <input v-model="form.kode_pos" type="number" placeholder="Kode Pos" class="input-form"> 
              <label class="text-labelku">Nomor Hp</label>
              <input v-model="form.no_telp" type="tel" placeholder="Nomor Hp" class="input-form">

              <!-- ================= Alamat ===================== -->               

              <label class="text-labelku col-12 col-md-12">Nik Pemohon</label>
              <input v-model="form.nik" class="input-form col-12 col-md-12" type="text">              
              <label class="text-labelku col-12 col-md-12">Nama Lengkap </label>
              <input v-model="form.nama" class="input-form col-12 col-md-12" type="text">              
 

              

            </q-step> 

            <q-step :name="3" title="DATA KEPINDAHAN" icon="add_comment" :done="step > 3">

                <label class="text-labelku">1. Alasan Kepindahan</label>                   
                <select v-model="form.alasan_kepindahan"> 
                  <option value="" disabled> - Pilih Alasan Kepindahan - </option>
                  <option v-for="(data, index) in list_kepindahan" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                </select>                
                <template v-if="form.alasan_kepindahan == 'Lainnya'">
                    <label class="text-labelku">Alasan Kepindahan Lainnya</label> <input v-model="form.alasan_kepindahan_lainnya" class="input-form" type="text" placeholder="Alasan Kepindahan Lainnya">
                </template>

                <label class="text-labelku">Alamat </label>
                <q-select
                  filled
                  v-model="form.provinsi_tujuan"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="list_data_provinsi3"
                  @filter="provinsi3"
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
                  v-model="form.kabupaten_tujuan"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="list_data_kabupaten3"
                  @filter="(val, update) => kabupaten3(val, update, form.provinsi_tujuan)"
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
                  v-model="form.kecamatan_tujuan"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="list_data_kecamatan3"
                  @filter="(val, update) => kecamatan3(val, update, form.kabupaten_tujuan)"
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
                  v-model="form.desa_kelurahan_tujuan"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="list_data_desa_kelurahan3"
                  @filter="(val, update) => desa_kelurahan3(val, update, form.kecamatan_tujuan)"
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
                <label class="q-gutter-xs col-12 col-md-12 col-sm-12 text-labelku">2. Alamat Tujuan Pindah </label> 

                <label class="text-labelku">Alamat Keluarga Lama</label>   
                <input class="input-form" v-model="form.alamat_tujuan" type="text" placeholder="Alamat Keluarga Lama">  
                <label class="text-labelku">RT</label>   
                <input class="input-form" v-model="form.rt_tujuan" type="number" placeholder="RT">  
                <label class="text-labelku">RW</label>   
                <input class="input-form" v-model="form.rw_tujuan" type="number" placeholder="RW">  

                <label class="text-labelku">Kode Pos</label>   
                <input class="input-form" v-model="form.kodePos_tujuan" type="tel" placeholder="Kode Pos">   
                <label class="text-labelku">Telepon</label>   
                <input class="input-form" v-model="form.noTelp_tujuan" type="tel" placeholder="Telepon">

                <label class="text-labelku">3. Jenis Kepindahan</label>                   
                <select v-model="form.jenis_kepindahan"> 
                  <option value="" disabled> - Pilih Jenis Kepindahan - </option>
                  <option v-for="(data, index) in list_jenis_kepindahan" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                </select>    
                <label class="text-labelku">4. Status KK Bagi Yang Tidak Pindah</label>                   
                <select v-model="form.status_kk_bagi_yang_tidak_pindah"> 
                  <option value="" disabled> - Pilih Status KK Bagi Yang Tidak Pindah - </option>
                  <option v-for="(data, index) in list_status_kk_bagi_yang_tidak_pindah" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                </select>    
                <label class="text-labelku">5. Status KK Bagi Yang Pindah</label>                   
                <select v-model="form.status_kk_bagi_yang_pindah"> 
                  <option value="" disabled> - Pilih Status KK Bagi Yang Pindah - </option>
                  <option v-for="(data, index) in list_status_kk_bagi_yang_pindah" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                </select>                

            </q-step>

            <q-step :name="4" title="Data Anggota keluarga" icon="add_comment" :done="step > 4">
              <label class="text-labelku">Tambah Anggota Keluarga</label>

              <!-- Form Input Anggota Keluarga -->
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <label class="text-labelku">Nama Lengkap</label>
                <input v-model="anggota_keluarga.nama" type="text" placeholder="Nama Lengkap" class="input-form">

                <label class="text-labelku">NIK</label>
                <input v-model="anggota_keluarga.nik" type="number" placeholder="NIK" class="input-form">

                <label class="text-labelku">Jenis Kelamin</label>
                <select v-model="anggota_keluarga.jenis_kelamin" class="input-form">
                  <option disabled value="">Pilih Jenis Kelamin</option>
                  <option value="Laki - Laki">Laki - Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>

                <label class="text-labelku">Tempat Lahir</label>
                <input v-model="anggota_keluarga.tempat_lahir" type="text" placeholder="Tempat Lahir" class="input-form">

                <label class="text-labelku">Tanggal Lahir</label>
                <input v-model="anggota_keluarga.tanggal_lahir" type="date" placeholder="Tanggal Lahir" class="input-form">

                <label class="text-labelku">Status Hubungan Dalam Keluarga</label>
                <select v-model="anggota_keluarga.shdk" class="input-form">
                  <option disabled value="">- Pilih Status Hubungan -</option>
                  <option v-for="(data, index) in simcard.listShdk" :key="index" :value="data.uraian">
                    {{ data.uraian }}
                  </option>
                </select>

                <div class="row">
                  <label class="text-labelku text-center col-12 col-md-12">Masa Berlaku KTP S/D</label>
                  <div class="text-center col-6 col-md-6 col-sm-6">
                    <label class="text-labelku ">Dari</label>
                    <input v-model="anggota_keluarga.tglKTP_dari" class="input-form" type="date">
                  </div>
                  <div class="text-center col-6 col-md-6 col-sm-6">
                    <label class="text-labelku ">Hingga</label>
                    <input v-model="anggota_keluarga.tglKTP_hingga" class="input-form" type="date">
                  </div>                

                </div>

                <label class="text-labelku">Agama</label>
                <select v-model="anggota_keluarga.agama" class="input-form">
                  <option disabled value="">- Pilih Agama -</option>
                  <option v-for="(data, index) in simcard.listAgama" :key="index" :value="data.uraian">
                    {{ data.uraian }}
                  </option>
                </select>

                <label class="text-labelku">Pekerjaan</label>
                <select v-model="anggota_keluarga.pekerjaan" class="input-form">
                  <option disabled value="">- Pilih Pekerjaan -</option>
                  <option v-for="(data, index) in simcard.listPekerjaan" :key="index" :value="data.uraian">
                    {{ data.uraian }}
                  </option>
                </select>

                <label class="text-labelku">Pendidikan Terakhir</label>
                <select v-model="anggota_keluarga.pendidikan" class="input-form">
                  <option disabled value="">- Pilih Pendidikan -</option>
                  <option v-for="(data, index) in simcard.listPendidikan" :key="index" :value="data.uraian">
                    {{ data.uraian }}
                  </option>
                </select>

                <div style="margin-top: 20px; display: flex; gap: 10px;">
                  <q-btn 
                    :color="isEditing ? 'warning' : 'primary'"
                    :label="isEditing ? 'Simpan Perubahan' : 'Tambah Anggota'" 
                    :icon="isEditing ? 'save' : 'add'"
                    @click="tambahAnggotaKeluarga()"
                    style="flex: 1;"
                  />
                  <q-btn 
                    v-if="isEditing"
                    color="grey-7"
                    label="Batal" 
                    icon="close"
                    @click="cancelEdit()"
                    style="flex: 1;"
                  />
                </div>
              </div>

              <!-- Daftar Anggota Keluarga menggunakan Quasar List -->
              <label class="text-labelku">Daftar Anggota Keluarga</label>
              <div v-if="form.anggota_keluarga.length > 0" style="margin-top: 20px;">
                <div v-for="(anggota, index) in form.anggota_keluarga" :key="index" style="background-color: white; padding: 16px; margin-bottom: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); border-left: 4px solid #3683FD;">
                  
                  <!-- Row 1: Nomor Urut dan Action Buttons -->
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div style="font-size: 14px; font-weight: 600; color: #1a202c;">
                      Anggota #{{ index + 1 }}
                    </div>
                    <div class="q-gutter-xs" style="display: flex; gap: 8px;">
                      <q-btn 
                        size="sm" 
                        round 
                        dense 
                        flat 
                        icon="edit" 
                        color="primary"
                        @click.stop="editAnggotaKeluarga(index)"
                        style="width: 36px; height: 36px;"
                      >
                        <q-tooltip>Edit</q-tooltip>
                      </q-btn>
                      <q-btn 
                        size="sm" 
                        round 
                        dense 
                        flat 
                        icon="delete" 
                        color="negative"
                        @click.stop="hapusAnggotaKeluarga(index)"
                        style="width: 36px; height: 36px;"
                      >
                        <q-tooltip>Hapus</q-tooltip>
                      </q-btn>
                    </div>
                  </div>

                  <!-- Row 2: Data Anggota -->
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
                    <!-- Nama -->
                    <div style="margin-bottom: 10px;">
                      <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Nama Lengkap</div>
                      <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.nama }}</div>
                    </div>

                    <!-- Grid 2 Kolom: NIK dan Jenis Kelamin -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 10px;">
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">NIK</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.nik }}</div>
                      </div>
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Jenis Kelamin</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.jenis_kelamin }}</div>
                      </div>
                    </div>

                    <!-- Grid 2 Kolom: Status dan Agama -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 10px;">
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Status Hubungan</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.shdk }}</div>
                      </div>
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Agama</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.agama }}</div>
                      </div>
                    </div>

                    <!-- Tanggal Lahir -->
                    <div style="margin-bottom: 10px;">
                      <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Tanggal Lahir</div>
                      <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.tanggal_lahir }}</div>
                    </div>

                    <!-- Grid 2 Kolom: Pekerjaan dan Pendidikan -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Pekerjaan</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.pekerjaan }}</div>
                      </div>
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Pendidikan Terakhir</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.pendidikan }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else style="text-align: center; padding: 20px; color: #999; border: 2px dashed #ddd; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 150px;">
                <q-icon name="info" size="32px" style="opacity: 0.5; margin-bottom: 8px;" />
                <p>Belum ada anggota keluarga yang ditambahkan</p>
              </div>

            </q-step>

            <q-step :name="5" title="Data Dukung" icon="add_comment">
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
                <q-btn v-if="step < 5" @click="$refs.stepper.next()" color="primary" label="Continue" />
                <q-btn v-if="step === 5" @click="addData()" color="positive" label="Submit" :loading="loading" />
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

            <q-step :name="2" title="DATA DAERAH ASAL" caption="" icon="create_new_folder" :done="step > 2">

              <label class="text-labelku col-12 col-md-12">1. Nomor Kartu Keluarga</label>
              <input v-model="form.no_kk" class="input-form col-12 col-md-12" type="text">
              <label class="col-12 col-md-12 text-labelku ">2. Nama Kepala Keluarga</label>
              <input v-model="form.nama_kepalaKeluarga" class="input-form col-12 col-md-12" type="text">
              <!-- <label class="q-gutter-xs col-12 col-md-12 col-sm-12 text-labelku">3. Alamat </label> -->
              <!-- <input v-model="form.alamat" class="input-form col-md-6 col-sm-6 col-xs-12" type="text" placeholder="Jl. Jend. Sudirman"> -->
              <!-- <input v-model="form.rt" class="input-form col-md-3 col-sm-3 col-xs-6" type="text" placeholder="RT"> -->
              <!-- <input v-model="form.rw" class="input-form col-md-3 col-sm-3 col-xs-6" type="text" placeholder="RW">               -->

              <!-- ================= Alamat ===================== -->
              <label class="text-labelku">Alamat </label>
              <q-select
                filled
                v-model="form.provinsi"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_provinsi2"
                @filter="provinsi2"
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
                v-model="form.kabupaten"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_kabupaten2"
                @filter="(val, update) => kabupaten2(val, update, form.provinsi)"
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
                v-model="form.kecamatan"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_kecamatan2"
                @filter="(val, update) => kecamatan2(val, update, form.kabupaten)"
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
                v-model="form.desa_kelurahan"
                use-input
                hide-selected
                fill-input
                input-debounce="300"
                :options="list_data_desa_kelurahan2"
                @filter="(val, update) => desa_kelurahan2(val, update, form.kecamatan)"
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

              <label class="text-labelku">Alamat Pemohon</label>
              <input v-model="form.alamat" type="text" placeholder="Alamat Ex: Jl. Raya No. 123" class="input-form">
              <label class="text-labelku">RT</label>
              <input v-model="form.rt" type="number" placeholder="RT" class="input-form">
              <label class="text-labelku">RW</label>
              <input v-model="form.rw" type="number" placeholder="RW" class="input-form">
              <label class="text-labelku">Kode Pos</label>
              <input v-model="form.kode_pos" type="number" placeholder="Kode Pos" class="input-form"> 
              <label class="text-labelku">Nomor Hp</label>
              <input v-model="form.no_telp" type="tel" placeholder="Nomor Hp" class="input-form">

              <!-- ================= Alamat ===================== -->               

              <label class="text-labelku col-12 col-md-12">Nik Pemohon</label>
              <input v-model="form.nik" class="input-form col-12 col-md-12" type="text">              
              <label class="text-labelku col-12 col-md-12">Nama Lengkap </label>
              <input v-model="form.nama" class="input-form col-12 col-md-12" type="text">              
 

              

            </q-step> 

            <q-step :name="3" title="DATA KEPINDAHAN" icon="add_comment" :done="step > 3">

                <label class="text-labelku">1. Alasan Kepindahan</label>                   
                <select v-model="form.alasan_kepindahan"> 
                  <option value="" disabled> - Pilih Alasan Kepindahan - </option>
                  <option v-for="(data, index) in list_kepindahan" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                </select>                
                <template v-if="form.alasan_kepindahan == 'Lainnya'">
                    <label class="text-labelku">Alasan Kepindahan Lainnya</label> <input v-model="form.alasan_kepindahan_lainnya" class="input-form" type="text" placeholder="Alasan Kepindahan Lainnya">
                </template>

                <label class="text-labelku">Alamat </label>
                <q-select
                  filled
                  v-model="form.provinsi_tujuan"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="list_data_provinsi3"
                  @filter="provinsi3"
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
                  v-model="form.kabupaten_tujuan"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="list_data_kabupaten3"
                  @filter="(val, update) => kabupaten3(val, update, form.provinsi_tujuan)"
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
                  v-model="form.kecamatan_tujuan"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="list_data_kecamatan3"
                  @filter="(val, update) => kecamatan3(val, update, form.kabupaten_tujuan)"
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
                  v-model="form.desa_kelurahan_tujuan"
                  use-input
                  hide-selected
                  fill-input
                  input-debounce="300"
                  :options="list_data_desa_kelurahan3"
                  @filter="(val, update) => desa_kelurahan3(val, update, form.kecamatan_tujuan)"
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
                <label class="q-gutter-xs col-12 col-md-12 col-sm-12 text-labelku">2. Alamat Tujuan Pindah </label> 

                <label class="text-labelku">Alamat Keluarga Lama</label>   
                <input class="input-form" v-model="form.alamat_tujuan" type="text" placeholder="Alamat Keluarga Lama">  
                <label class="text-labelku">RT</label>   
                <input class="input-form" v-model="form.rt_tujuan" type="number" placeholder="RT">  
                <label class="text-labelku">RW</label>   
                <input class="input-form" v-model="form.rw_tujuan" type="number" placeholder="RW">  

                <label class="text-labelku">Kode Pos</label>   
                <input class="input-form" v-model="form.kodePos_tujuan" type="tel" placeholder="Kode Pos">   
                <label class="text-labelku">Telepon</label>   
                <input class="input-form" v-model="form.noTelp_tujuan" type="tel" placeholder="Telepon">

                <label class="text-labelku">3. Jenis Kepindahan</label>                   
                <select v-model="form.jenis_kepindahan"> 
                  <option value="" disabled> - Pilih Jenis Kepindahan - </option>
                  <option v-for="(data, index) in list_jenis_kepindahan" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                </select>    
                <label class="text-labelku">4. Status KK Bagi Yang Tidak Pindah</label>                   
                <select v-model="form.status_kk_bagi_yang_tidak_pindah"> 
                  <option value="" disabled> - Pilih Status KK Bagi Yang Tidak Pindah - </option>
                  <option v-for="(data, index) in list_status_kk_bagi_yang_tidak_pindah" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                </select>    
                <label class="text-labelku">5. Status KK Bagi Yang Pindah</label>                   
                <select v-model="form.status_kk_bagi_yang_pindah"> 
                  <option value="" disabled> - Pilih Status KK Bagi Yang Pindah - </option>
                  <option v-for="(data, index) in list_status_kk_bagi_yang_pindah" :key="index" v-bind:value="data.uraian" >{{data.uraian}}</option>
                </select>                

            </q-step>

            <q-step :name="4" title="Data Anggota keluarga" icon="add_comment" :done="step > 4">
              <label class="text-labelku">Tambah Anggota Keluarga</label>

              <!-- Form Input Anggota Keluarga -->
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <label class="text-labelku">Nama Lengkap</label>
                <input v-model="anggota_keluarga.nama" type="text" placeholder="Nama Lengkap" class="input-form">

                <label class="text-labelku">NIK</label>
                <input v-model="anggota_keluarga.nik" type="number" placeholder="NIK" class="input-form">

                <label class="text-labelku">Jenis Kelamin</label>
                <select v-model="anggota_keluarga.jenis_kelamin" class="input-form">
                  <option disabled value="">Pilih Jenis Kelamin</option>
                  <option value="Laki - Laki">Laki - Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>

                <label class="text-labelku">Tempat Lahir</label>
                <input v-model="anggota_keluarga.tempat_lahir" type="text" placeholder="Tempat Lahir" class="input-form">

                <label class="text-labelku">Tanggal Lahir</label>
                <input v-model="anggota_keluarga.tanggal_lahir" type="date" placeholder="Tanggal Lahir" class="input-form">

                <label class="text-labelku">Status Hubungan Dalam Keluarga</label>
                <select v-model="anggota_keluarga.shdk" class="input-form">
                  <option disabled value="">- Pilih Status Hubungan -</option>
                  <option v-for="(data, index) in simcard.listShdk" :key="index" :value="data.uraian">
                    {{ data.uraian }}
                  </option>
                </select>

                <div class="row">
                  <label class="text-labelku text-center col-12 col-md-12">Masa Berlaku KTP S/D</label>
                  <div class="text-center col-6 col-md-6 col-sm-6">
                    <label class="text-labelku ">Dari</label>
                    <input v-model="anggota_keluarga.tglKTP_dari" class="input-form" type="date">
                  </div>
                  <div class="text-center col-6 col-md-6 col-sm-6">
                    <label class="text-labelku ">Hingga</label>
                    <input v-model="anggota_keluarga.tglKTP_hingga" class="input-form" type="date">
                  </div>                

                </div>

                <label class="text-labelku">Agama</label>
                <select v-model="anggota_keluarga.agama" class="input-form">
                  <option disabled value="">- Pilih Agama -</option>
                  <option v-for="(data, index) in simcard.listAgama" :key="index" :value="data.uraian">
                    {{ data.uraian }}
                  </option>
                </select>

                <label class="text-labelku">Pekerjaan</label>
                <select v-model="anggota_keluarga.pekerjaan" class="input-form">
                  <option disabled value="">- Pilih Pekerjaan -</option>
                  <option v-for="(data, index) in simcard.listPekerjaan" :key="index" :value="data.uraian">
                    {{ data.uraian }}
                  </option>
                </select>

                <label class="text-labelku">Pendidikan Terakhir</label>
                <select v-model="anggota_keluarga.pendidikan" class="input-form">
                  <option disabled value="">- Pilih Pendidikan -</option>
                  <option v-for="(data, index) in simcard.listPendidikan" :key="index" :value="data.uraian">
                    {{ data.uraian }}
                  </option>
                </select>

                <div style="margin-top: 20px; display: flex; gap: 10px;">
                  <q-btn 
                    :color="isEditing ? 'warning' : 'primary'"
                    :label="isEditing ? 'Simpan Perubahan' : 'Tambah Anggota'" 
                    :icon="isEditing ? 'save' : 'add'"
                    @click="tambahAnggotaKeluarga()"
                    style="flex: 1;"
                  />
                  <q-btn 
                    v-if="isEditing"
                    color="grey-7"
                    label="Batal" 
                    icon="close"
                    @click="cancelEdit()"
                    style="flex: 1;"
                  />
                </div>
              </div>

              <!-- Daftar Anggota Keluarga menggunakan Quasar List -->
              <label class="text-labelku">Daftar Anggota Keluarga</label>
              <div v-if="form.anggota_keluarga.length > 0" style="margin-top: 20px;">
                <div v-for="(anggota, index) in form.anggota_keluarga" :key="index" style="background-color: white; padding: 16px; margin-bottom: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); border-left: 4px solid #3683FD;">
                  
                  <!-- Row 1: Nomor Urut dan Action Buttons -->
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div style="font-size: 14px; font-weight: 600; color: #1a202c;">
                      Anggota #{{ index + 1 }}
                    </div>
                    <div class="q-gutter-xs" style="display: flex; gap: 8px;">
                      <q-btn 
                        size="sm" 
                        round 
                        dense 
                        flat 
                        icon="edit" 
                        color="primary"
                        @click.stop="editAnggotaKeluarga(index)"
                        style="width: 36px; height: 36px;"
                      >
                        <q-tooltip>Edit</q-tooltip>
                      </q-btn>
                      <q-btn 
                        size="sm" 
                        round 
                        dense 
                        flat 
                        icon="delete" 
                        color="negative"
                        @click.stop="hapusAnggotaKeluarga(index)"
                        style="width: 36px; height: 36px;"
                      >
                        <q-tooltip>Hapus</q-tooltip>
                      </q-btn>
                    </div>
                  </div>

                  <!-- Row 2: Data Anggota -->
                  <div style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
                    <!-- Nama -->
                    <div style="margin-bottom: 10px;">
                      <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Nama Lengkap</div>
                      <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.nama }}</div>
                    </div>

                    <!-- Grid 2 Kolom: NIK dan Jenis Kelamin -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 10px;">
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">NIK</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.nik }}</div>
                      </div>
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Jenis Kelamin</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.jenis_kelamin }}</div>
                      </div>
                    </div>

                    <!-- Grid 2 Kolom: Status dan Agama -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 10px;">
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Status Hubungan</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.shdk }}</div>
                      </div>
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Agama</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.agama }}</div>
                      </div>
                    </div>

                    <!-- Tanggal Lahir -->
                    <div style="margin-bottom: 10px;">
                      <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Tanggal Lahir</div>
                      <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.tanggal_lahir }}</div>
                    </div>

                    <!-- Grid 2 Kolom: Pekerjaan dan Pendidikan -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Pekerjaan</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.pekerjaan }}</div>
                      </div>
                      <div>
                        <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 2px;">Pendidikan Terakhir</div>
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.pendidikan }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else style="text-align: center; padding: 20px; color: #999; border: 2px dashed #ddd; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 150px;">
                <q-icon name="info" size="32px" style="opacity: 0.5; margin-bottom: 8px;" />
                <p>Belum ada anggota keluarga yang ditambahkan</p>
              </div>

            </q-step>

            <q-step :name="5" title="Data Dukung" icon="add_comment">
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
                <q-btn v-if="step < 5" @click="$refs.stepper.next()" color="primary" label="Continue" />
                <q-btn v-if="step === 5" @click="editData()" color="positive" label="Submit" :loading="loading" />
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
            <span class="text-weight-bold">Detail Permohonan Kartu Keluarga</span>
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-separator />

        <q-scroll-area style="height: 500px; width: 100%;">
          <q-card-section>
            <div class="q-gutter-lg">
              <!-- Bagian 1: Data Daerah Administratif (Lokasi Permohonan) -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  🏘️ Daerah Administratif (Lokasi Permohonan)
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

              <!-- Bagian 2: Data Daerah Asal -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #0097A7; border-bottom: 2px solid #0097A7; padding-bottom: 8px;">
                  📍 Data Daerah Asal
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Nomor Kartu Keluarga</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.no_kk || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Nama Kepala Keluarga</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.nama_kepalaKeluarga || '-' }}</div>
                  </div>
                </div>
              </div>

 

 
              <div>
                <!-- <h5 style="margin: 0 0 16px 0; color: #C2185B; border-bottom: 2px solid #C2185B; padding-bottom: 8px;">
                  🏠 Alamat Pemohon
                </h5> -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Provinsi</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ wilayah_pemohon.uraian_provinsi || '-' }}</div>
                    <div style="font-size: 11px; color: #A0AEC0; margin-top: 2px;">Kode: {{ wilayah_pemohon.kd_provinsi || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kabupaten</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ wilayah_pemohon.uraian_kabupaten || '-' }}</div>
                    <div style="font-size: 11px; color: #A0AEC0; margin-top: 2px;">Kode: {{ wilayah_pemohon.kd_kabupaten || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kecamatan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ wilayah_pemohon.uraian_kecamatan || '-' }}</div>
                    <div style="font-size: 11px; color: #A0AEC0; margin-top: 2px;">Kode: {{ wilayah_pemohon.kd_kecamatan || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Desa/Kelurahan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ wilayah_pemohon.uraian_desa_kelurahan || '-' }}</div>
                    <div style="font-size: 11px; color: #A0AEC0; margin-top: 2px;">Kode: {{ wilayah_pemohon.kd_desa_kelurahan || '-' }}</div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Alamat</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.alamat || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">RT</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.rt || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">RW</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.rw || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kode Pos</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.kode_pos || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Bagian 6: Data Kepindahan -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #6D4C41; border-bottom: 2px solid #6D4C41; padding-bottom: 8px;">
                  🚚 Data Kepindahan
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Alasan Kepindahan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.alasan_kepindahan || '-' }}</div>
                    <div v-if="form.alasan_kepindahan_lainnya" style="font-size: 13px; color: #718096; margin-top: 4px;">
                      <strong>Keterangan:</strong> {{ form.alasan_kepindahan_lainnya }}
                    </div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 8px;">📍 Alamat Tujuan Pindah</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                      <div>
                        <div style="font-size: 11px; color: #718096;">Provinsi</div>
                        <div style="font-size: 13px; color: #2d3748;">{{ wilayah_tujuan.uraian_provinsi || '-' }}</div>
                      </div>
                      <div>
                        <div style="font-size: 11px; color: #718096;">Kabupaten</div>
                        <div style="font-size: 13px; color: #2d3748;">{{ wilayah_tujuan.uraian_kabupaten || '-' }}</div>
                      </div>
                      <div>
                        <div style="font-size: 11px; color: #718096;">Kecamatan</div>
                        <div style="font-size: 13px; color: #2d3748;">{{ wilayah_tujuan.uraian_kecamatan || '-' }}</div>
                      </div>
                      <div>
                        <div style="font-size: 11px; color: #718096;">Desa/Kelurahan</div>
                        <div style="font-size: 13px; color: #2d3748;">{{ wilayah_tujuan.uraian_desa_kelurahan || '-' }}</div>
                      </div>
                    </div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Alamat Tujuan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.alamat_tujuan || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">RT Tujuan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.rt_tujuan || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">RW Tujuan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.rw_tujuan || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kode Pos Tujuan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.kodePos_tujuan || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Telepon</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.noTelp_tujuan || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Jenis Kepindahan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.jenis_kepindahan || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Status KK Bagi Yang Tidak Pindah</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.status_kk_bagi_yang_tidak_pindah || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Status KK Bagi Yang Pindah</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.status_kk_bagi_yang_pindah || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Bagian 7: Anggota Keluarga -->
              <div v-if="form.anggota_keluarga && form.anggota_keluarga.length > 0">
                <h5 style="margin: 0 0 16px 0; color: #6A1B9A; border-bottom: 2px solid #6A1B9A; padding-bottom: 8px;">
                  👨‍👩‍👧‍👦 Anggota Keluarga ({{ form.anggota_keluarga.length }})
                </h5>
                <div style="display: grid; gap: 12px;">
                  <div v-for="(anggota, index) in form.anggota_keluarga" :key="index" style="background-color: #F5F5F5; padding: 12px; border-radius: 8px; border-left: 4px solid #6A1B9A;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #2d3748;">Anggota #{{ index + 1 }}: {{ anggota.nama }}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                      <div>
                        <span style="color: #718096;">NIK:</span>
                        <div style="color: #2d3748;">{{ anggota.nik || '-' }}</div>
                      </div>
                      <div>
                        <span style="color: #718096;">Jenis Kelamin:</span>
                        <div style="color: #2d3748;">{{ anggota.jenis_kelamin || '-' }}</div>
                      </div>
                      <div>
                        <span style="color: #718096;">Tempat Lahir:</span>
                        <div style="color: #2d3748;">{{ anggota.tempat_lahir || '-' }}</div>
                      </div>
                      <div>
                        <span style="color: #718096;">Tanggal Lahir:</span>
                        <div style="color: #2d3748;">{{ anggota.tanggal_lahir || '-' }}</div>
                      </div>
                      <div>
                        <span style="color: #718096;">Status:</span>
                        <div style="color: #2d3748;">{{ anggota.status_hubungan_dl_keluarga || '-' }}</div>
                      </div>
                      <div>
                        <span style="color: #718096;">Agama:</span>
                        <div style="color: #2d3748;">{{ anggota.agama || '-' }}</div>
                      </div>
                      <div>
                        <span style="color: #718096;">Pekerjaan:</span>
                        <div style="color: #2d3748;">{{ anggota.pekerjaan || '-' }}</div>
                      </div>
                      <div>
                        <span style="color: #718096;">Pendidikan:</span>
                        <div style="color: #2d3748;">{{ anggota.pendidikan || '-' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bagian 8: File Lampiran -->
              <div v-if="form.file_lampiranOld">
                <h5 style="margin: 0 0 16px 0; color: #00897B; border-bottom: 2px solid #00897B; padding-bottom: 8px;">
                  📎 File Lampiran
                </h5>
                <div @click="bukaLink(form.file_lampiranOld)" style="background-color: #E0F2F1; padding: 12px; border-radius: 8px; border-left: 4px solid #00897B; cursor: pointer;">
                  <div style="font-size: 14px; color: #2d3748;">{{ form.file_lampiranOld }}</div>
                </div>
              </div>

              <!-- Bagian 9: Status dan Tanggal -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #455A64; border-bottom: 2px solid #455A64; padding-bottom: 8px;">
                  Informasi Permohonan
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Status</div>
                    <div>
                      <q-badge 
                        :label="form.status === 0 ? 'Menunggu Verifikasi' : (form.status === 1 ? 'Diterima' : 'Dikembalikan')"
                        :color="form.status === 0 ? 'warning' : (form.status === 1 ? 'positive' : 'negative')"
                        style="font-size: 12px; padding: 4px 8px;"
                      />
                    </div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Tanggal Dibuat</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.createdAt || '-' }}</div>
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

    <q-dialog v-model="modal_syarat">
      <q-card style="min-width: 90%; max-width: 90%;">
        <q-toolbar>
          <q-toolbar-title>
            <q-icon name="description" color="primary" class="q-mr-md" />
            <span style="font-size: 12pt;" class="text-weight-bold">Persyaratan Dokumen</span>
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-separator />

        <q-scroll-area style="height: 500px; width: 100%;">
          <q-card-section>
            <div class="q-gutter-md">
              <!-- Header -->
              <div>
                <h4 style="margin: 0 0 8px 0; color: #1976D2; font-weight: bold;">Persyaratan Penerbitan Kartu Keluarga</h4>
                <p style="margin: 0; font-size: 12px; color: #666;">by Disdukcapil Konsel | 31 Januari 2020</p>
              </div>

              <!-- Penerbitan KK Baru atau Pisah KK -->
              <div>
                <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  📋 Penerbitan KK Baru atau Pisah KK
                </h5>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                  <li>Berumur 17 (Tujuh Belas) Tahun atau sudah Kawin atau pernah Kawin yang dibuktikan dengan kepemilikan KTP-El</li>
                  <li>Foto Copy Buku Nikah/Kutipan Akta Perkawinan atau Kutipan Akta Perceraian</li>
                  <li>Surat Pindah bagi Penduduk yang pindah dalam wilayah Negara Kesatuan Republik Indonesia (SKPWNI)</li>
                  <li>Surat Pernyataan Tanggung Jawab Mutlak Perkawinan/Perceraian belum tercatat</li>
                  <li>Mengisi Formulir Biodata Keluarga (F-1.01)</li>
                  <li>Surat Kuasa jika diwakilkan (F 1.07)</li>
                </ul>
              </div>

              <!-- Penerbitan KK Baru untuk Penduduk Orang Asing -->
              <div>
                <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  🌍 Penerbitan KK Baru untuk Penduduk Orang Asing
                </h5>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                  <li>Kartu Izin Tinggal Tetap</li>
                  <li>Foto Copy Buku Nikah/Kutipan Akta Perkawinan atau Kutipan Akta Perceraian atau yang disebut dengan nama lain</li>
                  <li>Surat Keterangan Pindah Bagi Penduduk yang pindah dalam wilayah Negara Kesatuan Republik Indonesia</li>
                  <li>Mengisi Formulir Biodata Keluarga (F-1.01)</li>
                </ul>
              </div>

              <!-- Penerbitan KK Baru karena Perubahan Elemen Data -->
              <div>
                <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  ✏️ Penerbitan KK Baru karena Perubahan Elemen Data
                </h5>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                  <li>Asli KK lama</li>
                  <li>Surat Keterangan/Bukti Perubahan Peristiwa Kependudukan dan Peristiwa Penting</li>
                  <li>Surat Pernyataan Perubahan Elemen Data (F 1.06)</li>
                  <li>Surat Kuasa jika diwakilkan (F 1.07)</li>
                </ul>
              </div>

              <!-- Penambahan Anggota Keluarga Atau Numpang KK -->
              <div>
                <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  👨‍👩‍👧 Penambahan Anggota Keluarga Atau Numpang KK
                </h5>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                  <li>Asli KK lama atau KK yang akan ditumpangi</li>
                  <li>Surat keterangan lahir dari Dokter/Bidan</li>
                  <li>Foto Copy Buku Nikah/Kutipan Akta Perkawinan bagi yang Perkawinannya belum tercatat di Kartu Keluarga</li>
                  <li>Surat Keterangan Pindah Datang Warga Negara Indonesia (SKPWNI)</li>
                  <li>Surat Pernyataan bersedia menerima sebagai Anggota Keluarga</li>
                  <li>Surat Kuasa jika diwakilkan (F 1.07)</li>
                </ul>
              </div>

              <!-- Penerbitan KK Hilang atau Rusak -->
              <div>
                <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  ⚠️ Penerbitan KK Hilang atau Rusak
                </h5>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                  <li>Surat Keterangan Kehilangan dari Kepolisian atau KK yang rusak</li>
                  <li>Foto Copy KTP-El</li>
                  <li>Surat Kuasa jika diwakilkan (F 1.07)</li>
                </ul>
              </div>

              <!-- Penerbitan KK Hilang atau Rusak untuk Penduduk Orang Asing -->
              <div>
                <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  🌍 Penerbitan KK Hilang atau Rusak untuk Penduduk Orang Asing
                </h5>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                  <li>Surat Keterangan Hilang dari Kepolisian atau KK yang Rusak</li>
                  <li>Kartu Izin Tinggal Tetap</li>
                  <li>KTP-El</li>
                </ul>
              </div>

              <!-- Persyaratan Permohonan SKPWNI -->
              <div>
                <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  📄 Persyaratan Permohonan Surat Keterangan Pindah WNI (SKPWNI)
                </h5>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                  <li>Kartu Keluarga Asli</li>
                  <li>Surat Kuasa Bagi yang Diwakili</li>
                </ul>
              </div>

              <!-- Jam Layanan -->
              <div style="background-color: #E8F5E9; padding: 12px; border-radius: 8px; border-left: 4px solid #4CAF50; margin-top: 16px;">
                <h5 style="margin: 0 0 8px 0; color: #2E7D32;">🕐 Jam Layanan</h5>
                <p style="margin: 0; line-height: 1.6; font-size: 13px;">
                  <strong>Senin - Jumat:</strong> 08:00 - 16:00 WIT
                </p>
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

  </q-page>
</template>

<script>
import { useSimcardStore } from '../../../../src/stores/simcard';
import AutocompleteInput from 'src/components/AutocompleteInput.vue'
import { Loading, Notify } from 'quasar'
import axios from 'axios'

export default {
  components: { AutocompleteInput },
  name: 'PPD2_list',
  data() {
    return {
      nama_form:'PPD2',
      nama:'',
      step: 1,
      modal_lihat   : false,
      modal_add   : false,
      modal_edit  : false,
      modal_alur  : false,
      modal_delete  : false,
      modal_syarat  : false,
      loading: false,
      isLoadingData: false, // Flag untuk menandai apakah sedang load data dari edit
      file_lampiran_new: null, // State untuk file baru
      options: [],
      options2: [],
      token: localStorage.getItem('token') || '',

      list_kepindahan:[ {uraian:'Pekerjaan'},{uraian:'Pendidikan'},{uraian:'Keamanan'},{uraian:'Kesehatan'},{uraian:'Perumahan'},{uraian:'Keluarga'},{uraian:'Lainnya'} ],
      list_jenis_kepindahan:[ {uraian:'Kep. Keluarga'},{uraian:'Kep. Keluarga dan Seluruh Angg. Keluarga '},{uraian:'Kep. Keluarga dan Sbg. Angg. Keluarga'},{uraian:'Angg. Keluarga'}, ],
      list_status_kk_bagi_yang_tidak_pindah:[ {uraian:'Numpang KK'},{uraian:'Membuat KK Baru'},{uraian:'Nomor KK Tetap'} ],
      list_status_kk_bagi_yang_pindah:[ {uraian:'Numpang KK'},{uraian:'Membuat KK Baru'},{uraian:'Nomor KK Tetap'} ],

          form: {
              id : '',
              KKref : '',
              id_dari_form : '',

              m_provinsi : '74',
              m_kabupaten : '7405',
              m_kecamatan : '',
              m_desa_kelurahan : '', 

              no_kk                :'',
              nama_kepalaKeluarga  :'',
              provinsi             :'',
              kabupaten            :'',
              kecamatan            :'',  
              desa_kelurahan       :'',
              alamat               :'',
              rt                   :'',
              rw                   :'',
              kode_pos             :'',
              no_telp              :'', 

              nik                  :'',
              nama                 :'',

              alasan_kepindahan         :'',
              alasan_kepindahan_lainnya :'',

              provinsi_tujuan       :'',
              kabupaten_tujuan      :'',
              kecamatan_tujuan      :'',  
              desa_kelurahan_tujuan :'',
              alamat_tujuan         : '',
              rt_tujuan             : '',
              rw_tujuan             : '',
              kodePos_tujuan        :'',
              noTelp_tujuan         :'',


              jenis_kepindahan:'',
              status_kk_bagi_yang_tidak_pindah:'',
              status_kk_bagi_yang_pindah:'',

              shdk:'',
              shdk_lainnya:'', 

              file_Kabupaten:null,
              file_Old_Kabupaten:null,

                status : 0,
                keterangan : 0,
                
                keterangan_deskel:'',
                keterangan_kecamatan:'',
                keterangan_kabupaten  :'',

                status_deskel:0,
                status_kecamatan:0,
                status_kabupaten  :0,

                createdBy : '',
                createdAt : '',
                createdAt_deskel:'',
                createdAt_kecamatan:'',
                createdAt_kabupaten  :'',

              file_terbitan   : null,
              emailPemohon    : '',
              email_file      : null,
              email_fileOld   : null,
              email_from      : '',
              email_to        : '',
              email_subject   : '',
              email_html      : '',

              file              : null, 
              fileThumb         : null, 
              file_lampiran     : null,
              file_lampiranOld  : null,
              
              anggota_keluarga:[]
              
          },   

            list_data:[],
            list_data_provinsi:[],            
            list_data_kabupaten:[],            
            list_data_kecamatan:[],
            list_data_desa_kelurahan:[],

            list_data_provinsi2:[],            
            list_data_kabupaten2:[],            
            list_data_kecamatan2:[],
            list_data_desa_kelurahan2:[],

            list_data_provinsi3:[],            
            list_data_kabupaten3:[],            
            list_data_kecamatan3:[],
            list_data_desa_kelurahan3:[],
            


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
      wilayah_alamat: {
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
        this.simcard.url.URL_PERMOHONAN_PPD2 + "view",
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
        console.log("list_data");
        console.log(this.list_data);

        // console.log('Response:', response)
        this.loading = false;
 
      })
 


    },

    addData() {
      this.loading = true;

      console.log("addData called ===========>");
      console.log(this.form);
      console.log(this.form.anggota_keluarga);

      const formData = new FormData();
      formData.append("data", JSON.stringify(this.form));
      formData.append("biodata", JSON.stringify(this.form.anggota_keluarga));
      formData.append("file", this.form.file);
      
      // Hanya append file_lampiran jika ada file baru
      if (this.form.file_lampiran && this.form.file_lampiran instanceof File) {
        formData.append("file_lampiran", this.form.file_lampiran);
      }

      axios.post(
        this.simcard.url.URL_PERMOHONAN_PPD2 + "addData",
        formData,
        {
          headers: {
            authorization: "kikensbatara " + this.token
          }
        }
      )
      .then(response => {
        this.loading = false;
        console.log('Response:', response)
        Notify.create({
          message: 'Data berhasil dikirim',
          color: 'positive'
        })
        this.getview();
        // this.modal_add = false;
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
      this.loading = true;

      console.log(this.form);
      console.log(this.form.anggota_keluarga);

      const formData = new FormData();
      formData.append("data", JSON.stringify(this.form));
      formData.append("biodata", JSON.stringify(this.form.anggota_keluarga));
      formData.append("file", this.form.file);
      
      // Hanya append file_lampiran jika ada file baru
      if (this.form.file_lampiran && this.form.file_lampiran instanceof File) {
        formData.append("file_lampiran", this.form.file_lampiran);
      }

      axios.post(
        this.simcard.url.URL_PERMOHONAN_PPD2 + "editData",
        formData,
        {
          headers: {
            authorization: "kikensbatara " + this.token
          }
        }
      )
      .then(response => {
        this.loading = false;
        console.log('Response:', response)
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

      const body = {
        id: this.form.id,
        KKref: this.form.KKref
      };

      axios.post(
        this.simcard.url.URL_PERMOHONAN_PPD2 + "removeData_mobile",
        body,
        {
          headers: {
            authorization: "kikensbatara " + this.token
          }
        }
      )
      .then(response => {
        this.loading = false;
        console.log('Response:', response)
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
      console.log(data); 

      // Set flag untuk tidak trigger reset di watcher
      this.isLoadingData = true

          //  console.log(data);
              this.form.id                                 = data.PPD2.id
        this.form.KKref                              = data.PPD2.KKref
        this.form.id_dari_form                       = data.PPD2.id_dari_form
        this.form.m_provinsi                         = data.PPD2.m_provinsi
        this.form.m_kabupaten                        = data.PPD2.m_kabupaten
        this.form.m_kecamatan                        = data.PPD2.m_kecamatan
        this.form.m_desa_kelurahan                   = data.PPD2.m_desa_kelurahan
        this.form.no_kk                              = data.PPD2.no_kk
        this.form.nama_kepalaKeluarga                = data.PPD2.nama_kepalaKeluarga
        this.form.alamat                             = data.PPD2.alamat
        this.form.rt                                 = data.PPD2.rt
        this.form.rw                                 = data.PPD2.rw
        this.form.provinsi                           = data.PPD2.provinsi
        this.form.kabupaten                          = data.PPD2.kabupaten
        this.form.kecamatan                          = data.PPD2.kecamatan
        this.form.desa_kelurahan                     = data.PPD2.desa_kelurahan
        this.form.kode_pos                           = data.PPD2.kode_pos
        this.form.no_telp                            = data.PPD2.no_telp
        this.form.nik                                = data.PPD2.nik
        this.form.nama                               = data.PPD2.nama
        this.form.alasan_kepindahan                  = data.PPD2.alasan_kepindahan
        this.form.alasan_kepindahan_lainnya          = data.PPD2.alasan_kepindahan_lainnya
        this.form.alamat_tujuan                      = data.PPD2.alamat_tujuan
        this.form.rt_tujuan                          = data.PPD2.rt_tujuan
        this.form.rw_tujuan                          = data.PPD2.rw_tujuan
        this.form.provinsi_tujuan                    = data.PPD2.provinsi_tujuan
        this.form.kabupaten_tujuan                   = data.PPD2.kabupaten_tujuan
        this.form.kecamatan_tujuan                   = data.PPD2.kecamatan_tujuan
        this.form.desa_kelurahan_tujuan              = data.PPD2.desa_kelurahan_tujuan
        this.form.kodePos_tujuan                     = data.PPD2.kodePos_tujuan
        this.form.noTelp_tujuan                      = data.PPD2.noTelp_tujuan
        this.form.jenis_kepindahan                   = data.PPD2.jenis_kepindahan
        this.form.status_kk_bagi_yang_tidak_pindah   = data.PPD2.status_kk_bagi_yang_tidak_pindah
        this.form.status_kk_bagi_yang_pindah         = data.PPD2.status_kk_bagi_yang_pindah
        this.form.shdk                               = data.PPD2.shdk
        this.form.shdk_lainnya                       = data.PPD2.shdk_lainnya
        this.form.file_Kabupaten                     = data.PPD2.file_Kabupaten
        this.form.file_Old_Kabupaten                 = data.PPD2.file_Old_Kabupaten


        this.form.status                = data.PPD2.status
        this.form.keterangan            = data.PPD2.keterangan
        this.form.keterangan_deskel     = data.PPD2.keterangan_deskel
        this.form.keterangan_kecamatan  = data.PPD2.keterangan_kecamatan
        this.form.keterangan_kabupaten  = data.PPD2.keterangan_kabupaten
        this.form.status_deskel         = data.PPD2.status_deskel
        this.form.status_kecamatan      = data.PPD2.status_kecamatan
        this.form.status_kabupaten      = data.PPD2.status_kabupaten
        this.form.createdBy             = data.PPD2.createdBy
        this.form.createdAt             = data.PPD2.createdAt
        this.form.createdAt_deskel      = data.PPD2.createdAt_deskel
        this.form.createdAt_kecamatan   = data.PPD2.createdAt_kecamatan
        this.form.createdAt_kabupaten   = data.PPD2.createdAt_kabupaten


        this.form.anggota_keluarga                = data.databio;  

        this.form.emailPemohon          = data.PPD2.emailPemohon;
        this.form.email_fileOld         = data.PPD2.email_file;
        this.form.email_from            = this.form.email_from;
        this.form.email_to              = this.form.emailPemohon;
        this.form.email_subject         = data.PPD2.email_subject;
        if (data.PPD2.email_html == undefined || data.PPD2.email_html == null || data.PPD2.email_html == '') {
          this.form.email_html          = ''
        } else {
          this.form.email_html          = data.PPD2.email_html; 
        }
        this.form.file_lampiran         = data.PPD2.file_lampiran
        this.form.file_lampiranOld      = data.PPD2.file_lampiranOld        

        this.wilayah = {
          uraian_provinsi       : data.m_provinsi.uraian,
          kd_provinsi           : data.m_provinsi.kd_provinsi,
          uraian_kabupaten      : data.m_kabupaten.uraian,
          kd_kabupaten          : data.m_kabupaten.kd_kabupaten,
          uraian_kecamatan      : data.m_kecamatan.uraian,
          kd_kecamatan          : data.m_kecamatan.kd_kecamatan,
          uraian_desa_kelurahan : data.m_desa_kelurahan.uraian,
          kd_desa_kelurahan     : data.m_desa_kelurahan.kd_desa_kelurahan,
        }
 
        this.wilayah_pemohon = {
          uraian_provinsi       : data.provinsi.uraian,
          kd_provinsi           : data.provinsi.kd_provinsi,
          uraian_kabupaten      : data.kabupaten.uraian,
          kd_kabupaten          : data.kabupaten.kd_kabupaten,
          uraian_kecamatan      : data.kecamatan.uraian,
          kd_kecamatan          : data.kecamatan.kd_kecamatan,
          uraian_desa_kelurahan : data.desa_kelurahan.uraian,
          kd_desa_kelurahan     : data.desa_kelurahan.kd_desa_kelurahan,
        }
        this.wilayah_tujuan = {
          uraian_provinsi       : data.provinsi_tujuan.uraian,
          kd_provinsi           : data.provinsi_tujuan.kd_provinsi,
          uraian_kabupaten      : data.kabupaten_tujuan.uraian,
          kd_kabupaten          : data.kabupaten_tujuan.kd_kabupaten,
          uraian_kecamatan      : data.kecamatan_tujuan.uraian,
          kd_kecamatan          : data.kecamatan_tujuan.kd_kecamatan,
          uraian_desa_kelurahan : data.desa_kelurahan_tujuan.uraian,
          kd_desa_kelurahan     : data.desa_kelurahan_tujuan.kd_desa_kelurahan,
        }
      
      // Reset file state untuk modal edit
      this.file_lampiran_new = null
      this.form.file_lampiran = null

      // Load initial data untuk alamat berdasarkan provinsi, kabupaten, kecamatan yang ada
      this.$nextTick(async () => {
        // Load kabupaten2 terlebih dahulu
        await this.loadInitialKabupaten2()
        // Tunggu kabupaten loaded, lalu load kecamatan2
        await this.loadInitialKecamatan2()
        // Tunggu kecamatan loaded, lalu load desa_kelurahan2
        await this.loadInitialDesaKelurahan2()
        
        // Reset flag setelah loading selesai
        this.isLoadingData = false
        
        // console.log('Alamat Data Loaded:')
        // console.log('Kabupaten2:', this.list_data_kabupaten2.length, 'items')
        // console.log('Kecamatan2:', this.list_data_kecamatan2.length, 'items')
        // console.log('Desa Kelurahan2:', this.list_data_desa_kelurahan2.length, 'items')
      })

    },    



    // FILTER DAERAH ADMINISTRATIF
    provinsi1(val, update, abort) {
      update(() => {
        if (!val) {
          this.options = this.list_data_provinsi
          return
        }

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
          // console.log('Provinsi response:', response)
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

    provinsi2(val, update, abort) {
      update(() => {
        if (!val) {
          this.options2 = this.list_data_provinsi2
          return
        }

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
          // console.log('Provinsi response:', response)
          // Simpan original data
          this.list_data_provinsi2 = response.data || []
          this.options2 = response.data || []
        })
        .catch(error => {
          console.error('Error fetching provinsi:', error)
        })
      })
    },
    kabupaten2(val, update, provinsi, abort) {
      update(() => {
        if (!val) {
          this.options2 = this.list_data_kabupaten2
          return
        }

        axios.get(this.simcard.url.URL_DATAMASTER_KAB_KOTA+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_provinsi: provinsi  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // console.log('Kabupaten response:', response)
          // Simpan original data
          this.list_data_kabupaten2 = response.data || []
          this.options2 = response.data || []
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })
      })
    },
    kecamatan2(val, update, kabupaten, abort) {
      update(() => {
        if (!val) {
          this.options2 = this.list_data_kecamatan2
          return
        }

        axios.get(this.simcard.url.URL_DATAMASTER_KECAMATAN+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_kabupaten: kabupaten  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // console.log('Kecamatan response:', response)
          // Simpan original data
          this.list_data_kecamatan2 = response.data || []
          this.options2 = response.data || []
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })
      })
    },
    desa_kelurahan2(val, update, kecamatan, abort) {
      update(() => {
        if (!val) {
          this.options2 = this.list_data_desa_kelurahan2
          return
        }

        axios.get(this.simcard.url.URL_DATAMASTER_DES_KEL+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_kecamatan: kecamatan  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // console.log('Kecamatan response:', response)
          // Simpan original data
          this.list_data_desa_kelurahan2 = response.data || []
          this.options2 = response.data || []
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })
      })
    },


    provinsi3(val, update, abort) {
      update(() => {
        if (!val) {
          this.options2 = this.list_data_provinsi3
          return
        }

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
          // console.log('Provinsi response:', response)
          // Simpan original data
          this.list_data_provinsi3 = response.data || []
          this.options2 = response.data || []
        })
        .catch(error => {
          console.error('Error fetching provinsi:', error)
        })
      })
    },
    kabupaten3(val, update, provinsi, abort) {
      update(() => {
        if (!val) {
          this.options2 = this.list_data_kabupaten3
          return
        }

        axios.get(this.simcard.url.URL_DATAMASTER_KAB_KOTA+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_provinsi: provinsi  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // console.log('Kabupaten response:', response)
          // Simpan original data
          this.list_data_kabupaten3 = response.data || []
          this.options2 = response.data || []
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })
      })
    },
    kecamatan3(val, update, kabupaten, abort) {
      update(() => {
        if (!val) {
          this.options2 = this.list_data_kecamatan3
          return
        }

        axios.get(this.simcard.url.URL_DATAMASTER_KECAMATAN+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_kabupaten: kabupaten  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // console.log('Kecamatan response:', response)
          // Simpan original data
          this.list_data_kecamatan3 = response.data || []
          this.options2 = response.data || []
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })
      })
    },
    desa_kelurahan3(val, update, kecamatan, abort) {
      update(() => {
        if (!val) {
          this.options2 = this.list_data_desa_kelurahan3
          return
        }

        axios.get(this.simcard.url.URL_DATAMASTER_DES_KEL+'autocomplete', {
          params: {
            q: val,  // ← Dikirim sebagai query parameter
            m_kecamatan: kecamatan  // ← Dikirim sebagai query parameter
          },          
          headers: {
            'Authorization': `kikensbatara ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          // console.log('Kecamatan response:', response)
          // Simpan original data
          this.list_data_desa_kelurahan3 = response.data || []
          this.options2 = response.data || []
        })
        .catch(error => {
          console.error('Error fetching kabupaten:', error)
        })
      })
    },

    async getmasterData(){
      // Panggil action pekerjaan dari Pinia store
      await this.simcard.pekerjaan()
      await this.simcard.agama()
      await this.simcard.pendidikan()
      await this.simcard.shdk() 
    },

 



    cekButton_status_kecamatan: function(data){  
      var a = data.PPD2.status 
      var status_kab = data.PPD2.status_kabupaten  

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

        if (dataKey === 'kabupaten2') params.m_provinsi = this.form.provinsi
        if (dataKey === 'kecamatan2') params.m_kabupaten = this.form.kabupaten
        if (dataKey === 'desa_kelurahan2') params.m_kecamatan = this.form.kecamatan

        if (dataKey === 'kabupaten3') params.m_provinsi = this.form.provinsi_lama
        if (dataKey === 'kecamatan3') params.m_kabupaten = this.form.kabupaten_lama
        if (dataKey === 'desa_kelurahan3') params.m_kecamatan = this.form.kecamatan_lama

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

    async loadInitialProvinsi2() {
      await this.loadInitialData('provinsi2', this.simcard.url.URL_DATAMASTER_WILAYAH + 'list')
    },

    async loadInitialKabupaten2() {
      await this.loadInitialData('kabupaten2', this.simcard.url.URL_DATAMASTER_KAB_KOTA + 'autocomplete', this.form.provinsi)
    },

    async loadInitialKecamatan2() {
      await this.loadInitialData('kecamatan2', this.simcard.url.URL_DATAMASTER_KECAMATAN + 'autocomplete', this.form.kabupaten)
    },

    async loadInitialDesaKelurahan2() {
      await this.loadInitialData('desa_kelurahan2', this.simcard.url.URL_DATAMASTER_DES_KEL + 'autocomplete', this.form.kecamatan)
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

          this.loadInitialProvinsi2()
          this.loadInitialKabupaten2()
          this.loadInitialKecamatan2()
          this.loadInitialDesaKelurahan2()

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

    'form.provinsi': function(newVal) {
      // Ketika provinsi berubah, load ulang kabupaten dan reset kecamatan
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadInitialKabupaten2()
        this.form.kecamatan = ''
        this.form.desa_kelurahan = ''
        this.list_data_kecamatan2 = []
        this.list_data_desa_kelurahan2 = []
      }
    },
    'form.kabupaten': function(newVal) {
      // Ketika kabupaten berubah, load ulang kecamatan dan reset desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadInitialKecamatan2()
        this.form.desa_kelurahan = ''
        this.list_data_desa_kelurahan2 = []
      }
    },
    'form.kecamatan': function(newVal) {
      // Ketika kecamatan berubah, load ulang desa
      // Tapi skip jika sedang loading data dari edit
      if (newVal && !this.isLoadingData) {
        this.loadInitialDesaKelurahan2()
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
