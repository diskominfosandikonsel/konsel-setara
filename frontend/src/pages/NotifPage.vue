<!--
  NotifPage.vue
  Halaman Notifikasi — menampilkan daftar notifikasi pengguna.
  Responsif menggunakan konsep Max-width Container & Pair-based Grouping.
-->

<template>
  <q-page class="q-pa-md bg-white pb-xl">
    <!-- Header Notifikasi -->
    <div class="row items-center q-mb-lg header-title">
      <q-btn
        flat
        round
        dense
        icon="keyboard_arrow_left"
        size="18px"
        @click="$router.back()"
        class="q-mr-sm"
      />
      <div class="text-h5 text-weight-regular text-black">Notifikasi</div>
    </div>

    <!-- Konten utama -->
    <div class="page-container">
      <!-- Loading -->
      <div v-if="isLoading" class="empty-state column flex-center">
        <q-spinner-dots color="primary" size="48px" />
        <div class="text-caption text-grey-5 q-mt-md">Memuat notifikasi...</div>
      </div>

      <!-- Error -->
      <div v-else-if="errorMsg" class="empty-state column flex-center">
        <q-icon name="cloud_off" size="64px" color="grey-4" />
        <div class="text-subtitle2 text-grey-5 q-mt-md text-center">
          {{ errorMsg }}
        </div>
        <q-btn
          flat
          color="primary"
          label="Coba Lagi"
          class="q-mt-sm"
          @click="fetchNotifikasi"
        />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="notifList.length === 0"
        class="empty-state column flex-center"
      >
        <q-img
          src="~assets/notify/img-notice.png"
          class="empty-img"
          fit="contain"
          no-spinner
        />
        <div class="text-subtitle1 text-grey-6 q-mt-md text-weight-medium">
          Tidak ada notifikasi
        </div>
      </div>

      <!-- List Notifikasi — Pair-based Grouping ikon + detail -->
      <div v-else>
        <div
          v-for="(notif, idx) in notifList"
          :key="idx"
          class="row items-start q-mb-md notif-item q-pa-sm"
        >
          <q-icon
            name="notifications"
            color="primary"
            size="28px"
            class="q-mr-md q-mt-xs"
          />
          <div class="col column">
            <div class="text-subtitle2 text-weight-bold text-grey-10">
              {{ notif.title }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              {{ notif.message }}
            </div>
            <div class="text-caption text-grey-4 q-mt-xs">
              {{ notif.date }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
// import { api } from 'boot/axios'

/**
 * ============================================================================
 * DOKUMENTASI API — Notifikasi Pengguna
 * ============================================================================
 *
 * Endpoint  : GET /api/notifikasi
 * Deskripsi : Mengambil daftar notifikasi milik pengguna yang sedang login.
 *
 * Headers:
 *   Authorization: Bearer <token>
 *
 * Response Sukses (200):
 *   {
 *     "success": true,
 *     "data": [
 *       {
 *         "title": "Pengumuman",
 *         "message": "Layanan baru telah tersedia.",
 *         "date": "2 jam lalu"
 *       }
 *     ]
 *   }
 *
 * Response Gagal (401 / 500):
 *   {
 *     "success": false,
 *     "message": "Gagal memuat notifikasi"
 *   }
 *
 * Contoh Implementasi:
 *   const response = await api.get('/notifikasi', {
 *     headers: { Authorization: `Bearer ${tokenUser}` }
 *   });
 *   notifList.value = response.data.data;
 * ============================================================================
 */

const notifList = ref([]);
const isLoading = ref(false);
const errorMsg = ref("");

// Mengambil daftar notifikasi dari backend (saat ini masih simulasi).
const fetchNotifikasi = async () => {
  isLoading.value = true;
  errorMsg.value = "";

  try {
    // TODO: ganti simulasi di bawah dengan `api.get('/notifikasi')`
    await new Promise((resolve) => setTimeout(resolve, 500));
    notifList.value = [];
  } catch (error) {
    console.error("Gagal memuat notifikasi:", error);
    errorMsg.value = "Gagal memuat notifikasi. Silakan coba lagi.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchNotifikasi();
});
</script>

<style scoped>
/* Header halaman — border tembus hingga pinggir layar */
.header-title {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;
  padding-right: 16px;
}

/* Max-width Container — membatasi lebar konten di tablet/desktop */
.page-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.pb-xl {
  padding-bottom: 80px;
}

.empty-state {
  min-height: calc(100vh - 180px);
}

.empty-img {
  width: 220px;
  max-width: 80vw;
}

.notif-item {
  border-bottom: 1px solid #eeeeee;
  padding-bottom: 12px;
}

/* Responsif tablet/desktop */
@media (min-width: 600px) {
  .page-container {
    padding-top: 24px;
  }
}
</style>
