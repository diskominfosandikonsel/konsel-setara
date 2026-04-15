<!--
  AccountSettingsPage.vue
  Halaman Pengaturan Akun — daftar menu navigasi (ganti password,
  hapus akun). Responsif menggunakan konsep
  Max-width Container & Pair-based Grouping.
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
    <div class="page-container">
      <q-list>
        <q-item
          v-for="(item, index) in menuItems"
          :key="item.label"
          clickable
          :to="item.route"
          class="menu-item"
          :class="{ 'menu-item--border': index < menuItems.length - 1 }"
        >
          <q-item-section avatar class="menu-icon-left">
            <img :src="item.iconLeft" :alt="item.label" class="icon-left" />
          </q-item-section>

          <q-item-section class="menu-label">
            {{ item.label }}
          </q-item-section>

          <q-item-section side>
            <img :src="chevronRight" alt="chevron" class="icon-right" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
import lockIcon from "src/assets/profile/lock.png";
import trashIcon from "src/assets/profile/trash-2.png";
import chevronRight from "src/assets/profile/chevron-right.png";

export default {
  name: "AccountSettingsPage",

  // State daftar menu navigasi halaman pengaturan akun.
  data() {
    return {
      chevronRight,
      menuItems: [
        { label: "Ganti Password", iconLeft: lockIcon, route: "/change_password" },
        { label: "Hapus Akun", iconLeft: trashIcon, route: "/delete_account" },
      ],
    };
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

/* Container konten — full-width pada semua ukuran layar */
.page-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

/* Pair-based Grouping — item menu dengan garis pemisah */
.menu-item {
  padding: 14px 0;
  min-height: 48px;
}

.menu-item--border {
  border-bottom: 1px solid #c1c1c1;
}

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

.menu-label {
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  color: #000000;
}

/* Responsif tablet/desktop */
@media (min-width: 600px) {
  .page-container {
    padding-top: 24px;
  }
}
</style>
