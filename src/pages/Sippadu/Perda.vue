<template>
  <q-page class="bg-white">
    <!-- TEAM STANDARD HEADER -->
    <div class="row items-center q-px-sm q-py-md bg-white" style="border-bottom: 1px solid #e5e7eb;">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="text-h6 text-weight-regular q-ml-sm" style="letter-spacing: 1.5px;">PERDA</div>
    </div>

    <!-- CONTENT AREA -->
    <div class="q-pa-lg">
      <div class="text-h5 text-weight-bold q-mb-lg" style="font-family: serif; color: #111; line-height: 1.3">
        Apa itu Peraturan Daerah (PERDA)?
      </div>

      <div class="text-body1 text-justify" style="color: #444; line-height: 1.6;">
        <p>
          <b>Peraturan Daerah (Perda)</b> adalah instrumen aturan yang diberikan kepada Pemerintah Daerah dalam rangka penyelenggaraan otonomi daerah dan tugas pembantuan.
        </p>
        <p>
          Perda dibentuk oleh <b>Dewan Perwakilan Rakyat Daerah (DPRD)</b> Provinsi, Kabupaten, atau Kota dengan persetujuan bersama Kepala Daerah (Gubernur, Bupati, atau Wali Kota).
        </p>
        <p>
          Perda bertujuan untuk mewujudkan kepastian hukum dan perlindungan masyarakat secara spesifik di daerah tersebut, contohnya: Perda tentang Ketertiban Umum, Perda Kawasan Tanpa Rokok, maupun Perda tentang Tata Ruang.
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Halaman penjelasan statis Perda
</script>

<style scoped>
p {
  margin-bottom: 16px;
}
p:last-child {
  margin-bottom: 0;
}
</style>
