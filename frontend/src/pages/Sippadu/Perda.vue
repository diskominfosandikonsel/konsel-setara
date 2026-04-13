<template>
  <q-page class="perda-page">
    <!-- HEADER -->
    <div class="perda-header sticky-header">
      <q-btn flat round dense icon="chevron_left" color="white" size="16px" @click="goBack" class="back-btn" />
      <span class="header-title">Peraturan Daerah</span>
    </div>

    <!-- HERO BANNER -->
    <div class="perda-hero">
      <q-icon name="r_gavel" size="36px" color="white" class="q-mb-sm" />
      <div class="hero-title">PERDA</div>
      <div class="hero-sub">Peraturan Daerah Kabupaten Konawe Selatan</div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="sippadu.loading" class="state-container">
      <q-spinner-dots color="primary" size="48px" />
      <div class="state-text">Memuat data...</div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="sippadu.list_perda.length === 0" class="state-container">
      <q-icon name="r_find_in_page" size="64px" color="grey-4" />
      <div class="state-text">Belum ada data perda tersedia</div>
    </div>

    <!-- LIST PERDA -->
    <div v-else class="perda-list q-px-md q-pb-xl">
      <div
        v-for="(item, index) in sippadu.list_perda"
        :key="index"
        class="perda-card"
      >
        <div class="card-body">
          <!-- Tanggal -->
          <div class="card-date">
            <q-icon name="r_calendar_today" size="13px" class="q-mr-xs" />
            {{ formatDate(item.createAt) }}
          </div>

          <!-- Judul -->
          <div class="card-title">{{ item.judul }}</div>

          <!-- Divider -->
          <div class="card-divider"></div>

          <!-- Isi — parsed -->
          <div v-if="item.isi" class="card-isi">
            <div
              v-for="(block, bi) in parseIsi(item.isi)"
              :key="bi"
              :class="block.type === 'point' ? 'isi-point' : 'isi-para'"
            >
              <!-- Poin bernomor -->
              <template v-if="block.type === 'point'">
                <span class="point-num">{{ block.num }}.</span>
                <span class="point-text">{{ block.text }}</span>
              </template>
              <!-- Paragraf biasa -->
              <template v-else>
                {{ block.text }}
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useSippaduStore } from 'stores/sippadu'

export default {
  computed: {
    sippadu() {
      return useSippaduStore()
    }
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    },
    /**
     * Parse plain text isi menjadi array blok:
     * - type 'point' : baris yang diawali angka (1. 2. dst)
     * - type 'para'  : paragraf teks biasa
     */
    parseIsi(isi) {
      if (!isi) return []
      // Normalkan baris
      const lines = isi
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)

      return lines.map(line => {
        // Cocokkan pola: "1. teks", "2) teks", "1 . teks"
        const match = line.match(/^(\d+)[.)]\s*(.+)/)
        if (match) {
          return { type: 'point', num: match[1], text: match[2] }
        }
        return { type: 'para', text: line }
      })
    }
  },
  mounted() {
    this.sippadu.fetchPerda()
  }
}
</script>

<style scoped>
/* ── PAGE ──────────────────────────────────────────── */
.perda-page {
  background-color: #f4f6fb;
  min-height: 100vh;
}

/* ── STICKY HEADER ─────────────────────────────────── */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #1565C0 0%, #1976D2 100%);
}

.back-btn { flex-shrink: 0; }

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
}

/* ── HERO BANNER ───────────────────────────────────── */
.perda-hero {
  background: linear-gradient(135deg, #1565C0 0%, #42A5F5 100%);
  padding: 24px 20px 32px;
  text-align: center;
  color: #fff;
}

.hero-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 3px;
  line-height: 1.2;
}

.hero-sub {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 4px;
  letter-spacing: 0.3px;
}

/* ── STATES ────────────────────────────────────────── */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.state-text {
  font-size: 14px;
  color: #9e9e9e;
}

/* ── LIST ──────────────────────────────────────────── */
.perda-list {
  margin-top: -16px;
}

/* ── CARD ──────────────────────────────────────────── */
.perda-card {
  background: #ffffff;
  border-radius: 14px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  overflow: hidden;
}

.card-body {
  padding: 16px;
}

.card-date {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #1976D2;
  font-weight: 600;
  margin-bottom: 6px;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.5;
}

.card-divider {
  height: 1px;
  background: #e8eaf0;
  margin: 10px 0 12px;
}

/* ── ISI ───────────────────────────────────────────── */
.card-isi {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Paragraf biasa */
.isi-para {
  font-size: 13px;
  color: #4a4a4a;
  line-height: 1.75;
  text-align: justify;
  hyphens: auto;
  -webkit-hyphens: auto;
}

/* Baris bernomor */
.isi-point {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
}

.point-num {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  min-width: 22px;
  flex-shrink: 0;
  padding-top: 1px;
}

.point-text {
  font-size: 13px;
  color: #4a4a4a;
  line-height: 1.75;
  text-align: justify;
  hyphens: auto;
  -webkit-hyphens: auto;
  flex: 1;
}
</style>
