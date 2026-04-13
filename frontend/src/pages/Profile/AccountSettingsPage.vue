<!--
  ============================================================================
  AccountSettingsPage.vue
  ============================================================================
  Deskripsi:
    Halaman Pengaturan Akun — menampilkan daftar menu navigasi untuk
    mengelola pengaturan akun pengguna (ganti email, ganti password,
    hapus akun). Halaman ini bersifat statis tanpa pemanggilan API,
    hanya berfungsi sebagai penghubung ke halaman-halaman tujuan.

  Struktur Komponen:
    - Header   : Tombol kembali + judul "Pengaturan akun"
    - Konten   : Daftar menu menggunakan q-list & q-item (Quasar)

  Menu Navigasi:
    1. Ganti email     -> /change_email
    2. Ganti Password  -> /change_password
    3. Hapus Akun      -> /delete_account

  Aset Ikon (dari folder src/assets/profile/):
    - mail.png         : ikon email (kiri)
    - lock.png         : ikon gembok/password (kiri)
    - trash-2.png      : ikon tempat sampah/hapus (kiri)
    - chevron-right.png: ikon panah kanan (kanan)

  Desain Responsif:
    - Mobile  : tampilan penuh (default)
    - Tablet/Desktop (>=600px) : konten dibatasi max-width 600px, rata tengah
  ============================================================================
-->

<template>
  <q-page class="q-pa-md bg-white">
    <!-- Header Pengaturan Akun -->
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
      <div class="text-h5 text-weight-regular text-black">Pengaturan akun</div>
    </div>

    <!-- Konten: Daftar menu pengaturan akun -->
    <div class="content-wrapper">
      <q-list>
        <!--
          Melakukan perulangan pada array menuItems.
          - Setiap item menampilkan ikon kiri, label, dan ikon chevron kanan.
          - Kelas 'menu-item--border' ditambahkan pada semua item
            kecuali item terakhir untuk memberikan garis pemisah.
        -->
        <q-item
          v-for="(item, index) in menuItems"
          :key="item.label"
          clickable
          :to="item.route"
          class="menu-item"
          :class="{ 'menu-item--border': index < menuItems.length - 1 }"
        >
          <!-- Ikon kiri (email/gembok/tempat sampah) -->
          <q-item-section avatar class="menu-icon-left">
            <img :src="item.iconLeft" :alt="item.label" class="icon-left" />
          </q-item-section>

          <!-- Label teks menu -->
          <q-item-section class="menu-label">
            {{ item.label }}
          </q-item-section>

          <!-- Ikon panah kanan (chevron) -->
          <q-item-section side>
            <img
              :src="chevronRight"
              alt="chevron"
              class="icon-right"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
/**
 * Import aset ikon dari folder src/assets/profile/
 * Ikon diimpor sebagai modul agar di-resolve oleh bundler (Webpack/Vite)
 */
import mailIcon from "src/assets/profile/mail.png";
import lockIcon from "src/assets/profile/lock.png";
import trashIcon from "src/assets/profile/trash-2.png";
import chevronRight from "src/assets/profile/chevron-right.png";

export default {
  name: "AccountSettingsPage",

  /**
   * data()
   * Mengembalikan state reaktif komponen:
   * - chevronRight : path ikon panah kanan, dipakai di template
   * - menuItems    : array objek menu navigasi, masing-masing berisi:
   *     - label    : teks yang ditampilkan pada menu
   *     - iconLeft : path ikon di sisi kiri menu
   *     - route    : path tujuan navigasi (vue-router)
   */
  data() {
    return {
      chevronRight,
      menuItems: [
        {
          label: "Ganti email",
          iconLeft: mailIcon,
          route: "/change_email",
        },
        {
          label: "Ganti Password",
          iconLeft: lockIcon,
          route: "/change_password",
        },
        {
          label: "Hapus Akun",
          iconLeft: trashIcon,
          route: "/delete_account",
        },
      ],
    };
  },
};
</script>

<style scoped>
/*
 * ===== HEADER =====
 * Garis bawah pada header dengan trik margin negatif
 * agar border tembus hingga pinggir layar meskipun
 * q-page memiliki padding (q-pa-md).
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
 * ===== MENU ITEM =====
 * Styling untuk setiap item dalam daftar menu.
 * Tinggi minimum 48px mengikuti standar touch target mobile.
 */
.menu-item {
  padding: 14px 0;
  min-height: 48px;
}

/* Garis pemisah antar item (kecuali item terakhir) */
.menu-item--border {
  border-bottom: 1px solid #c1c1c1;
}

/*
 * ===== IKON =====
 * Ikon kiri: 24px (email, gembok, tempat sampah)
 * Ikon kanan: 20px dengan opacity 0.7 (chevron)
 */
.menu-icon-left {
  min-width: auto;
  padding-right: 12px;
}

.icon-left {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.icon-right {
  width: 20px;
  height: 20px;
  object-fit: contain;
  opacity: 0.7;
}

/*
 * ===== TIPOGRAFI =====
 * Menggunakan font Poppins 16px warna hitam (#000000)
 */
.menu-label {
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  color: #000000;
}

/*
 * ===== RESPONSIF: TABLET / DESKTOP =====
 * Pada layar >= 600px, konten dibatasi lebar maksimal 600px
 * dan diposisikan rata tengah (margin: 0 auto).
 */
@media (min-width: 600px) {
  .content-wrapper {
    max-width: 600px;
    margin: 0 auto;
    padding-top: 24px;
  }
}
</style>
  