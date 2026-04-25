<template>
  <!-- <q-layout view="hHh lpR fFf"> -->

    <!-- HEADER -->
    <q-header bordered class="bg-white text-black">
      <q-toolbar>

        <!-- BACK -->
        <q-btn flat round dense icon="r_chevron_left" @click="goBack" />

        <!-- TITLE 1 LINE -->
        <q-toolbar-title class="ellipsis-title">
          {{ news?.title || 'Detail Berita' }}
        </q-toolbar-title>

        <!-- SHARE -->
        <q-btn flat round dense icon="share" size="10px" @click="shareWhatsApp" />

      </q-toolbar>
    </q-header>

    <!-- PAGE -->
    <q-page class="bg-white">

      <!-- 🟡 SKELETON -->
      <div v-if="loading" class="q-px-md q-pb-xl">

        <q-skeleton type="text" width="90%" class="q-mt-md" />
        <q-skeleton type="text" width="70%" class="q-mb-sm" />

        <q-skeleton type="text" width="40%" class="q-mb-xs" />
        <q-skeleton type="text" width="30%" class="q-mb-md" />

        <q-skeleton height="200px" class="q-mb-md" />

        <q-skeleton v-for="n in 6" :key="n" type="text" class="q-mb-xs" />
      </div>

      <!-- 🟢 CONTENT -->
      <div v-else-if="news" class="q-px-md q-pb-xl">

        <!-- TITLE -->
        <div class="news-title q-mt-md q-mb-sm">
          {{ news.title }}
        </div>

        <!-- META -->
        <div class="row news-meta q-mb-md justify-between">
          <div>{{ news.author }}</div>
          <div>{{ news.date }}</div>
        </div>

        <!-- IMAGE -->
        <q-img
          :src="news.img"
          style="height: 200px"
          class="news-cover-img q-mb-md"
        />

        <!-- CONTENT -->
        <div class="news-body" v-html="news.content"></div>
      </div>

    </q-page>

  <!-- </q-layout> -->
</template>

<script>
import { useEridaStore } from 'stores/erida'
import { formatDate, getFileErida } from 'src/utils/helper'

export default {
  name: 'DetailBerita',

  data() {
    return {
      news: null,
      loading: true,
      erida: useEridaStore()
    }
  },

  methods: {
    goBack() {
      this.$router.back()
    },

    async loadData() {
      this.loading = true

      try {
        const item = await this.erida.fetchDetailBerita(this.$route.params.id)

        if (!item) return

        this.news = {
          id: item.id,
          title: item.judul,
          date: formatDate(item.createAt),
          author: item.createBy || 'Admin',
          img: getFileErida(item.foto),
          content: item.isi
        }

      } finally {
        this.loading = false
      }
    },

    shareWhatsApp() {
      if (!this.news) return

      const text = `${this.news.title}\n\nBaca selengkapnya di aplikasi Konsel Setara`
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`

      window.open(url, '_blank')
    }
  },

  mounted() {
    this.loadData()
  },

  watch: {
  '$route.params.id'() {
    this.loadData()
  }
}
}
</script>

<style scoped>
/* HEADER TITLE (1 LINE + ...) */
.ellipsis-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 600;
}

/* CONTENT */
.news-title {
  font-family: serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: #111;
  line-height: 1.35;
}

.news-meta {
  font-size: 0.78rem;
  color: #888;
  text-align: center;
}

.news-cover-img {
  width: 100%;
  border-radius: 6px;
}

/* HTML CONTENT */
.news-body {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.75;
  text-align: justify;
  word-break: break-word;
  overflow-wrap: break-word;
}

.news-body * {
  max-width: 100%;
}

.news-body div {
  margin-bottom: 10px;
}

.news-body img {
  max-width: 100% !important;
  width: auto !important;
  height: auto !important;
  margin: 12px auto;
  border-radius: 8px;
}

.news-body p {
  margin-bottom: 10px;
}

/* SPACING */
.q-pb-xl {
  padding-bottom: 40px;
}

/* SKELETON */
.q-skeleton {
  border-radius: 6px;
}

/* TABLET */
@media (min-width: 600px) {
  .news-title {
    font-size: 1.8rem;
  }
  .news-body {
    font-size: 1.1rem;
  }
  .q-px-md {
    max-width: 720px;
    margin: auto;
  }
}

/* DESKTOP */
@media (min-width: 900px) {
  .news-title {
    font-size: 2rem;
  }
  .news-body {
    font-size: 1.25rem;
  }
  .q-px-md {
    max-width: 800px;
  }
}
</style>