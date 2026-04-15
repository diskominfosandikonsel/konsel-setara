<template>
  <q-page class="page-bg">
    <!-- HEADER -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="text-h6 text-weight-regular q-ml-sm text-uppercase text-dark" style="letter-spacing: 1.5px;">Syarat &amp; Ketentuan</div>
    </div>

    <!-- CONTENT -->
    <div class="legal-content q-px-md q-pb-xl">

      <div class="effective-date">
        <q-icon name="r_event" size="14px" class="q-mr-xs" />
        Terakhir diperbarui: 15 April 2026
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_info" size="18px" class="q-mr-sm" />
          Umum
        </div>
        <div class="section-body">
          Dengan menggunakan aplikasi <strong>Konsel Setara</strong> yang dikembangkan oleh Pemerintah Kabupaten Konawe Selatan, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku. Apabila Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan aplikasi ini.
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_person" size="18px" class="q-mr-sm" />
          Akun Pengguna
        </div>
        <div class="section-body">
          <div class="legal-point">
            <span class="point-num">1.</span>
            <span>Pengguna wajib mendaftarkan diri dengan data yang benar, akurat, dan lengkap.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">2.</span>
            <span>Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi akun miliknya.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">3.</span>
            <span>Setiap aktivitas yang dilakukan menggunakan akun Anda menjadi tanggung jawab Anda sepenuhnya.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">4.</span>
            <span>Pengguna dilarang memindahtangankan akun kepada pihak lain tanpa izin tertulis dari pengelola.</span>
          </div>
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_rule" size="18px" class="q-mr-sm" />
          Penggunaan Layanan
        </div>
        <div class="section-body">
          <div class="legal-point">
            <span class="point-num">1.</span>
            <span>Aplikasi ini diperuntukkan bagi masyarakat Kabupaten Konawe Selatan dalam mengakses layanan pemerintahan secara digital.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">2.</span>
            <span>Pengguna dilarang menggunakan aplikasi untuk tujuan yang melanggar hukum, norma kesusilaan, atau mengganggu pengguna lain.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">3.</span>
            <span>Pengguna dilarang menyebarkan konten yang mengandung SARA, hoaks, dan ujaran kebencian melalui fitur laporan atau komentar.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">4.</span>
            <span>Pengguna wajib menyertakan informasi yang valid dan dapat dipertanggungjawabkan saat membuat laporan.</span>
          </div>
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_copyright" size="18px" class="q-mr-sm" />
          Hak Kekayaan Intelektual
        </div>
        <div class="section-body">
          Seluruh konten dalam aplikasi Konsel Setara, termasuk namun tidak terbatas pada logo, desain, teks, grafis, dan kode program, merupakan milik Pemerintah Kabupaten Konawe Selatan dan dilindungi oleh ketentuan hukum yang berlaku. Dilarang menggandakan, memodifikasi, atau mendistribusikan konten tanpa izin tertulis.
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_update" size="18px" class="q-mr-sm" />
          Perubahan Ketentuan
        </div>
        <div class="section-body">
          Pemerintah Kabupaten Konawe Selatan berhak mengubah syarat dan ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan akan mulai berlaku sejak dipublikasikan dalam aplikasi. Penggunaan berkelanjutan atas layanan ini setelah perubahan dianggap sebagai persetujuan Anda terhadap ketentuan yang baru.
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_phone" size="18px" class="q-mr-sm" />
          Kontak
        </div>
        <div class="section-body">
          Jika Anda memiliki pertanyaan terkait syarat dan ketentuan ini, silakan hubungi kami melalui:
          <div class="legal-point q-mt-sm">
            <span class="point-num">•</span>
            <span>Email: <strong>diskominfo@konaweselatankab.go.id</strong></span>
          </div>
          <div class="legal-point">
            <span class="point-num">•</span>
            <span>Website resmi: <strong>konaweselatankab.go.id</strong></span>
          </div>
        </div>
      </div>

      <div class="legal-footer">
        © {{ currentYear }} Pemerintah Kabupaten Konawe Selatan.<br />Seluruh hak cipta dilindungi undang-undang.
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'SyaratKetentuanPage',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.page-bg {
  background-color: #f4f7fc;
  min-height: 100vh;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.border-bottom {
  border-bottom: 1px solid #e5e7eb;
}

.legal-content {
  padding-top: 16px;
}

.effective-date {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #1565C0;
  background: #e3f2fd;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 14px;
  font-weight: 600;
}

.legal-card {
  background: #fff;
  border-radius: 14px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 12px 16px 10px;
  font-size: 14px;
  font-weight: 700;
  color: #1565C0;
  border-bottom: 1px solid #eef0f6;
  background: #f7f9ff;
}

.section-body {
  padding: 12px 16px;
  font-size: 13px;
  color: #444;
  line-height: 1.75;
  text-align: justify;
  hyphens: auto;
  -webkit-hyphens: auto;
}

.legal-point {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.legal-point:last-child {
  margin-bottom: 0;
}

.point-num {
  font-weight: 700;
  color: #1976D2;
  min-width: 18px;
  flex-shrink: 0;
  padding-top: 1px;
}

.legal-footer {
  text-align: center;
  font-size: 11px;
  color: #aaa;
  padding: 16px 0 8px;
  line-height: 1.6;
}
</style>
