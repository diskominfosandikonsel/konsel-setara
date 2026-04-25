<template>
  <q-page class="bg-white">

    <!-- Header -->
    <div class="row items-center q-px-md header-title">
      <q-btn flat round dense icon="keyboard_arrow_left" size="18px" @click="$router.back()" class="q-mr-sm" />
      <div class="text-h5 text-weight-regular text-black text-capitalize">
        {{ news?.type || 'Informasi' }}
      </div>
    </div>

    <!-- Content -->
    <div v-if="news" class="q-px-md q-pb-xl">

      <!-- Judul Berita -->
      <div 
        class="news-title q-mt-md q-mb-sm"
        :class="{ 'is-pengumuman': news.type === 'pengumuman' }"
      >
        {{ news.title }}
      </div>

      <!-- Meta: tanggal & penulis -->
      <div class="news-meta q-mb-md">
        <div>Dibuat Pada {{ news.date }}</div>
        <div>{{ news.author }}</div>
      </div>

      <!-- Gambar Utama (Sembunyikan jika Pengumuman) -->
      <q-img
        v-if="news.type !== 'pengumuman'"
        :src="news.img"
        class="news-cover-img q-mb-md"
        :ratio="16/9"
        fit="cover"
      />

      <!-- Isi Artikel berformat HTML (Membutuhkan v-html) -->
      <div class="news-body" v-html="news.content"></div>

      <!-- File Attachment / Unduh PDF (Hanya untuk Pengumuman) -->
      <div v-if="news.type === 'pengumuman' && news.fileUrl" class="q-mt-lg q-mb-md">
        <q-card flat bordered class="bg-grey-1 rounded-borders">
          <q-card-section class="row items-center q-pa-sm">
            <q-avatar icon="picture_as_pdf" text-color="red" size="md" />
            <div class="col q-ml-sm">
              <div class="text-weight-bold text-subtitle2">Lampiran Dokumen</div>
            </div>
            <div class="row q-gutter-xs">
              <q-btn flat round color="primary" icon="visibility" @click="openPdf(news.fileUrl)">
                <q-tooltip>Lihat Dokumen</q-tooltip>
              </q-btn>
              <q-btn flat round color="secondary" icon="download" @click="downloadPdf(news.fileUrl)">
                <q-tooltip>Unduh Dokumen</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>

    </div>

    <!-- Loading State -->
    <div v-else class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="48px" />
    </div>



    <!-- Modal Dialog Preview PDF Internal -->
    <q-dialog v-model="showPdfModal" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="column full-height">
        <q-toolbar class="bg-primary text-white">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-subtitle1 text-weight-bold" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {{ news?.title || 'Preview Dokumen' }}
          </q-toolbar-title>
          <q-btn flat round dense icon="download" @click="downloadPdf(news.fileUrl)" />
        </q-toolbar>

        <q-card-section class="col q-pa-none bg-grey-2 relative-position">
          <iframe 
            v-if="showPdfModal && news?.fileUrl" 
            :src="news.fileUrl" 
            width="100%" 
            height="100%" 
            frameborder="0"
            style="border: none; position: absolute; top: 0; left: 0;"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { BeritaService } from 'src/services/berita.service'
import { getImageBerita, formatDate } from 'src/utils/helper'

const route = useRoute()
const news = ref(null)
const showPdfModal = ref(false)

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
      content: state.content || '',
      type: state.type || 'berita',
      fileUrl: state.fileUrl || ''
    }
  }

  // Jika detail konten tidak ada dalam memory list (misal dibuka langsung dari link atau halaman di-refresh)
  if (!state?.img || !state?.content) {
    try {
      // 1. Coba cari di API Berita terlebih dahulu
      const response = await BeritaService.getBerita()
      const dataApi = response.data?.data || response.data || []
      
      let item = dataApi.find(n => n.id == id)
      let currentType = 'berita'

      // 2. Jika tidak ketemu di list Berita, cari di Pengumuman (karena id-nya ID pengumuman)
      if (!item) {
        const responsePengumuman = await BeritaService.getPengumuman()
        const dataApiPengumuman = responsePengumuman.data?.data || responsePengumuman.data || []
        item = dataApiPengumuman.find(n => n.id == id)
        if (item) currentType = 'pengumuman'
      }

      if (item) {
        news.value = {
          id,
          title: item.judul || 'Tanpa Judul',
          author: item.createBy || 'Admin',
          date: formatDate(item.createAt) || 'Waktu tak diketahui',
          img: currentType === 'pengumuman' ? 'icons/pdf_logo.svg' : getImageBerita(item.foto),
          content: item.isi || 'Tidak ada konten.',
          type: currentType,
          fileUrl: getImageBerita(item.file || item.foto)
        }
      }
    } catch (e) {
      console.error("Gagal mendapatkan rincian API:", e)
    }
  }

})

// Buka PDF di modal internal
const openPdf = (url) => {
  showPdfModal.value = true
}

// Download trick PDF
const downloadPdf = (url) => {
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', '') // Beberapa modern browser memungkinkan ini untuk force download
  // Jika cross-origin, setidaknya terbuka di window terpisah
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
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

.news-title.is-pengumuman {
  font-size: 1.0rem;
  text-align: justify;
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
  .news-title.is-pengumuman {
    font-size: 1.2rem;
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
  .news-title.is-pengumuman {
    font-size: 1.5rem;
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
