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

    <div class="containerOne" style="padding-top:0px !important;">
      <div class="itemsContainer" style="padding: 0px 20px !important;">
        <div>
          <p class="text-white" style="font-size: 20px; margin-bottom: 0;">{{ $route.name }}</p>
          <p class="text-white" style="font-size: 12px; margin-bottom: 0;">Sistem Informasi Pencatatan dan Pendaftaran
            Penduduk</p>
        </div>
        <div>
          <img src="~assets/simcard/firetap.png" style="width: 92px; height: 92px;" alt="">
        </div>
      </div>
    </div>

    <div class="containerOne" style="padding-top:0px !important;">
      <q-card class="text-white full-width" style="border-radius: 15px; background-color: #FFFFFF; opacity: 0.85;">

        <!-- <div class="text-black text-left" style="padding:10px 10px 0px 15px; font-weight: bold;">Daftar Permohonan</div> -->
        <div class="row items-center no-wrap" style="justify-content: space-between; padding: 0 10px;">
          <input type="text" style="margin-left: 10px; margin-right: 10px; margin-top: 16px; border-radius: 8px; height: auto; flex: 1; padding: 10px 16px; border: 1px solid #C4C4C4;" placeholder="Pencarian" />
          <q-btn round flat icon="info" color="primary" @click="modal_syarat = true" style="margin-top: 16px;">
            <q-tooltip>Lihat Persyaratan Permohonan</q-tooltip>
          </q-btn>
        </div>

        <!-- <input type="text"> -->

        <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;" v-for="(item, index) in list_data"
          :key="index">
          <div class="row items-center no-wrap">

            <div v-if="item.KK1.status === 0" style="color:#6C7278;">
              <img src="~assets/simcard/wait.png" style="width: 100%; height: 56px;" alt="">
            </div>

            <div v-if="item.KK1.status === 1" style="color:#6C7278;">
              <img src="~assets/simcard/succes.png" style="width: 100%; height: 56px;" alt="">
            </div>

            <div v-if="item.KK1.status === 2" style="color:#6C7278;">
              <img src="~assets/simcard/fail.png" style="width: 100%; height: 56px;" alt="">
            </div>

            <div class="flex-break col self-center" style="margin-left: 11px;">
              <div v-if="item.KK1.status === 0" style="color:#000000;font-size: 12px;font-weight: bold;">
                Mohon bersabar, data masih diverifikasi
              </div>
              <div v-if="item.KK1.status === 1" style="color:#000000;font-size: 12px;font-weight: bold;">
                Permohonan Diterima
              </div>
              <div v-if="item.KK1.status === 2" style="color:#000000;font-size: 12px;font-weight: bold;">
                Permohonan Dikembalikan
              </div>
              <div style="color:#6C7278;font-size: 11px;">
                Nama pemohon : {{ item.KK1.nama }}
              </div>
            </div>
            <div class="" style="margin-left: 11px;">

              <div class="text-right" style="margin: 0px 0px 0px 0px ;">

                <!-- Button Icon -->
                <q-btn class="text-right" color="primary" icon="settings">
                  <q-menu>
                    <q-list>
                      <q-item clickable v-close-popup @click="selectData(item), modal_lihat = true ">
                        <q-item-section avatar>
                          <q-icon name="search" color="primary" />
                        </q-item-section>
                        <q-item-section>Detail</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="selectData(item), modal_edit = true ">
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







      </q-card>
    </div>

    <div class="q-pa-md">
      <!-- <q-btn v-touch-repeat.mouse="handleRepeat" class="fab" round color="primary" icon="add"  @click="modal_add = true" /> -->
      <q-btn class="fab" round color="primary" icon="add" @click="modal_add = true" />
    </div>


    <q-dialog v-model="modal_add">
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

            <q-step :name="2" title="Data Pemohon" caption="" icon="create_new_folder" :done="step > 2">
              <div class="q-pa-md">
                <div class="txkecil">
                  Alasan Permohonan: <strong> {{ form.permohonan }}</strong>
                </div>
                <div class="q-gutter-sm txkecil" inline>
                  <q-radio size="xs" v-model="form.permohonan" val="Karena Membentuk Rumah Tangga Baru"
                    label="Karena Membentuk Rumah Tangga Baru" />
                  <q-radio size="xs" v-model="form.permohonan" val="Karena Kartu Keluarga Hilang/Rusak "
                    label="Karena Kartu Keluarga Hilang/Rusak " />
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
              <input v-model="form.tempat_lahir" type="text" placeholder="TEMPAT LAHIR (Ex: Kendari)"
                class="input-form">
              <label class="text-labelku">Tanggal Lahir</label>
              <input v-model="form.tanggal_lahir" type="date" placeholder="TANGGAL LAHIR" class="input-form">

              <label class="text-labelku">Status Hubungan Dalam Keluarga {{ form.status_hubungan_dl_keluarga }}</label>
              <select v-model="form.status_hubungan_dl_keluarga" class="input-form">
                <option disabled value="">- Pilih Status Hubungan -</option>
                <option v-for="(data, index) in simcard.listShdk" :key="index" v-bind:value="data.uraian">{{ data.uraian }}
                </option>
              </select>

              <!-- ================= Agama ===================== -->
              <label class="text-labelku">Agama</label>
              <select v-model="form.agama" class="input-form">
                <option disabled value=""> - Pilih Agama - </option>
                <option v-for="(data, index) in simcard.listAgama" :key="index" v-bind:value="data.uraian">{{ data.uraian }}
                </option>
              </select>
              <template v-if="form.agama == 'Lainnya'">
                <label class="text-labelku">Agama / Kepercayaan Lainnya</label>
                <input v-model="form.agama_lainnya" type="text" placeholder="Agama / Kepercayaan Lainnya"
                  class="input-form">
              </template>
              <!-- ================= Agama ===================== -->
              <!-- ================= Pekerjaan ===================== -->
              <label class="text-labelku">PEKERJAAN</label>
              <select v-model="form.pekerjaan" class="input-form">
                <option value="" disabled> - Pilih PEKERJAAN - </option>
                <option v-for="(data, index) in simcard.listPekerjaan" :key="index" v-bind:value="data.uraian">{{ data.uraian }}
                </option>
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
                <option v-for="(data, index) in simcard.listPendidikan" :key="index" v-bind:value="data.uraian">{{ data.uraian }}
                </option>
              </select>
              <template v-if="form.pendidikan == 'Lainnya'">
                <label class="text-labelku">Pendidikan Lainnya</label>
                <input v-model="form.pendidikan_lainnya" type="text" placeholder="Pendidikan Lainnya"
                  class="input-form">
              </template>
              <!-- ================= Pendidikan ===================== -->


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

              <!-- ================= Alamat ===================== -->
            </q-step> 

            <q-step :name="3" title="Data Anggota keluarga" icon="add_comment" :done="step > 3">
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
                <select v-model="anggota_keluarga.status_hubungan_dl_keluarga" class="input-form">
                  <option disabled value="">- Pilih Status Hubungan -</option>
                  <option v-for="(data, index) in simcard.listShdk" :key="index" :value="data.uraian">
                    {{ data.uraian }}
                  </option>
                </select>

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
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.status_hubungan_dl_keluarga }}</div>
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
              <div v-else style="text-align: center; padding: 20px; color: #999; border: 2px dashed #ddd; border-radius: 8px;">
                <q-icon name="info" size="32px" style="opacity: 0.5; display: block; margin-bottom: 8px;" />
                <p>Belum ada anggota keluarga yang ditambahkan</p>
              </div>

            </q-step>

            <q-step :name="4" title="Data Dukung" icon="add_comment">
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
                <q-btn v-if="step < 4" @click="$refs.stepper.next()" color="primary" label="Continue" />
                <q-btn v-if="step === 4" @click="addData()" color="positive" label="Submit" :loading="loading" />
                <q-btn v-if="step > 1" flat color="primary" @click="$refs.stepper.previous()" label="Back"
                  class="q-ml-sm" />
              </q-stepper-navigation>
            </template>
          </q-stepper>

        </q-card-section>
      </q-card>
    </q-dialog>


    <q-dialog v-model="modal_edit">
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

            <q-step :name="2" title="Data Pemohon" caption="" icon="create_new_folder" :done="step > 2">
              <div class="q-pa-md">
                <div class="txkecil">
                  Alasan Permohonan: <strong> {{ form.permohonan }}</strong>
                </div>
                <div class="q-gutter-sm txkecil" inline>
                  <q-radio size="xs" v-model="form.permohonan" val="Karena Membentuk Rumah Tangga Baru"
                    label="Karena Membentuk Rumah Tangga Baru" />
                  <q-radio size="xs" v-model="form.permohonan" val="Karena Kartu Keluarga Hilang/Rusak "
                    label="Karena Kartu Keluarga Hilang/Rusak " />
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
              <input v-model="form.tempat_lahir" type="text" placeholder="TEMPAT LAHIR (Ex: Kendari)"
                class="input-form">
              <label class="text-labelku">Tanggal Lahir</label>
              <input v-model="form.tanggal_lahir" type="date" placeholder="TANGGAL LAHIR" class="input-form">

              <label class="text-labelku">Status Hubungan Dalam Keluarga {{ form.status_hubungan_dl_keluarga }}</label>
              <select v-model="form.status_hubungan_dl_keluarga" class="input-form">
                <option disabled value="">- Pilih Status Hubungan -</option>
                <option v-for="(data, index) in simcard.listShdk" :key="index" v-bind:value="data.uraian">{{ data.uraian }}
                </option>
              </select>

              <!-- ================= Agama ===================== -->
              <label class="text-labelku">Agama</label>
              <select v-model="form.agama" class="input-form">
                <option disabled value=""> - Pilih Agama - </option>
                <option v-for="(data, index) in simcard.listAgama" :key="index" v-bind:value="data.uraian">{{ data.uraian }}
                </option>
              </select>
              <template v-if="form.agama == 'Lainnya'">
                <label class="text-labelku">Agama / Kepercayaan Lainnya</label>
                <input v-model="form.agama_lainnya" type="text" placeholder="Agama / Kepercayaan Lainnya"
                  class="input-form">
              </template>
              <!-- ================= Agama ===================== -->
              <!-- ================= Pekerjaan ===================== -->
              <label class="text-labelku">PEKERJAAN</label>
              <select v-model="form.pekerjaan" class="input-form">
                <option value="" disabled> - Pilih PEKERJAAN - </option>
                <option v-for="(data, index) in simcard.listPekerjaan" :key="index" v-bind:value="data.uraian">{{ data.uraian }}
                </option>
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
                <option v-for="(data, index) in simcard.listPendidikan" :key="index" v-bind:value="data.uraian">{{ data.uraian }}
                </option>
              </select>
              <template v-if="form.pendidikan == 'Lainnya'">
                <label class="text-labelku">Pendidikan Lainnya</label>
                <input v-model="form.pendidikan_lainnya" type="text" placeholder="Pendidikan Lainnya"
                  class="input-form">
              </template>
              <!-- ================= Pendidikan ===================== -->


              <!-- ================= Alamat ===================== -->
               <label class="text-labelku">Alamat </label>
               {{form.provinsi}}
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
              {{ form.kabupaten }}
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

              {{form.kecamatan}}

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

              {{ form.desa_kelurahan }}

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

              <!-- ================= Alamat ===================== -->
            </q-step> 

            <q-step :name="3" title="Data Anggota keluarga" icon="add_comment" :done="step > 3">
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
                <select v-model="anggota_keluarga.status_hubungan_dl_keluarga" class="input-form">
                  <option disabled value="">- Pilih Status Hubungan -</option>
                  <option v-for="(data, index) in simcard.listShdk" :key="index" :value="data.uraian">
                    {{ data.uraian }}
                  </option>
                </select>

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
                        <div style="font-size: 13px; font-weight: 600; color: #1a202c;">{{ anggota.status_hubungan_dl_keluarga }}</div>
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
              <div v-else style="text-align: center; padding: 20px; color: #999; border: 2px dashed #ddd; border-radius: 8px;">
                <q-icon name="info" size="32px" style="opacity: 0.5; display: block; margin-bottom: 8px;" />
                <p>Belum ada anggota keluarga yang ditambahkan</p>
              </div>

            </q-step>

            <q-step :name="4" title="Data Dukung" icon="add_comment">
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
                <q-btn v-if="step < 4" @click="$refs.stepper.next()" color="primary" label="Continue" />
                <q-btn v-if="step === 4" @click="editData()" color="positive" label="Submit" :loading="loading" />
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
              <!-- Bagian 1: Data Daerah Administratif -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  📍 Daerah Administratif
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Provinsi</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.m_provinsi || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kabupaten</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.m_kabupaten || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kecamatan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.m_kecamatan || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Desa/Kelurahan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.m_desa_kelurahan || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Bagian 2: Alasan Permohonan -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #388E3C; border-bottom: 2px solid #388E3C; padding-bottom: 8px;">
                  ✍️ Alasan Permohonan
                </h5>
                <div style="background-color: #F1F5FE; padding: 12px; border-radius: 8px;">
                  <div style="font-size: 14px; color: #2d3748;">{{ form.permohonan || '-' }}</div>
                  <div v-if="form.permohonan_lainnya" style="font-size: 13px; color: #718096; margin-top: 8px;">
                    <strong>Keterangan:</strong> {{ form.permohonan_lainnya }}
                  </div>
                </div>
              </div>

              <!-- Bagian 3: Data Pemohon -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #F57C00; border-bottom: 2px solid #F57C00; padding-bottom: 8px;">
                  👤 Data Pemohon
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">NO KK</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.no_kk || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">NIK</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.nik || '-' }}</div>
                  </div>
                  <div style="grid-column: 1 / -1;">
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Nama Lengkap</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.nama || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Jenis Kelamin</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.jenis_kelamin || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Tempat Lahir</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.tempat_lahir || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Tanggal Lahir</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.tanggal_lahir || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Status Hubungan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.status_hubungan_dl_keluarga || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Agama</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.agama || (form.agama_lainnya ? form.agama_lainnya : '-') }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Pekerjaan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.pekerjaan || (form.pekerjaan_lainnya ? form.pekerjaan_lainnya : '-') }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Pendidikan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.pendidikan || (form.pendidikan_lainnya ? form.pendidikan_lainnya : '-') }}</div>
                  </div>
                </div>
              </div>

              <!-- Bagian 4: Alamat Pemohon -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #C2185B; border-bottom: 2px solid #C2185B; padding-bottom: 8px;">
                  🏠 Alamat Pemohon
                </h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Provinsi</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.provinsi || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kabupaten</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.kabupaten || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Kecamatan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.kecamatan || '-' }}</div>
                  </div>
                  <div>
                    <div style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">Desa/Kelurahan</div>
                    <div style="font-size: 14px; color: #2d3748;">{{ form.desa_kelurahan || '-' }}</div>
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

              <!-- Bagian 5: Anggota Keluarga -->
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

              <!-- Bagian 6: File Lampiran -->
              <div v-if="form.file_lampiranOld">
                <h5 style="margin: 0 0 16px 0; color: #00897B; border-bottom: 2px solid #00897B; padding-bottom: 8px;">
                  📎 File Lampiran
                </h5>
                <div style="background-color: #E0F2F1; padding: 12px; border-radius: 8px; border-left: 4px solid #00897B;">
                  <div style="font-size: 14px; color: #2d3748;">{{ form.file_lampiranOld }}</div>
                </div>
              </div>

              <!-- Bagian 7: Status dan Tanggal -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #455A64; border-bottom: 2px solid #455A64; padding-bottom: 8px;">
                  📅 Informasi Permohonan
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

        <q-scroll-area style="height: 400px; width: 100%;">
          <q-card-section>
            <div class="q-gutter-md">
              <!-- Persyaratan Umum -->
              <div>
                <h5 style="margin: 0 0 16px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                  📋 Persyaratan Umum
                </h5>
                <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Seluruh Dokumen Harus di scan di satukan dalam bentuk pdf</li>
                  <li>Kartu Tanda Penduduk (KTP) yang masih berlaku</li>
                  <li>Surat Nikah (untuk yang sudah menikah)</li>
                  <li>Akta Kelahiran dari kantor pencatatan sipil</li>
                  <li>Pas Foto 4x6 cm (hitam putih atau berwarna)</li>
                  <li>Surat Keterangan Domisili dari kelurahan setempat</li>
                </ul>
              </div>

            

              <!-- Waktu dan Tempat -->
                <div style="background-color: #E8F5E9; padding: 12px; border-radius: 8px; border-left: 4px solid #4CAF50;">
                  <h5 style="margin: 0 0 8px 0; color: #2E7D32;">🕐 Jam Layanan</h5>
                  <p style="margin: 0; line-height: 1.6; font-size: 13px;">
                    <strong>Senin - Jumat:</strong> 08:00 - 16:00 WIT<br>
                    <!-- <strong>Sabtu:</strong> 08:00 - 12:00 WIT -->
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
  name: 'KK1_list',
  data() {
    return {
      step: 1,
      modal_lihat   : false,
      modal_add   : false,
      modal_edit  : false,
      modal_delete  : false,
      modal_syarat  : false,
      loading: false,
      isLoadingData: false, // Flag untuk menandai apakah sedang load data dari edit
      slide: 1,
      file_lampiran_new: null, // State untuk file baru
      images: [
        'https://cdn.quasar.dev/img/mountains.jpg',
        'https://cdn.quasar.dev/img/parallax1.jpg',
        'https://cdn.quasar.dev/img/parallax2.jpg',
        'https://cdn.quasar.dev/img/quasar.jpg'
      ],
      model: null,
      options: [],
      options2: [],
 

 
      token: localStorage.getItem('token') || '',
 
      listProvinsi: [],
      listKabupaten: [],
      listKecamatan: [],
      listDesaKelurahan: [],
      filtered1: [],
      filtered2: [],
      filtered3: [],
      filtered4: [],

            form: {
              id:'',
              KKref:'',
              id_dari_form:'',

              m_provinsi : '74',
              m_kabupaten : '7405',
              m_kecamatan : '',
              m_desa_kelurahan : '',

              permohonan: '',  
              permohonan_lainnya: '',  

              nama: '',  
              nik: '',  
              no_kk: '',  

              agama:'',
              agama_lainnya:'',
              pekerjaan:'',
              pekerjaan_lainnya:'',
              pendidikan:'',
              pendidikan_lainnya:'',
            
              jenis_kelamin: '',  
              tempat_lahir: '',  
              tanggal_lahir: '', 
              status_hubungan_dl_keluarga:'', 
              

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

              // ADMIN 
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
              email_fileOld   : '',
              email_from      : '',
              email_to        : '',
              email_subject   : '',
              email_html      : '',
              
              // ADMIN 

 
              file              : null, 
              fileThumb         : null, 
              file_lampiran     :null,
              file_lampiranOld  : null,
              anggota_keluarga  : []              
              

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
        status_hubungan_dl_keluarga: '',
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
      user: 'w8moqrskn1bgzpm',
      info: null,


      list_data: [],
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

    onFileLampiranChange(newFile) {
      // Set file baru ke form.file_lampiran
      this.form.file_lampiran = newFile
    },

    async getview() {
      console.log("result getview = ====================");
      var payload = {
        data_ke: this.page_first,
        page_limit: this.page_limit,
        cari_value: this.cari_value,
        createdBy: this.user
      }
      var result = await this.simcard.getView(payload)
      this.list_data = result.data.data; 
    },

    addData() {
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
        this.simcard.url.URL_PERMOHONAN_KK_BARU + "addData",
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
        this.modal_add = false;
        this.file_lampiran_new = null; // Reset file state
      })
      .catch(error => {
        this.loading = false;
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
        this.simcard.url.URL_PERMOHONAN_KK_BARU + "editData",
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
        this.simcard.url.URL_PERMOHONAN_KK_BARU + "removeData",
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

      // Set semua data form
      this.form.id                              = data.KK1.id
      this.form.KKref                           = data.KK1.KKref
      this.form.id_dari_form                    = data.KK1.id_dari_form
      this.form.m_provinsi                      = data.KK1.m_provinsi
      this.form.m_kabupaten                     = data.KK1.m_kabupaten
      this.form.m_kecamatan                     = data.KK1.m_kecamatan
      this.form.m_desa_kelurahan                = data.KK1.m_desa_kelurahan
      this.form.permohonan                      = data.KK1.permohonan
      this.form.permohonan_lainnya              = data.KK1.keterangan_lainnya
      this.form.nama                            = data.KK1.nama
      this.form.nik                             = data.KK1.nik
      this.form.no_kk                           = data.KK1.no_kk
      this.form.alamat                          = data.KK1.alamat
      this.form.rt                              = data.KK1.rt
      this.form.rw                              = data.KK1.rw
      this.form.kode_pos                        = data.KK1.kode_pos

      // Set alamat data SEBELUM trigger watcher
      this.form.provinsi                        = data.KK1.provinsi
      this.form.kabupaten                       = data.KK1.kabupaten
      this.form.kecamatan                       = data.KK1.kecamatan
      this.form.desa_kelurahan                  = data.KK1.desa_kelurahan

      this.form.agama                           = data.KK1.agama
      this.form.agama_lainnya                   = data.KK1.agama_lainnya
      this.form.pekerjaan                       = data.KK1.pekerjaan
      this.form.pekerjaan_lainnya               = data.KK1.pekerjaan_lainnya
      this.form.pendidikan                      = data.KK1.pendidikan
      this.form.pendidikan_lainnya              = data.KK1.pendidikan_lainnya        

      this.form.jenis_kelamin                   = data.KK1.jenis_kelamin
      this.form.tempat_lahir                    = data.KK1.tempat_lahir
      this.form.tanggal_lahir                   = data.KK1.tanggal_lahir
      this.form.status_hubungan_dl_keluarga     = data.KK1.status_hubungan_dl_keluarga

      this.form.anggota_keluarga                = data.databio;  

      this.form.status_kecamatan      = data.KK1.status_kecamatan
      this.form.status_kabupaten      = data.KK1.status_kabupaten
      this.form.keterangan            = data.KK1.keterangan
      this.form.keterangan_deskel     = data.KK1.keterangan_deskel
      this.form.keterangan_kecamatan  = data.KK1.keterangan_kecamatan
      this.form.keterangan_kabupaten  = data.KK1.keterangan_kabupaten

      this.form.emailPemohon          = data.KK1.emailPemohon;
      this.form.email_fileOld         = data.KK1.email_file;
      this.form.email_from            = this.form.email_from;
      this.form.email_to              = this.form.emailPemohon;
      this.form.email_subject         = data.KK1.email_subject;

      this.form.file                  = data.KK1.file
      this.form.fileThumb             = data.KK1.fileThumb
      this.form.file_lampiran         = data.KK1.file_lampiran
      this.form.file_lampiranOld      = data.KK1.file_lampiranOld

      this.form.createdBy             = data.KK1.createdBy
      this.form.createdAt             = data.KK1.createdAt
      this.form.createdAt_deskel      = data.KK1.createdAt_deskel
      this.form.createdAt_kecamatan   = data.KK1.createdAt_kecamatan
      this.form.createdAt_kabupaten   = data.KK1.createdAt_kabupaten

      if (data.KK1.email_html == undefined || data.KK1.email_html == null || data.KK1.email_html == '') {
        this.form.email_html          = ''
      } else {
        this.form.email_html          = data.KK1.email_html; 
      }

      this.wilayah = {
        uraian_provinsi : data.m_provinsi.uraian,
        kd_provinsi : data.m_provinsi.kd_provinsi,
        uraian_kabupaten : data.m_kabupaten.uraian,
        kd_kabupaten : data.m_kabupaten.kd_kabupaten,
        uraian_kecamatan : data.m_kecamatan.uraian,
        kd_kecamatan : data.m_kecamatan.kd_kecamatan,
        uraian_desa_kelurahan : data.m_desa_kelurahan.uraian,
        kd_desa_kelurahan : data.m_desa_kelurahan.kd_desa_kelurahan,
      };         
      this.wilayah_alamat = {
        uraian_provinsi : data.alamat_provinsi.uraian,
        kd_provinsi : data.alamat_provinsi.kd_provinsi,
        uraian_kabupaten : data.alamat_kabupaten.uraian,
        kd_kabupaten : data.alamat_kabupaten.kd_kabupaten,
        uraian_kecamatan : data.alamat_kecamatan.uraian,
        kd_kecamatan : data.alamat_kecamatan.kd_kecamatan,
        uraian_desa_kelurahan : data.alamat_desa_kelurahan.uraian,
        kd_desa_kelurahan : data.alamat_desa_kelurahan.kd_desa_kelurahan,
      };         
      
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
        
        console.log('Alamat Data Loaded:')
        console.log('Kabupaten2:', this.list_data_kabupaten2.length, 'items')
        console.log('Kecamatan2:', this.list_data_kecamatan2.length, 'items')
        console.log('Desa Kelurahan2:', this.list_data_desa_kelurahan2.length, 'items')
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
          console.log('Provinsi response:', response)
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
          console.log('Kabupaten response:', response)
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
          console.log('Kecamatan response:', response)
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
          console.log('Kecamatan response:', response)
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
          console.log('Provinsi response:', response)
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
          console.log('Kabupaten response:', response)
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
          console.log('Kecamatan response:', response)
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
          console.log('Kecamatan response:', response)
          // Simpan original data
          this.list_data_desa_kelurahan2 = response.data || []
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
      var a = data.KK1.status 
      var status_kab = data.KK1.status_kabupaten  

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
          !this.anggota_keluarga.tanggal_lahir || !this.anggota_keluarga.status_hubungan_dl_keluarga || !this.anggota_keluarga.agama ||
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
          status_hubungan_dl_keluarga: this.anggota_keluarga.status_hubungan_dl_keluarga,
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
        status_hubungan_dl_keluarga: this.anggota_keluarga.status_hubungan_dl_keluarga,
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
        status_hubungan_dl_keluarga: anggota.status_hubungan_dl_keluarga,
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
        console.log(`✓ Initial ${dataKey} loaded:`, this[stateKey].length, 'items')
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

    loadfilter() {
          this.loadInitialProvinsi()
          this.loadInitialKabupaten()
          this.loadInitialKecamatan()
          this.loadInitialDesaKelurahan()

          this.loadInitialProvinsi2()
          this.loadInitialKabupaten2()
          this.loadInitialKecamatan2()
          this.loadInitialDesaKelurahan2()
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
    this.getview()
    this.loadfilter()
    this.getmasterData()
    var user = JSON.parse(localStorage.getItem('user') || '')
    var profile = user.profile
    this.form.emailPemohon  = profile.email;
    this.form.email_from    = profile.email;
    // this.form.createdBy     = user._id; 
    this.form.createdBy     = this.user; 
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
  max-height: 70vh;
  overflow-y: auto !important;
  overflow-x: visible !important;
}

/* kalau autocomplete ketutup  */
</style>
