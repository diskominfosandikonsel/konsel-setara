<template>
  <q-layout view="hHh lpR fFf" style="background-color: #F6F6F6;">

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
      <q-page class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-12">

            <div v-if="loading">
              <q-skeleton height="20px" width="50%" class="q-mb-md" />
              <q-skeleton height="80px" class="q-mb-md" />
              <q-skeleton height="60px" class="q-mb-md" />
              <q-skeleton height="120px" class="q-mb-md" />
              <q-skeleton height="200px" />
            </div>

            <div v-else-if="laporan">

              <q-card class="bg-white mulish full-width no-shadow" style="border-radius: 10px; opacity: 0.85;">
                
                <q-card-section>

                  <!-- STATUS -->
                  <div class="row q-pb-md q-mb-lg" style="border-bottom: #BEBEBE 0.5px solid;">
                    <div class="col-6 text-grey-8 text-weight-medium text-caption">
                      Status Laporan
                    </div>
                    <div class="col-6 text-right">
                      <span
                      :style="{
                        ...getStatusStyle(laporan.status),
                        fontSize: '12px',
                        borderRadius: '12px',
                        padding: '5px 10px',
                        fontWeight: '800'
                      }"
                    >
                      {{ getStatusLabel(laporan.status) }}
                    </span>
                    </div>
                  </div>

                  <!-- HEADER -->
                  <div class="row q-mb-lg">

                    <div class="col-2">
                      <img :src="getIcon(laporan.status)" width="44px" />
                    </div>

                    <div class="col-6 q-pl-sm">
                      <div class="text-weight-bold text-dark">
                        {{ laporan.jenis }}
                      </div>
                      <div class="text-grey">
                        {{ laporan.kecamatan }}
                      </div>
                    </div>

                    <div class="col-4 text-right text-grey-8 text-caption" style="line-height: 1.2;">
  
                      <div v-if="laporan.dateMeta.type === 'relative'">
                        {{ laporan.date.text }}
                      </div>

                      <div v-else-if="laporan.dateMeta.type === 'full'">
                        <div>{{ laporan.date.date }}</div>
                        <div style="font-size: 11px; color: #9E9E9E;">
                          {{ laporan.date.time }}
                        </div>
                      </div>

                    </div>

                  </div>

                  <!-- PELAPOR -->
                  <div class="text-weight-bold q-mb-sm">Pelapor</div>

                  <div class="row q-mb-md" style="border: #BEBEBE 0.5px solid; border-radius: 8px; padding: 6px 12px;">
                    <div class="col-2">
                      <img src="~src/assets/sapa/profil.png" width="44px" />
                    </div>

                    <div class="col-10 q-pl-sm">
                      <div class="text-weight-bold text-grey-8">
                        {{ laporan.nama }}
                      </div>
                      <div class="text-grey-6 text-caption">
                        {{ laporan.hp }}
                      </div>
                    </div>
                  </div>

                  <!-- KETERANGAN -->
                  <div class="text-weight-bold q-mb-sm">Keterangan</div>

                  <div class="q-mb-lg text-grey-8" style="padding:16px; background:#FBFBFB; border-radius:10px;">
                    {{ laporan.uraian }}
                  </div>

                  <!-- LOKASI -->
                  <div class="row text-weight-bold">
                    <div class="col-6">Lokasi Laporan</div>
                    <div class="col-6 text-right text-grey">
                      {{ laporan.kecamatan }}
                    </div>
                  </div>

                </q-card-section>

                <!-- IMAGE -->
                <div class="q-px-md q-pb-md">
                  <div class="text-weight-bold q-mb-sm">Dokumentasi Laporan</div>

                  <q-img
                    :src="laporan.img || 'https://via.placeholder.com/300'"
                    style="border-radius:10px;"
                  />
                </div>

              </q-card>

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

import { formatDateTime, getImageUrl } from 'src/utils/helper'

export default {
  name: 'DetailRiwayat',

  data () {
    return {
      laporan: null,
      loading: true,
      sapa: useSapaStore()
    }
  },

  methods: {
    goBack () {
      this.$router.back()
    },

    getIcon (status) {
      if (status === 'selesai') return done
      if (status === 'proses') return process
      return cancel
    },

    getStatusLabel (status) {
      if (status === 'selesai') return 'Selesai'
      if (status === 'proses') return 'Proses'
      return 'Ditolak'
    },

    getStatusStyle (status) {
      if (status === 'selesai') {
        return {
          background: '#E0FFF0',
          color: '#5EDE99'
        }
      }

      if (status === 'proses') {
        return {
          background: '#FFFCE0',
          color: '#EFBE24'
        }
      }

      return {
        background: '#FFE0E0',
        color: '#F26666'
      }
    },

    async loadData () {
      this.loading = true

      try {
        const item = await this.sapa.fetchDetailLaporan(this.$route.params.id)

        if (!item) return

        const formatted = formatDateTime(item.createAt)

        this.laporan = {
          id: item.id,
          jenis: item.jenis_uraian,
          uraian: item.uraian,
          status: item.status,
          dateMeta: formatted,
          nama: item.nama_pelapor || 'Anonim',
          hp: item.hp_pelapor || '-',
          kecamatan: item.kecamatan_nama,
          img: getImageUrl(item.file)
        }

      } catch (err) {
        console.error('Gagal fetch detail', err)
      } finally {
        this.loading = false
      }
    }
  },

  mounted () {
    this.loadData()
  },

  watch: {
    '$route.params.id' () {
      this.loadData()
    }
  }
}
</script>

<style>
</style>
