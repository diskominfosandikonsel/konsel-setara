<template>
  <q-page class="detail-bg">
    <!-- HEADER -->
    <div class="detail-header">
      <div class="header-overlay"></div>
      <div class="row items-center q-pa-md relative-position z-top">
        <q-btn flat round icon="arrow_back" color="white" class="glass-btn" @click="$router.back()" />
        <div class="q-ml-md text-white text-weight-bold" style="font-size: 16px;">Detail Program</div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="q-pa-md">
      <q-skeleton height="200px" class="rounded-borders q-mb-md" />
      <q-skeleton type="text" width="80%" />
      <q-skeleton type="text" width="60%" />
      <q-skeleton type="text" width="90%" class="q-mt-md" />
    </div>

    <!-- DATA -->
    <div v-else-if="detail" class="q-pa-md">
      <!-- Image -->
      <q-img
        :src="getImage(detail)"
        height="200px"
        class="rounded-borders q-mb-md"
        style="border-radius: 18px;"
      />

      <!-- Status Badge -->
      <div class="q-mb-sm">
        <q-chip
          :color="getStatusColor(detail.status)"
          text-color="white"
          size="sm"
          dense
        >{{ getStatusLabel(detail.status) }}</q-chip>
      </div>

      <!-- Title -->
      <div class="detail-title">{{ detail.nama_csr }}</div>

      <!-- Meta Info Cards -->
      <div class="meta-grid q-mt-md">
        <div class="meta-card" v-if="detail.uraian_bidang_csr">
          <q-icon name="category" size="20px" color="teal" />
          <div>
            <div class="meta-label">Bidang CSR</div>
            <div class="meta-value">{{ detail.uraian_bidang_csr }}</div>
          </div>
        </div>

        <div class="meta-card" v-if="detail.uraian_bidang_sub_csr">
          <q-icon name="subdirectory_arrow_right" size="20px" color="blue" />
          <div>
            <div class="meta-label">Sub Bidang</div>
            <div class="meta-value">{{ detail.uraian_bidang_sub_csr }}</div>
          </div>
        </div>

        <div class="meta-card" v-if="detail.nama_kecamatan">
          <q-icon name="place" size="20px" color="red" />
          <div>
            <div class="meta-label">Lokasi</div>
            <div class="meta-value">{{ detail.nama_desa || '-' }}, {{ detail.nama_kecamatan }}</div>
          </div>
        </div>

        <div class="meta-card" v-if="detail.nilai">
          <q-icon name="payments" size="20px" color="green" />
          <div>
            <div class="meta-label">Nilai</div>
            <div class="meta-value text-weight-bold">{{ formatRupiah(detail.nilai) }} / {{ detail.satuan }}</div>
          </div>
        </div>

        <div class="meta-card" v-if="detail.jumlah">
          <q-icon name="inventory_2" size="20px" color="amber-8" />
          <div>
            <div class="meta-label">Jumlah</div>
            <div class="meta-value">{{ detail.jumlah }} {{ detail.satuan }}</div>
          </div>
        </div>
      </div>

      <!-- TOMBOL AMBIL PROGRAM (khusus perusahaan) -->
      <div v-if="isCompany && detail && (detail.status == 1 || detail.status == 3) && detail.jumlah_sisa > 0" class="q-mt-lg">
        <q-btn unelevated rounded color="orange-8" text-color="white" class="full-width q-py-sm"
          icon="gavel" label="Ambil Program CSR Ini" @click="mdlAmbil = true" />
      </div>

      <!-- Deskripsi -->
      <div class="q-mt-lg" v-if="detail.keterangan">
        <div class="section-title">Keterangan</div>
        <div class="detail-desc" v-html="detail.keterangan"></div>
      </div>

      <!-- Mitra Section -->
      <div class="q-mt-lg" v-if="mitraList.length > 0">
        <div class="section-title">Mitra Terlibat</div>
        <div class="mitra-list">
          <div v-for="(m, idx) in mitraList" :key="idx" class="mitra-item">
            <q-icon name="business" size="18px" color="teal" />
            <div class="q-ml-sm">
              <div class="mitra-name">{{ m.nama_mitra }}</div>
              <div class="mitra-info" v-if="m.jumlah_ambil">{{ m.jumlah_ambil }} {{ detail.satuan }} — {{ formatRupiah(m.nilai) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ERROR -->
    <div v-else class="text-center q-pa-xl">
      <q-icon name="error_outline" size="64px" color="grey-4" />
      <div class="text-grey-5 q-mt-md">Program tidak ditemukan</div>
    </div>

    <!-- MODAL AMBIL PROGRAM -->
    <q-dialog v-model="mdlAmbil" persistent>
      <q-card style="min-width: 320px; max-width: 90vw;">
        <q-card-section class="bg-orange-8 text-white">
          <div class="text-h6">Ambil Program CSR</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <div class="text-subtitle2 text-weight-bold">{{ detail?.nama_csr }}</div>
          <div class="text-caption text-grey-7">Tersedia: {{ detail?.jumlah_sisa }} {{ detail?.satuan }}</div>

          <q-separator class="q-my-sm" />

          <q-toggle v-model="ambilSemua" label="Ambil seluruh kebutuhan" color="amber"
            @update:model-value="onToggleSemua" />

          <q-input v-model.number="jumlahAmbil" type="number" outlined dense class="q-mt-xs"
            label="Jumlah yang ingin diambil" :disable="ambilSemua"
            :rules="[v => v > 0 || 'Minimal 1', v => v <= (detail?.jumlah_sisa || 0) || 'Melebihi jumlah tersedia']" />

          <q-input v-model="catatanAmbil" type="textarea" outlined dense autogrow
            label="Catatan (opsional)" class="q-mt-xs" />
        </q-card-section>
        <q-card-actions align="right" class="bg-grey-2">
          <q-btn flat label="Batal" color="negative" v-close-popup />
          <q-btn unelevated label="Kirim Pengajuan" color="orange-8" :loading="ambilLoading" @click="submitAmbil" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { CsrService } from 'src/services/csr.service'
import { useQuasar } from 'quasar'

const route = useRoute()
const authStore = useAuthStore()
const $q = useQuasar()

const loading = ref(true)
const detail = ref(null)
const mitraList = ref([])

// Company check
const isCompany = computed(() => {
  if (!authStore.user) return false
  const u = authStore.user
  return u.db_csrkonsel == 4 || u.menu_klp == 4 || u.profile?.db_csrkonsel == 4 || u.profile?.menu_klp == 4
})

// Ambil program state
const mdlAmbil = ref(false)
const jumlahAmbil = ref(0)
const ambilSemua = ref(false)
const catatanAmbil = ref('')
const ambilLoading = ref(false)

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await CsrService.getDetailCSR(route.params.id)
    detail.value = res.data?.data || null

    // Try fetch mitra if status allows
    if (detail.value && [2,3,4].includes(detail.value.status)) {
      try {
        const mitraRes = await CsrService.getMitraKegiatan(route.params.id)
        mitraList.value = mitraRes.data?.data || []
      } catch(e) { /* mitra not available */ }
    }
  } catch(err) {
    console.error('Gagal fetch detail CSR:', err)
  } finally {
    loading.value = false
  }
}

const getImage = (item) => {
  const url = CsrService.getImageUrl(item.file_name)
  return url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&auto=format'
}

const getStatusLabel = (status) => {
  const map = { 1: 'Program Baru', 2: 'Dalam Pengerjaan', 3: 'Sebagian', 4: 'Selesai' }
  return map[status] || 'Belum Diketahui'
}

const getStatusColor = (status) => {
  const map = { 1: 'amber-8', 2: 'blue', 3: 'blue-grey', 4: 'green' }
  return map[status] || 'grey'
}

const formatRupiah = (value) => {
  if (!value) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(value)
}

// Ambil Program
const onToggleSemua = (val) => {
  if (val && detail.value) {
    jumlahAmbil.value = detail.value.jumlah_sisa || detail.value.jumlah || 0
  }
}

const submitAmbil = async () => {
  if (!jumlahAmbil.value || jumlahAmbil.value <= 0) {
    $q.notify({ type: 'negative', message: 'Jumlah harus minimal 1' })
    return
  }
  if (jumlahAmbil.value > (detail.value?.jumlah_sisa || 0)) {
    $q.notify({ type: 'negative', message: 'Melebihi jumlah tersedia' })
    return
  }

  ambilLoading.value = true
  try {
    const userId = authStore.user?._id || authStore.user?.id
    await CsrService.addPengajuan({
      kegiatan_csr_id: detail.value.id,
      users_id: userId,
      jumlah_ambil: jumlahAmbil.value,
      catatan_admin: catatanAmbil.value || ''
    })
    $q.notify({ type: 'positive', message: 'Pengajuan berhasil dikirim!' })
    mdlAmbil.value = false
    jumlahAmbil.value = 0
    ambilSemua.value = false
    catatanAmbil.value = ''
    fetchDetail() // Refresh data
  } catch (err) {
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Gagal mengirim pengajuan' })
  } finally {
    ambilLoading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.detail-bg {
  background: #f0fdf4;
  min-height: 100vh;
}

.detail-header {
  position: relative;
  background: linear-gradient(135deg, #065f46, #059669);
  padding-bottom: 12px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(6,78,59,0.2), rgba(16,185,129,0.1));
}

.glass-btn {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(4px);
}

.detail-title {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.4;
}

.meta-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-card {
  background: white;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.meta-label {
  font-size: 11px;
  color: #94a3b8;
}

.meta-value {
  font-size: 13px;
  color: #1e293b;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.detail-desc {
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

.mitra-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mitra-item {
  background: white;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.mitra-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.mitra-info {
  font-size: 11px;
  color: #64748b;
}
</style>
