<template>
  <q-page class="bg-grey-1">
    <div class="header q-pa-md">
      <div class="row items-center justify-between">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="white"
          @click="$router.back()"
        />
        <div class="row items-center q-gutter-sm logo-wrapper">
          <div class="logo-shadow">
            <q-img src="/icons/sippadu/logo_konsel.png" />
          </div>
          <div class="logo-shadow">
            <q-img src="/icons/sippadu/satpol.png" />
          </div>
        </div>

        <q-btn
          rounded
          icon="call"
          label="HOTLINE"
          size="sm"
          class="hotline-btn"
        />
      </div>

      <div class="q-mt-md flex flex-center">
        <q-img
          src="/icons/sippadu/banner-lapor.png"
          style="max-width: 260px"
          fit="contain"
        />
      </div>

      <div class="header-fade"></div>
    </div>

    <div class="content q-pa-md">
      <div class="text-center q-mb-md title-wrapper">
        <div class="text-h6 text-primary text-weight-bold">
          SIPPADU
        </div>
        <div class="text-caption text-grey-7">
          SISTEM INFORMASI PENGADUAN PELANGGARAN PERDA<br />
          DAN PERKADA SECARA TERPADU
        </div>
      </div>

      <q-card flat bordered class="q-pa-md q-mb-md rounded-card">
        <div class="text-subtitle2 text-weight-medium q-mb-sm">
          Klik untuk Melapor
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-6">
            <q-card
              clickable
              class="lapor-card"
              @click="goPerda"
            >
              <q-img src="/public/icons/sippadu/icon-perda.png" width="64px" />
              <div class="q-mt-sm text-weight-bold">PERDA</div>
            </q-card>
          </div>

          <div class="col-6">
            <q-card
              clickable
              class="lapor-card"
              @click="goPerkada"
            >
              <q-img src="/public/icons/sippadu/icon-perkada.png" width="64px" />
              <div class="q-mt-sm text-weight-bold">PERKADA</div>
            </q-card>
          </div>
        </div>
      </q-card>

      <div class="text-subtitle2 text-weight-medium q-mb-sm">
        Informasi Tentang Perda dan Perkada
      </div>

      <q-card clickable @click="goPerdaInfo" class="q-mb-sm rounded-card">
        <q-img src="/icons/sippadu/banner-perda.png" ratio="4.68" />
      </q-card>

      <q-card clickable @click="goPerkadaInfo" class="rounded-card">
        <q-img src="/icons/sippadu/banner-perkada.png" ratio="4.68" />
      </q-card>

      <q-card
        flat
        bordered
        class="q-pa-md q-mt-md row items-center justify-between rounded-card"
        clickable
        @click="goRiwayat"
      >
        <div class="text-weight-medium">Riwayat Laporan Anda</div>
        <q-icon name="chevron_right" size="20px" />
      </q-card>

    </div>
  </q-page>
</template>

<script>
export default {
  name: 'SippaduDashboard',
  data () {
    return {
      tab: 'home'
    }
  },
  methods: {
    goPerdaInfo () {
      this.$router.push('/Perda')
    },
    goPerkadaInfo () {
      this.$router.push('/Perkada')
    },
    goRiwayat () {
      this.$router.push('/Riwayat')
    }
  }
}
</script>

<style scoped>
.header {
  position: relative;
  background: linear-gradient(180deg, #4a7cff 0%, #8fb6ff 70%);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  color: white;
}

.header-fade {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 48px;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.4) 40%,
    rgba(255,255,255,0.8) 70%,
    #FAFAFA 100%
  );
}
.header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 56px;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0),
    #FAFAFA
  );
}


.content {
  margin-top: -20px;
}

.rounded-card {
  border-radius: 16px;
}

.lapor-card {
  text-align: center;
  padding: 16px;
  border-radius: 14px;
  background: #eaf2ff;
}

.title-wrapper {
  padding-top: 12px;
}

.logo-wrapper {
  align-items: center;
  margin-top: -4px;
}

.logo-shadow {
  position: relative;
  width: 42px;
  height: 42px;
  padding: 4px;
  border-radius: 10px;

 
}

.logo-shadow .q-img__image {
  width: auto !important;
  height: 28px !important;
  object-fit: contain !important;
}

.logo-shadow .q-img {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-shadow .q-img__image {
  transform: translateY(1px);
}

.hotline-btn {
  background: #f6c34a !important;
  color: #000 !important;
  font-weight: 700;
  padding: 6px 18px;
  border-radius: 999px;

  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.25),
    inset 0 -2px 0 rgba(0, 0, 0, 0.15);
}

.hotline-btn .q-icon {
  margin-right: 6px;
}


</style>
