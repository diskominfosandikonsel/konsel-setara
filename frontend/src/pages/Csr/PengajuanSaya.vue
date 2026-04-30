<template>
  <q-page class="pengajuan-bg">

    <!-- HEADER -->
    <!-- TEAM STANDARD HEADER (Clean Style) -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="header-title q-ml-sm text-uppercase text-dark">Pengajuan Saya</div>
      <q-space />
      <q-btn flat round dense icon="refresh" color="dark" size="18px" @click="fetchData" />
    </div>

    <div class="main-content">

      <!-- FILTER STATUS -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col">
          <q-select v-model="filterStatus" :options="statusOptions" emit-value map-options outlined dense
            class="filter-select" bg-color="white" @update:model-value="fetchData" />
        </div>
      </div>

      <!-- LOADING -->
      <div v-if="loading">
        <div v-for="n in 3" :key="'skel-' + n" class="pengajuan-card q-mb-md">
          <q-skeleton type="text" width="70%" class="q-mb-xs" />
          <q-skeleton type="text" width="40%" />
          <q-skeleton type="text" width="50%" class="q-mt-sm" />
        </div>
      </div>

      <!-- EMPTY STATE -->
      <div v-else-if="listData.length === 0" class="text-center q-pa-xl">
        <q-icon name="inbox" size="56px" color="grey-4" />
        <div class="text-grey-6 q-mt-sm" style="font-size: 14px;">Belum ada pengajuan program</div>
        <q-btn unelevated rounded color="teal" label="Lihat Program" class="q-mt-md"
          @click="$router.push('/csr_program')" />
      </div>

      <!-- LIST DATA -->
      <div v-else>
        <div v-for="item in listData" :key="item.id" class="pengajuan-card q-mb-md" @click="showDetail(item)">
          <!-- Status Badge -->
          <div class="row items-center justify-between q-mb-xs">
            <q-badge :color="getStatusColor(item.status_pengajuan)" :label="getStatusLabel(item.status_pengajuan)" />
            <span class="text-caption text-grey-6">{{ formatDate(item.tgl_pengajuan) }}</span>
          </div>

          <!-- Nama Program -->
          <div class="text-weight-bold text-dark" style="font-size: 14px; line-height: 1.3;">
            {{ item.nama_kegiatan }}
          </div>
          <div class="text-caption text-blue-8 text-weight-medium q-mt-xs">
            {{ item.uraian_bidang_csr }}
            <span v-if="item.uraian_bidang_sub_csr">, {{ item.uraian_bidang_sub_csr }}</span>
          </div>

          <!-- Jumlah -->
          <div class="row items-center q-mt-sm q-gutter-sm">
            <q-chip size="sm" color="amber-2" text-color="amber-10" icon="shopping_cart" dense>
              Ambil: {{ item.jumlah_ambil }} {{ item.satuan }}
            </q-chip>
            <q-chip size="sm" color="grey-2" text-color="grey-8" icon="inventory" dense>
              Tersedia: {{ item.jumlah_sisa }} {{ item.satuan }}
            </q-chip>
          </div>

          <!-- Actions -->
          <div class="row q-mt-sm q-gutter-xs" @click.stop>
            <!-- Edit (jika pending atau ditolak) -->
            <q-btn v-if="item.status_pengajuan == 1 || item.status_pengajuan == 3" flat dense size="sm" color="orange"
              icon="edit" label="Edit" @click.stop="openEdit(item)" />

            <!-- Upload Bukti (hanya jika diterima) -->
            <q-btn v-if="item.status_pengajuan == 2" flat dense size="sm" color="purple" icon="photo_camera"
              label="Upload Bukti" @click.stop="openUpload(item)" />

            <!-- Hapus (hanya jika pending atau ditolak) -->
            <q-btn v-if="item.status_pengajuan == 1 || item.status_pengajuan == 3" flat dense size="sm" color="negative"
              icon="delete" @click.stop="confirmDelete(item)" />
          </div>

          <!-- Catatan Admin (jika ditolak) -->
          <div v-if="item.status_pengajuan == 3 && item.catatan_admin" class="catatan-admin q-mt-sm">
            <q-icon name="info" size="14px" class="q-mr-xs" />
            {{ item.catatan_admin }}
          </div>
        </div>
      </div>

    </div>

    <!-- ===================== MODAL DETAIL ===================== -->
    <q-dialog v-model="mdlDetail">
      <q-card style="min-width: 350px; max-width: 90vw; border-radius: 16px;">
        <q-card-section class="bg-teal text-white flex items-center q-py-sm">
          <q-icon name="assignment" size="20px" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold">Detail Pengajuan</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedItem" class="q-pa-none">
          <!-- Foto Program -->
          <q-img :src="getImage(selectedItem)" height="180px" class="q-mb-md">
            <div class="absolute-bottom bg-transparent">
              <q-badge :color="getStatusColor(selectedItem.status_pengajuan)"
                :label="getStatusLabel(selectedItem.status_pengajuan)" class="q-pa-xs" style="font-size: 11px;" />
            </div>
          </q-img>

          <div class="q-px-md q-pb-md">
            <!-- Info Program -->
            <div class="text-overline text-teal-8">INFO PROGRAM</div>
            <div class="text-h6 text-dark q-mb-xs" style="line-height: 1.2;">{{ selectedItem.nama_kegiatan }}</div>
            <div class="text-caption text-grey-7 q-mb-md">
              {{ selectedItem.uraian_bidang_csr }}
              <span v-if="selectedItem.uraian_bidang_sub_csr"> | {{ selectedItem.uraian_bidang_sub_csr }}</span>
            </div>

            <q-separator class="q-mb-md" />

            <!-- Grid Info -->
            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-6">
                <div class="text-caption text-grey">Jumlah Ambil</div>
                <div class="text-subtitle2 text-weight-bolder text-orange-9">
                  {{ selectedItem.jumlah_ambil }} {{ selectedItem.satuan }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">Sisa Tersedia</div>
                <div class="text-subtitle2 text-weight-bold">
                  {{ selectedItem.jumlah_sisa }} {{ selectedItem.satuan }}
                </div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey">Tanggal Pengajuan</div>
                <div class="text-subtitle2">{{ formatDate(selectedItem.tgl_pengajuan) }}</div>
              </div>
            </div>

            <!-- Catatan Admin -->
            <div v-if="selectedItem.catatan_admin" class="catatan-box q-mt-sm">
              <div class="text-caption text-weight-bold text-red-9">CATATAN ADMIN:</div>
              <div class="text-body2 italic text-red-10">"{{ selectedItem.catatan_admin }}"</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Tutup" color="grey-7" v-close-popup />
          <q-btn v-if="selectedItem?.status_pengajuan == 3 || selectedItem?.status_pengajuan == 1" unelevated
            label="Edit Pengajuan" color="orange" icon="edit" @click="openEdit(selectedItem)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ===================== MODAL EDIT ===================== -->
    <q-dialog v-model="mdlEdit" persistent>
      <q-card style="min-width: 320px; max-width: 90vw;">
        <q-card-section class="bg-orange text-white">
          <div class="text-h6">Edit Jumlah Pengajuan</div>
        </q-card-section>
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">{{ editItem?.nama_kegiatan }}</div>
          <q-toggle v-model="editAmbilSemua" label="Ambil seluruh kebutuhan" color="amber"
            @update:model-value="onToggleEditSemua" />
          <q-input v-model.number="editJumlah" type="number" outlined dense class="q-mt-sm" label="Jumlah"
            :disable="editAmbilSemua" :max="editItem?.jumlah_sisa" :rules="[
              val => val > 0 || 'Minimal 1',
              val => val <= (editItem?.jumlah_sisa || 0) || 'Melebihi sisa tersedia'
            ]" />
        </q-card-section>
        <q-card-actions align="right" class="bg-grey-2">
          <q-btn flat label="Batal" color="negative" v-close-popup />
          <q-btn unelevated label="Simpan" color="orange" :loading="editLoading" @click="submitEdit"
            :disable="!editJumlah || editJumlah <= 0 || editJumlah > (editItem?.jumlah_sisa || 0)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ===================== MODAL UPLOAD BUKTI ===================== -->
    <q-dialog v-model="mdlUpload" persistent>
      <q-card style="min-width: 340px; max-width: 90vw;">
        <q-card-section class="bg-purple text-white">
          <div class="text-h6">Upload Bukti Program</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="uploadKeterangan" outlined dense label="Keterangan" type="textarea" class="q-mb-md" />
          <q-file v-model="uploadFile" label="Pilih Foto" accept="image/*" outlined dense use-chips>
            <template v-slot:append>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <!-- List bukti yang sudah ada -->
          <div v-if="listBukti.length > 0" class="q-mt-md">
            <div class="text-weight-bold q-mb-xs" style="font-size: 13px;">Bukti yang sudah diupload:</div>
            <div v-for="(bukti, idx) in listBukti" :key="bukti.id" class="row items-center q-mb-sm bukti-row">
              <q-img :src="getBuktiUrl(bukti.file_name)" style="width: 50px; height: 50px; border-radius: 6px;" />
              <div class="col q-ml-sm" style="font-size: 12px;">{{ bukti.keterangan || '(tanpa keterangan)' }}</div>
              <q-btn flat round dense icon="delete" color="negative" size="sm" @click="hapusBukti(bukti.id)" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="bg-grey-2">
          <q-btn flat label="Tutup" color="negative" v-close-popup />
          <q-btn unelevated label="Upload" color="purple" :loading="uploadLoading" @click="submitUpload"
            :disable="!uploadFile" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { CsrService } from 'src/services/csr.service'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

// Data
const loading = ref(true)
const listData = ref([])
const filterStatus = ref('')

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Diproses', value: 1 },
  { label: 'Diterima', value: 2 },
  { label: 'Ditolak', value: 3 },
]

// Detail
const mdlDetail = ref(false)
const selectedItem = ref(null)

// Edit
const mdlEdit = ref(false)
const editItem = ref(null)
const editJumlah = ref(0)
const editAmbilSemua = ref(false)
const editLoading = ref(false)

// Upload
const mdlUpload = ref(false)
const uploadItem = ref(null)
const uploadFile = ref(null)
const uploadKeterangan = ref('')
const uploadLoading = ref(false)
const listBukti = ref([])

const getUserId = () => authStore.user?._id || authStore.user?.id || null

const fetchData = async () => {
  loading.value = true
  try {
    const payload = {
      users_id: getUserId(),
      page_first: 1,
      page_limit: 50,
      cari_value: '',
      status_pengajuan: filterStatus.value || '',
      bidang_csr_id: '',
      bidang_sub_csr_id: ''
    }
    const res = await CsrService.getPengajuanSaya(payload)
    listData.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('Gagal fetch pengajuan:', err)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (s) => {
  const map = { 1: 'orange', 2: 'green', 3: 'red' }
  return map[s] || 'grey'
}

const getStatusLabel = (s) => {
  const map = { 1: 'Diproses', 2: 'Diterima', 3: 'Ditolak' }
  return map[s] || '-'
}

const formatDate = (d) => {
  if (!d) return '-'
  try {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}

const getBuktiUrl = (fileName) => {
  if (!fileName) return ''
  return 'https://server-csr.konaweselatankab.go.id/uploads/' + fileName
}

const getImage = (item) => {
  if (!item) return ''
  const url = CsrService.getImageUrl(item.file_name)
  return url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&auto=format'
}

// Detail
const showDetail = (item) => {
  selectedItem.value = item
  mdlDetail.value = true
}

// Edit
const openEdit = (item) => {
  mdlDetail.value = false // Tutup detail jika buka dari situ
  editItem.value = { ...item }
  editJumlah.value = item.jumlah_ambil
  editAmbilSemua.value = false
  mdlEdit.value = true
}

const onToggleEditSemua = (val) => {
  if (val && editItem.value) {
    // Utamakan jumlah_sisa (sisa stok), jika tidak ada baru jumlah (total)
    editJumlah.value = editItem.value.jumlah_sisa ?? editItem.value.jumlah ?? 0
  }
}

const submitEdit = async () => {
  if (!editItem.value || !editJumlah.value || editJumlah.value <= 0) {
    $q.notify({ type: 'negative', message: 'Jumlah harus minimal 1' })
    return
  }
  editLoading.value = true
  try {
    await CsrService.editPengajuan({
      id: editItem.value.id,
      jumlah_ambil: editJumlah.value
    })
    $q.notify({ type: 'positive', message: 'Pengajuan berhasil diupdate' })
    mdlEdit.value = false
    fetchData()
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Gagal update pengajuan' })
  } finally {
    editLoading.value = false
  }
}

// Upload Bukti
const openUpload = async (item) => {
  uploadItem.value = item
  uploadFile.value = null
  uploadKeterangan.value = ''
  listBukti.value = []
  mdlUpload.value = true

  // Fetch existing bukti
  try {
    const res = await CsrService.getEviden(item.id)
    listBukti.value = res.data?.data || res.data || []
  } catch (err) {
    console.error('Gagal fetch bukti:', err)
  }
}

const submitUpload = async () => {
  if (!uploadFile.value || !uploadItem.value) return

  uploadLoading.value = true
  try {
    const fd = new FormData()
    fd.append('pengajuan_id', uploadItem.value.id)
    fd.append('keterangan', uploadKeterangan.value)
    fd.append('file', uploadFile.value)

    await CsrService.uploadEviden(fd)
    $q.notify({ type: 'positive', message: 'Bukti berhasil diupload' })
    uploadFile.value = null
    uploadKeterangan.value = ''

    // Refresh bukti list
    const res = await CsrService.getEviden(uploadItem.value.id)
    listBukti.value = res.data?.data || res.data || []
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Gagal upload bukti' })
  } finally {
    uploadLoading.value = false
  }
}

const hapusBukti = async (id) => {
  $q.dialog({
    title: 'Hapus Bukti',
    message: 'Yakin ingin menghapus bukti ini?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await CsrService.hapusEviden(id)
      $q.notify({ type: 'positive', message: 'Bukti dihapus' })
      if (uploadItem.value) {
        const res = await CsrService.getEviden(uploadItem.value.id)
        listBukti.value = res.data?.data || res.data || []
      }
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Gagal menghapus' })
    }
  })
}

// Delete Pengajuan
const confirmDelete = (item) => {
  $q.dialog({
    title: 'Hapus Pengajuan',
    message: `Yakin ingin menghapus pengajuan "${item.nama_kegiatan}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await CsrService.removePengajuan(item.id)
      $q.notify({ type: 'positive', message: 'Pengajuan dihapus' })
      fetchData()
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Gagal menghapus pengajuan' })
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.pengajuan-bg {
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

.filter-select {
  border-radius: 10px;
}

.pengajuan-card {
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.15s ease;
}

.pengajuan-card:active {
  transform: scale(0.98);
}

.catatan-admin {
  background: #fef2f2;
  border-left: 3px solid #ef4444;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 12px;
  color: #b91c1c;
  display: flex;
  align-items: flex-start;
}

.bukti-row {
  background: #f8fafc;
  border-radius: 8px;
  padding: 6px 8px;
}

.catatan-box {
  background: #fff5f5;
  border: 1px dashed #feb2b2;
  border-radius: 8px;
  padding: 12px;
}
</style>
