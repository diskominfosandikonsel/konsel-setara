<template>
  <q-page class="page-bg">
    <!-- HEADER -->
    <div class="row items-center q-px-sm q-py-md bg-white border-bottom sticky-header">
      <q-btn flat round dense icon="chevron_left" color="dark" size="18px" @click="$router.back()" />
      <div class="text-h6 text-weight-regular q-ml-sm text-uppercase text-dark" style="letter-spacing: 1.5px;">Kebijakan
        Privasi</div>
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
          Pendahuluan
        </div>
        <div class="section-body">
          Pemerintah Kabupaten Konawe Selatan menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi
          yang Anda berikan melalui aplikasi <strong>Konsel Setara</strong>. Kebijakan Privasi ini menjelaskan bagaimana
          kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda.
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_database" size="18px" class="q-mr-sm" />
          Data yang Kami Kumpulkan
        </div>
        <div class="section-body">
          <div class="legal-point">
            <span class="point-num">1.</span>
            <span><strong>Data Identitas:</strong> Nama lengkap, nomor identitas (NIK), alamat, tanggal lahir.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">2.</span>
            <span><strong>Data Kontak:</strong> Alamat email dan nomor telepon yang digunakan untuk registrasi.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">3.</span>
            <span><strong>Data Lokasi:</strong> Koordinat GPS saat pengiriman laporan (hanya jika diizinkan oleh
              pengguna).</span>
          </div>
          <div class="legal-point">
            <span class="point-num">4.</span>
            <span><strong>Data Laporan:</strong> Foto, deskripsi, dan informasi lain yang Anda input saat menggunakan
              layanan pelaporan. Foto yang diambil melalui kamera digunakan secara khusus untuk melengkapi laporan
              pengaduan, pengambilan foto dokumen identitas (KTP/KK), serta keperluan verifikasi layanan. Foto tidak
              digunakan untuk tujuan lain di luar konteks layanan.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">5.</span>
            <span><strong>Data Teknis:</strong> Jenis perangkat, sistem operasi, dan log penggunaan aplikasi.</span>
          </div>
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_manage_search" size="18px" class="q-mr-sm" />
          Tujuan Penggunaan Data
        </div>
        <div class="section-body">
          <div class="legal-point">
            <span class="point-num">1.</span>
            <span>Memproses dan menindaklanjuti laporan atau permintaan layanan yang Anda kirimkan.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">2.</span>
            <span>Memverifikasi identitas pengguna untuk keamanan akun dan layanan.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">3.</span>
            <span>Meningkatkan kualitas layanan dan pengalaman pengguna pada aplikasi.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">4.</span>
            <span>Mengirimkan notifikasi terkait status laporan atau informasi pemerintahan yang relevan.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">5.</span>
            <span>Keperluan analitik dan pelaporan internal pemerintah daerah yang bersifat anonim.</span>
          </div>
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_lock" size="18px" class="q-mr-sm" />
          Keamanan Data
        </div>
        <div class="section-body">
          Kami menerapkan langkah-langkah teknis dan organisasi yang wajar untuk melindungi data pribadi Anda dari akses
          yang tidak sah, pengungkapan, perubahan, atau penghancuran. Data disimpan di server yang aman dan hanya dapat
          diakses oleh pihak yang berwenang.
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_schedule" size="18px" class="q-mr-sm" />
          Penyimpanan Data
        </div>
        <div class="section-body">
          Data pribadi Anda akan disimpan selama akun Anda aktif dan diperlukan untuk penyediaan layanan. Setelah
          penghapusan akun, data pribadi Anda akan dihapus dalam waktu 30 (tiga puluh) hari kerja, kecuali data yang
          wajib diarsipkan sesuai peraturan perundang-undangan yang berlaku di Republik Indonesia. Data laporan yang
          telah diproses dapat disimpan dalam bentuk anonim untuk keperluan statistik dan peningkatan layanan.
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_share" size="18px" class="q-mr-sm" />
          Berbagi Data dengan Pihak Ketiga
        </div>
        <div class="section-body">
          Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga. Data hanya dapat
          dibagikan kepada:
          <div class="legal-point q-mt-sm">
            <span class="point-num">•</span>
            <span>Instansi pemerintah terkait dalam rangka penyelenggaraan layanan publik.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">•</span>
            <span>Penegak hukum jika diwajibkan oleh peraturan perundang-undangan yang berlaku.</span>
          </div>
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_admin_panel_settings" size="18px" class="q-mr-sm" />
          Hak Pengguna
        </div>
        <div class="section-body">
          <div class="legal-point">
            <span class="point-num">1.</span>
            <span>Anda berhak mengakses dan memperbarui data pribadi Anda melalui menu pengaturan akun.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">2.</span>
            <span>Anda dapat meminta penghapusan akun dan data pribadi Anda melalui fitur "Hapus Akun" yang tersedia di
              halaman pengaturan akun aplikasi, atau dengan menghubungi kami melalui email.</span>
          </div>
          <div class="legal-point">
            <span class="point-num">3.</span>
            <span>Anda dapat mencabut izin lokasi dan kamera kapan saja melalui pengaturan perangkat Anda.</span>
          </div>
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_child_care" size="18px" class="q-mr-sm" />
          Batasan Usia
        </div>
        <div class="section-body">
          Aplikasi ini tidak ditujukan untuk pengguna di bawah usia 17 tahun. Kami tidak secara sengaja mengumpulkan
          data pribadi dari anak di bawah umur. Apabila kami mengetahui bahwa data dari pengguna di bawah usia 17 tahun
          telah terkumpul tanpa persetujuan wali, kami akan segera menghapus data tersebut dari sistem kami.
        </div>
      </div>

      <div class="legal-card">
        <div class="section-header">
          <q-icon name="r_phone" size="18px" class="q-mr-sm" />
          Kontak
        </div>
        <div class="section-body">
          Untuk pertanyaan atau keluhan terkait Kebijakan Privasi ini, hubungi kami:
          <div class="legal-point q-mt-sm">
            <span class="point-num">•</span>
            <span>Email: <strong>diskominfo@konaweselatankab.go.id</strong></span>
          </div>
          <div class="legal-point">
            <span class="point-num">•</span>
            <span>Alamat: Dinas Komunikasi, Informatika dan Persandian Kab. Konawe Selatan</span>
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
  name: 'KebijakanPrivasiPage',
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
