<!--
  ============================================================================
  ChangeEmailPage.vue
  ============================================================================
  Deskripsi:
    Halaman Ganti Email — menampilkan form untuk memverifikasi email
    pengguna sebelum melakukan perubahan alamat email.

  Struktur Komponen:
    - Header       : Tombol kembali + judul "Ganti email"
    - Ikon dekoratif: Ilustrasi email (Mail-Send.png, 62px)
    - Form         : Input email terdaftar + tombol Verifikasi

  Alur Pengguna:
    1. Pengguna melihat email terdaftar saat ini
    2. Pengguna memasukkan/mengedit email aktif
    3. Klik tombol "Verifikasi" untuk memulai proses verifikasi

  Aset Ikon (dari folder src/assets/profile/):
    - Mail-Send.png : ikon ilustrasi email besar (dekoratif)

  Desain Responsif:
    - Mobile  : tampilan penuh (default)
    - Tablet/Desktop (>=600px) : konten dibatasi max-width 600px, rata tengah
  ============================================================================
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
    <div class="content-wrapper q-pa-md">
      <!-- Ikon dekoratif email -->
      <div class="q-mb-md">
        <img
          :src="mailSendIcon"
          alt="Mail icon"
          class="decorative-icon"
        />
      </div>

      <!-- Judul dan instruksi -->
      <div class="text-h6 text-weight-bold q-mb-xs" style="color: #000000">
        Ganti email
      </div>
      <div class="text-body2 text-grey-7 q-mb-lg" style="font-size: 14px">
        Silakan masukan email aktif anda
      </div>

      <!-- Form input email -->
      <div class="q-mb-lg">
        <!-- Label terpisah di atas input -->
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
/**
 * Import aset ikon dekoratif dari folder src/assets/profile/
 */
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
 * Request Body:
 *   {
 *     "email": "user@example.com"   // Email aktif yang akan diverifikasi
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

  /**
   * data()
   * State reaktif komponen:
   * - mailSendIcon : path ikon dekoratif email
   * - email        : nilai input email pengguna (v-model)
   * - loading      : status loading saat proses verifikasi berjalan
   * - submitted    : penanda apakah form sudah pernah di-submit (untuk validasi)
   */
  data() {
    return {
      mailSendIcon,
      email: "",
      loading: false,
      submitted: false,
    };
  },

  computed: {
    /**
     * isEmailValid
     * Memvalidasi format email menggunakan regex sederhana.
     * Mengecek keberadaan karakter @, domain, dan TLD.
     * @returns {boolean} true jika format email valid
     */
    isEmailValid() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(this.email);
    },

    /**
     * emailErrorMessage
     * Mengembalikan pesan error yang sesuai berdasarkan kondisi input.
     * @returns {string} pesan error validasi
     */
    emailErrorMessage() {
      if (!this.email) return "Email wajib diisi";
      if (!this.isEmailValid) return "Format email tidak valid";
      return "";
    },
  },

  methods: {
    /**
     * onVerifikasi()
     * Handler ketika tombol "Verifikasi" diklik.
     * Melakukan validasi format email terlebih dahulu,
     * kemudian memanggil API verifikasi email.
     *
     * TODO: Ganti logic di bawah dengan pemanggilan API sesungguhnya
     *       menggunakan axios.post (lihat dokumentasi API di atas).
     */
    onVerifikasi() {
      this.submitted = true;

      if (!this.isEmailValid) return;

      // TODO: Implementasi pemanggilan API verifikasi email di sini
      console.log("Verifikasi email:", this.email);
    },
  },
};
</script>

<style scoped>
/*
 * ===== HEADER =====
 * Garis bawah pada header dengan trik margin negatif
 * agar border tembus hingga pinggir layar.
 */
.header-title {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;
  padding-right: 16px;
}

/*
 * ===== IKON DEKORATIF =====
 * Ilustrasi email berukuran 62px di bagian atas konten.
 */
.decorative-icon {
  width: 62px;
  height: 62px;
  object-fit: contain;
}

/*
 * ===== LABEL INPUT =====
 * Label "Email terdaftar *" dipisahkan di atas input
 * untuk menjaga presisi desain sesuai Figma.
 */
.input-label {
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
}

/*
 * ===== INPUT EMAIL =====
 * Input borderless dengan garis bawah manual warna #C1C1C1.
 */
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

/*
 * ===== TOMBOL VERIFIKASI =====
 * Background #114EA4, teks putih, tinggi 53px, border-radius 10px.
 */
.btn-verifikasi {
  background-color: #114ea4;
  color: #ffffff;
  height: 53px;
  border-radius: 10px;
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  font-weight: 600;
}

/*
 * ===== RESPONSIF: TABLET / DESKTOP =====
 * Pada layar >= 600px, konten dibatasi max-width 600px
 * dan diposisikan rata tengah.
 */
@media (min-width: 600px) {
  .content-wrapper {
    max-width: 600px;
    margin: 0 auto;
    padding-top: 24px;
  }
}
</style>
  