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
        <div class="row q-col-gutter-sm flex flex-center">
          <div class="col-auto">
            <q-card class="cardBiodata q-pa-md">
              <div class="row items-center justify-between q-mb-md">
                <div class="textBiodata">Biodata</div>
                <q-btn flat round color="grey-7" icon="r_settings" size="20px">
                  <q-menu auto-close transition-show="scale" transition-hide="scale" class="menu-setting">
                    <q-list style="min-width: 120px">

                      <q-item clickable @click="goEdit">
                        <q-item-section avatar>
                          <q-icon name="r_edit" color="warning" size="20px" />
                        </q-item-section>
                        <q-item-section class="text-weight-medium">Edit</q-item-section>
                      </q-item>

                      <q-separator />

                      <q-item clickable>
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

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Nama Lengkap</div>
                  <div class="valueData">Muh. Risal Al-Ihram</div>
                </div>
                <div class="col-6">
                  <div class="labelData">NIK</div>
                  <div class="valueData">7405182106060001</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Jenis Kelamin</div>
                  <div class="valueData">Laki-Laki</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Tanggal Lahir</div>
                  <div class="valueData">21 Mei 2001</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">No. Handphone</div>
                  <div class="valueData">082236027854</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Agama</div>
                  <div class="valueData">Islam</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Kecamatan</div>
                  <div class="valueData">Andoolo Barat</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Desa</div>
                  <div class="valueData">Andoolo Utama</div>
                </div>
              </div>

              <div class="row q-mb-sm">
                <div class="col-12">
                  <div class="labelData">Alamat</div>
                  <div class="valueData">Dusun III Desa Ranooha, Kecamatan Ranomeeto</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Pendidikan</div>
                  <div class="valueData">SMA</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Pekerjaan</div>
                  <div class="valueData">Islam</div>
                </div>
              </div>

              <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6">
                  <div class="labelData">Email</div>
                  <div class="valueData">risalihram58@gmail.com</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Username</div>
                  <div class="valueData">naurariswan</div>
                </div>
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="labelData">Tinggi Badan</div>
                  <div class="valueData">166 cm</div>
                </div>
                <div class="col-6">
                  <div class="labelData">Berat Badan</div>
                  <div class="valueData">57 kg</div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
        <div class="divBtn flex flex-center" @click="goAdd">
          <q-icon name="r_add" color="white" size="40px" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'Biodata',
  data() {
    return {

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
      this.$router.push('/editBiodata');
    }
  }
}
</script>
