<!--
  NotifPage.vue
  Halaman Notifikasi — menampilkan riwayat notifikasi push dari localStorage.
  Fitur: hold untuk hapus (modal konfirmasi), navigasi ke detail.
-->

<template>
  <q-page class="notif-bg pb-xl">

    <!-- Header Notifikasi -->
    <div class="row items-center q-mb-none header-bar">
      <q-btn
        flat
        round
        dense
        icon="chevron_left"
        size="18px"
        color="dark"
        @click="$router.back()"
      />
      <div class="text-h6 text-weight-regular q-ml-sm text-uppercase text-dark header-text">
        NOTIFIKASI
      </div>
      <q-space />
      <q-btn
        v-if="notifStore.list.length > 0"
        flat
        dense
        no-caps
        color="red-5"
        label="Hapus Semua"
        icon="delete_sweep"
        class="text-caption"
        @click="showClearAllDialog = true"
      />
    </div>

    <!-- Konten utama -->
    <div class="page-container q-px-md">

      <!-- Empty state -->
      <div
        v-if="notifStore.list.length === 0"
        class="empty-state column flex-center"
      >
        <q-img
          src="~assets/notify/img-notice.png"
          class="empty-img"
          fit="contain"
          no-spinner
        />
        <div class="text-subtitle1 text-grey-6 q-mt-md text-weight-medium">
          Belum ada notifikasi
        </div>
        <div class="text-caption text-grey-4 q-mt-xs">
          Notifikasi dari aplikasi akan muncul di sini
        </div>
      </div>

      <!-- List Notifikasi -->
      <div v-else>
        <transition-group name="notif-list" tag="div">
          <div
            v-for="notif in notifStore.list"
            :key="notif.id"
            class="notif-card"
            :class="{ unread: !notif.read }"
            @click="onNotifClick(notif)"
            @contextmenu.prevent="onNotifHold(notif)"
            v-touch-hold.mouse.prevent="() => onNotifHold(notif)"
          >
            <!-- Indikator belum dibaca -->
            <div v-if="!notif.read" class="unread-dot"></div>

            <div class="notif-content">
              <div class="notif-header-row">
                <span class="notif-type-label" :class="getTypeClass(notif.type)">
                  {{ getTypeLabel(notif.type) }}
                </span>
                <span class="notif-time">{{ formatTimeAgo(notif.createdAt) }}</span>
              </div>
              <div class="notif-title">{{ notif.title }}</div>
              <div class="notif-body">{{ notif.body }}</div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Satu -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 300px; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="delete_outline" color="red-5" size="28px" class="q-mr-sm" />
          <div class="text-h6">Hapus Notifikasi?</div>
        </q-card-section>
        <q-card-section>
          <div class="text-body2 text-grey-7">
            Apakah Anda yakin ingin menghapus notifikasi ini?
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pt-none q-pb-md q-pr-md">
          <q-btn flat no-caps label="Batal" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Hapus"
            color="red-5"
            text-color="white"
            style="border-radius: 10px; min-width: 80px"
            @click="confirmDelete"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal Konfirmasi Hapus Semua -->
    <q-dialog v-model="showClearAllDialog">
      <q-card style="min-width: 300px; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <q-icon name="delete_sweep" color="red-5" size="28px" class="q-mr-sm" />
          <div class="text-h6">Hapus Semua?</div>
        </q-card-section>
        <q-card-section>
          <div class="text-body2 text-grey-7">
            Semua riwayat notifikasi akan dihapus secara permanen.
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pt-none q-pb-md q-pr-md">
          <q-btn flat no-caps label="Batal" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Hapus Semua"
            color="red-5"
            text-color="white"
            style="border-radius: 10px; min-width: 80px"
            @click="confirmClearAll"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotifikasiStore } from 'src/stores/notifikasi'

const router = useRouter()
const notifStore = useNotifikasiStore()

const showDeleteDialog = ref(false)
const showClearAllDialog = ref(false)
const selectedNotif = ref(null)

// ── Klik notifikasi: tandai dibaca lalu navigasi ke detail ──
function onNotifClick(notif) {
  notifStore.markRead(notif.id)

  if (notif.type === 'sippadu' && notif.laporanId) {
    router.push('/sippadu_detail/' + notif.laporanId)
  } else if (notif.type === 'sapakonsel' && notif.laporanId) {
    router.push('/sapa_riwayat/' + notif.laporanId)
  } else if (notif.type === 'firetap' && notif.laporanId) {
    router.push('/firetap_detail/' + notif.laporanId)
  } else if (notif.type === 'perak' && notif.laporanId) {
    router.push('/kartu/' + notif.laporanId)
  }
}

// ── Hold notifikasi: tampilkan modal hapus ──
function onNotifHold(notif) {
  selectedNotif.value = notif
  showDeleteDialog.value = true
}

function confirmDelete() {
  if (selectedNotif.value) {
    notifStore.remove(selectedNotif.value.id)
  }
  showDeleteDialog.value = false
  selectedNotif.value = null
}

function confirmClearAll() {
  notifStore.clearAll()
  showClearAllDialog.value = false
}

// ── Helpers ──
function getTypeLabel(type) {
  const map = {
    sippadu: 'SIPPADU',
    sapakonsel: 'SAPA KONSEL',
    firetap: 'FIRETAP',
    perak: 'PERAK'
  }
  return map[type] || 'UMUM'
}

function getTypeClass(type) {
  const map = {
    sippadu: 'type-sippadu',
    sapakonsel: 'type-sapakonsel',
    firetap: 'type-firetap',
    perak: 'type-perak'
  }
  return map[type] || 'type-default'
}

function formatTimeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return mins + ' menit lalu'
  const hours = Math.floor(mins / 60)
  if (hours < 24) return hours + ' jam lalu'
  const days = Math.floor(hours / 24)
  if (days < 7) return days + ' hari lalu'
  return new Date(isoStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}
</script>

<style scoped>
.notif-bg {
  background: #f0f4f9;
  min-height: 100vh;
}

.header-bar {
  padding: 14px 12px;
  background: white;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-text {
  letter-spacing: 2px;
  font-size: 16px;
}

.page-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding-top: 12px;
}

.pb-xl {
  padding-bottom: 80px;
}

.empty-state {
  min-height: calc(100vh - 180px);
}

.empty-img {
  width: 200px;
  max-width: 70vw;
  opacity: 0.7;
}

/* ─── Notif Card ─── */
.notif-card {
  padding: 14px 16px;
  margin-bottom: 8px;
  background: white;
  border-radius: 14px;
  position: relative;
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.notif-card:active {
  transform: scale(0.98);
}

.notif-card.unread {
  background: #fafcff;
}

.unread-dot {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
}

/* ─── Content ─── */
.notif-content {
  min-width: 0;
}

.notif-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.notif-type-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.notif-type-label.type-sippadu {
  color: #3b82f6;
}

.notif-type-label.type-sapakonsel {
  color: #10b981;
}

.notif-type-label.type-firetap {
  color: #f59e0b;
}

.notif-type-label.type-perak {
  color: #0495b3;
}

.notif-type-label.type-default {
  color: #9ca3af;
}

.notif-time {
  font-size: 11px;
  color: #b0b8c4;
  white-space: nowrap;
}

.notif-title {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 2px;
}

.notif-body {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ─── Transition ─── */
.notif-list-enter-active {
  transition: all 0.3s ease;
}

.notif-list-leave-active {
  transition: all 0.25s ease;
}

.notif-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.notif-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@media (min-width: 600px) {
  .page-container {
    padding-top: 24px;
  }
}
</style>
