<template>
  <q-page class="mitra-bg">
    <!-- HEADER -->
    <div
      class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header"
    >
      <q-btn
        flat
        round
        dense
        icon="chevron_left"
        color="dark"
        size="18px"
        @click="$router.back()"
      />
      <div class="header-title q-ml-sm text-uppercase text-dark">
        Mitra Resmi CSR
      </div>
    </div>

    <div class="main-content">
      <!-- FILTER: Bidang Usaha -->
      <div class="q-mb-md">
        <div class="text-weight-bold text-dark q-mb-sm" style="font-size: 14px">
          Filter Bidang Usaha
        </div>
        <div class="filter-scroll">
          <q-chip
            :outline="!selectedBidang"
            :color="!selectedBidang ? 'teal' : 'grey-4'"
            :text-color="!selectedBidang ? 'white' : 'grey-7'"
            clickable
            @click="selectBidang(null)"
            class="filter-chip"
            >Semua</q-chip
          >
          <q-chip
            v-for="b in listBidang"
            :key="b.id"
            :outline="selectedBidang === b.id"
            :color="selectedBidang === b.id ? 'teal' : 'grey-4'"
            :text-color="selectedBidang === b.id ? 'white' : 'grey-7'"
            clickable
            @click="selectBidang(b.id)"
            class="filter-chip"
            >{{ b.uraian }}</q-chip
          >
        </div>
      </div>

      <!-- SEARCH -->
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Cari nama perusahaan..."
        bg-color="white"
        class="q-mb-md search-input"
        @update:model-value="debouncedSearch"
      >
        <template v-slot:prepend>
          <q-icon name="search" color="grey-5" />
        </template>
        <template v-slot:append>
          <q-icon
            v-if="searchQuery"
            name="close"
            class="cursor-pointer"
            color="grey-5"
            @click="
              searchQuery = '';
              applyFilter();
            "
          />
        </template>
      </q-input>

      <!-- INFO TOTAL -->
      <div class="text-caption text-grey-6 q-mb-sm">
        {{ filteredMitra.length }} perusahaan ditemukan
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="q-mt-md">
        <div v-for="n in 4" :key="'skel-' + n" class="mitra-card-skel q-mb-sm">
          <div class="row items-center no-wrap q-pa-md">
            <q-skeleton type="circle" size="48px" />
            <div class="col q-ml-md">
              <q-skeleton type="text" width="70%" />
              <q-skeleton type="text" width="45%" class="q-mt-xs" />
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div v-else-if="filteredMitra.length === 0" class="text-center q-py-xl">
        <q-icon name="business" size="64px" color="grey-4" />
        <div class="text-grey-5 q-mt-md" style="font-size: 14px">
          Tidak ada perusahaan ditemukan
        </div>
      </div>

      <!-- LIST PERUSAHAAN -->
      <div v-else>
        <div
          v-for="item in filteredMitra"
          :key="item.id"
          class="mitra-card q-mb-sm"
          @click="openProgramModal(item)"
        >
          <div class="row items-center no-wrap">
            <q-avatar size="48px" class="mitra-avatar">
              <img v-if="item.file_name" :src="getLogoUrl(item.file_name)" />
              <q-icon v-else name="business" size="24px" color="teal" />
            </q-avatar>
            <div class="col q-ml-md">
              <div class="mitra-nama">{{ item.perusahaan_nama }}</div>
              <div class="mitra-bidang">{{ item.bidang_usaha || "-" }}</div>
            </div>
            <q-icon name="chevron_right" size="20px" color="grey-5" />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ MODAL: PROGRAM PERUSAHAAN ═══ -->
    <q-dialog v-model="showProgramModal" position="bottom" maximized>
      <q-card class="modal-card">
        <q-card-section class="modal-header">
          <div class="row items-center no-wrap">
            <q-avatar size="36px" class="mitra-avatar q-mr-sm">
              <img
                v-if="selectedMitra?.file_name"
                :src="getLogoUrl(selectedMitra.file_name)"
              />
              <q-icon v-else name="business" size="18px" color="teal" />
            </q-avatar>
            <div class="col">
              <div
                class="text-weight-bold text-dark"
                style="font-size: 14px; line-height: 1.2"
              >
                {{ selectedMitra?.perusahaan_nama }}
              </div>
              <div class="text-caption text-grey">Program CSR Terlibat</div>
            </div>
            <q-btn flat round dense icon="close" color="grey" v-close-popup />
          </div>
        </q-card-section>
        <q-card-section
          class="modal-body q-pa-sm"
          style="max-height: 70vh; overflow-y: auto"
        >
          <div v-if="loadingProgMitra" class="q-pa-lg text-center">
            <q-spinner-dots size="32px" color="teal" />
          </div>
          <div
            v-else-if="programMitra.length === 0"
            class="q-pa-lg text-center text-grey"
          >
            <q-icon name="info" size="32px" class="q-mb-sm" />
            <div>Belum ada program yang diikuti</div>
          </div>
          <div v-else>
            <div
              v-for="p in programMitra"
              :key="p.id"
              class="prog-mitra-card q-mb-sm"
              @click="goDetailProgram(p.id)"
            >
              <div class="row items-start no-wrap">
                <q-img
                  :src="getImage(p)"
                  width="70px"
                  height="70px"
                  class="rounded-borders"
                  style="flex-shrink: 0"
                />
                <div class="col q-ml-md">
                  <div class="prog-mitra-title">{{ p.nama_csr }}</div>
                  <div class="prog-mitra-bidang">
                    {{ p.uraian_bidang_csr || "-" }}
                  </div>
                  <q-chip
                    :color="getStatusColor(p.status)"
                    text-color="white"
                    size="xs"
                    dense
                    class="q-mt-xs"
                    >{{ getStatusLabel(p.status) }}</q-chip
                  >
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { CsrService } from "src/services/csr.service";

const router = useRouter();

const loading = ref(true);
const allMitra = ref([]);
const searchQuery = ref("");
const selectedBidang = ref(null);
const listBidang = ref([]);

// Program modal
const showProgramModal = ref(false);
const selectedMitra = ref(null);
const programMitra = ref([]);
const loadingProgMitra = ref(false);

let debounceTimer = null;
const debouncedSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => applyFilter(), 300);
};

const filteredMitra = computed(() => {
  let result = allMitra.value;
  if (selectedBidang.value) {
    result = result.filter((m) => m.bidang_usaha_id === selectedBidang.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (m) =>
        m.perusahaan_nama?.toLowerCase().includes(q) ||
        m.bidang_usaha?.toLowerCase().includes(q),
    );
  }
  return result;
});

const selectBidang = (id) => {
  selectedBidang.value = id;
};

const applyFilter = () => {
  // filtering is reactive via computed, no extra action needed
};

const fetchMitra = async () => {
  loading.value = true;
  try {
    const res = await CsrService.getMitraResmi();
    allMitra.value = res.data?.data || [];
  } catch (err) {
    console.error("Gagal fetch mitra resmi:", err);
  } finally {
    loading.value = false;
  }
};

const fetchBidangUsaha = async () => {
  try {
    const res = await CsrService.getBidangUsaha();
    listBidang.value = res.data?.data || [];
  } catch (err) {
    console.error("Gagal fetch bidang usaha:", err);
  }
};

const openProgramModal = async (mitra) => {
  selectedMitra.value = mitra;
  showProgramModal.value = true;
  loadingProgMitra.value = true;
  try {
    const res = await CsrService.getProgramMitra(mitra.users_id);
    programMitra.value = res.data?.data || [];
  } catch (err) {
    console.error("Gagal fetch program mitra:", err);
  } finally {
    loadingProgMitra.value = false;
  }
};

const goDetailProgram = (id) => router.push("/csr_detail/" + id);

const getLogoUrl = (fileName) => {
  if (!fileName) return "";
  if (fileName.startsWith("http")) return fileName;
  return "https://server-csr.konaweselatankab.go.id/uploads/logo/" + fileName;
};

const getImage = (item) => {
  const url = CsrService.getImageUrl(item.file_name);
  return (
    url ||
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&auto=format"
  );
};

const getStatusLabel = (status) => {
  const map = { 1: "Baru", 2: "Proses", 3: "Sebagian", 4: "Selesai" };
  return map[status] || "-";
};

const getStatusColor = (status) => {
  const map = { 1: "amber-8", 2: "blue", 3: "blue-grey", 4: "green" };
  return map[status] || "grey";
};

onMounted(() => {
  fetchBidangUsaha();
  fetchMitra();
});
</script>

<style scoped>
.mitra-bg {
  background: #f0fdf4;
  min-height: 100vh;
}

/* ─── HEADER ─── */
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

/* ─── FILTER ─── */
.filter-scroll {
  display: flex;
  overflow-x: auto;
  gap: 6px;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.filter-scroll::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  flex-shrink: 0;
  font-weight: 600;
}

.search-input :deep(.q-field__control) {
  border-radius: 14px;
}

/* ─── MITRA CARDS ─── */
.mitra-card {
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
}

.mitra-card:active {
  transform: scale(0.97);
}

.mitra-card-skel {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.mitra-avatar {
  background: #f0fdf4;
  border: 2px solid #a7f3d0;
}

.mitra-nama {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}

.mitra-bidang {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

/* ─── MODAL ─── */
.modal-card {
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  max-height: 85vh;
}

.modal-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 16px;
}

.modal-body {
  padding: 8px 12px;
}

.prog-mitra-card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
}

.prog-mitra-card:active {
  transform: scale(0.98);
  background: #f0fdf4;
}

.prog-mitra-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prog-mitra-bidang {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}
</style>
