<template>
  <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-white text-black">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
          </q-avatar>
          <span class="sapa_title">
          Satgas PPPA
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
                    <div style="font-size: 16px; font-weight: bold; color: #152C07;">Riswan M Rizal</div>
                    <div style="font-size: 12px; color: #5D5C5D;" class="two_line">Kecamatan Palangga</div>
                    <div style="font-size: 12px; color: #BEBEBE;">082290374843</div>
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
              Tidak ada data
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script>
import profil from 'src/assets/sapa/profil.png'

export default {
  name: 'SapaSatgas',
  data () {
    return {
      icons: [ profil, profil, profil, profil ]
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
