<template>
  <q-page class="q-pa-md bg-white pb-xl">
    <!-- Header Berita -->
    <div class="row items-center q-mb-md header-title">
      <q-btn flat round dense icon="keyboard_arrow_left" size="18px" @click="$router.back()" class="q-mr-sm" />
      <div class="text-h5 text-weight-regular text-black">Berita</div>
    </div>

    <!-- Kolom Pencarian -->
    <div class="q-mb-md">
      <q-input
        outlined
        dense
        v-model="searchQuery"
        placeholder="Cari berita terkini..."
        bg-color="grey-1"
        color="primary"
        debounce="600"
        @update:model-value="onSearch"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append v-if="searchQuery">
          <q-icon name="close" @click="searchQuery = ''; onSearch()" class="cursor-pointer" />
        </template>
      </q-input>
    </div>

    <!-- Infinite Scroll Container -->
    <!-- :offset="150" berarti load triggger ketika pengguna mencapai 150px dari bawah -->
    <q-infinite-scroll @load="onLoad" :offset="150" ref="infiniteScrollRef">
      
      <!-- Empty State Pencarian -->
      <div v-if="newsList.length === 0 && allDataLoaded" class="text-center q-py-xl">
        <q-icon name="search_off" size="48px" color="grey-4" class="q-mb-sm" />
        <div class="text-body2 text-grey-6">Berita tidak ditemukan</div>
      </div>

      <!-- List Berita -->
      <div
        v-for="(news, idx) in newsList"
        :key="idx"
        class="row q-mb-md news-item items-start clickable-item"
        @click="$router.push({ path: `/news/${news.id}`, state: { img: news.img, title: news.title, author: news.author, date: news.date, content: news.content } })"
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
      <div v-if="allDataLoaded && newsList.length > 0" class="text-center text-clack-5 q-py-md text-caption">
        Semua berita terkini telah dimuat.
      </div>
    </q-infinite-scroll>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useBeritaStore } from 'src/stores/berita'
import { getImageBerita, formatDate } from 'src/utils/helper'

const beritaStore = useBeritaStore()

const newsList = ref([])
const allDataLoaded = ref(false)
const infiniteScrollRef = ref(null)

const searchQuery = ref('')
const page = ref(1)
const lastPage = ref(1)

const onSearch = () => {
  newsList.value = []
  allDataLoaded.value = false
  page.value = 1
  if (infiniteScrollRef.value) {
    infiniteScrollRef.value.reset() // reset halaman kembali ke 1
    infiniteScrollRef.value.resume()
    infiniteScrollRef.value.trigger()
  }
}

// Fungsi panggilan API Web menggunakan Store
const fetchNews = async () => {
  try {
    const payload = {
      data_ke: page.value,
      cari_value: searchQuery.value || ""
    }
    
    const res = await beritaStore.fetchBerita(payload)
    
    // Sesuaikan format balikan object API -> { data, jml_data }
    const dataApi = res?.data || []
    lastPage.value = res?.jml_data || 1
    
    return dataApi.map((item) => ({
      id: item.id,
      title: item.judul || 'Tanpa Judul',
      author: item.createBy || 'Pemkab Konsel',
      date: formatDate(item.createAt) || 'Waktu tak diketahui',
      img: getImageBerita(item.foto),
      content: item.isi || 'Tidak Ada Konten'
    }))
  } catch (error) {
    console.error('Error memuat berita:', error)
    return []
  }
}

// Handler Infinite Scroll dari API Quasar
const onLoad = async (index, done) => {
  try {
    if (allDataLoaded.value) {
      done(true)
      return
    }

    const dataBatch = await fetchNews()
    
    // Jika data tidak kosong, masukkan
    if (dataBatch && dataBatch.length > 0) {
      newsList.value.push(...dataBatch)
      
      if (page.value >= lastPage.value) {
        allDataLoaded.value = true
        done(true) // parameter true = henti pencarian data bawah
      } else {
        page.value++ // lanjut ke page berikutnya next pass
        done() 
      }
    } else {
      // Tidak ada data kembali
      allDataLoaded.value = true
      done(true)
    }
  } catch (error) {
    console.error('Error memuat berita:', error)
    done()
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
  -webkit-line-clamp: 2;
  line-clamp: 2;
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