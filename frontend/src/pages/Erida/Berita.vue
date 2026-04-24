<template>
  <q-header bordered class="bg-white text-black">
    <q-toolbar>
      <q-toolbar-title>
        <q-avatar>
          <q-icon name="r_chevron_left" size="35px" color="black" class="cursor-pointer" @click="goBack" />
        </q-avatar>
        <span class="sapa_title">
        Rida News
        </span>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md bg-white pb-xl">
    <!-- 🔍 SEARCH -->
    <div class="q-mb-md">
      <q-input
        v-model="cari"
        placeholder="Cari berita..."
        outlined
        dense
        debounce="500"
        @update:model-value="onSearch"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- 🦴 SKELETON -->
    <div v-if="skeletonLoading">
      <div v-for="n in 10" :key="n" class="row q-mb-md">
        <div class="col-4">
          <q-skeleton height="90px" square />
        </div>
        <div class="col-8 q-pl-md">
          <q-skeleton type="text" width="90%" />
          <q-skeleton type="text" width="70%" />
          <q-skeleton type="text" width="40%" />
        </div>
      </div>
    </div>
    <q-infinite-scroll @load="onLoad" :offset="150" ref="infiniteScrollRef">
      <!-- List Berita -->
      <div
        v-for="(news, idx) in newsList"
        :key="idx"
        class="row q-mb-md news-item items-start clickable-item"
        @click="goDetail(news.id)"
      >
        <div class="col-4">
          <q-img :src="news.img" class="rounded-borders news-img" ratio="1" />
        </div>
        <div class="col-8 q-pl-md column justify-between py-1" style="min-height: 85px">
          <div>
            <div class="text-subtitle2 text-weight-bold line-clamp-2 text-grey-10 lh-tight letter-spacing-tight" style="font-family: serif;">
              {{ news.title }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs text-weight-medium">
              {{ news.author }}
            </div>
          </div>
          <div class="q-mt-xs">
            <q-chip color="blue-2" text-color="blue-8" size="sm" class="q-ma-none text-weight-bold" square>
              {{ news.date }}
            </q-chip>
          </div>
        </div>
      </div>


      <!-- Icon Loading Quasar standar -->
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>

      <!-- Teks indikator habisa data (jika database sudah tersedot semua) -->
      <div v-if="allDataLoaded && newsList.length > 0" class="text-center text-black-5 q-py-md text-caption">
        Tidak ada data terbaru.
      </div>
    </q-infinite-scroll>
  </q-page>
</template>

<script>
import { useEridaStore } from 'stores/erida'
import { getImageUrl, formatDate } from 'src/utils/helper'

export default {
  name: 'EridaNews',

  data() {
    return {
      newsList: [],
      allDataLoaded: false,
      page: 1,
      lastPage: 1,
      cari: '',
      skeletonLoading: true,
      cacheKey: ''
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

    goDetail(id) {
      this.$router.push({
        name: 'detail-berita',
        params: { id }
      })
    },
    
    generateCacheKey() {
      return `berita_${this.cari}`
    },

    async loadData(reset = false) {
      if (this.erida.loading) return

      if (reset) {
        this.page = 1
        this.newsList = []
        this.allDataLoaded = false
      }

      const payload = {
        data_ke: this.page,
        cari_value: this.cari
      }

      const res = await this.erida.fetchBerita(payload)

      // 🔥 IMPORTANT: backend kamu formatnya { data, jml_data }
      const data = res?.data || []
      const totalPage = res?.jml_data || 1

      this.lastPage = totalPage

      if (data.length > 0) {
        const mapped = data.map(item => ({
          id: item.id,
          title: item.judul,
          author: item.createBy || 'Admin',
          img: getImageUrl(item.foto),
          date: formatDate(item.createAt)
        }))

        this.newsList.push(...mapped)

        // 🧠 CACHE
        localStorage.setItem(this.cacheKey, JSON.stringify({
          page: this.page,
          data: this.newsList,
          lastPage: this.lastPage
        }))

        // ✅ STOP CONDITION
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

    // 🔍 SEARCH
    async onSearch() {
      this.cacheKey = this.generateCacheKey()
      this.skeletonLoading = true
      await this.loadData(true)
    },

    // 🧠 CACHE LOAD
    loadCache() {
      this.cacheKey = this.generateCacheKey()

      const cache = localStorage.getItem(this.cacheKey)

      if (cache) {
        const parsed = JSON.parse(cache)

        this.newsList = parsed.data
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

  mounted() {
    this.loadCache()
  }
}
</script>

<style scoped>
.header-title {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
  /* Trick membuat border tembus sampai pinggir meski q-page ada padding */
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;
  padding-right: 16px;
}
.pb-xl {
  padding-bottom: 30px; /* Alokasi bottom navigation di MainLayout */
}
.news-item {
  border-bottom: 1px solid #eeeeee;
  padding-bottom: 16px;
}
.news-img {
  border-radius: 4px; /* Border tajam minimalis sesuai gambar */
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.lh-tight {
  line-height: 1.2;
}
.letter-spacing-tight {
  letter-spacing: -0.2px;
}
.clickable-item {
  cursor: pointer;
  transition: background 0.15s ease;
  border-radius: 6px;
}
.clickable-item:active {
  background-color: #f5f5f5;
}

/* Tablet responsive — batasi ukuran thumbnail berita */
@media (min-width: 600px) {
  .news-item .col-4 {
    max-width: 150px;
    flex: 0 0 150px;
  }
  .news-item .col-8 {
    flex: 1;
    max-width: none;
  }
}

@media (min-width: 900px) {
  .news-item .col-4 {
    max-width: 180px;
    flex: 0 0 180px;
  }
}

</style>