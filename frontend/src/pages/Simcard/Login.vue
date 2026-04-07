<template>
  <q-page class="dashboard-page">

    <div class="containerOne ">
        <div class="itemsContainer">
            <div>
                <p class="text-white text-right">Eleanor Pena</p>
            </div>
            <div>
                <img src="~assets/simcard/FotoProfile.png" alt="">
            </div>
        </div> 
    </div>
    <div class="containerOne" style="padding-top:0px !important;" >
        <div class="itemsContainer" style="padding: 0px 20px !important;">
            <div>
                <p class="text-white" style="font-size: 20px; margin-bottom: 0;">SIMCARD</p>
                <p class="text-white" style="font-size: 12px; margin-bottom: 0;">Sistem Informasi Pencatatan dan Pendaftaran Penduduk</p>
            </div>
            <div>
                <img src="~assets/simcard/icon1.png" style="width: 92px; height: 92px;" alt="">
            </div>
        </div> 
    </div>

    <div class="containerOne" style="padding-top:0px !important;" >
        <q-card class="text-white full-width" style="border-radius: 15px; background-color: #FFFFFF; opacity: 0.85;">
        <q-card-section> 
            <div class="text-black text-center">Halaman Login Aplikasi Simcard</div>
            <div class="text-center" style="color: #6C7278; margin-top: 24px;">Masukan Username dan Password Anda</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">

              <input type="text" style="margin-top: 16px; border-radius: 8px; height: 56px; width: 100%; padding: 0 16px; border: 1px solid #C4C4C4;" placeholder="Username" />
              <input type="text" style="margin-top: 16px; border-radius: 8px; height: 56px; width: 100%; padding: 0 16px; border: 1px solid #C4C4C4;" placeholder="Password" />
              <input type="checkbox" name="remember" id="remember"> <span class="text-black">Remember Me</span>
        </q-card-section>
        <q-card-section class="text-center">
            <q-btn to="/simcard_dashboard" class="full-width" color="primary" label="Login" /> 
        </q-card-section>
        </q-card>
    </div>



 
    <!-- <div class="q-pa-md">
          <div class="text-center title">Selamat Datang di Sahabat<br/>Perempuan & Anak Konawe Selatan</div>
          <div class="text-center q-mt-xs sub-title">
            Platform Digital Pelaporan dan Edukasi Perlindungan
            <br />
            Perempuan & Anak Kabupaten Konawe Selatan
          </div>
    </div> -->
    <!-- <div class="row q-col-gutter-md q-px-md q-py-lg text-center">
      <div class="col-6">
        <q-card class="bg-warning text-white full-width" style="border-radius: 15px; background-color: #FF8D00; opacity: 0.85;">
          <q-card-section>
            <q-icon name="r_warning_amber" size="61px" color="white" class="cursor-pointer q-py-md" @click="goBack" />
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6">
        <q-card class="text-white full-width" style="border-radius: 15px; background-color: #3683FD; opacity: 0.85;">
          <q-card-section>
            <q-icon name="o_chat" size="61px" color="white" class="cursor-pointer q-py-md" @click="goBack" />
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6">
        <q-card class="text-white full-width" style="border-radius: 15px; background-color: #3683FD; opacity: 0.85;">
          <q-card-section>
            <q-icon name="o_group" size="61px" color="white" class="cursor-pointer q-py-md" @click="goBack" />
            <div class="text-subtitle2">by John Doe</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6">
        <q-card class="text-white full-width" style="border-radius: 15px; background-color: #E9F0FF;">
          <q-card-section>
            <q-icon name="o_description" size="61px" style="color: #3683FD;" class="cursor-pointer q-py-md" @click="goBack" />
            <div class="text-subtitle2" style="color: #3683FD;">by John Doe</div>
          </q-card-section>
        </q-card>
      </div>
    </div> -->

  </q-page>
</template>

<script>
export default {
  name: 'SapaDashboard',
  data () {
    return {
      slide: 1,
      images: [
        'https://cdn.quasar.dev/img/mountains.jpg',
        'https://cdn.quasar.dev/img/parallax1.jpg',
        'https://cdn.quasar.dev/img/parallax2.jpg',
        'https://cdn.quasar.dev/img/quasar.jpg'
      ]
    }
  },
  methods: {
  goBack () {
    this.$router.back()
  }
}
}
</script>

<style>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(
    to bottom,
    #3683FD 0%,
    #3683FD 15%,
    #78ACFE 30%,
    #e3f2fd 45%,
    #ffffff 85%
  );
}

.containerOne {
  padding: 20px;
  margin: 0;
}

.itemsContainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.itemsContainer > div:first-child {
  flex: 1;
}

.itemsContainer > div:last-child {
  display: flex;
  align-items: center;
}

.itemsContainer img {
  display: block;
}

.logo-shadow {
  filter: drop-shadow(0 0 2.5px #fff)
          drop-shadow(0 0 5px #fff);
}

.mobile-carousel {
  padding: 0 20px;
}

.carousel-slide {
  border-radius: 25px;
  overflow: hidden;
  transition: transform 0.35s ease;
}

.title {
  font-size: 18px;
  font-weight: 400;
  color: #000000;
} 

.sub-title {
  font-size: 12px;
  font-weight: 250;
  color: #000000;
}
</style>
