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
      <!-- Card Intro dengan Badge Subtle Tahap Pengembangan -->
      <q-card class="q-mb-md rounded-borders shadow-1 border-left-green">
        <q-card-section>
          <div class="row items-center justify-between q-mb-xs">
            <div class="text-subtitle2 text-weight-bold text-teal-9">
              Saluran Konsultasi Publik
            </div>
            <q-badge color="amber-1" text-color="amber-10" class="text-weight-bold q-py-xs q-px-sm border-amber">
              <q-icon name="construction" size="12px" class="q-mr-xs" />
              Tahap Pengembangan
            </q-badge>
          </div>
          <div class="text-caption text-grey-7">
            Layanan konsultasi ini masih dalam tahap pengembangan. Formulir di bawah ini berfungsi sebagai simulasi pratinjau (dummy).
          </div>
        </q-card-section>
      </q-card>

      <!-- Form Konsultasi Bersih -->
      <q-card class="rounded-borders shadow-1 form-card">
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

            <div class="q-mt-md">
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

    <!-- ══════════════════════════════════════════════ -->
    <!-- DIALOG MODAL ALERT TAHAP PENGEMBANGAN          -->
    <!-- ══════════════════════════════════════════════ -->
    <q-dialog v-model="alertDevDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card class="dev-alert-card text-center q-pa-md">
        <div class="dev-alert-icon-wrap q-mx-auto q-mb-md">
          <q-icon name="construction" size="44px" color="amber-9" />
        </div>

        <div class="text-h6 text-weight-bold text-grey-9 q-mb-xs">
          Fitur Dalam Tahap Pengembangan
        </div>

        <div class="text-caption text-weight-medium text-amber-10 bg-amber-1 q-py-xs q-px-sm rounded-borders dev-pill-simulasi q-mb-md">
          Data Simulasi (Dummy Preview)
        </div>

        <div class="text-body2 text-grey-8 q-mb-md text-left" style="font-size: 13px; line-height: 1.55;">
          Terima kasih atas partisipasi Anda! Layanan <b>Konsultasi Pengadaan Barang & Jasa</b> saat ini masih dalam proses penyempurnaan dan integrasi sistem backend dengan pihak UKPBJ Konawe Selatan.
          <br><br>
          Pertanyaan dan masukan yang Anda kirimkan saat ini <b>belum dapat diproses secara langsung oleh admin</b>.
        </div>

        <div class="row q-gutter-sm">
          <q-btn
            flat
            label="Tetap di Halaman"
            color="grey-7"
            class="col"
            v-close-popup
          />
          <q-btn
            unelevated
            label="Saya Mengerti"
            color="amber-9"
            class="col text-weight-bold text-white shadow-1"
            @click="handleAcknowledge"
          />
        </div>
      </q-card>
    </q-dialog>
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
    const alertDevDialog = ref(false)

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
        // Tampilkan Modal Dialog Tahap Pengembangan
        alertDevDialog.value = true

        // Toast alert pendukung
        $q.notify({
          type: 'warning',
          icon: 'construction',
          message: 'Fitur masih dalam tahap pengembangan (Simulasi Dummy)',
          position: 'top',
          timeout: 3000
        })
      }, 600)
    }

    const handleAcknowledge = () => {
      alertDevDialog.value = false
      form.value = {
        nama: '',
        kontak: '',
        kategori: 'Pertanyaan Teknis RUP',
        judul: '',
        pesan: ''
      }
      router.back()
    }

    return {
      form,
      kategoriOptions,
      submitting,
      alertDevDialog,
      submitForm,
      handleAcknowledge
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

.border-amber {
  border: 1px solid #fcd34d;
}

/* Dialog Alert Tahap Pengembangan */
.dev-alert-card {
  width: 90vw;
  max-width: 380px;
  border-radius: 20px;
}

.dev-alert-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dev-pill-simulasi {
  display: inline-block;
  font-size: 11px;
}
</style>
