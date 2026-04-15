<template>
  <q-page class="page-container bg-white">
    <!-- Header (Sticky) -->
    <div class="sticky-header">
      <div class="header-inner q-px-md">
        <div class="row items-center header-title">
          <q-btn
            flat
            round
            dense
            icon="keyboard_arrow_left"
            size="18px"
            @click="$router.back()"
            class="q-mr-sm"
          />
          <div class="text-h5 text-weight-regular text-black">Ubah Profil</div>
        </div>
      </div>
    </div>

    <!-- Konten utama (Scrollable) -->
    <div class="content-wrapper q-pa-md">

      <!-- ===== INISIAL AVATAR ===== -->
      <div class="row items-center q-mb-lg q-pt-md">
        <div class="profile-initial q-mr-md">
          {{ userInitial }}
        </div>
        <div class="col column justify-center">
          <div class="text-subtitle1 text-weight-bold text-black" style="line-height: 1.3;">{{ form.nama || '-' }}</div>
          <div class="text-caption text-grey-6" style="line-height: 1.3;">@{{ form.username || '-' }}</div>
        </div>
      </div>

      <!-- ===== FORM DATA PROFIL ===== -->
      <div class="row q-col-gutter-md">

        <!-- Username -->
        <div class="col-12">
          <div class="field-label">Username <span class="text-red">*</span></div>
          <q-input
            v-model="form.username"
            borderless
            dense
            hide-bottom-space
            placeholder="username"
            class="field-input"
          />
        </div>

        <!-- Nama -->
        <div class="col-12">
          <div class="field-label">Nama Lengkap <span class="text-red">*</span></div>
          <q-input
            v-model="form.nama"
            borderless
            dense
            hide-bottom-space
            placeholder="Nama lengkap"
            class="field-input"
          />
        </div>

        <!-- Nomor HP -->
        <div class="col-12 col-sm-6">
          <div class="field-label">Nomor HP <span class="text-red">*</span></div>
          <q-input
            v-model="form.hp"
            borderless
            dense
            hide-bottom-space
            placeholder="08xxxxxxxxxx"
            class="field-input"
          />
        </div>

        <!-- Email -->
        <div class="col-12 col-sm-6">
          <div class="field-label">Email <span class="text-red">*</span></div>
          <q-input
            v-model="form.email"
            type="email"
            borderless
            dense
            hide-bottom-space
            placeholder="email@contoh.com"
            class="field-input"
          />
        </div>

      </div>

      <!-- ===== TOMBOL SIMPAN ===== -->
      <div class="row justify-end q-mt-xl q-mb-md">
        <q-btn
          label="Simpan"
          unelevated
          no-caps
          class="btn-simpan shadow-2"
          :loading="loading"
          @click="simpanProfile"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
/**
 * ============================================================================
 * DOKUMENTASI API — Edit Profil
 * ============================================================================
 *
 * 1. MENGAMBIL DATA PROFIL (mounted)
 * -----------------------------------
 * Endpoint  : GET /api/user/profile
 * Headers:
 *   Authorization: Bearer <token>
 *
 * Response Sukses (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "username": "andi123",
 *       "nama": "Andi",
 *       "email": "andi@gmail.com",
 *       "hp": "081212145607"
 *     }
 *   }
 *
 * 2. MENYIMPAN DATA PROFIL (simpanProfile)
 * -----------------------------------------
 * Endpoint  : PUT /api/user/profile
 * Headers:
 *   Authorization: Bearer <token>
 *   Content-Type: application/json
 *
 * Request Body:
 *   {
 *     "username": "andi123",
 *     "nama": "Andi",
 *     "email": "andi@gmail.com",
 *     "hp": "081212145607"
 *   }
 *
 * Response Sukses (200):
 *   {
 *     "success": true,
 *     "message": "Profil berhasil diperbarui"
 *   }
 * ============================================================================
 */

import { useAuthStore } from 'src/stores/auth';
import { ProfileService } from 'src/services/profile.service';

export default {
  name: "EditProfilePage",

  data() {
    return {
      loading: false,
      originalUsername: "",
      form: {
        username: "",
        nama: "",
        hp: "",
        email: "",
      },
    };
  },

  computed: {
    auth() {
      return useAuthStore()
    },
    userInitial() {
      const name = this.form.nama
      if (!name) return '?'
      return name.charAt(0).toUpperCase()
    }
  },

  async mounted() {
    // Ambil data profil dari backend
    try {
      const res = await ProfileService.getProfile()
      if (res.data?.success && res.data?.data) {
        const d = res.data.data
        this.form.username = d.username || ''
        this.form.nama = d.nama || ''
        this.form.hp = d.hp || ''
        this.form.email = d.email || ''
        this.originalUsername = d.username || ''
      }
    } catch (err) {
      console.warn('Gagal ambil profil dari server, pakai data lokal:', err?.message)
      // Fallback: prefill dari data user di auth store
      const u = this.auth.user
      if (u) {
        this.form.username = u.username || ''
        this.form.nama = u.nama || u.name || u.full_name || ''
        this.form.hp = u.hp || u.phone || u.no_hp || u.no_telp || ''
        this.form.email = u.email || ''
        this.originalUsername = u.username || ''
      }
    }
  },

  methods: {
    async simpanProfile() {
      // Validasi dasar
      if (!this.form.username || !this.form.nama || !this.form.hp || !this.form.email) {
        return this.$q.notify({
          message: 'Semua field wajib diisi',
          color: 'negative',
          icon: 'warning'
        })
      }

      this.loading = true

      try {
        const res = await ProfileService.updateProfile({
          username: this.form.username,
          nama: this.form.nama,
          hp: this.form.hp,
          email: this.form.email
        })

        if (res.data?.success) {
          // Update data di auth store dan localStorage
          const updatedUser = {
            ...this.auth.user,
            username: this.form.username,
            nama: this.form.nama,
            hp: this.form.hp,
            email: this.form.email
          }
          this.auth.user = updatedUser
          localStorage.setItem('user', JSON.stringify(updatedUser))

          this.$q.notify({
            message: res.data.message || 'Profil berhasil diperbarui',
            color: 'positive',
            icon: 'check_circle'
          })

          // Jika username berubah, logout karena token sudah tidak valid
          if (this.form.username !== this.originalUsername) {
            this.$q.notify({
              message: 'Username berubah. Silakan login ulang.',
              color: 'info',
              icon: 'info',
              timeout: 2000
            })
            setTimeout(() => {
              this.auth.logout()
              this.$router.replace('/')
            }, 1500)
          } else {
            // Update data di auth store dan localStorage
            const updatedUser = {
              ...this.auth.user,
              username: this.form.username,
              nama: this.form.nama,
              hp: this.form.hp,
              email: this.form.email
            }
            this.auth.user = updatedUser
            localStorage.setItem('user', JSON.stringify(updatedUser))
            this.$router.back()
          }
        } else {
          this.$q.notify({
            message: res.data?.message || 'Gagal menyimpan profil',
            color: 'negative',
            icon: 'error'
          })
        }
      } catch (err) {
        console.error('Simpan profil error:', err)
        this.$q.notify({
          message: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil',
          color: 'negative',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },
  },
};
</script>

<style scoped>
/* Page container: header sticky + content scrollable */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.sticky-header {
  flex-shrink: 0;
  background-color: #ffffff;
  z-index: 10;
  border-bottom: 1px solid #e0e0e0;
  padding-top: 16px;
}

.header-inner {
  padding-top: 0px;
}

.header-title {
  padding-bottom: 12px;
}

.content-wrapper {
  flex-grow: 1;
  overflow-y: auto;
}

/* ─── INISIAL AVATAR ─── */
.profile-initial {
  width: 63px;
  height: 63px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Tombol Simpan */
.btn-simpan {
  background-color: #114ea4;
  color: #ffffff;
  width: 95px;
  height: 31px;
  border-radius: 8px;
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-weight: 500;
}

.field-label {
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #757575;
  margin-bottom: 2px;
}

.field-input {
  border-bottom: 1px solid #c1c1c1;
}

.field-input :deep(.q-field__control) {
  padding: 0;
}

.field-input :deep(input) {
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #000000;
}

/* ===== Responsive ===== */
@media (min-width: 600px) {
  .content-wrapper {
    max-width: 95%;
    margin: 0 auto;
    padding-top: 24px;
    padding-left: 32px;
    padding-right: 32px;
  }

  .field-input :deep(input) {
    font-size: 17px;
  }
}

@media (min-width: 900px) {
  .header-inner,
  .content-wrapper {
    max-width: 800px;
  }
}

@media (min-width: 1200px) {
  .header-inner,
  .content-wrapper {
    max-width: 900px;
  }
}
</style>
