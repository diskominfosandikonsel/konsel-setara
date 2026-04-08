<template>
  <q-page class="q-pa-md bg-white pb-xl">
    <!-- Header Notifikasi -->
    <div class="row items-center q-mb-lg header-title">
      <q-btn flat round dense icon="keyboard_arrow_left" size="18px" @click="$router.back()" class="q-mr-sm" />
      <div class="text-h5 text-weight-regular text-black">Notifikasi</div>
    </div>

    <!-- Indikator Loading (tampil saat data sedang diambil dari server) -->
    <div v-if="isLoading" class="empty-state column flex-center">
      <q-spinner-dots color="primary" size="48px" />
      <div class="text-caption text-grey-5 q-mt-md">Memuat notifikasi...</div>
    </div>

    <!-- Pesan Error (tampil jika gagal terhubung ke server) -->
    <div v-else-if="errorMsg" class="empty-state column flex-center">
      <q-icon name="cloud_off" size="64px" color="grey-4" />
      <div class="text-subtitle2 text-grey-5 q-mt-md text-center">{{ errorMsg }}</div>
      <q-btn
        flat
        color="primary"
        label="Coba Lagi"
        class="q-mt-sm"
        @click="fetchNotifikasi"
      />
    </div>

    <!-- Empty State -->
    <div v-else-if="notifList.length === 0" class="empty-state column flex-center">
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

    <!-- List Notifikasi (tampil jika ada data dari server) -->
    <div v-else>
      <div
        v-for="(notif, idx) in notifList"
        :key="idx"
        class="row items-start q-mb-md notif-item q-pa-sm"
      >
        <q-icon name="notifications" color="primary" size="28px" class="q-mr-md q-mt-xs" />
        <div class="col column">
          <div class="text-subtitle2 text-weight-bold text-grey-10">{{ notif.title }}</div>
          <div class="text-caption text-grey-6 q-mt-xs">{{ notif.message }}</div>
          <div class="text-caption text-grey-4 q-mt-xs">{{ notif.date }}</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import { api } from 'boot/axios' // Aktifkan baris ini ketika axios sudah dikonfigurasi di boot/axios.js

const notifList = ref([])
const isLoading = ref(false)
const errorMsg = ref('')

/**
 * FUNGSI UTAMA: Mengambil data notifikasi dari server
 *
 * CARA INTEGRASI KETIKA BACKEND SUDAH SIAP:
 * 1. Hapus seluruh blok "Simulasi data dummy" di bawah
 * 2. Aktifkan baris komentar `import { api }` di bagian atas
 * 3. Aktifkan blok komentar `const response = await api.get(...)` di bawah
 * 4. Sesuaikan nama endpoint dan struktur response sesuai kesepakatan dengan backend
 */
const fetchNotifikasi = async () => {
  isLoading.value = true
  errorMsg.value = ''

  try {

    // =========================================================
    // BAGIAN INI DIGANTI KETIKA BACKEND SUDAH SIAP
    // ---------------------------------------------------------
    // Aktifkan kode di bawah ini dan hapus blok simulasi dummy:
    //
    // const response = await api.get('/notifikasi')
    //
    // Contoh jika API memerlukan token autentikasi:
    // const response = await api.get('/notifikasi', {
    //   headers: { Authorization: `Bearer ${tokenUser}` }
    // })
    //
    // Sesuaikan nama field dengan struktur JSON dari backend:
    // notifList.value = response.data.data  // jika struktur: { data: [...] }
    // notifList.value = response.data       // jika struktur langsung array: [...]
    // =========================================================

    // --- Simulasi data dummy (hapus blok ini ketika backend siap) ---
    await new Promise((resolve) => setTimeout(resolve, 500)) // tunda 0,5 detik
    notifList.value = [] // Ganti dengan array dummy untuk pengujian tampilan list:
    // notifList.value = [
    //   { title: 'Pengumuman', message: 'Layanan baru telah tersedia.', date: '2 jam lalu' },
    //   { title: 'Info', message: 'Jadwal pemeliharaan sistem malam ini.', date: '1 hari lalu' },
    // ]
    // --- Akhir simulasi dummy ---

  } catch (error) {
    // Tangani error koneksi atau error dari server (misal: 401, 500)
    console.error('Gagal memuat notifikasi:', error)
    errorMsg.value = 'Gagal memuat notifikasi. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}

// Panggil fetchNotifikasi secara otomatis ketika halaman pertama kali dibuka
onMounted(() => {
  fetchNotifikasi()
})
</script>

<style scoped>
.header-title {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;
  padding-right: 16px;
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
</style>
