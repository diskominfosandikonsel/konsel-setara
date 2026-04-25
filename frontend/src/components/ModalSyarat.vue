<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 90%; max-width: 90%;">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="description" color="primary" class="q-mr-md" />
          <span style="font-size: 12pt;" class="text-weight-bold">{{ title }}</span>
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-separator />

      <q-scroll-area style="height: 500px; width: 100%;">
        <q-card-section>
          <div class="q-gutter-md">
            <!-- Header -->
            <div>
              <h6 style="margin: 0 0 8px 0; color: #1976D2; font-weight: bold;">{{ headerTitle }}</h6>
              <p style="margin: 0; font-size: 12px; color: #666;">{{ headerSubtitle }}</p>
            </div>

            <!-- Penerbitan KK Baru atau Pisah KK -->
            <div>
              <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                📋 Penerbitan KK Baru atau Pisah KK
              </h5>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                <li>Berumur 17 (Tujuh Belas) Tahun atau sudah Kawin atau pernah Kawin yang dibuktikan dengan kepemilikan KTP-El</li>
                <li>Foto Copy Buku Nikah/Kutipan Akta Perkawinan atau Kutipan Akta Perceraian</li>
                <li>Surat Pindah bagi Penduduk yang pindah dalam wilayah Negara Kesatuan Republik Indonesia (SKPWNI)</li>
                <li>Surat Pernyataan Tanggung Jawab Mutlak Perkawinan/Perceraian belum tercatat</li>
                <li>Mengisi Formulir Biodata Keluarga (F-1.01)</li>
                <li>Surat Kuasa jika diwakilkan (F 1.07)</li>
              </ul>
            </div>

            <!-- Penerbitan KK Baru untuk Penduduk Orang Asing -->
            <div>
              <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                🌍 Penerbitan KK Baru untuk Penduduk Orang Asing
              </h5>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                <li>Kartu Izin Tinggal Tetap</li>
                <li>Foto Copy Buku Nikah/Kutipan Akta Perkawinan atau Kutipan Akta Perceraian atau yang disebut dengan nama lain</li>
                <li>Surat Keterangan Pindah Bagi Penduduk yang pindah dalam wilayah Negara Kesatuan Republik Indonesia</li>
                <li>Mengisi Formulir Biodata Keluarga (F-1.01)</li>
              </ul>
            </div>

            <!-- Penerbitan KK Baru karena Perubahan Elemen Data -->
            <div>
              <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                ✏️ Penerbitan KK Baru karena Perubahan Elemen Data
              </h5>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                <li>Asli KK lama</li>
                <li>Surat Keterangan/Bukti Perubahan Peristiwa Kependudukan dan Peristiwa Penting</li>
                <li>Surat Pernyataan Perubahan Elemen Data (F 1.06)</li>
                <li>Surat Kuasa jika diwakilkan (F 1.07)</li>
              </ul>
            </div>

            <!-- Penambahan Anggota Keluarga Atau Numpang KK -->
            <div>
              <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                👨‍👩‍👧 Penambahan Anggota Keluarga Atau Numpang KK
              </h5>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                <li>Asli KK lama atau KK yang akan ditumpangi</li>
                <li>Surat keterangan lahir dari Dokter/Bidan</li>
                <li>Foto Copy Buku Nikah/Kutipan Akta Perkawinan bagi yang Perkawinannya belum tercatat di Kartu Keluarga</li>
                <li>Surat Keterangan Pindah Datang Warga Negara Indonesia (SKPWNI)</li>
                <li>Surat Pernyataan bersedia menerima sebagai Anggota Keluarga</li>
                <li>Surat Kuasa jika diwakilkan (F 1.07)</li>
              </ul>
            </div>

            <!-- Penerbitan KK Hilang atau Rusak -->
            <div>
              <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                ⚠️ Penerbitan KK Hilang atau Rusak
              </h5>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                <li>Surat Keterangan Kehilangan dari Kepolisian atau KK yang rusak</li>
                <li>Foto Copy KTP-El</li>
                <li>Surat Kuasa jika diwakilkan (F 1.07)</li>
              </ul>
            </div>

            <!-- Penerbitan KK Hilang atau Rusak untuk Penduduk Orang Asing -->
            <div>
              <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                🌍 Penerbitan KK Hilang atau Rusak untuk Penduduk Orang Asing
              </h5>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                <li>Surat Keterangan Hilang dari Kepolisian atau KK yang Rusak</li>
                <li>Kartu Izin Tinggal Tetap</li>
                <li>KTP-El</li>
              </ul>
            </div>

            <!-- Persyaratan Permohonan SKPWNI -->
            <div>
              <h5 style="margin: 0 0 12px 0; color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 8px;">
                📄 Persyaratan Permohonan Surat Keterangan Pindah WNI (SKPWNI)
              </h5>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8; font-size: 13px;">
                <li>Kartu Keluarga Asli</li>
                <li>Surat Kuasa Bagi yang Diwakili</li>
              </ul>
            </div>

            <!-- Jam Layanan -->
            <div style="background-color: #E8F5E9; padding: 12px; border-radius: 8px; border-left: 4px solid #4CAF50; margin-top: 16px;">
              <h5 style="margin: 0 0 8px 0; color: #2E7D32;">🕐 Jam Layanan</h5>
              <p style="margin: 0; line-height: 1.6; font-size: 13px;">
                <strong>Senin - Jumat:</strong> 08:00 - 16:00 WIT
              </p>
            </div>
          </div>
        </q-card-section>
      </q-scroll-area>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Tutup" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ModalSyaratKelahiran',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Persyaratan Dokumen'
    },
    headerTitle: {
      type: String,
      default: 'Persyaratan Penerbitan Kartu Keluarga'
    },
    headerSubtitle: {
      type: String,
      default: 'by Disdukcapil Konsel | 31 Januari 2020'
    }
  },
  emits: ['update:modelValue'],
  computed: {
    isOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>

<style scoped>
/* Add component-specific styles here if needed */
</style>
