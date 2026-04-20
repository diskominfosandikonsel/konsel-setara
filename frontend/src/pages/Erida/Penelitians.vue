<template>
  <q-page class="q-pa-md">

    <!-- SEARCH -->
    <q-input v-model="store.cari" label="Cari..." @keyup.enter="loadData" />
    <q-btn label="Cari" @click="loadData" />

    <!-- LIST -->
    <div v-for="item in store.list" :key="item.id">
      {{ item.nama }} - {{ item.email }}
    </div>

    <!-- ADD -->
    <q-input v-model="form.nama" label="Nama" />
    <q-input v-model="form.email" label="Email" />

    <input type="file" @change="onFileChange" />

    <q-btn label="Tambah" @click="submit" />

  </q-page>
</template>

<script>
import { usePenelitianStore } from 'stores/erida/penelitian'

export default {
  data() {
    return {
      form: {
        nama: '',
        alamat: '',
        hp: '',
        email: '',
        nik: '',
        file: null
      }
    }
  },

  computed: {
    store() {
      return usePenelitianStore()
    }
  },

  methods: {
    loadData() {
      this.store.fetchData()
    },

    onFileChange(e) {
      this.form.file = e.target.files[0]
    },

    submit() {
      this.store.addData(this.form)
    }
  },

  mounted() {
    this.loadData()
  }
}
</script>