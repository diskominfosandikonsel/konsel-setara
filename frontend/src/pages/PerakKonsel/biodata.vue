<template>
  <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-white text-black">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
          </q-avatar>
          <span class="headerText">Biodata Pencaker</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md" style="background-color: #FFFFFF;">
        <div v-if="loading" class="flex flex-center q-pa-xl">
          <q-spinner-dots color="primary" size="40px" />
        </div>
        <div v-else-if="perak.biodata && perak.biodata.length > 0" class="row q-col-gutter-sm flex flex-center">
          <div class="col-auto">
            <q-card class="cardBiodata q-pa-md">
              <div class="row items-center justify-between">
                <div class="textBiodata">Biodata Pencaker</div>
                <q-btn flat round color="grey-7" icon="r_settings" size="14px">
                  <q-menu auto-close transition-show="scale" transition-hide="scale" class="menu-setting">
                    <q-list style="min-width: 120px">
                      <q-item clickable @click="goEdit">
                        <q-item-section avatar>
                          <q-icon name="r_edit" color="warning" size="20px" />
                        </q-item-section>
                        <q-item-section class="text-weight-medium">Edit</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item clickable @click="confirmDelete">
                        <q-item-section avatar>
                          <q-icon name="r_delete" color="negative" size="20px" />
                        </q-item-section>
                        <q-item-section class="text-weight-medium">Hapus</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <q-separator class="q-mb-md" />

              <div class="row justify-center q-mb-lg">
                <div class="col-auto text-center">
                  <q-img
                    :src="perak.urlFoto + perak.biodata[0].file"
                    spinner-color="primary"
                    style="height: 160px; width: 110px; border-radius: 8px; border: 2px solid #eeeeee;"
                  >
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                        <q-icon name="r_person" size="50px" />
                        <div style="font-size: 10px">No Image</div>
                      </div>
                    </template>
                  </q-img>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Nama Lengkap</div>
                  <div class="valueData">{{ perak.biodata[0].nama }}</div>
                </div>
                <div class="col-6">
                  <div class="labelData">NIK</div>
                  <div class="valueData">{{ perak.biodata[0].nik }}</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Tempat Lahir</div>
                  <div class="valueData">{{ perak.biodata[0].tmp_lahir }}</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Tanggal Lahir</div>
                  <div class="valueData">{{ tglConvert(perak.biodata[0].tgl_lahir) }}</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Jenis Kelamin</div>
                  <div class="valueData">{{ perak.biodata[0].jns_kelamin }}</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Agama</div>
                  <div class="valueData">{{ perak.biodata[0].uraian_agama }}</div>
                </div>
              </div>

              <div class="row q-mb-sm">
                <div class="col-12">
                  <div class="labelData">Alamat</div>
                  <div class="valueData">{{ perak.biodata[0].alamat }}</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Dusun</div>
                  <div class="valueData">{{ perak.biodata[0].dusun || '-' }}</div>
                </div>
                <div class="col-6">
                  <div class="labelData">RT / RW</div>
                  <div class="valueData">{{ perak.biodata[0].rt_rw || '-' }}</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Kecamatan</div>
                  <div class="valueData">{{ perak.biodata[0].nama_kecamatan }}</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Desa / Kelurahan</div>
                  <div class="valueData">{{ perak.biodata[0].nama_des_kel }}</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">No. Handphone</div>
                  <div class="valueData">{{ perak.biodata[0].hp }}</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Email</div>
                  <div class="valueData">{{ perak.biodata[0].email }}</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Status Perkawinan</div>
                  <div class="valueData">{{ perak.biodata[0].uraian_perkawinan }}</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Kode Pos</div>
                  <div class="valueData">{{ perak.biodata[0].kode_pos || '-' }}</div>
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="labelData">Tinggi Badan</div>
                  <div class="valueData">{{ perak.biodata[0].tinggi_bdn }} cm</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Berat Badan</div>
                  <div class="valueData">{{ perak.biodata[0].berat_bdn }} kg</div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
        <div v-else class="column justify-center items-center q-pa-xl" style="min-height: 70vh;">
          <q-img
              src="/img/no_data.png"
              fit="contain"
              style="width: 120px; height: 120px;"
              no-spinner
          />
          <div class="text-subtitle1 text-grey-6 q-mt-md text-weight-medium">
              Tidak ada data ditemukan
          </div>
          <div class="divBtn flex flex-center" @click="goAdd">
            <q-icon name="r_add" color="white" size="40px" />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { usePerakStore } from 'stores/perak'
import { formatDate } from '../../utils/library'

export default {
  name: 'Biodata',
  data() {
    return {
      loading: false,
      page_first: 1,
      cari_value: ''
    }
  },
  computed: {
    perak() {
      return usePerakStore()
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    goAdd() {
      this.$router.push('/tambahBiodata');
    },
    goEdit() {
      const dataYangMauDiedit = this.perak.biodata[0]
      this.perak.selectData(dataYangMauDiedit)
      this.$router.push('/editBiodata');
    },
    async loadData() {
      const payload = {
          data_ke: this.page_first,
          cari_value: this.cari_value,
      }
      await this.perak.fetchBiodata(payload)
    },
    confirmDelete() {
      this.$q.dialog({
        title: 'Konfirmasi Hapus',
        message: 'Apakah Anda yakin ingin menghapus data?',
        cancel: {
          color: 'grey',
          label: 'Batal',
          flat: true
        },
        ok: {
          color: 'negative',
          label: 'Hapus',
          unelevated: true
        },
        persistent: true
      }).onOk(async () => {
        const data = this.perak.biodata[0]
        // Langsung panggil action hapus di Pinia
        await this.perak.removeData(data.id, data.file)
      })
    },
    tglConvert(tgl) {
      return formatDate(tgl)
    }
  },
  mounted() {
    this.loadData()
  }
}
</script>
