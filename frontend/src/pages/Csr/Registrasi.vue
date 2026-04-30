<template>
  <q-page class="regis-bg">
    <!-- HEADER -->
    <!-- TEAM STANDARD HEADER (Clean Style) -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="header-title q-ml-sm text-uppercase text-dark">Registrasi Mitra CSR</div>
    </div>

    <div class="main-content">

      <!-- STEPPER -->
      <q-stepper v-model="step" vertical animated flat class="regis-stepper">

        <!-- STEP 1: PENANGGUNG JAWAB -->
        <q-step :name="1" title="Penanggung Jawab" icon="person" :done="step > 1" done-color="teal">
          <div class="step-desc q-mb-md">Data penanggung jawab perusahaan (PIC)</div>

          <q-input v-model="form.nama" label="Nama Lengkap *" outlined dense class="q-mb-sm field-input"
            :rules="[v => !!v || 'Wajib diisi']" />
          <q-input v-model="form.jabatan" label="Jabatan *" outlined dense class="q-mb-sm field-input"
            :rules="[v => !!v || 'Wajib diisi']" />
          <q-input v-model="form.pic_email" label="Email PIC *" type="email" outlined dense class="q-mb-sm field-input"
            :rules="[v => !!v || 'Wajib diisi']" />
          <q-input v-model="form.pic_hp" label="No. HP PIC *" outlined dense class="q-mb-sm field-input"
            :rules="[v => !!v || 'Wajib diisi']" />

          <q-stepper-navigation>
            <q-btn color="teal" label="Lanjut" @click="step = 2" :disable="!isStep1Valid" unelevated class="step-btn" />
          </q-stepper-navigation>
        </q-step>

        <!-- STEP 2: DATA PERUSAHAAN -->
        <q-step :name="2" title="Data Perusahaan" icon="business" :done="step > 2" done-color="teal">
          <div class="step-desc q-mb-md">Informasi lengkap perusahaan Anda</div>

          <q-input v-model="form.perusahaan_nama" label="Nama Perusahaan *" outlined dense
            class="q-mb-sm field-input" />

          <q-select v-model="form.bidang_usaha_id" :options="bidangOptions" label="Bidang Usaha *" outlined dense
            emit-value map-options class="q-mb-sm field-input" />

          <q-input v-model="form.perusahaan_email" label="Email Perusahaan *" type="email" outlined dense
            class="q-mb-sm field-input" />
          <q-input v-model="form.perusahaan_hp" label="Telepon Perusahaan *" outlined dense
            class="q-mb-sm field-input" />
          <q-input v-model="form.alamat" label="Alamat *" type="textarea" outlined dense autogrow
            class="q-mb-sm field-input" />

          <q-stepper-navigation>
            <q-btn color="teal" label="Lanjut" @click="step = 3" :disable="!isStep2Valid" unelevated class="step-btn" />
            <q-btn flat label="Kembali" @click="step = 1" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>

        <!-- STEP 3: UPLOAD DOKUMEN -->
        <q-step :name="3" title="Upload Dokumen" icon="upload_file" done-color="teal">
          <div class="step-desc q-mb-md">Upload dokumen persyaratan sesuai format yang ditentukan</div>

          <!-- Download Template -->
          <div class="download-box q-mb-md" @click="downloadTemplate">
            <q-icon name="download" size="24px" color="teal" />
            <div class="q-ml-sm">
              <div class="download-title">Download Format Dokumen</div>
              <div class="download-hint">Pastikan dokumen sesuai format</div>
            </div>
            <q-icon name="chevron_right" size="18px" color="grey-5" class="q-ml-auto" />
          </div>

          <!-- File Input -->
          <q-file v-model="form.dokumen" label="Pilih Dokumen (PDF) *" outlined dense accept=".pdf"
            class="q-mb-md field-input">
            <template v-slot:prepend>
              <q-icon name="attach_file" color="teal" />
            </template>
          </q-file>

          <q-stepper-navigation>
            <q-btn color="teal" label="Kirim Permohonan" icon="send" @click="submitRegistration" :loading="submitting"
              :disable="!form.dokumen" unelevated class="step-btn" />
            <q-btn flat label="Kembali" @click="step = 2" class="q-ml-sm" />
          </q-stepper-navigation>
        </q-step>

      </q-stepper>

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notify, Dialog } from 'quasar'
import { CsrService } from 'src/services/csr.service'

const router = useRouter()
const step = ref(1)
const submitting = ref(false)
const bidangOptions = ref([])

const form = ref({
  nama: '',
  jabatan: '',
  pic_email: '',
  pic_hp: '',
  perusahaan_nama: '',
  bidang_usaha_id: null,
  perusahaan_email: '',
  perusahaan_hp: '',
  alamat: '',
  dokumen: null
})

const isStep1Valid = computed(() => {
  return form.value.nama && form.value.jabatan && form.value.pic_email && form.value.pic_hp
})

const isStep2Valid = computed(() => {
  return form.value.perusahaan_nama && form.value.bidang_usaha_id && form.value.perusahaan_email && form.value.perusahaan_hp && form.value.alamat
})

const fetchBidangUsaha = async () => {
  try {
    const res = await CsrService.getBidangUsaha()
    const data = res.data?.data || []
    bidangOptions.value = data.map(b => ({ label: b.uraian, value: b.id }))
  } catch (err) {
    console.error('Gagal fetch bidang usaha:', err)
  }
}

const downloadTemplate = () => {
  // Mengarahkan ke file template yang ada di website CSR Setara
  const fileName = 'Form _Permohonan_Admin CSR-Setara _Perusahaan.pdf'
  const url = `https://csr-setara.konaweselatankab.go.id/assets/template/${encodeURIComponent(fileName)}`
  window.open(url, '_blank')
}

const submitRegistration = () => {
  Dialog.create({
    title: 'Konfirmasi',
    message: 'Apakah data yang Anda isi sudah benar?',
    cancel: true,
    persistent: true,
    ok: { label: 'Ya, Kirim', color: 'teal', unelevated: true },
    cancel: { label: 'Periksa Lagi', flat: true }
  }).onOk(async () => {
    submitting.value = true
    try {
      const formData = new FormData()
      formData.append('nama', form.value.nama)
      formData.append('jabatan', form.value.jabatan)
      formData.append('pic_email', form.value.pic_email)
      formData.append('pic_hp', form.value.pic_hp)
      formData.append('perusahaan_nama', form.value.perusahaan_nama)
      formData.append('bidang_usaha_id', form.value.bidang_usaha_id)
      formData.append('perusahaan_email', form.value.perusahaan_email)
      formData.append('perusahaan_hp', form.value.perusahaan_hp)
      formData.append('alamat', form.value.alamat)
      formData.append('dokumen', form.value.dokumen)

      const res = await CsrService.registerMitra(formData)
      const data = res.data

      if (data.success) {
        Notify.create({
          message: 'Permohonan berhasil dikirim! Admin akan memverifikasi dokumen Anda. Jika diterima, silakan cek email untuk mendapatkan akun.',
          color: 'positive',
          position: 'top',
          timeout: 5000,
          icon: 'check_circle'
        })
        router.push('/csr_dashboard')
      } else {
        Notify.create({
          message: 'Gagal: ' + (data.message || 'Terjadi kesalahan'),
          color: 'negative',
          position: 'top'
        })
      }
    } catch (err) {
      console.error('Gagal registrasi:', err)
      Notify.create({
        message: 'Terjadi kesalahan server. Silakan coba lagi.',
        color: 'negative',
        position: 'top'
      })
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  fetchBidangUsaha()
})
</script>

<style scoped>
.regis-bg {
  background: #f0fdf4;
  min-height: 100vh;
}

/* ─── HEADER STANDAR (Clean Style) ─── */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}

.header-title {
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 1.5px;
}

.main-content {
  padding: 16px;
}

.regis-stepper {
  background: transparent;
}

.regis-stepper :deep(.q-stepper__tab--active .q-stepper__dot) {
  background: #059669;
}

.step-desc {
  font-size: 12px;
  color: #64748b;
}

.field-input :deep(.q-field__control) {
  border-radius: 12px;
}

.step-btn {
  border-radius: 12px;
  padding: 8px 24px;
  font-weight: 700;
}

.download-box {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  border: 1px solid #d1fae5;
  transition: transform 0.2s;
}

.download-box:active {
  transform: scale(0.98);
}

.download-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

.download-hint {
  font-size: 11px;
  color: #94a3b8;
}
</style>
