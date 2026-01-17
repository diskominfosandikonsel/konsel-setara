<template>
  <q-page class="dashboard-page">
    <div class="q-pa-md row items-center">
      <div class="col-4 text-white text-left">
        <q-icon name="r_close" size="35px" color="white" class="cursor-pointer" @click="goBack" />
      </div>

      <div class="col-4 text-white text-center flex flex-center">
        <img src="~assets/sapa/logo.svg" class="logo-shadow" width="52" />
      </div>

      <div class="col-4 text-white text-right">
      </div>
    </div>
      <q-carousel
        v-model="slide"
        :arrows="false"
        animated
        infinite
        swipeable
        :autoplay="7500"
        transition-prev="slide-right"
        transition-next="slide-left"
        height="175px"
        class="mobile-carousel bg-transparent"
        @touchstart="autoplay = false"
        @touchend="autoplay = true"
      >
        <q-carousel-slide
          v-for="n in 4"
          :key="n"
          :name="n"
          :img-src="images[n - 1]"
          class="carousel-slide"
        />
      </q-carousel>
    <div class="q-pa-md">
          <div class="text-center title">Selamat Datang di Sahabat<br/>Perempuan & Anak Konawe Selatan</div>
          <div class="text-center q-mt-xs sub-title">
            Platform Digital Pelaporan dan Edukasi Perlindungan
            <br />
            Perempuan & Anak Kabupaten Konawe Selatan
          </div>
    </div>
    <div class="row q-col-gutter-md q-px-md q-py-lg text-center">
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
</div>

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
