<template>
  <q-page class="flex flex-center column">
    <div>hello Index Page</div>

    <q-btn label="Load Data" @click="getData" class="q-mt-md" />

    <div v-if="loading" class="q-mt-md">
      Loading...
    </div>

    <div v-for="item in list_cek" :key="item.id">
      {{ item.nama }}
    </div>
  </q-page>
</template>

<script>
import { useAppStore } from 'stores/app'

export default {
  name: 'IndexPage',

  computed: {
    store() {
      return useAppStore()
    },

    list_cek() {
      return this.store.list_cek || []
    },

    loading() {
      return this.store.loading
    }
  },

  methods: {
    getData() {
      this.store.getCekStores()
    }
  },

  mounted() {
    this.getData()
  }
}
</script>