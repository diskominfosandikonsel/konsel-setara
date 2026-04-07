<template>
  <q-page class="q-pa-md">

    <!-- 🔍 SEARCH -->
    <q-input
      v-model="sippadu.cari"
      label="Cari laporan..."
      outlined
      dense
      @keyup.enter="onSearch"
      class="q-mb-md"
    />

    <q-btn label="Cari" @click="onSearch" color="primary" />

    <!-- 📊 DATA -->
    <div v-if="sippadu.loading">Loading...</div>

    <div v-else>
      <div v-for="item in sippadu.list_laporan" :key="item.id">
        {{ item.uraian }} - {{ item.createBy }}
      </div>
    </div>

    <!-- 🔢 PAGINATION -->
    <div class="q-mt-md">
      <q-btn label="Prev" @click="prevPage" :disable="sippadu.page === 1" />
      <span class="q-mx-sm">Page {{ sippadu.page }}</span>
      <q-btn label="Next" @click="nextPage" />
    </div>

  </q-page>
</template>

<script>
import { useSippaduStore } from 'stores/sippadu'

export default {
  name: 'NewsPage',

  computed: {
    sippadu() {
      return useSippaduStore()
    }
  },

  methods: {
    loadData() {
      this.sippadu.getLaporan()
    },

    onSearch() {
      this.sippadu.page = 1 // reset page
      this.loadData()
    },

    nextPage() {
      this.sippadu.page++
      this.loadData()
    },

    prevPage() {
      if (this.sippadu.page > 1) {
        this.sippadu.page--
        this.loadData()
      }
    }
  },

  mounted() {
    this.loadData()
  }
}
</script>