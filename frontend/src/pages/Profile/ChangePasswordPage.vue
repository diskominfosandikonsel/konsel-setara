<!--
  ============================================================================
  ChangePasswordPage.vue
  ============================================================================
  Deskripsi:
    Halaman Ganti Password — menampilkan form untuk mengubah password
    pengguna dengan input password baru dan konfirmasi password.

  Struktur Komponen:
    - Header         : Tombol kembali + judul "Ganti password"
    - Ikon dekoratif : Ilustrasi gembok (Password-Lock.png, 62px)
    - Form           : Input Password Baru, Konfirmasi Password Baru
    - Tombol         : "Verifikasi" untuk submit perubahan password

  Validasi:
    1. Password baru wajib diisi
    2. Konfirmasi password wajib diisi
    3. Konfirmasi password harus sama dengan password baru

  Aset Ikon (dari folder src/assets/profile/):
    - Password-Lock.png : ikon ilustrasi gembok besar (dekoratif)

  Desain Responsif:
    - Mobile  : tampilan penuh (default)
    - Tablet/Desktop (>=600px) : konten dibatasi max-width 600px, rata tengah
  ============================================================================
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
    <div class="content-wrapper q-pa-md">
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

      <!-- Input Password Baru -->
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

      <!-- Input Konfirmasi Password Baru -->
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
/**
 * Import aset ikon dekoratif dari folder src/assets/profile/
 */
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

  /**
   * data()
   * State reaktif komponen:
   * - passwordLockIcon   : path ikon dekoratif gembok
   * - password           : nilai input password baru (v-model)
   * - confirmPassword    : nilai input konfirmasi password (v-model)
   * - showPassword       : toggle visibilitas password baru
   * - showConfirmPassword: toggle visibilitas konfirmasi password
   * - loading            : status loading saat proses verifikasi
   * - submitted          : penanda apakah form sudah pernah di-submit
   */
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
    /**
     * confirmPasswordError
     * Mengembalikan pesan error untuk input konfirmasi password.
     * - Kosong jika belum di-submit atau sudah valid
     * - "Konfirmasi password wajib diisi" jika kosong
     * - "Konfirmasi password tidak cocok" jika tidak sama
     * @returns {string} pesan error validasi
     */
    confirmPasswordError() {
      if (!this.submitted) return "";
      if (!this.confirmPassword) return "Konfirmasi password wajib diisi";
      if (this.confirmPassword !== this.password)
        return "Konfirmasi password tidak cocok";
      return "";
    },
  },

  methods: {
    /**
     * onVerifikasi()
     * Handler ketika tombol "Verifikasi" diklik.
     * Melakukan validasi:
     *   1. Password baru tidak boleh kosong
     *   2. Konfirmasi password tidak boleh kosong
     *   3. Konfirmasi password harus sama dengan password baru
     *
     * TODO: Ganti logic di bawah dengan pemanggilan API sesungguhnya
     *       menggunakan axios.post (lihat dokumentasi API di atas).
     */
    onVerifikasi() {
      this.submitted = true;

      if (!this.password || this.confirmPasswordError) return;

      // TODO: Implementasi pemanggilan API ganti password di sini
      console.log("Verifikasi ganti password");
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
 * Ilustrasi gembok berukuran 62px di bagian atas konten.
 */
.decorative-icon {
  width: 62px;
  height: 62px;
  object-fit: contain;
}

/*
 * ===== LABEL INPUT =====
 * Label dipisahkan di atas input untuk presisi desain Figma.
 * Font Poppins 14px medium, warna hitam.
 */
.input-label {
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
}

/*
 * ===== INPUT PASSWORD =====
 * Input borderless dengan garis bawah manual warna #C1C1C1.
 */
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

/*
 * ===== TOGGLE IKON MATA =====
 * Ikon visibility untuk toggle tampil/sembunyikan password.
 */
.toggle-icon {
  color: #9e9e9e;
  font-size: 20px;
}

/*
 * ===== TOMBOL VERIFIKASI =====
 * Background #114EA4, teks putih, tinggi 53px, border-radius 8px.
 */
.btn-verifikasi {
  background-color: #114ea4;
  color: #ffffff;
  height: 53px;
  border-radius: 8px;
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
  