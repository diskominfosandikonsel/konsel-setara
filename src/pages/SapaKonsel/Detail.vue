<template>
  <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-white text-black">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
          </q-avatar>
          <span class="sapa_title">
          Detail Laporan
          </span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md" style="background-color: #F6F6F6;">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-card class="bg-white mulish full-width no-shadow" style="border-radius: 10px; opacity: 0.85;">
              <q-card-section>
                <div class="row q-pb-md q-mb-lg" style="border-bottom: #BEBEBE 0.5px solid;">
                  <div class="col-6" style="font-size: 12px; color: #5D5C5D; font-weight: 600;">
                  Status Laporan
                  </div>
                  <div class="col-6 text-right">
                    <span  style="font-size: 12px; color: #EFBE24; border-radius: 12px; background-color: #FFFCE0; padding: 4px 8px;">
                      Proses
                    </span>
                  </div>
                </div>
                <div class="row q-mb-lg">
                  <div class="col-2">
                    <img src="~src/assets/sapa/process.png" width="44px" style="display: block;" />
                  </div>

                  <div class="col-8 q-pl-sm">
                    <div style="font-size: 16px; font-weight: 600; color: #152C07;">Kekerasan Perempuan</div>
                    <div style="font-size: 14px; color: #5D5C5D;">Kekerasan Fisik</div>
                  </div>
                  <div class="col-2 text-right">
                    <div style="font-size: 12px; color: #BEBEBE;">29.11.25</div>
                    <div style="font-size: 12px; color: #BEBEBE;">13.00</div>
                  </div>
                </div>
                <div class="q-pb-sm" style="font-size: 14px; font-weight: 600; color: #152C07;">
                  Pelapor
                </div>
                <div class="row q-mb-md" style="border: #BEBEBE 0.5px solid; border-radius: 8px; padding: 6px 12px;">
                  <div class="col-2">
                    <img src="~src/assets/sapa/profil.png" width="44px" style="display: block;" />
                  </div>

                  <div class="col-10 q-pl-sm">
                    <div style="font-size: 16px; color: #5D5C5D; font-weight: 600;">Iksan Sinatra</div>
                    <div style="font-size: 12px; color: #BEBEBE; font-weight: 600;">082290374843</div>
                  </div>
                </div>
                <div class="q-pb-sm" style="font-size: 14px; font-weight: 600; color: #152C07;">
                  Keterangan
                </div>
                <div class="q-mb-lg" style="font-size: 12px; font-weight: bold; color: #5D5C5D; padding: 16px; background-color: #FBFBFB; border-radius: 10px;">
                  Telah terjadi kekerasan terhadap perempuan yang terjadi dikecamatan andoolo desa andoolo, pelaku merupakan kerabat dekat korban, harap segera ditindak lanjuti
                </div>
                <div class="row" style="font-size: 14px; font-weight: 600; color: #152C07;">
                  <div class="col-6">
                    Lokasi Laporan
                  </div>
                  <div class="col-6 text-right">
                    <q-icon name="r_keyboard_arrow_down" size="16px" color="#5D5C5D" class="cursor-pointer" @click="goBack" />
                  </div>
                </div>
              </q-card-section>
              <div class="row q-pb-sm q-px-md" style="font-size: 14px; font-weight: 600; color: #152C07;">
                    Dokumentasi Laporan
                </div>
              <img src="https://m.media-amazon.com/images/M/MV5BZTNjOWI0ZTAtOGY1OS00ZGU0LWEyOWYtMjhkYjdlYmVjMDk2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg" />
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script>
import done from 'src/assets/sapa/done.png'
import process from 'src/assets/sapa/process.png'
import cancel from 'src/assets/sapa/cancel.png'

export default {
  name: 'SapaRiwayat',
  data () {
    return {
      icons: [ done, process, cancel, done ]
    }
  },
  methods: {
    goBack () {
      this.$router.back()
    }
  }
}
</script>

<style>
</style>
