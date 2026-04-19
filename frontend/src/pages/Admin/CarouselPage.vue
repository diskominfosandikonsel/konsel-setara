<template>
  <q-page class="bg-grey-1">
    <!-- Header -->
    <div class="q-pa-md bg-white shadow-1 row items-center">
      <q-btn flat round icon="arrow_back" color="primary" @click="$router.push('/profil')" />
      <h1 class="text-h6 q-ml-sm q-my-none text-weight-bold">Manajemen Slider</h1>
    </div>

    <!-- State: Loading -->
    <div v-if="sliderStore.loading && sliderStore.sliders.length === 0" class="row justify-center q-pt-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <!-- State: Kosong -->
    <div v-else-if="!sliderStore.loading && sliderStore.sliders.length === 0" class="column items-center justify-center q-pt-xl text-grey-6">
      <q-icon name="collections" size="80px" class="q-mb-md" />
      <p class="text-subtitle1 q-mb-xs">Belum ada data slider</p>
      <p class="text-caption">Klik tombol "Upload" untuk menambahkan gambar slider baru.</p>
    </div>

    <!-- Daftar Slider (Drag & Drop) -->
    <div v-else class="q-pa-md">

      <draggable
        v-model="localSliders"
        item-key="id"
        class="row q-col-gutter-md"
        handle=".drag-handle"
        @change="onDragChange"
      >
        <template #item="{ element: item, index }">
          <div class="col-12 col-sm-6">
            <q-card class="no-shadow rounded-borders overflow-hidden" style="border: 1px solid #e0e0e0;">
              <!-- Handle Drag & Gambar -->
              <div class="relative-position">
                <q-img
                  :src="getFullUrl(item.img)"
                  :ratio="16/9"
                  class="bg-grey-3"
                >
                  <template #error>
                    <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
                      <div class="text-center">
                        <q-icon name="broken_image" size="40px" />
                        <div class="text-caption">Gagal memuat gambar</div>
                      </div>
                    </div>
                  </template>
                </q-img>
                <!-- Drag Overlay Handle -->
                <div class="absolute-top-right q-ma-sm drag-handle cursor-move shadow-2" style="background: rgba(255,255,255,0.8); border-radius: 4px; padding: 4px;">
                  <q-icon name="open_with" size="24px" color="primary" />
                </div>
              </div>

              <!-- Info & Aksi -->
              <q-card-section class="q-py-sm">
                <div class="row items-center q-mb-xs">
                  <q-badge color="primary" rounded class="text-weight-bold q-mr-sm" style="font-size: 12px; padding: 3px 10px;">
                    No. {{ index + 1 }}
                  </q-badge>
                  <span class="text-overline text-grey-7">Slider ID: {{ item.id }}</span>
                </div>
                <div class="text-body2 text-primary ellipsis" v-if="item.link">
                  {{ item.link }}
                </div>
                <div class="text-caption text-grey-5 italic" v-else>
                  Tanpa link tujuan
                </div>
                <div class="q-mt-sm row justify-end q-gutter-sm">
                  <q-btn
                    unelevated rounded
                    color="primary"
                    icon="edit"
                    label="Edit"
                    size="sm"
                    @click="openEdit(item)"
                  />
                  <q-btn
                    unelevated rounded
                    color="negative"
                    icon="delete"
                    label="Hapus"
                    size="sm"
                    @click="confirmDelete(item.id)"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </draggable>
    </div>

    <!-- FAB Group: Simpan & Tambah -->
    <q-page-sticky position="bottom-right" :offset="[24, 24]">
      <div class="column q-gutter-y-md items-end">
        <!-- Floating Save Button -->
        <transition appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
          <q-btn
            v-if="orderChanged"
            fab
            icon="save"
            color="positive"
            @click="saveNewOrder"
            :loading="btnLoading"
          >
            <q-tooltip anchor="center left" self="center right">Simpan Urutan Baru</q-tooltip>
          </q-btn>
        </transition>

        <!-- Floating Add Button -->
        <q-btn
          fab
          icon="add"
          color="primary"
          @click="showAddDialog = true"
          aria-label="Tambah Slider"
        >
          <q-tooltip anchor="center left" self="center right">Tambah Slider</q-tooltip>
        </q-btn>
      </div>
    </q-page-sticky>

    <!-- Dialog: Tambah Slider Baru -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 340px; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Tambah Slider Baru</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetForm" />
        </q-card-section>

        <q-form @submit.prevent="handleSubmit">
          <q-card-section class="q-gutter-md">
            <!-- Upload Gambar -->
            <div class="text-caption text-grey-7">Gambar Slider (JPG / PNG)</div>
            <q-file
              v-model="imageFile"
              label="Pilih File Gambar"
              outlined dense
              accept=".jpg,.jpeg,.png"
              :max-file-size="2 * 1024 * 1024"
              @rejected="onFileRejected"
              lazy-rules
              :rules="[val => !!val || 'Gambar wajib dipilih']"
            >
              <template #prepend>
                <q-icon name="image" />
              </template>
            </q-file>

            <!-- Preview gambar sebelum upload -->
            <q-img
              v-if="previewUrl"
              :src="previewUrl"
              ratio="16/9"
              class="rounded-borders bg-grey-3"
              style="border: 1px solid #ddd;"
            />

            <!-- Link tautan (opsional) -->
            <q-input
              v-model="linkInput"
              label="Link Tautan (Opsional)"
              placeholder="https://konaweselatankab.go.id"
              outlined dense
            />

            <div class="bg-blue-1 q-pa-sm rounded-borders text-caption text-blue-9">
              <q-icon name="info" class="q-mr-xs" />
              Sebaiknya Ukuran Gambar 1920x1080 dan Maksimal 2MB.
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-px-md">
            <q-btn flat label="Batal" v-close-popup @click="resetForm" />
            <q-btn
              unelevated rounded
              label="Simpan Slider"
              color="primary"
              type="submit"
              :loading="btnLoading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialog: Edit Slider -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 340px; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Edit Slider</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetEdit" />
        </q-card-section>

        <q-form @submit.prevent="handleUpdate">
          <q-card-section class="q-gutter-md">
            <!-- Preview gambar saat ini -->
            <div class="text-caption text-grey-7">Gambar Saat Ini:</div>
            <q-img
              :src="getFullUrl(editItem?.img)"
              :ratio="16/9"
              class="rounded-borders bg-grey-3"
              style="border: 1px solid #ddd;"
            />

            <!-- Ganti gambar (opsional) -->
            <div class="text-caption text-grey-7 q-mt-sm">Ganti Gambar (Opsional):</div>
            <q-file
              v-model="editImageFile"
              label="Pilih File Baru (kosongkan jika tidak ganti)"
              outlined dense
              accept=".jpg,.jpeg,.png"
              :max-file-size="2 * 1024 * 1024"
              @rejected="onFileRejected"
              clearable
            >
              <template #prepend><q-icon name="image" /></template>
            </q-file>

            <!-- Preview gambar baru jika dipilih -->
            <q-img
              v-if="editPreviewUrl"
              :src="editPreviewUrl"
              ratio="16/9"
              class="rounded-borders bg-grey-3"
              style="border: 1px solid #4caf50;"
            />

            <!-- Edit link -->
            <q-input
              v-model="editLinkInput"
              label="Link Tautan"
              placeholder="https://konaweselatankab.go.id"
              outlined dense
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pb-md q-px-md">
            <q-btn flat label="Batal" v-close-popup @click="resetEdit" />
            <q-btn
              unelevated rounded
              label="Simpan Perubahan"
              color="primary"
              type="submit"
              :loading="btnLoading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useSliderStore } from 'src/stores/slider'
import { api } from 'src/api/api'
import draggable from 'vuedraggable'

const $q = useQuasar()
const sliderStore = useSliderStore()

const localSliders = ref([])
const orderChanged = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const btnLoading = ref(false)
const imageFile = ref(null)
const previewUrl = ref(null)
const linkInput = ref('')

// State untuk edit
const editItem = ref(null)
const editImageFile = ref(null)
const editPreviewUrl = ref(null)
const editLinkInput = ref('')

// Generate preview URL saat file dipilih (tambah)
watch(imageFile, (file) => {
  previewUrl.value = file ? URL.createObjectURL(file) : null
})
// Generate preview URL saat file dipilih (edit)
watch(editImageFile, (file) => {
  editPreviewUrl.value = file ? URL.createObjectURL(file) : null
})

// Update local sliders saat store sliders di-fetch
watch(() => sliderStore.sliders, (newVal) => {
  localSliders.value = [...newVal]
}, { deep: true })

const onDragChange = () => {
  orderChanged.value = true
}

const saveNewOrder = async () => {
  btnLoading.value = true
  try {
    // Siapkan data urutan baru (berdasarkan posisi array 1, 2, 3...)
    const newOrderPayload = localSliders.value.map((item, index) => ({
      id: item.id,
      urutan: index + 1
    }))

    await sliderStore.reorderSliders(newOrderPayload)
    $q.notify({ color: 'positive', message: 'Urutan terbaru berhasil disimpan!' })
    orderChanged.value = false
    await sliderStore.fetchSliders()
  } catch (err) {
    $q.notify({ color: 'negative', message: 'Gagal menyimpan urutan' })
  } finally {
    btnLoading.value = false
  }
}

// Base URL gambar diambil dari config axios di api.js
const IMG_BASE_URL = api.defaults.baseURL.replace(/\/$/, '')

const getFullUrl = (filename) => {
  if (!filename) return ''
  if (filename.startsWith('http')) return filename
  // Jika nama file sudah mengandung 'uploads/', jangan dobel
  if (filename.startsWith('uploads/')) {
    return `${IMG_BASE_URL}/${filename}`
  }
  return `${IMG_BASE_URL}/uploads/${filename}`
}

const resetForm = () => {
  imageFile.value = null
  previewUrl.value = null
  linkInput.value = ''
}

const onFileRejected = () => {
  $q.notify({ color: 'negative', message: 'File ditolak. Pastikan format JPG/PNG dan ukuran < 2MB' })
}

const handleSubmit = async () => {
  if (!imageFile.value) return

  btnLoading.value = true
  try {
    const fd = new FormData()
    fd.append('image', imageFile.value)
    fd.append('link', linkInput.value || '')

    await sliderStore.createSlider(fd)

    $q.notify({ color: 'positive', message: 'Slider berhasil diunggah!' })
    showAddDialog.value = false
    resetForm()
    // Refresh data
    await sliderStore.fetchSliders()
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: err?.response?.data?.message || 'Gagal mengunggah slider' })
  } finally {
    btnLoading.value = false
  }
}

const openEdit = (item) => {
  editItem.value = item
  editLinkInput.value = item.link || ''
  editImageFile.value = null
  editPreviewUrl.value = null
  showEditDialog.value = true
}

const resetEdit = () => {
  editItem.value = null
  editImageFile.value = null
  editPreviewUrl.value = null
  editLinkInput.value = ''
}

const handleUpdate = async () => {
  if (!editItem.value) return

  btnLoading.value = true
  try {
    const fd = new FormData()
    fd.append('link', editLinkInput.value || '')
    if (editImageFile.value) {
      fd.append('image', editImageFile.value)
    }

    await sliderStore.updateSlider(editItem.value.id, fd)

    $q.notify({ color: 'positive', message: 'Slider berhasil diperbarui!' })
    showEditDialog.value = false
    resetEdit()
    await sliderStore.fetchSliders()
  } catch (err) {
    console.error(err)
    $q.notify({ color: 'negative', message: err?.response?.data?.message || 'Gagal memperbarui slider' })
  } finally {
    btnLoading.value = false
  }
}

const confirmDelete = (id) => {
  $q.dialog({
    title: 'Hapus Slider',
    message: 'Yakin ingin menghapus gambar slider ini dari database?',
    cancel: { flat: true, label: 'Batal' },
    ok: { color: 'negative', label: 'Hapus', unelevated: true },
    persistent: true
  }).onOk(async () => {
    try {
      await sliderStore.removeSlider(id)
      $q.notify({ color: 'positive', message: 'Slider berhasil dihapus' })
      await sliderStore.fetchSliders()
    } catch (err) {
      $q.notify({ color: 'negative', message: 'Gagal menghapus data' })
    }
  })
}

onMounted(() => {
  sliderStore.fetchSliders()
})
</script>

<style scoped>
.rounded-borders { border-radius: 12px; }
</style>
