<template>
  <q-page class="q-pa-md bg-white pb-xl">
    <!-- Header Berita -->
    <div class="row items-center q-mb-lg header-title">
      <q-btn flat round dense icon="keyboard_arrow_left" size="18px" @click="$router.back()" class="q-mr-sm" />
      <div class="text-h5 text-weight-regular text-black">Berita</div>
    </div>

    <!-- Infinite Scroll Container -->
    <!-- :offset="150" berarti load triggger ketika pengguna mencapai 150px dari bawah -->
    <q-infinite-scroll @load="onLoad" :offset="150" ref="infiniteScrollRef">
      <!-- List Berita -->
      <div
        v-for="(news, idx) in newsList"
        :key="idx"
        class="row q-mb-md news-item items-start clickable-item"
        @click="$router.push({ path: `/news/${news.id}`, state: { img: news.img, title: news.title, author: news.author, date: news.date } })"
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

const newsList = ref([])
const allDataLoaded = ref(false)

// Fungsi mock panggilan API
// limit = 10 berarti default ambil 10 berita sesuai permintaan
const fetchNews = async (page, limit = 10) => {
  
  // GANTI BAGIAN INI DENGAN FUNGSI API DARI DATABASE ASLI ANDA
  // Contoh: 
  // const response = await api.get(`/endpoint-berita?page=${page}&limit=${limit}`)
  // return response.data
  
  return new Promise((resolve) => {
    // Simulasi delay pemuatan data 1,5 detik
    setTimeout(() => {
      const dbHalaman = []
      // Menghasilkan dummy data
      for(let i = 1; i <= limit; i++) {
        const id = ((page - 1) * limit) + i
        dbHalaman.push({
          id,
          title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
          author: 'Pemkab Konawe Selatan',
          date: '1 Years ago',
          img: `https://picsum.photos/300/300?random=${id}`
        })
      }
      resolve(dbHalaman)
    }, 1000)
  })
}

// Handler Infinite Scroll dari API Quasar
const onLoad = async (index, done) => {
  try {
    // index bernilai urutan per-halaman yang langsung dikasih Quasar secara matematis (1, 2, 3...)
    const dataBatch = await fetchNews(index, 10)
    
    // Jika data tidak kosong, masukkan
    if (dataBatch && dataBatch.length > 0) {
      newsList.value.push(...dataBatch)
      
      // Simulasi batasan total database (Misal hanya ada 30 data berita)
      // Hal ini agar animasi load berhenti ketika seluruh berita habis di database.
      if (newsList.value.length >= 25) {
        allDataLoaded.value = true
        done(true) // parameter true = henti pencarian data bawah
      } else {
        done() // teruskan pemantauan scorll untuk load API part selanjutnya
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