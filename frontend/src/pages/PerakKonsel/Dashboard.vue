<template>
  <q-page class="">
    <div class="app-header q-pa-md">
      <div class="row items-center justify-between relative-position" style="min-height: 50px;">
        <q-btn flat round icon="arrow_back" color="white" @click="$router.back()" />
        <div class="absolute-center row items-center q-gutter-sm logo-wrapper">
          <div class="logo-image-container">
            <img src="/icons/sippadu/logo_konsel.png" class="header-logo" alt="Logo Konsel" />
          </div>
        </div>
      </div>
      <div class="q-mt-md flex flex-center">
        <img src="/img/perak/contactUs.png" alt="" class="banner-main">
      </div>
    </div>
    <div class="row q-col-gutter-md q-px-md text-center" style="margin-top: -30px;">
      <div class="col-6">
        <div class="card" @click="goBiodata">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/binders.png" class="card-icon" />
            </div>
            <div class="h1judul">Biodata Pencaker</div>
          </q-card-section>
        </div>
      </div>
      <div class="col-6">
        <div class="card" @click="goPendidikan">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/toga.png" class="card-icon" />
            </div>
            <div class="h1judul">Pendidikan Formal</div>
          </q-card-section>
        </div>
      </div>
      <div class="col-6">
        <div class="card" @click="goPengalaman">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/certificate.png" class="card-icon" />
            </div>
            <div class="h1judul">Pengalaman Kerja</div>
          </q-card-section>
        </div>
      </div>
      <div class="col-6">
        <div class="card" @click="goJabatan">
          <q-card-section>
            <div class="card-inside">
              <q-img src="/img/perak/pen.png" class="card-icon" />
            </div>
            <div class="h1judul">Jabatan</div>
          </q-card-section>
        </div>
      </div>
      <div class="col-6">
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
  </q-page>
</template>

<script>
export default {
  name: 'PerakDashboard',
  data () {
    return {

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
  }
}
</script>
