<template>
  <q-page class="firetap-bg">

    <!-- ═══════════════════════════════════════════ -->
    <!-- PREMIUM HEADER                              -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="firetap-header">
      <div class="header-overlay"></div>
      <div class="header-embers">
        <div class="ember e1"></div>
        <div class="ember e2"></div>
        <div class="ember e3"></div>
        <div class="ember e4"></div>
      </div>

      <div class="row items-center justify-between q-pa-md relative-position z-top">
        <q-btn flat round icon="arrow_back" color="white" class="glass-btn" @click="$router.back()" />

        <!-- <div class="row items-center q-gutter-xs">
          <div class="logo-badge damkar-badge">
            <img src="/icons/damkar.png" alt="Damkar" />
          </div>
        </div> -->

        <q-btn unelevated rounded color="deep-orange" text-color="white" size="sm" class="hotline-btn"
          @click="callHotline">
          <q-icon name="local_fire_department" size="14px" class="q-mr-xs" />
          DARURAT
        </q-btn>
      </div>

      <div class="column flex-center q-pb-xl relative-position z-top">
        <div class="brand-logo-wrapper">
          <img src="/icons/firetap_logo.png" alt="FireTap" class="brand-logo" />
        </div>
        <div class="app-title">FIRETAP</div>
        <div class="app-subtitle">Fire Emergency Fast Response</div>
        <div class="app-sub-badge">Kabupaten Konawe Selatan</div>
      </div>
    </div>

    <!-- ════════════════════════════ -->
    <!-- CONTENT SECTION              -->
    <!-- ════════════════════════════ -->
    <div class="main-content">

      <!-- MENU UTAMA — 2 Kolom Grid -->
      <div class="q-pt-xl q-pb-md">
        <div class="text-weight-bold text-dark q-mb-md" style="font-size: 15px; letter-spacing: 0.3px;">Layanan Darurat</div>

        <div class="row q-col-gutter-md">
          <!-- Lapor -->
          <div class="col-6">
            <div class="grid-card lapor-card" @click="goLapor">
              <div class="card-badge-top">
                <q-icon name="add" size="14px" />
              </div>
              <div class="grid-icon-wrap lapor-icon-bg">
                <q-icon name="fire_truck" size="32px" color="white" />
              </div>
              <div class="grid-label text-deep-orange-8">LAPOR</div>
              <div class="grid-hint">Laporkan Kejadian</div>
            </div>
          </div>

          <!-- Riwayat -->
          <div class="col-6">
            <div class="grid-card riwayat-card" @click="goRiwayat">
              <div class="card-badge-top" style="color: #6b7280;">
                <q-icon name="history" size="14px" />
              </div>
              <div class="grid-icon-wrap riwayat-icon-bg">
                <q-icon name="list_alt" size="32px" color="white" />
              </div>
              <div class="grid-label text-grey-8">RIWAYAT</div>
              <div class="grid-hint">Status Laporan</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TELEPON PENTING / DARURAT -->
      <div class="q-mt-md q-mb-xl">
        <div class="text-weight-bold text-dark q-mb-md" style="font-size: 15px; letter-spacing: 0.3px;">Telepon Penting</div>

        <!-- Loading -->
        <div v-if="loadingTelp" class="text-center q-py-lg">
          <q-spinner-dots size="28px" color="deep-orange" />
        </div>

        <!-- Empty State -->
        <div v-else-if="listTelepon.length === 0" class="text-center text-grey-5 q-py-lg" style="font-size: 13px;">
          Belum ada data telepon penting
        </div>

        <!-- List -->
        <div v-else class="telp-list-card">
          <div
            v-for="(item, idx) in listTelepon"
            :key="idx"
            class="telp-item"
            :class="{ 'telp-item-border': idx < listTelepon.length - 1 }"
          >
            <div class="telp-info">
              <div class="telp-name">{{ item.nama_instansi }}</div>
              <div class="telp-address">{{ item.alamat_instansi || '-' }}</div>
            </div>
            <div class="telp-actions">
              <q-btn flat round dense icon="phone" color="deep-orange" size="sm" @click.stop="callNumber(item.no_telp_instansi)">
                <q-tooltip>Telepon</q-tooltip>
              </q-btn>
              <q-btn flat round dense size="sm" @click.stop="openWA(item.no_telp_instansi)">
                <img src="/icons/wa-icon.png" style="width: 20px; height: 20px;" onerror="this.parentElement.style.display='none'" />
                <q-tooltip>WhatsApp</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>

    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FiretapService } from 'src/services/firetap.service'

const router = useRouter()

const goLapor = () => router.push('/firetap_lapor')
const goRiwayat = () => router.push('/firetap_riwayat')
const callHotline = () => window.open('tel:113')

// Telepon Penting
const listTelepon = ref([])
const loadingTelp = ref(false)

const fetchTeleponPenting = async () => {
  loadingTelp.value = true
  try {
    const res = await FiretapService.getTeleponPenting()
    listTelepon.value = res.data?.data || []
  } catch (err) {
    console.error('Gagal ambil telepon penting:', err)
  } finally {
    loadingTelp.value = false
  }
}

const callNumber = (number) => {
  if (number) window.open('tel:' + number)
}

const openWA = (number) => {
  if (number) window.open('https://wa.me/' + number, '_blank')
}

onMounted(() => {
  fetchTeleponPenting()
})
</script>

<style scoped>
.firetap-bg {
  background: #fff7f0;
  min-height: 100vh;
}

/* ─── HEADER ─── */
.firetap-header {
  position: relative;
  background: url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop') center top;
  background-size: cover;
  min-height: 300px;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(124, 29, 5, 0.92) 0%, rgba(234, 88, 12, 0.88) 60%, rgba(249, 115, 22, 0.85) 100%);
}

/* Embers animation */
.header-embers {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.ember {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 200, 100, 0.3);
  animation: float-up 4s infinite;
}

.e1 {
  width: 6px;
  height: 6px;
  left: 20%;
  animation-delay: 0s;
}

.e2 {
  width: 4px;
  height: 4px;
  left: 50%;
  animation-delay: 1s;
}

.e3 {
  width: 8px;
  height: 8px;
  left: 75%;
  animation-delay: 2s;
}

.e4 {
  width: 5px;
  height: 5px;
  left: 35%;
  animation-delay: 1.5s;
}

@keyframes float-up {
  0% {
    bottom: 0;
    opacity: 0.8;
    transform: translateX(0);
  }

  100% {
    bottom: 100%;
    opacity: 0;
    transform: translateX(15px);
  }
}

.logo-badge {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 4px;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.damkar-badge {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.logo-badge img {
  height: 32px;
  width: 32px;
  object-fit: contain;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
}

.hotline-btn {
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.5);
  font-weight: 800;
}

/* ─── BRAND LOGO ─── */
.brand-logo-wrapper {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: logo-pulse 3s ease-in-out infinite;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.35));
}

.brand-logo {
  width: 110px;
  height: 110px;
  object-fit: contain;
}

@keyframes logo-pulse {

  0%,
  100% {
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.35));
    transform: scale(1);
  }

  50% {
    filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.45));
    transform: scale(1.04);
  }
}

.app-title {
  font-size: 32px;
  font-weight: 900;
  color: white;
  letter-spacing: 5px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  margin-top: 8px;
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-top: 4px;
}

.app-sub-badge {
  margin-top: 8px;
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 99px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  font-weight: 600;
}

/* ─── CONTENT ─── */
.main-content {
  margin-top: -28px;
  padding: 0 16px 40px;
}

/* ─── GRID CARDS ─── */
.grid-card {
  background: white;
  border-radius: 20px;
  padding: 20px 16px 18px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  min-height: 155px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.grid-card:active {
  transform: scale(0.95);
}

.lapor-card {
  border: 1.5px solid #fed7aa;
  background: linear-gradient(145deg, #fff7f0 0%, #fff 100%);
}

.riwayat-card {
  border: 1.5px solid #e5e7eb;
  background: linear-gradient(145deg, #f9fafb 0%, #fff 100%);
}

/* Badge pojok kanan atas */
.card-badge-top {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: rgba(234, 88, 12, 0.1);
  color: #ea580c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.riwayat-card .card-badge-top {
  background: rgba(107, 114, 128, 0.1);
}

/* Icon wrapper bulat */
.grid-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.lapor-icon-bg {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 6px 16px rgba(234, 88, 12, 0.3);
}

.riwayat-icon-bg {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 6px 16px rgba(75, 85, 99, 0.25);
}

.grid-label {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.grid-hint {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.3;
}

/* ─── TELEPON PENTING LIST ─── */
.telp-list-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #f1f5f9;
}

.telp-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  transition: background 0.15s ease;
}

.telp-item:active {
  background: #fff7ed;
}

.telp-item-border {
  border-bottom: 1px solid #f1f5f9;
}

.telp-info {
  flex: 1;
  min-width: 0;
}

.telp-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.telp-address {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.telp-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}
</style>
