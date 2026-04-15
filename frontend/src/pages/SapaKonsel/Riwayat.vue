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

        <div v-if="skeletonLoading">
          <q-skeleton v-for="n in 4" :key="n" height="80px" class="q-mb-sm" />
        </div>

        <div v-else-if="laporanList.length">

          <div class="row q-col-gutter-sm">
            <div class="col-12" v-for="item in laporanList" :key="item.id">

              <q-card
                class="bg-white full-width no-shadow cursor-pointer"
                style="border-radius: 10px; opacity: 0.85;"
                @click="goDetail(item.id)"
              >
                <q-card-section>
                  <div class="row">

                    <div class="col-2">
                      <img :src="getIcon(item.status)" width="44px" />
                    </div>

                    <div class="col-10 q-pl-md">
                      <div style="font-size: 16px; font-weight: bold; color: #152C07;">
                        {{ item.jenis_uraian }}
                      </div>

                      <div class="two_line" style="font-size: 12px; color: #5D5C5D;">
                        {{ item.uraian }}
                      </div>

                      <div style="font-size: 12px; color: #BEBEBE;">
                        {{ item.createAt }}
                      </div>
                    </div>

                  </div>
                </q-card-section>
              </q-card>

            </div>
          </div>

          <q-infinite-scroll
            @load="onLoad"
            :offset="100"
            :disable="allDataLoaded"
          >
            <template v-slot:loading>
              <div class="row justify-center q-my-md">
                <q-spinner />
              </div>
            </template>
          </q-infinite-scroll>

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
import { useSapaStore } from 'stores/sapa'
import done from 'src/assets/sapa/done.png'
import process from 'src/assets/sapa/process.png'
import cancel from 'src/assets/sapa/cancel.png'

export default {
  name: 'SapaRiwayat',

  data () {
    return {
      sapa: useSapaStore(),

      laporanList: [],
      page: 1,
      lastPage: 1,
      allDataLoaded: false,
      cari: '',
      skeletonLoading: true,
      cacheKey: ''
    }
  },

  methods: {
    goBack () {
      this.$router.back()
    },

    goDetail(id) {
      this.$router.push({
        name: 'detail-riwayat',
        params: { id }
      })
    },

    getIcon (status) {
      if (status === 'selesai') return done
      if (status === 'proses') return process
      return cancel
    },

    generateCacheKey () {
      const user = JSON.parse(localStorage.user || '{}')
      const userId = user._id || 'guest'

      return `riwayat_${userId}_${this.cari}`
    },

    async loadData (reset = false) {
      if (this.sapa.loading) return

      if (reset) {
        this.page = 1
        this.laporanList = []
        this.allDataLoaded = false
      }

      const payload = {
        data_ke: this.page,
        cari_value: this.cari
      }

      await this.sapa.fetchLaporan(payload)

      const data = this.sapa.laporan || []
      const totalPage = this.sapa.lastPage || 1

      this.lastPage = totalPage

      if (data.length > 0) {
        // karena store sudah append, kita cukup assign
        this.laporanList = [...this.sapa.laporan]

        localStorage.setItem(this.cacheKey, JSON.stringify({
          page: this.page,
          data: this.laporanList,
          lastPage: this.lastPage
        }))

        if (this.page >= this.lastPage) {
          this.allDataLoaded = true
        }

      } else {
        this.allDataLoaded = true
      }

      this.skeletonLoading = false
    },

    async onLoad (index, done) {
      if (this.allDataLoaded) {
        done(true)
        return
      }

      this.page++

      await this.loadData()

      this.allDataLoaded ? done(true) : done()
    },

    async onSearch () {
      this.cacheKey = this.generateCacheKey()
      this.skeletonLoading = true
      await this.loadData(true)
    },

    loadCache () {
      this.cacheKey = this.generateCacheKey()

      const cache = localStorage.getItem(this.cacheKey)

      if (cache) {
        const parsed = JSON.parse(cache)

        this.laporanList = parsed.data
        this.page = parsed.page
        this.lastPage = parsed.lastPage || 1

        if (this.page >= this.lastPage) {
          this.allDataLoaded = true
        }

        this.skeletonLoading = false
      } else {
        this.loadData(true)
      }
    }
  },

  mounted () {
    this.loadCache()
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