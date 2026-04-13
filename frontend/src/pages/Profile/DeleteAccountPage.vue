<template>
    <q-page class="q-pa-md bg-white">
      <!-- Header Ubah Profile -->
      <div class="row items-center q-mb-lg header-title">
        <q-btn flat round dense icon="keyboard_arrow_left" size="18px" @click="$router.back()" class="q-mr-sm" />
        <div class="text-h5 text-weight-regular text-black">Hapus akun</div>
      </div>
  
      <div>
        hello hapus akun page
      </div>
    </q-page>
  </template>
  
  <script>
  export default {
    name: 'ChangePasswordPage',
  }
  </script>
  
  <style scoped>
  .header-title {
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 12px;
    /* Trick membuat border tembus sampai pinggir meski q-page ada padding */
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
  }
  </style>
  