<template>
  <q-page class="">
    <div class="app-header q-pa-md">
      <div class="row items-center no-wrap" style="min-height: 50px;">
  
        <div class="col-2">
          <q-btn flat round icon="arrow_back" color="white" @click="$router.back()" />
        </div>

        <div class="col-8 row items-center justify-center q-gutter-x-sm">
          <div class="logo-image-container">
            <img src="/icons/sippadu/logo_konsel.png" class="header-logo" alt="Logo Konsel" />
          </div>
          <div class="text-white text-weight-bolder text-h6 mulish tracking-tight">
            PERAK
          </div>
        </div>

        <div class="col-2"></div>

      </div>

      <div class="q-mt-md flex flex-center">
        <img src="/img/perak/contactUs.png" alt="" class="banner-main">
      </div>
    </div>
    <div class="row q-col-gutter-md q-px-md justify-center" style="margin-top: -30px;">
      <div class="col-4">
        <div class="card" @click="goBiodata">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/binders.png" class="card-icon" />
            </div>
            <div class="h1judul">Biodata Pencaker</div>
          </q-card-section>
        </div>
      </div>
      <div class="col-4">
        <div class="card" @click="goPendidikan">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/toga.png" class="card-icon" />
            </div>
            <div class="h1judul">Pendidikan Formal</div>
          </q-card-section>
        </div>
      </div>
      <div class="col-4">
        <div class="card" @click="goKeterampilan">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/pencil.png" class="card-icon" />
            </div>
            <div class="h1judul">Keterampilan</div>
          </q-card-section>
        </div>
      </div>
      <div class="col-4">
        <div class="card" @click="goBahasa">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/translate.png" class="card-icon" />
            </div>
            <div class="h1judul">Bahasa Asing</div>
          </q-card-section>
        </div>
      </div>
      <div class="col-4">
        <div class="card" @click="goPengalaman">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/certificate.png" class="card-icon" />
            </div>
            <div class="h1judul">Pengalaman Kerja</div>
          </q-card-section>
        </div>
      </div>
      <div class="col-4">
        <div class="card" @click="goJabatan">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/pen.png" class="card-icon" />
            </div>
            <div class="h1judul">Jabatan</div>
          </q-card-section>
        </div>
      </div>
      <div class="col-4">
        <div class="card" @click="goLampiran">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/file.png" class="card-icon" />
            </div>
            <div class="h1judul">Lampiran</div>
          </q-card-section>
        </div>
      </div>
    </div>
    
    <!-- <div class="menu-container q-px-md">
      <div class="row q-col-gutter-sm justify-center">
        <div v-for="(menu, index) in menuList" :key="index" class="col-4">
          <q-card flat bordered class="menu-card cursor-pointer flex flex-center" @click="menu.action">
            <q-card-section class="column items-center q-pa-sm">
              <div class="icon-box q-mb-xs">
                <q-img :src="menu.icon" class="menu-icon-img" />
              </div>
              <div class="menu-title text-center">{{ menu.label }}</div>
            </q-card-section>
          </q-card>
        </div>

      </div>
    </div> -->
  </q-page>
</template>

<script>
export default {
  name: 'PerakDashboard',
  data () {
    return {
      menuList: [
        { label: 'Biodata', icon: '/img/perak/binders.png', action: this.goBiodata },
        { label: 'Pendidikan', icon: '/img/perak/toga.png', action: this.goPendidikan },
        { label: 'Keterampilan', icon: '/img/perak/pencil.png', action: this.goKeterampilan },
        { label: 'Bahasa Asing', icon: '/img/perak/translate.png', action: this.goBahasa },
        { label: 'Pengalaman', icon: '/img/perak/certificate.png', action: this.goPengalaman },
        { label: 'Jabatan', icon: '/img/perak/pen.png', action: this.goJabatan },
        { label: 'Lampiran', icon: '/img/perak/file.png', action: this.goLampiran },
      ]
    }
  },
  methods: {
    goBiodata() {
      this.$router.push('/biodata');
    },
    goPendidikan(){
      this.$router.push('/pendidikanFormal');
    },
    goPengalaman(){
      this.$router.push('/pengalamanKerja');
    },
    goJabatan(){
      this.$router.push('/jabatan');
    },
    goLampiran(){
      this.$router.push('/lampiran');
    },
    goKeterampilan(){
      this.$router.push('/keterampilan');
    },
    goBahasa(){
      this.$router.push('/bahasa');
    },
  }
}
</script>
