<!--
  ChangePasswordPage.vue
  Halaman Ganti Password — form input password baru & konfirmasi.
  Responsif menggunakan konsep Max-width Container & Pair-based Grouping.
-->

<template>
  <q-page class="q-pa-md bg-white">
    <!-- Header Ganti Password -->
    <div class="row items-center q-mb-lg header-title">
      <q-btn
        flat
        round
        dense
        icon="keyboard_arrow_left"
        size="18px"
        @click="$router.back()"
        class="q-mr-sm"
      />
      <div class="text-h5 text-weight-regular text-black">Ganti password</div>
    </div>

    <!-- Konten utama -->
    <div class="page-container q-pa-md">
      <!-- Ikon dekoratif gembok -->
      <div class="q-mb-md">
        <img
          :src="passwordLockIcon"
          alt="Password lock icon"
          class="decorative-icon"
        />
      </div>

      <!-- Judul dan instruksi -->
      <div class="text-h6 text-weight-bold q-mb-xs" style="color: #000000">
        Ganti Password
      </div>
      <div class="text-body2 text-grey-7 q-mb-lg" style="font-size: 14px">
        Silakan masukan Password Baru anda
      </div>

      <!-- Pair-based Grouping: label + input password baru -->
      <div class="q-mb-md">
        <div class="input-label q-mb-xs">
          Password Baru <span class="text-red">*</span>
        </div>

        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          borderless
          dense
          placeholder="Masukkan password baru"
          class="password-input"
          :error="submitted && !password"
          error-message="Password baru wajib diisi"
          hide-bottom-space
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer toggle-icon"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </div>

      <!-- Pair-based Grouping: label + input konfirmasi password -->
      <div class="q-mb-lg">
        <div class="input-label q-mb-xs">
          Konfirmasi Password Baru <span class="text-red">*</span>
        </div>

        <q-input
          v-model="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          borderless
          dense
          placeholder="Konfirmasi password baru"
          class="password-input"
          :error="submitted && confirmPasswordError !== ''"
          :error-message="confirmPasswordError"
          hide-bottom-space
        >
          <template #append>
            <q-icon
              :name="showConfirmPassword ? 'visibility' : 'visibility_off'"
              class="cursor-pointer toggle-icon"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </q-input>
      </div>

      <!-- Tombol Verifikasi -->
      <q-btn
        label="Verifikasi"
        unelevated
        no-caps
        class="full-width btn-verifikasi"
        :loading="loading"
        @click="onVerifikasi"
      />
    </div>
  </q-page>
</template>

<script>
import passwordLockIcon from "src/assets/profile/Password-Lock.png";

/**
 * ============================================================================
 * DOKUMENTASI API — Ganti Password
 * ============================================================================
 *
 * Endpoint  : POST /api/user/change-password
 * Deskripsi : Mengubah password pengguna dengan password baru
 *             setelah validasi konfirmasi password berhasil.
 *
 * Headers:
 *   Authorization: Bearer <token>
 *
 * Request Body:
 *   {
 *     "password": "newPassword123",
 *     "password_confirmation": "newPassword123"
 *   }
 *
 * Response Sukses (200):
 *   {
 *     "success": true,
 *     "message": "Password berhasil diubah"
 *   }
 *
 * Response Gagal (422):
 *   {
 *     "success": false,
 *     "message": "Konfirmasi password tidak cocok"
 *   }
 *
 * Contoh Implementasi:
 *   import { api } from 'src/boot/axios';
 *
 *   async onVerifikasi() {
 *     try {
 *       this.loading = true;
 *       const response = await api.post('/api/user/change-password', {
 *         password: this.password,
 *         password_confirmation: this.confirmPassword,
 *       });
 *
 *       if (response.data.success) {
 *         this.$q.notify({ type: 'positive', message: response.data.message });
 *         this.$router.push('/account_settings');
 *       }
 *     } catch (error) {
 *       this.$q.notify({ type: 'negative', message: 'Gagal mengubah password' });
 *     } finally {
 *       this.loading = false;
 *     }
 *   }
 * ============================================================================
 */

export default {
  name: "ChangePasswordPage",

  // State form ganti password.
  data() {
    return {
      passwordLockIcon,
      password: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      submitted: false,
    };
  },

  computed: {
    // Pesan error validasi konfirmasi password.
    confirmPasswordError() {
      if (!this.submitted) return "";
      if (!this.confirmPassword) return "Konfirmasi password wajib diisi";
      if (this.confirmPassword !== this.password)
        return "Konfirmasi password tidak cocok";
      return "";
    },
  },

  methods: {
    // Handler tombol Verifikasi: validasi lalu panggil API.
    onVerifikasi() {
      this.submitted = true;
      if (!this.password || this.confirmPasswordError) return;

      // TODO: POST /api/user/change-password
      console.log("Verifikasi ganti password");
    },
  },
};
</script>

<style scoped>
/* Header halaman — border tembus hingga pinggir layar */
.header-title {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;
  padding-right: 16px;
}

/* Max-width Container — membatasi lebar konten di tablet/desktop */
.page-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.decorative-icon {
  width: 62px;
  height: 62px;
  object-fit: contain;
}

.input-label {
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
}

.password-input {
  border-bottom: 1px solid #c1c1c1;
}

.password-input :deep(.q-field__control) {
  padding: 0;
}

.password-input :deep(input) {
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  color: #000000;
}

.toggle-icon {
  color: #9e9e9e;
  font-size: 20px;
}

.btn-verifikasi {
  background-color: #114ea4;
  color: #ffffff;
  height: 53px;
  border-radius: 8px;
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  font-weight: 600;
}

/* Responsif tablet/desktop */
@media (min-width: 600px) {
  .page-container {
    padding-top: 24px;
  }
}
</style>
