<template>
  <q-page class="profile-page q-pb-xl">
    <div class="page-container">
      <!-- Header -->
      <div class="row items-center q-px-md header-title q-pt-md">
        <q-btn flat round dense icon="keyboard_arrow_left" size="18px" @click="$router.back()" class="q-mr-sm" />
        <div class="text-h5 text-weight-regular text-black">Profile</div>
      </div>

      <div class="content-wrapper q-px-md q-pt-md q-pb-xl">
        <!-- Profile Card — tanpa foto, pakai inisial -->
        <q-card class="profile-card q-mb-lg no-shadow rounded-box q-pa-md cursor-pointer" @click="$router.push('/edit_profile')">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <div class="profile-initial q-mr-md">
                {{ userInitial }}
              </div>
              <div class="column">
                <div class="text-subtitle1 text-weight-bold text-black" style="line-height: 1.2;">{{ userName }}</div>
                <div class="text-caption text-grey-6" style="line-height: 1.2; margin-top: 2px;">@{{ userUsername }}</div>
                <div class="text-caption text-grey-7" style="line-height: 1.2; margin-top: 4px;">{{ userEmail }}</div>
                <div class="text-caption text-grey-7" style="line-height: 1.2; margin-top: 2px;">{{ userHp }}</div>
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
            <q-item clickable v-ripple class="q-py-md" @click="$router.push('/account_settings')">
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
            <q-item clickable v-ripple class="q-py-md item-bordered" @click="$router.push('/syarat-ketentuan')">
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
            <q-item clickable v-ripple class="q-py-md" @click="$router.push('/kebijakan-privasi')">
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

<script>
import { useAuthStore } from 'src/stores/auth';
import { Dialog } from 'quasar';

export default {
    name: 'ProfilPage',

    computed: {
      auth() {
        return useAuthStore()
      },
      userName() {
        const u = this.auth.user
        return u?.nama || u?.name || u?.full_name || '-'
      },
      userUsername() {
        const u = this.auth.user
        return u?.username || '-'
      },
      userEmail() {
        const u = this.auth.user
        return u?.email || '-'
      },
      userHp() {
        const u = this.auth.user
        return u?.hp || u?.phone || u?.no_hp || u?.no_telp || '-'
      },
      userInitial() {
        const name = this.userName
        if (!name || name === '-') return '?'
        return name.charAt(0).toUpperCase()
      }
    },

    methods: {
        async handleLogout() {
          Dialog.create({
            title: 'Konfirmasi Keluar',
            message: 'Apakah Anda yakin ingin keluar dari akun ini?',
            cancel: {
              color: 'grey',
              label: 'Batal',
              flat: true
            },
            ok: {
              color: 'negative',
              label: 'Ya, Keluar',
              unelevated: true
            },
            persistent: true
          }).onOk(async () => {
            const success = await this.auth.logout()
            console.log('Logging out...')
            
            if (success) {
              this.$router.push('/')
            }
          })
        }
    }
}
</script>

<style scoped>
.profile-page {
  background-color: #f2eeeb;
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

/* ─── INISIAL AVATAR ─── */
.profile-initial {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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
    background: transparent;
  }
  
  .content-wrapper {
    padding-top: 10px;
  }

  .profile-initial {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }

  .profile-card .text-subtitle1 {
    font-size: 22px !important;
    margin-bottom: 2px;
  }
  .profile-card .text-caption {
    font-size: 15px !important;
  }
  .profile-card .q-icon {
    font-size: 28px !important;
  }

  .section-title {
    font-size: 1.25rem;
    margin-bottom: 12px;
  }

  .menu-card .q-item {
    padding-top: 18px !important;
    padding-bottom: 18px !important;
  }
  
  .menu-card .q-icon {
    font-size: 28px !important;
  }
  
  .menu-card .text-weight-medium {
    font-size: 17px !important;
  }
  
  .menu-card .q-item__section--avatar {
    min-width: 50px !important;
  }
}

@media (min-width: 900px) {
  .page-container {
    max-width: 800px;
  }

  .content-wrapper {
    padding-top: 24px; 
  }

  .profile-initial {
    width: 100px;
    height: 100px;
    font-size: 40px;
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

  .menu-card .q-item {
    padding-top: 22px !important;
    padding-bottom: 22px !important;
  }
  
  .menu-card .q-icon {
    font-size: 32px !important; 
  }
  
  .menu-card .text-weight-medium {
    font-size: 19px !important;
  }
}
</style>
