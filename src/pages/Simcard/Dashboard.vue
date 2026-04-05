<template>
  <q-page class="dashboard-page">



    <div class="containerOne ">
        <div class="itemsContainer">
            <div>
                <p class="text-white">Eleanor Pena</p>
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
        <!-- <q-card-section> 
            <div class="text-black text-left">Halaman Login Aplikasi Simcard</div> 
        </q-card-section> -->
         

          <div class="text-black text-left" style="padding:10px 10px 0px 10px; font-weight: bold;">Kartu Keluarga</div>
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('KK1')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/firetap.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Baru
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Pembuatan kartu keluarga baru
                </div>
              </div>
            </div>
          </div> 
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('KK2')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/firetap.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Perubahan
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Perubahan kartu keluarga  
                </div>
              </div>
            </div>
          </div> 
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('KK3')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/firetap.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Warga Negara Asing
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Pembuatan kartu keluarga baru WNA
                </div>
              </div>
            </div>
          </div> 
          
          <div class="text-black text-left" style="padding:10px 10px 0px 10px; font-weight: bold;">Pindah Penduduk</div>
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('PPD1')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/firetap2.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Provinsi
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Perpindahan penduduk antar Provinsi
                </div>
  
              </div>
            </div>
          </div> 
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('PPD2')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/firetap2.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Kabupaten/Kota
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Perpindahan penduduk antar Kabupaten Kota
                </div>
  
              </div>
            </div>
          </div> 
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('PPD3')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/firetap2.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Antar Desa/Kelurahan
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Perpindahan penduduk antar Desa / Kelurahan
                </div>
  
              </div>
            </div>
          </div> 

          <div class="text-black text-left" style="padding:10px 10px 0px 10px; font-weight: bold;">Kelahiran</div>
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('LAHIR1')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/firetap3.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Kelahiran
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Surat Keterangan Kelahiran
                </div>
  
              </div>
            </div>
          </div> 
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('LAHIR2')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/firetap3.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Surat Keterangan Kelahiran
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  (Anak Yang Tidak Diketahui Asal-Usulnya)
                </div>
  
              </div>
            </div>
          </div> 

          <div class="text-black text-left" style="padding:10px 10px 0px 10px; font-weight: bold;">Pelaporan Kematian</div>
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('MATI1')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/firetap4.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Pelaporan Lahir Mati
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Pelaporan Lahir Mati
                </div>
  
              </div>
            </div>
          </div>           
          <div style="padding:10px 10px 0px 10px; border-bottom: 1.5px solid #D9D9D9;">
            <div class="row" @click="pindahKe('MATI2')">
              <div style="color:#6C7278;">
                <img src="~assets/simcard/firetap4.png" style="width: 100%; height: 56px;" alt="">
              </div>
              <div class="flex-break col self-center" style="margin-left: 11px;">
                <div style="color:#000000;font-size: 12px;font-weight: bold;">
                  Pelaporan Kematian
                </div>
                <div style="color:#6C7278;font-size: 12px;">
                  Pelaporan Kematian
                </div>
  
              </div>
            </div>
          </div>           



         
 
        </q-card>
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
  },
  pindahKe(halaman){
    this.$router.push(halaman)
  },
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
