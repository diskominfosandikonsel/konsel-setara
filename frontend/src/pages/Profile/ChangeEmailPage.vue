<!--
  ChangeEmailPage.vue
  Halaman Ganti Email — form verifikasi email pengguna.
  Responsif menggunakan konsep Max-width Container & Pair-based Grouping.
-->

<template>
  <q-page class="q-pa-md bg-white">
    <!-- Header Ganti Email -->
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
      <div class="text-h5 text-weight-regular text-black">Ganti email</div>
    </div>

    <!-- Konten utama -->
    <div class="page-container q-pa-md">
      <!-- Ikon dekoratif email -->
      <div class="q-mb-md">
        <img :src="mailSendIcon" alt="Mail icon" class="decorative-icon" />
      </div>

      <!-- Judul dan instruksi -->
      <div class="text-h6 text-weight-bold q-mb-xs" style="color: #000000">
        Ganti email
      </div>
      <div class="text-body2 text-grey-7 q-mb-lg" style="font-size: 14px">
        Silakan masukan email aktif anda
      </div>

      <!-- Pair-based Grouping: label + input email -->
      <div class="q-mb-lg">
        <div class="input-label q-mb-xs">
          Email terdaftar <span class="text-red">*</span>
        </div>

        <q-input
          v-model="email"
          type="email"
          borderless
          dense
          placeholder="contoh@email.com"
          class="email-input"
          :error="submitted && !isEmailValid"
          :error-message="emailErrorMessage"
          hide-bottom-space
        />
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
import mailSendIcon from "src/assets/profile/Mail-Send.png";

/**
 * ============================================================================
 * DOKUMENTASI API — Verifikasi Email
 * ============================================================================
 *
 * Endpoint  : POST /api/user/verify-email
 * Deskripsi : Mengirim kode verifikasi ke alamat email yang dimasukkan
 *             pengguna untuk memulai proses perubahan email.
 *
 * Headers:
 *   Authorization: Bearer <token>
 *
 * Request Body:
 *   {
 *     "email": "user@example.com"
 *   }
 *
 * Response Sukses (200):
 *   {
 *     "success": true,
 *     "message": "Kode verifikasi telah dikirim ke email anda"
 *   }
 *
 * Response Gagal (422):
 *   {
 *     "success": false,
 *     "message": "Format email tidak valid"
 *   }
 *
 * Contoh Implementasi:
 *   import { api } from 'src/boot/axios';
 *
 *   async onVerifikasi() {
 *     try {
 *       this.loading = true;
 *       const response = await api.post('/api/user/verify-email', {
 *         email: this.email,
 *       });
 *
 *       if (response.data.success) {
 *         this.$q.notify({ type: 'positive', message: response.data.message });
 *         this.$router.push('/verify-otp');
 *       }
 *     } catch (error) {
 *       this.$q.notify({ type: 'negative', message: 'Gagal mengirim verifikasi' });
 *     } finally {
 *       this.loading = false;
 *     }
 *   }
 * ============================================================================
 */

export default {
  name: "ChangeEmailPage",

  // State form verifikasi email.
  data() {
    return {
      mailSendIcon,
      email: "",
      loading: false,
      submitted: false,
    };
  },

  computed: {
    // Validasi format email dengan regex sederhana.
    isEmailValid() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.email);
    },

    // Pesan error validasi input email.
    emailErrorMessage() {
      if (!this.email) return "Email wajib diisi";
      if (!this.isEmailValid) return "Format email tidak valid";
      return "";
    },
  },

  methods: {
    // Handler tombol Verifikasi: validasi lalu panggil API.
    onVerifikasi() {
      this.submitted = true;
      if (!this.isEmailValid) return;

      // TODO: POST /api/user/verify-email { email }
      console.log("Verifikasi email:", this.email);
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

.email-input {
  border-bottom: 1px solid #c1c1c1;
}

.email-input :deep(.q-field__control) {
  padding: 0;
}

.email-input :deep(input) {
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  color: #000000;
}

.btn-verifikasi {
  background-color: #114ea4;
  color: #ffffff;
  height: 53px;
  border-radius: 10px;
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
