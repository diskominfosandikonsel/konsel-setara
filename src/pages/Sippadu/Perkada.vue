<template>
  <q-page class="bg-white">
    <!-- TEAM STANDARD HEADER -->
    <div class="row items-center q-px-sm q-py-md bg-white" style="border-bottom: 1px solid #e5e7eb;">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="text-h6 text-weight-regular q-ml-sm" style="letter-spacing: 1.5px;">PERKADA</div>
    </div>

    <!-- CONTENT AREA -->
    <div class="q-pa-lg">
      <div class="text-h5 text-weight-bold q-mb-lg" style="font-family: serif; color: #111; line-height: 1.3">
        Apa itu Peraturan Kepala Daerah (PERKADA)?
      </div>

      <div class="text-body1 text-justify" style="color: #444; line-height: 1.6;">
        <p>
          <b>Peraturan Kepala Daerah (Perkada)</b> adalah peraturan perundang-undangan yang ditetapkan oleh Kepala Daerah. Tingkatannya meliputi Peraturan Gubernur, Peraturan Bupati, atau Peraturan Wali Kota.
        </p>
        <p>
          Perkada dibentuk secara langsung oleh Kepala Daerah yang bersangkutan untuk menyelenggarakan kewenangannya, serta menjabarkan dan melaksanakan ketentuan dari Peraturan Daerah (Perda) yang sudah ada.
        </p>
        <p>
          Berbeda dengan Perda yang dibahas bersama legislatif (DPRD), Perkada lebih bersifat sebagai aturan teknis pelaksanaan di tingkat eksekutif daerah agar kebijakan pemerintah berjalan dengan lancar.
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Halaman penjelasan statis Perkada
</script>

<style scoped>
p {
  margin-bottom: 16px;
}
p:last-child {
  margin-bottom: 0;
}
</style>
