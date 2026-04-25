<template>
  <!-- HEADER -->
  <q-header bordered class="bg-white text-black">
    <q-toolbar>
      <q-btn flat round dense icon="r_chevron_left" @click="goBack" />
      <q-toolbar-title>Kegiatan</q-toolbar-title>
    </q-toolbar>
  </q-header>

  <q-page class="q-pa-md bg-white pb-xl">
    <q-input
      v-model="cari"
      dense
      outlined
      placeholder="Cari data..."
      debounce="500"
      @update:model-value="onSearch"
    >
      <template v-slot:append>
        <q-icon name="search" size="17px" />
      </template>

      <template v-slot:append v-if="cari">
        <q-icon
          name="close"
          class="cursor-pointer"
          size="17px"
          @click="clearSearch"
        />
      </template>
    </q-input>

    <!-- 🦴 SKELETON GRID -->
    <div v-if="skeletonLoading" class="grid q-mt-md">
      <div v-for="n in 15" :key="n" class="img-card">
        <q-skeleton height="120px" square />
      </div>
    </div>

    <!-- 📸 GRID + INFINITE -->
    <q-infinite-scroll
      v-else
      @load="onLoad"
      :offset="150"
      ref="infiniteScrollRef"
      class="q-mt-md"
    >
      <div class="grid">
        <div
          v-for="(img, i) in images"
          :key="i"
          class="img-card"
          @click="openImage(img)"
        >
          <q-img :src="img.url" ratio="1" class="img-thumb" />
        </div>
      </div>

      <!-- LOADING -->
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots size="40px" color="primary" />
        </div>
      </template>

      <!-- END -->
      <div
        v-if="allDataLoaded && images.length > 0"
        class="text-center text-grey-5 q-py-md text-caption"
      >
        Tidak ada data lagi
      </div>
    </q-infinite-scroll>

    <!-- 🔍 EMPTY -->
    <div v-if="!skeletonLoading && images.length === 0" class="text-center q-mt-lg text-grey-5">
      Tidak ada kegiatan ditemukan
    </div>

    <!-- 🖼 MODAL -->
    <q-dialog v-model="showDialog">
      <q-card style="background-color: #3b82f6;">
        <q-card-section class="q-pa-none">
          <img :src="selectedImage" class="full-image" />
          <div class="text-caption text-white text-center q-mb-sm q-px-md py-1" style="font-size: 11px;">
            {{ selectedImageTitle }}
          </div>
        </q-card-section>

        <q-btn
          icon="close"
          flat
          round
          dense
          class="absolute-top-right q-ma-sm bg-white"
          style="color: #3b82f6;"
          @click="showDialog = false"
        />
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { useEridaStore } from 'stores/erida'
import { getFileErida } from 'src/utils/helper'

export default {
  name: 'EridaGallery',

  data() {
    return {
      images: [],
      page: 1,
      lastPage: 1,
      allDataLoaded: false,
      cari: '',
      skeletonLoading: true,

      showDialog: false,
      selectedImage: null,
      selectedImageTitle: '',
    }
  },

  computed: {
    erida() {
      return useEridaStore()
    }
  },

  methods: {
    goBack() {
      this.$router.back()
    },

    openImage(img) {
      this.selectedImage = img.url;
      this.selectedImageTitle = img.title;
      this.showDialog = true;
    },

    async loadData(reset = false) {
      if (this.erida.loading) return

      if (reset) {
        this.page = 1
        this.images = []
        this.allDataLoaded = false
      }

      const payload = {
        data_ke: this.page,
        cari_value: this.cari
      }

      const res = await this.erida.fetchImage(payload)

      const data = res?.data || []
      this.lastPage = res?.jml_data || 1

      if (data.length > 0) {
        const mapped = data.map(item => ({
          id: item.id,
          url: getFileErida(item.foto),
          title: item.judul
        }))

        this.images.push(...mapped)

        if (this.page >= this.lastPage) {
          this.allDataLoaded = true
        }
      } else {
        this.allDataLoaded = true
      }

      this.skeletonLoading = false
    },

    async onLoad(index, done) {
      if (this.allDataLoaded) {
        done(true)
        return
      }

      this.page++
      await this.loadData()

      this.allDataLoaded ? done(true) : done()
    },

    clearSearch() {
      this.cari = "";
      this.onSearch();
    },

    async onSearch() {
      this.skeletonLoading = true
      await this.loadData(true)
    }
  },

  mounted() {
    this.loadData(true)
  }
}
</script>

<style scoped>
.pb-xl {
  padding-bottom: 30px;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

/* CARD */
.img-card {
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}

.img-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* FULL IMAGE */
.full-image {
  width: 100%;
  max-height: 100vh;
  object-fit: contain;
}

/* TABLET */
@media (min-width: 600px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* DESKTOP */
@media (min-width: 900px) {
  .grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

</style>