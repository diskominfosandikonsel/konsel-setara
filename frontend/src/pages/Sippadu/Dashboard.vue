<template>
  <q-page class="sippadu-bg">
    <!-- ═══════════════════════════════════════════ -->
    <!-- PREMIUM HEADER                              -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="header-premium">
      <div class="header-overlay"></div>
      <div class="row items-center justify-between q-pa-md relative-position z-top">
        <q-btn flat round icon="arrow_back" color="white" class="glass-btn" @click="$router.back()" />

        <div class="row items-center q-gutter-xs">
          <div class="logo-badge"><img src="/icons/sippadu/logo_konsel.png" alt="Konsel" /></div>
          <div class="logo-badge"><img src="/icons/sippadu/satpol.png" alt="Satpol" /></div>
        </div>

        <q-btn unelevated rounded color="warning" text-color="dark" size="sm" class="hotline-premium">
          <q-icon name="phone_in_talk" size="14px" class="q-mr-xs" />
          HOTLINE
        </q-btn>
      </div>

      <div class="column flex-center q-pb-xl relative-position z-top">
        <img src="/icons/sippadu/banner-lapor.png" class="hero-banner" alt="Sippadu" />
        <div class="app-title">SIPPADU</div>
        <div class="app-subtitle">Sistem Informasi Pengaduan Terpadu</div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- CONTENT SECTION                             -->
    <!-- ═══════════════════════════════════════════ -->
    <div class="main-content">

      <!-- MENU GRID -->
      <div class="menu-grid q-mb-lg">
        <div class="section-header q-mb-md">
          <div class="text-weight-bold text-dark" style="font-size: 16px; letter-spacing: 0.5px;">Layanan Pengaduan</div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-6">
            <div class="premium-card perda ripple" @click="goAduan('perda')">
              <div class="card-icon">
                <img src="/icons/sippadu/icon-perda.png" alt="Perda" />
              </div>
              <div class="card-label">PERDA</div>
              <div class="card-hint">Peraturan Daerah</div>
              <div class="card-plus"><q-icon name="add" /></div>
            </div>
          </div>
          <div class="col-6">
            <div class="premium-card perkada ripple" @click="goAduan('perkada')">
              <div class="card-icon">
                <img src="/icons/sippadu/icon-perkada.png" alt="Perkada" />
              </div>
              <div class="card-label">PERKADA</div>
              <div class="card-hint">Peraturan Kepala Daerah</div>
              <div class="card-plus"><q-icon name="add" /></div>
            </div>
          </div>
        </div>
      </div>

      <!-- HISTORY SECTION (PROMINENT) -->
      <div class="history-section q-mb-lg">
        <div class="premium-history-card ripple shadow-premium" @click="goRiwayat">
          <div class="row items-center no-wrap">
            <div class="history-icon-box">
              <q-icon name="history" size="24px" />
            </div>
            <div class="q-ml-md col">
              <div class="history-label">Riwayat Laporan Anda</div>
              <div class="history-hint">Cek status dan tindak lanjut aduan</div>
            </div>
            <q-icon name="chevron_right" color="grey-4" size="24px" />
          </div>
          <div class="card-glow"></div>
        </div>
      </div>

      <!-- INFO BANNERS -->
      <div class="info-section q-mb-xl">
        <div class="section-header q-mb-md">
          <div class="text-weight-bold text-dark">Produk Hukum</div>
        </div>

        <div class="banner-item q-mb-md" @click="goPerdaInfo">
          <q-img src="/icons/sippadu/banner-perda.png" class="banner-img" ratio="4.68" />
          <div class="banner-overlay">
            <span>Pelajari Peraturan Daerah</span>
            <q-icon name="chevron_right" />
          </div>
        </div>

        <div class="banner-item" @click="goPerkadaInfo">
          <q-img src="/icons/sippadu/banner-perkada.png" class="banner-img" ratio="4.68" />
          <div class="banner-overlay">
            <span>Pelajari Peraturan Kepala Daerah</span>
            <q-icon name="chevron_right" />
          </div>
        </div>
      </div>

    </div>

    <!-- FORM ADUAN DIALOG — dihapus, kini navigasi ke halaman Aduan.vue -->

    <!-- HIDDEN CAMERA INPUT -->
    <input type="file" accept="image/*" capture="environment" ref="cameraInput" style="display: none"
      @change="onCameraCapture" />

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSippaduStore } from 'stores/sippadu'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const sippaduStore = useSippaduStore()
const authStore = useAuthStore()

onMounted(() => {
  // Preload jika diperlukan
})

const goAduan = (type) => router.push(`/sippadu_aduan/${type}`)
const goRiwayat = () => router.push('/sippadu_riwayat')
const goPerdaInfo = () => router.push('/Perda')
const goPerkadaInfo = () => router.push('/Perkada')
</script>

<style scoped>
.sippadu-bg {
  background: #f8faff;
  min-height: 100vh;
}

/* ─── HEADER ─── */
.header-premium {
  position: relative;
  background: url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop') center top;
  background-size: cover;
  min-height: 280px;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.9) 0%, rgba(59, 130, 246, 0.85) 100%);
}

.logo-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  padding: 4px;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-badge img {
  height: 26px;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
}

.hotline-premium {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  font-weight: 800;
}

.hero-banner {
  max-width: 180px;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2));
}

.app-title {
  font-size: 28px;
  font-weight: 900;
  color: white;
  letter-spacing: 4px;
  margin-top: 12px;
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

/* ─── CONTENT ─── */
.main-content {
  margin-top: -30px;
  padding: 0 20px;
}

.premium-card {
  background: white;
  border-radius: 24px;
  padding: 24px 16px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.premium-card:active {
  transform: scale(0.95);
}

.card-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon img {
  width: 100%;
  object-fit: contain;
}

.card-label {
  font-size: 16px;
  font-weight: 800;
  color: #1e3a8a;
}

.card-hint {
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.2;
}

.card-plus {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: #eff6ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 14px;
}

.ripple {
  position: relative;
  cursor: pointer;
}

/* BANNERS */
.banner-item {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.banner-img {
  transition: transform 0.4s ease;
}

.banner-item:hover .banner-img {
  transform: scale(1.05);
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 12px 16px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ─── HISTORY CARD ─── */
.premium-history-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
}

.premium-history-card:active {
  transform: scale(0.97);
}

.history-icon-box {
  width: 50px;
  height: 50px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-label {
  font-size: 15px;
  font-weight: 800;
  color: #1e3a8a;
}

.history-hint {
  font-size: 11px;
  color: #94a3b8;
}

.card-glow {
  position: absolute;
  top: -50%; right: -50%;
  width: 100%; height: 100%;
  background: radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%);
  pointer-events: none;
}

.shadow-premium {
  box-shadow: 0 10px 25px rgba(30, 64, 175, 0.05);
}

/* ─── FORM DIALOG ─── */
.lapor-header {
  min-height: 200px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
}

.lapor-header.perda {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
}

.lapor-header.perkada {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
}

.photo-preview-container {
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px dashed rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.empty-photo {
  color: white;
  height: 100%;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.edit-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: white;
  color: #1e3a8a;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.form-section-title {
  font-size: 13px;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.premium-input {
  border-radius: 12px;
}

.location-box {
  background: white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.location-box.has-loc {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.loc-icon-ring {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.has-loc .loc-icon-ring {
  background: #dcfce7;
  color: #22c55e;
}

.premium-submit {
  border-radius: 16px;
  padding: 18px;
  font-weight: 800;
  letter-spacing: 1px;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}
</style>
