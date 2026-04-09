<template>
  <q-page class="q-pa-md">

    <!-- 🔍 SEARCH -->
    <q-input
      v-model="store.cari"
      label="Cari..."
      outlined
      dense
      @keyup.enter="loadData"
      class="q-mb-md"
    />

    <q-btn label="Cari" @click="loadData" color="primary" class="q-mb-md" />

    <!-- ➕ ADD -->
    <q-btn label="Tambah Data" color="positive" @click="openDialog()" />

    <!-- 📊 LIST -->
    <div v-if="store.loading" class="q-mt-md">Loading...</div>

    <div v-else>
      <div v-for="item in store.list" :key="item.id" class="q-mb-sm">

        <q-card>
          <q-card-section>
            <div>{{ item.title }}</div>

            <!-- FILE -->
            <img
              v-if="isImage(item.file)"
              :src="fileUrl(item.file)"
              width="100"
            />

            <a
              v-else-if="item.file"
              :href="fileUrl(item.file)"
              target="_blank"
            >
              Lihat File
            </a>
          </q-card-section>

          <q-card-actions>
            <q-btn flat label="Edit" @click="openDialog(item)" />
            <q-btn flat label="Hapus" color="negative" @click="remove(item.id)" />
          </q-card-actions>
        </q-card>

      </div>
    </div>

    <!-- 📝 DIALOG -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Edit' : 'Tambah' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.title" label="Title" />

          <input type="file" @change="onFileChange" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Save" color="primary" @click="submit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { useLaporanStore } from 'stores/laporan'

export default {
  name: 'LaporanPage',

  data() {
    return {
      dialog: false,
      form: {
        id: null,
        title: '',
        file: null
      }
    }
  },

  computed: {
    store() {
      return useLaporanStore()
    }
  },

  methods: {
    loadData() {
      this.store.fetchData()
    },

    openDialog(data = null) {
      if (data) {
        this.form = { ...data, file: null }
      } else {
        this.form = { id: null, title: '', file: null }
      }

      this.dialog = true
    },

    onFileChange(e) {
      this.form.file = e.target.files[0]
    },

    async submit() {
      if (this.form.id) {
        await this.store.editData(this.form.id, this.form)
      } else {
        await this.store.addData(this.form)
      }

      this.dialog = false
    },

    remove(id) {
      this.store.deleteData(id)
    },

    fileUrl(file) {
      return 'https://konsel-setara.konaweselatankab.go.id/uploads/' + file
    },

    isImage(file) {
      return file && file.match(/\.(jpg|jpeg|png)$/)
    }
  },

  mounted() {
    this.loadData()
  }
}
</script>