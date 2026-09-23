<template>
  <q-page class="konsultasi-page bg-grey-1">
    <q-header elevated class="bg-teal-7 text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.back()" />
        <q-toolbar-title class="text-subtitle1 text-weight-bold">
          Konsultasi Pengadaan
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="q-pa-md container">
      <!-- Card Intro -->
      <q-card class="q-mb-md rounded-borders shadow-1 border-left-green">
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold text-teal-9">
            Saluran Konsultasi & Partisipasi Publik
          </div>
          <div class="text-caption text-grey-7 q-mt-xs">
            Masyarakat dapat menyampaikan pertanyaan, saran teknis, atau klarifikasi terkait rencana umum pengadaan Pemerintah Kabupaten Konawe Selatan.
          </div>
        </q-card-section>
      </q-card>

      <!-- Form Konsultasi -->
      <q-card class="rounded-borders shadow-1">
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md">
            Kirimkan Masukan / Pertanyaan
          </div>

          <q-form @submit="submitForm" class="q-gutter-y-md">
            <q-input
              v-model="form.nama"
              label="Nama Lengkap *"
              outlined
              dense
              :rules="[val => !!val || 'Nama wajib diisi']"
            />

            <q-input
              v-model="form.kontak"
              label="Nomor WhatsApp / Email *"
              outlined
              dense
              :rules="[val => !!val || 'Kontak wajib diisi']"
            />

            <q-select
              v-model="form.kategori"
              :options="kategoriOptions"
              label="Kategori Konsultasi *"
              outlined
              dense
              :rules="[val => !!val || 'Pilih kategori']"
            />

            <q-input
              v-model="form.judul"
              label="Subjek / Terkait Paket Pengadaan *"
              outlined
              dense
              placeholder="Contoh: Pertanyaan Paket Pengadaan Jembatan..."
              :rules="[val => !!val || 'Subjek wajib diisi']"
            />

            <q-input
              v-model="form.pesan"
              label="Uraian Masukan / Pertanyaan *"
              type="textarea"
              outlined
              rows="4"
              placeholder="Tuliskan secara jelas saran, pertanyaan, atau masukan Anda..."
              :rules="[val => !!val || 'Pesan tidak boleh kosong']"
            />

            <div class="q-mt-lg">
              <q-btn
                type="submit"
                label="Kirimkan Konsultasi"
                color="teal-7"
                class="full-width q-py-sm text-weight-bold"
                unelevated
                icon="send"
                :loading="submitting"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export default {
  name: 'KonsultasiPage',
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const submitting = ref(false)

    const form = ref({
      nama: '',
      kontak: '',
      kategori: 'Pertanyaan Teknis RUP',
      judul: '',
      pesan: ''
    })

    const kategoriOptions = [
      'Pertanyaan Teknis RUP',
      'Masukan Spesifikasi Barang/Jasa',
      'Konsultasi Regulasi PBJ',
      'Saran & Partisipasi Publik',
      'Lainnya'
    ]

    const submitForm = () => {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        $q.notify({
          type: 'positive',
          message: 'Konsultasi Anda telah berhasil dikirimkan ke Tim Pengadaan UKPBJ / Dinas terkait.',
          position: 'top',
          timeout: 3000
        })
        form.value = {
          nama: '',
          kontak: '',
          kategori: 'Pertanyaan Teknis RUP',
          judul: '',
          pesan: ''
        }
        router.back()
      }, 1000)
    }

    return {
      form,
      kategoriOptions,
      submitting,
      submitForm
    }
  }
}
</script>

<style scoped lang="scss">
.konsultasi-page {
  min-height: 100vh;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.border-left-green {
  border-left: 4px solid #00a86b;
}
</style>
