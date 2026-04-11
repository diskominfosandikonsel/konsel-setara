<template>
  <q-page class="profile-page q-pb-xl">
    <div class="page-container">
      <!-- Header -->
      <div class="row items-center q-px-md header-title q-pt-md">
        <q-btn flat round dense icon="keyboard_arrow_left" size="18px" @click="$router.back()" class="q-mr-sm" />
        <div class="text-h5 text-weight-regular text-black">Profile</div>
      </div>

      <div class="content-wrapper q-px-md q-pt-md q-pb-xl">
        <!-- Profile Card -->
        <q-card class="profile-card q-mb-lg no-shadow rounded-box q-pa-md cursor-pointer" @click="$router.push('/edit_profile')">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <q-avatar size="60px" class="q-mr-md bg-grey-3">
                <!-- Using standard picsum or placeholder for avatar -->
                <img src="https://picsum.photos/200/200?random=10" />
              </q-avatar>
              <div class="column">
                <div class="text-subtitle1 text-weight-bold text-black" style="line-height: 1.2;">Abram</div>
                <div class="text-caption text-grey-7" style="line-height: 1.2; margin-bottom: 2px;">user_ifoid@gmail.com</div>
                <div class="text-caption text-grey-7" style="line-height: 1.2;">+6281080709012</div>
              </div>
            </div>
            <div>
              <q-icon name="edit" size="22px" color="grey-8" />
            </div>
          </div>
        </q-card>

        <!-- Preferensi Section -->
        <div class="section-title q-mb-sm text-grey-9 text-weight-medium">Preferensi</div>
        <q-card class="menu-card q-mb-lg no-shadow rounded-box">
          <q-list class="rounded-borders">
            <q-item clickable v-ripple class="q-py-md">
              <q-item-section avatar class="q-pr-sm" style="min-width: 40px;">
                <q-icon name="security" size="24px" color="grey-9" />
              </q-item-section>
              <q-item-section class="text-weight-medium text-grey-9">
                Pengaturan Akun
              </q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" size="24px" color="grey-7" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- Lainnya Section -->
        <div class="section-title q-mb-sm text-grey-9 text-weight-medium">Lainnya</div>
        <q-card class="menu-card q-mb-lg no-shadow rounded-box">
          <q-list class="rounded-borders">
            <!-- Panduan Konsel Digital -->
            <q-item clickable v-ripple class="q-py-md item-bordered">
              <q-item-section avatar class="q-pr-sm" style="min-width: 40px;">
                <q-icon name="book" size="24px" color="grey-9" />
              </q-item-section>
              <q-item-section class="text-weight-medium text-grey-9">
                Panduan Konsel Digital
              </q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" size="24px" color="grey-7" />
              </q-item-section>
            </q-item>

            <!-- Syarat & Ketentuan -->
            <q-item clickable v-ripple class="q-py-md item-bordered">
              <q-item-section avatar class="q-pr-sm" style="min-width: 40px;">
                <q-icon name="description" size="24px" color="grey-9" />
              </q-item-section>
              <q-item-section class="text-weight-medium text-grey-9">
                Syarat & Ketentuan
              </q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" size="24px" color="grey-7" />
              </q-item-section>
            </q-item>

            <!-- Kebijakan Privasi -->
            <q-item clickable v-ripple class="q-py-md">
              <q-item-section avatar class="q-pr-sm" style="min-width: 40px;">
                <q-icon name="privacy_tip" size="24px" color="grey-9" />
              </q-item-section>
              <q-item-section class="text-weight-medium text-grey-9">
                Kebijakan Privasi
              </q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" size="24px" color="grey-7" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- Keluar Section -->
        <q-card class="menu-card q-mb-xl no-shadow rounded-box">
          <q-list class="rounded-borders">
            <q-item clickable v-ripple class="q-py-md" @click="handleLogout">
              <q-item-section avatar class="q-pr-sm" style="min-width: 40px;">
                <q-icon name="logout" size="24px" color="grey-9" />
              </q-item-section>
              <q-item-section class="text-weight-medium text-grey-9">
                Keluar
              </q-item-section>
              <q-item-section side>
                <q-icon name="keyboard_arrow_right" size="24px" color="grey-7" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script >
import { useAuthStore } from 'src/stores/auth';
import { Notify, Dialog } from 'quasar';

export default {
    name : 'ProfilPage',

    methods: {
        async handleLogout() {
          const auth = useAuthStore()
          auth.logout()

          this.$router.push('/')
        }
    }
}
</script>

<style scoped>
.profile-page {
  background-color: #f2eeeb; /* Matches the slightly warm greyish background in the image */
  min-height: 100vh;
}

.header-title {
  padding-bottom: 14px;
}

.rounded-box {
  border-radius: 16px;
}

.profile-card {
  transition: background-color 0.2s ease;
}

.profile-card:active {
  background-color: #f5f5f5;
}

.section-title {
  font-size: 1.05rem;
  margin-left: 4px;
}

.item-bordered {
  border-bottom: 1px solid #f0f0f0;
}

/* Tablet / Desktop Responsive */
@media (min-width: 600px) {
  .page-container {
    max-width: 600px;
    margin: 0 auto;
    /* Memberi jarak/bayangan tipis sebagai layout "Mobile inside Tablet" */
    background: transparent;
  }
  
  .content-wrapper {
    padding-top: 10px; /* Menyesuaikan agar tidak terlalu longgar */
  }

  /* ----- UPSCALING ELEMENT UNTUK TABLET ----- */
  /* Profile Card Header */
  .profile-card .q-avatar {
    font-size: 80px !important; /* Standarnya 60px */
  }
  .profile-card .text-subtitle1 {
    font-size: 22px !important;
    margin-bottom: 2px;
  }
  .profile-card .text-caption {
    font-size: 15px !important;
  }
  .profile-card .q-icon {
    font-size: 28px !important; /* Standar 22px */
  }

  /* Judul Section (Preferensi, Lainnya) */
  .section-title {
    font-size: 1.25rem;
    margin-bottom: 12px;
  }

  /* Baris Menu */
  .menu-card .q-item {
    padding-top: 18px !important;
    padding-bottom: 18px !important;
  }
  
  /* Ikon pada Menu */
  .menu-card .q-icon {
    font-size: 28px !important; /* Standar 24px */
  }
  
  /* Teks pada Menu */
  .menu-card .text-weight-medium {
    font-size: 17px !important;
  }
  
  /* Jarak ikon dan teks menu */
  .menu-card .q-item__section--avatar {
    min-width: 50px !important; /* Melebarkan inline style bawaan */
  }
}

/* Desktop / Tablet Landscape Responsive */
@media (min-width: 900px) {
  .page-container {
    max-width: 800px; /* Melebarkan kontainer utama di atas 900px */
  }

  .content-wrapper {
    padding-top: 24px; 
  }

  /* Profile Card Header Extra Besar */
  .profile-card .q-avatar {
    font-size: 100px !important; /* Standarnya 60px -> Tablet 80px */
  }
  .profile-card .text-subtitle1 {
    font-size: 26px !important;
  }
  .profile-card .text-caption {
    font-size: 16px !important;
  }
  .profile-card .q-icon {
    font-size: 32px !important;
  }

  /* Baris Menu */
  .menu-card .q-item {
    padding-top: 22px !important;
    padding-bottom: 22px !important;
  }
  
  /* Ikon pada Menu */
  .menu-card .q-icon {
    font-size: 32px !important; 
  }
  
  /* Teks pada Menu */
  .menu-card .text-weight-medium {
    font-size: 19px !important;
  }
}
</style>
