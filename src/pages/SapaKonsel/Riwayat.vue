<template>
  <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-white text-black">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
          </q-avatar>
          <span class="sapa_title">
          Riwayat Laporan
          </span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md mulish" style="background-color: #F6F6F6;">
        <div v-if="icons" class="row q-col-gutter-sm">
          <div class="col-12" v-for="icon in icons" :key="icon">
            <q-card class="bg-white full-width no-shadow cursor-pointer" style="border-radius: 10px; opacity: 0.85;" @click="goBack">
              <q-card-section>
                <div class="row">
                  <div class="col-2">
                    <img :src="icon" width="44px" style="display: block;" />
                  </div>

                  <div class="col-10 q-pl-md">
                    <div style="font-size: 16px; font-weight: bold; color: #152C07;">Kekerasan Perempuan</div>
                    <div style="font-size: 12px; color: #5D5C5D;" class="two_line">Telah terjadi tindak pidana pelecehan terhadap perempuan di desa andoolo ......</div>
                    <div style="font-size: 12px; color: #BEBEBE;">29 November 2021 (13.00)</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <div v-else class="column flex-center" style="height: 75vh;">
          <div>
            <img class="q-pb-md" src="~src/assets/sapa/searching.png" width="200">
            
            <div style="font-family: 'Poppins', sans-serif; font-size: 16px; color: #707070; font-weight: 300; opacity: 0.75;">
              Tidak ada riwayat laporan
            </div>
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
  .two_line {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

</style>
