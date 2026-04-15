<template>
  <q-page class="bg-white">

    <!-- Header -->
    <div class="row items-center q-px-md header-title">
      <q-btn flat round dense icon="keyboard_arrow_left" size="18px" @click="$router.back()" class="q-mr-sm" />
      <div class="text-h5 text-weight-regular text-black">Berita</div>
    </div>

    <!-- Content -->
    <div v-if="news" class="q-px-md q-pb-xl">

      <!-- Judul Berita -->
      <div class="news-title q-mt-md q-mb-sm">
        {{ news.title }}
      </div>

      <!-- Meta: tanggal & penulis -->
      <div class="news-meta q-mb-md">
        <div>Dibuat Pada {{ news.date }}</div>
        <div>{{ news.author }}</div>
      </div>

      <!-- Gambar Utama -->
      <q-img
        :src="news.img"
        class="news-cover-img q-mb-md"
        :ratio="16/9"
        fit="cover"
      />

      <!-- Isi Artikel berformat HTML (Membutuhkan v-html) -->
      <div class="news-body" v-html="news.content"></div>

    </div>

    <!-- Loading State -->
    <div v-else class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="48px" />
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { BeritaService } from 'src/services/berita.service'
import { getImageBerita, formatDate } from 'src/utils/helper'

const route = useRoute()
const news = ref(null)

onMounted(async () => {
  const id = route.params.id

  // Ambil data yang diteruskan dari NewsPage via router state (instan, tanpa loading)
  const state = window.history.state

  if (state?.img) {
    // Data sudah ada dari list — tampilkan segera
    news.value = {
      id,
      title: state.title || 'Memuat judul...',
      date: state.date || '',
      author: state.author || '',
      img: state.img,
      content: state.content || ''
    }
  }

  // Jika detail konten tidak ada dalam memory (misal dibuka langsung dari link)
  if (!state?.img || !state?.content) {
    try {
      const response = await BeritaService.getBerita()
      const dataApi = response.data?.data || response.data || []
      
      const item = dataApi.find(n => n.id == id)
      if (item) {
        news.value = {
          id,
          title: item.judul || 'Tanpa Judul',
          author: item.createBy || 'Admin',
          date: formatDate(item.createAt) || 'Waktu tak diketahui',
          img: getImageBerita(item.foto),
          content: item.isi || 'Tidak ada konten.'
        }
      }
    } catch (e) {
      console.error("Gagal mendapatkan rincian API:", e)
    }
  }
})
</script>


<style scoped>
.header-title {
  border-bottom: 1px solid #e0e0e0;
  padding-top: 14px;
  padding-bottom: 14px;
  margin-left: 0;
  margin-right: 0;
}

.news-title {
  font-family: serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: #111111;
  line-height: 1.35;
  letter-spacing: -0.3px;
}

.news-meta {
  font-size: 0.78rem;
  color: #888888;
  text-align: center;
  line-height: 1.6;
}

.news-cover-img {
  width: 100%;
  border-radius: 6px;
}

.news-body {
  font-size: 0.93rem;
  color: #333333;
  line-height: 1.4;
  text-align: justify;
}

/* Mengatur spesifik jarak bawaan tag <p> dari v-html */
:deep(.news-body p) {
  margin-bottom: 1rem;
}


/* Tablet responsive — perbesar font dan batasi lebar konten */
@media (min-width: 600px) {
  .news-title {
    font-size: 1.8rem;
    line-height: 1.4;
  }
  .news-meta {
    font-size: 1rem;
  }
  .news-body {
    font-size: 1.1rem;
    line-height: 1.85;
  }
  .news-cover-img {
    border-radius: 10px;
  }
  .q-px-md {
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
  }
}

@media (min-width: 900px) {
  .news-title {
    font-size: 2.0rem;
    line-height: 1.45;
  }
  .news-meta {
    font-size: 1.15rem;
  }
  .news-body {
    font-size: 1.3rem;
    line-height: 1.9;
  }
  .q-px-md {
    max-width: 800px;
  }
}
</style>
