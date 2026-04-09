<template>
  <q-page style="background-color: #FFFFFF;">
    <!-- TEAM STANDARD HEADER -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="goBack" />
      <div class="text-h6 text-weight-regular q-ml-sm text-uppercase text-dark" style="letter-spacing: 1.5px;">PERATURAN DAERAH (PERDA)</div>
    </div>

        <!-- LOADING STATE -->
        <div v-if="sippadu.loading" class="row justify-center q-pa-xl">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <!-- EMPTY STATE -->
        <div v-else-if="sippadu.list_perda.length === 0" class="text-center q-pa-xl">
          <q-icon name="r_find_in_page" size="60px" color="grey-6" />
          <div class="text-grey-6 q-mt-sm">Data perda tidak ditemukan</div>
        </div>

        <!-- ISI PERDA LANGSUNG -->
        <div v-else class="q-pa-md">
          <div v-for="(item, index) in sippadu.list_perda" :key="index" class="perda-section">
            <div class="text-h6 text-weight-bold text-grey-9 q-mb-xs">
              {{ item.judul }}
            </div>
            <div class="row items-center text-caption text-grey-6 q-mb-md">
              <q-icon name="event" size="14px" class="q-mr-xs" />
              <span>{{ formatDate(item.createAt) }}</span>
            </div>
            <div class="text-body1 text-grey-8 perda-isi" v-if="item.isi" v-html="item.isi"></div>

            <q-separator class="q-my-lg" v-if="index < sippadu.list_perda.length - 1" />
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
    }
  },
  mounted() {
    this.sippadu.fetchPerda()
  }
}
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.headerText {
  font-size: 16px;
  font-weight: 600;
}

.perda-section {
  padding-bottom: 8px;
}

.perda-isi {
  line-height: 1.8;
  text-align: justify;
}
</style>
