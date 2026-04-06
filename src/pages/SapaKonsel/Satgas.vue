<template>
  <q-layout view="hHh lpR fFf">

    <q-header bordered class="bg-white text-black">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
          </q-avatar>
          <span class="sapa_title">
          Satgas PPA
          </span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md mulish" style="background-color: #F6F6F6;">
        <div v-if="sapa.loading" class="text-center q-mt-md">
          Loading...
        </div>
        <div v-else-if="sapa.pengguna.length" class="row q-col-gutter-sm">
          <div class="col-12" v-for="item in sapa.pengguna" :key="item.id">
            <q-card
              class="bg-white full-width no-shadow cursor-pointer"
              style="border-radius: 10px; opacity: 0.85;"
              @click="goBack"
            >
              <q-card-section>
                <div class="row">
                  <div class="col-2">
                    <img :src="profil" width="44px" />
                  </div>

                  <div class="col-10 q-pl-md">
                    <div style="font-size: 16px; font-weight: bold;">
                      {{ item.nama }}
                    </div>

                    <div style="font-size: 12px;" class="two_line">
                      {{ item.email }}
                    </div>

                    <div style="font-size: 12px;">
                      {{ item.hp }}
                    </div>
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
import { useSapaStore } from 'stores/sapa'
import profil from 'src/assets/sapa/profil.png'

export default {
  name: 'SapaSatgas',

  data() {
    return {
      profil,
      cari: '',
      page: 1,
    }
  },

  computed: {
    sapa() {
      return useSapaStore()
    }
  },

  methods: {
    goBack() {
      this.$router.back()
    },
    loadData() {
      this.sapa.fetchPengguna({
        cari_value: this.cari,
        data_ke: this.page
      })
    },
  },

  mounted() {
    this.loadData()
  }
}
</script>

<style>

</style>
