<template>
  <q-page class="page-container bg-white">
    <!-- Header (Sticky) — mengikuti gaya NewsPage.vue -->
    <div class="header-section">
      <div class="header-inner q-px-md">
        <div class="row items-center header-title">
          <q-btn
            flat
            round
            dense
            icon="keyboard_arrow_left"
            size="18px"
            @click="$router.back()"
            class="q-mr-sm"
          />
          <div class="text-h5 text-weight-regular text-black">Ubah profile</div>
        </div>
      </div>
    </div>

    <!-- Konten utama (Scrollable) -->
    <div class="content-wrapper q-pa-md">
      <!-- ===== FOTO PROFIL ===== -->
      <div class="row items-start q-mb-sm q-pt-md">
        <q-avatar size="63px" class="q-mr-md">
          <img :src="profilePicture" alt="Foto profil" />
        </q-avatar>
        <div class="col column justify-center" style="padding-top: 4px">
          <div class="text-grey-7" style="font-size: 13px; line-height: 1.4">
            Pasang foto anda ! semua orang, bakal bisa lihat
          </div>
        </div>
      </div>

      <div
        class="text-primary text-weight-medium q-mb-lg cursor-pointer"
        style="font-size: 14px"
        @click="onTambahFoto"
      >
        Tambah foto
      </div>

      <!-- ===== FORM DATA PROFIL (Pair-based Grouping) ===== -->
      <div class="row q-col-gutter-md">
        <!-- Nama (full-width) -->
        <div class="col-12">
          <div class="field-label">Nama <span class="text-red">*</span></div>
          <q-input
            v-model="form.nama"
            borderless
            dense
            hide-bottom-space
            class="field-input"
          />
        </div>

        <!-- Pair: Nomor HP + Email -->
        <div class="col-12 col-sm-6">
          <div class="field-label">Nomor HP <span class="text-red">*</span></div>
          <q-input
            v-model="form.nomorHp"
            borderless
            dense
            hide-bottom-space
            class="field-input"
          />
        </div>
        <div class="col-12 col-sm-6">
          <div class="field-label">Email <span class="text-red">*</span></div>
          <q-input
            v-model="form.email"
            type="email"
            borderless
            dense
            hide-bottom-space
            class="field-input"
          />
        </div>

        <!-- Pair: NIK + NIP -->
        <div class="col-12 col-sm-6">
          <div class="field-label">NIK <span class="text-red">*</span></div>
          <q-input
            v-model="form.nik"
            borderless
            dense
            hide-bottom-space
            class="field-input"
          />
        </div>
        <div class="col-12 col-sm-6">
          <div class="field-label">NIP</div>
          <q-input
            v-model="form.nip"
            borderless
            dense
            hide-bottom-space
            placeholder="-"
            class="field-input"
          />
        </div>

        <!-- Pair: Tanggal Lahir + Tempat Lahir -->
        <div class="col-12 col-sm-6">
          <div class="field-label-highlight">Tanggal lahir</div>
          <q-input
            v-model="form.tanggalLahir"
            borderless
            dense
            hide-bottom-space
            readonly
            class="highlight-input"
          >
            <template #append>
              <img
                :src="calendarIcon"
                alt="Calendar"
                class="calendar-icon cursor-pointer"
              />
              <q-popup-proxy transition-show="scale" transition-hide="scale">
                <q-date v-model="form.tanggalLahir" mask="DD/MM/YYYY" />
              </q-popup-proxy>
            </template>
          </q-input>
        </div>
        <div class="col-12 col-sm-6">
          <div class="field-label">Tempat lahir</div>
          <q-input
            v-model="form.tempatLahir"
            borderless
            dense
            hide-bottom-space
            class="field-input"
          />
        </div>

        <!-- Pair: Jenis Kelamin + Agama -->
        <div class="col-12 col-sm-6">
          <div class="field-label-highlight">Jenis kelamin</div>
          <q-select
            v-model="form.jenisKelamin"
            :options="jenisKelaminOptions"
            borderless
            dense
            hide-bottom-space
            dropdown-icon="keyboard_arrow_down"
            class="highlight-input"
          />
        </div>
        <div class="col-12 col-sm-6">
          <div class="field-label-highlight">Agama</div>
          <q-select
            v-model="form.agama"
            :options="agamaOptions"
            borderless
            dense
            hide-bottom-space
            dropdown-icon="keyboard_arrow_down"
            class="highlight-input"
          />
        </div>

        <!-- Alamat Lengkap (full-width) -->
        <div class="col-12">
          <div class="field-label">Alamat lengkap</div>
          <q-input
            v-model="form.alamatLengkap"
            borderless
            dense
            hide-bottom-space
            class="field-input"
          />
        </div>

        <!-- Pair: Kota/Kabupaten + Kecamatan -->
        <div class="col-12 col-sm-6">
          <div class="field-label">Kota/ Kabupaten</div>
          <q-input
            v-model="form.kota"
            borderless
            dense
            hide-bottom-space
            class="field-input"
          />
        </div>
        <div class="col-12 col-sm-6">
          <div class="field-label">Kecamatan</div>
          <q-input
            v-model="form.kecamatan"
            borderless
            dense
            hide-bottom-space
            class="field-input"
          />
        </div>
      </div>

      <!-- ===== TOMBOL SIMPAN (bawah kanan) ===== -->
      <div class="row justify-end q-mt-xl q-mb-md">
        <q-btn
          label="Simpan"
          unelevated
          no-caps
          class="btn-simpan shadow-2"
          :loading="loading"
          @click="simpanProfile"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import profilePicture from "src/assets/profile/profile-picture.jpg";
import calendarIcon from "src/assets/profile/calendar.png";

/**
 * ============================================================================
 * DOKUMENTASI API — Edit Profil
 * ============================================================================
 *
 * 1. MENGAMBIL DATA PROFIL (mounted)
 * -----------------------------------
 * Endpoint  : GET /api/user/profile
 * Deskripsi : Mengambil data profil pengguna yang sedang login
 *             untuk ditampilkan pada form.
 *
 * Headers:
 *   Authorization: Bearer <token>
 *
 * Response Sukses (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "nama": "John Doe",
 *       "nomor_hp": "0808880808",
 *       "email": "user_ifoid@gmail.com",
 *       "nik": "3603081211020003",
 *       "nip": "-",
 *       "tanggal_lahir": "11/12/2002",
 *       "tempat_lahir": "Konawe Selatan",
 *       "jenis_kelamin": "Laki-laki",
 *       "agama": "Islam",
 *       "alamat_lengkap": "Jl. Potoro, Rt 003/002, Ds. Potoro",
 *       "kota": "Kabupaten Konawe Selatan",
 *       "kecamatan": "Andoolo",
 *       "foto_url": "https://..."
 *     }
 *   }
 *
 * Contoh Implementasi:
 *   import { api } from 'src/boot/axios';
 *
 *   async mounted() {
 *     try {
 *       const response = await api.get('/api/user/profile');
 *       if (response.data.success) {
 *         const d = response.data.data;
 *         this.form = {
 *           nama: d.nama,
 *           nomorHp: d.nomor_hp,
 *           email: d.email,
 *           nik: d.nik,
 *           nip: d.nip,
 *           tanggalLahir: d.tanggal_lahir,
 *           tempatLahir: d.tempat_lahir,
 *           jenisKelamin: d.jenis_kelamin,
 *           agama: d.agama,
 *           alamatLengkap: d.alamat_lengkap,
 *           kota: d.kota,
 *           kecamatan: d.kecamatan,
 *         };
 *       }
 *     } catch (error) {
 *       this.$q.notify({ type: 'negative', message: 'Gagal memuat data profil' });
 *     }
 *   }
 *
 * 2. MENYIMPAN DATA PROFIL (simpanProfile)
 * -----------------------------------------
 * Endpoint  : PUT /api/user/profile
 * Deskripsi : Mengirim data profil yang telah diubah ke server.
 *
 * Headers:
 *   Authorization: Bearer <token>
 *   Content-Type: application/json
 *
 * Request Body:
 *   {
 *     "nama": "John Doe",
 *     "nomor_hp": "0808880808",
 *     "email": "user_ifoid@gmail.com",
 *     "nik": "3603081211020003",
 *     "nip": "-",
 *     "tanggal_lahir": "11/12/2002",
 *     "tempat_lahir": "Konawe Selatan",
 *     "jenis_kelamin": "Laki-laki",
 *     "agama": "Islam",
 *     "alamat_lengkap": "Jl. Potoro, Rt 003/002, Ds. Potoro",
 *     "kota": "Kabupaten Konawe Selatan",
 *     "kecamatan": "Andoolo"
 *   }
 *
 * Response Sukses (200):
 *   {
 *     "success": true,
 *     "message": "Profil berhasil diperbarui"
 *   }
 *
 * Contoh Implementasi:
 *   async simpanProfile() {
 *     try {
 *       this.loading = true;
 *       const response = await api.put('/api/user/profile', {
 *         nama: this.form.nama,
 *         nomor_hp: this.form.nomorHp,
 *         email: this.form.email,
 *         nik: this.form.nik,
 *         nip: this.form.nip,
 *         tanggal_lahir: this.form.tanggalLahir,
 *         tempat_lahir: this.form.tempatLahir,
 *         jenis_kelamin: this.form.jenisKelamin,
 *         agama: this.form.agama,
 *         alamat_lengkap: this.form.alamatLengkap,
 *         kota: this.form.kota,
 *         kecamatan: this.form.kecamatan,
 *       });
 *
 *       if (response.data.success) {
 *         this.$q.notify({ type: 'positive', message: response.data.message });
 *         this.$router.back();
 *       }
 *     } catch (error) {
 *       this.$q.notify({ type: 'negative', message: 'Gagal menyimpan profil' });
 *     } finally {
 *       this.loading = false;
 *     }
 *   }
 * ============================================================================
 */

export default {
  name: "EditProfilePage",

  data() {
    return {
      profilePicture,
      calendarIcon,
      loading: false,

      form: {
        nama: "",
        nomorHp: "0808880808",
        email: "user_ifoid@gmail.com",
        nik: "3603081211020003",
        nip: "-",
        tanggalLahir: "11/12/2002",
        tempatLahir: "Konawe Selatan",
        jenisKelamin: "Laki-laki",
        agama: "Islam",
        alamatLengkap: "Jl. Potoro, Rt 003/002, Ds. Potoro",
        kota: "Kabupaten Konawe Selatan",
        kecamatan: "Andoolo",
      },

      jenisKelaminOptions: ["Laki-laki", "Perempuan"],

      agamaOptions: [
        "Islam",
        "Kristen",
        "Katolik",
        "Hindu",
        "Buddha",
        "Konghucu",
      ],
    };
  },

  methods: {
    onTambahFoto() {
      // TODO: Implementasi upload foto profil
      console.log("Tambah foto diklik");
    },

    simpanProfile() {
      // TODO: Implementasi pemanggilan API simpan profil (lihat dokumentasi di atas)
      console.log("Simpan profil:", this.form);
    },
  },
};
</script>

<style scoped>
/* Page container: header sticky + content scrollable */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.header-section {
  flex-shrink: 0;
  background-color: #ffffff;
  z-index: 10;
}

.header-inner {
  padding-top: 16px;
}

.header-title {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;
  padding-right: 16px;
}

.content-wrapper {
  flex-grow: 1;
  overflow-y: auto;
}

/* Tombol Simpan: #114EA4, 95x31, radius 8 */
.btn-simpan {
  background-color: #114ea4;
  color: #ffffff;
  width: 95px;
  height: 31px;
  border-radius: 8px;
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-weight: 500;
}

.field-label {
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #757575;
  margin-bottom: 2px;
}

.field-input {
  border-bottom: 1px solid #c1c1c1;
}

.field-input :deep(.q-field__control) {
  padding: 0;
}

.field-input :deep(input) {
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #000000;
}

.field-label-highlight {
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #9e9e9e;
  margin-bottom: 6px;
}

.highlight-input {
  background-color: #fcfbfc;
  border-radius: 8px;
  padding: 4px 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.highlight-input :deep(.q-field__control) {
  padding: 0;
}

.highlight-input :deep(input),
.highlight-input :deep(.q-field__native) {
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #000000;
}

.calendar-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  opacity: 0.6;
}

/* ===== Max-width Container: Tablet (≥600px) ===== */
@media (min-width: 600px) {
  .header-inner,
  .content-wrapper {
    max-width: 90%;
    margin: 0 auto;
  }

  .header-title {
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .content-wrapper {
    padding-top: 24px;
    padding-left: 32px;
    padding-right: 32px;
  }

  .field-input :deep(input),
  .highlight-input :deep(input),
  .highlight-input :deep(.q-field__native) {
    font-size: 17px;
  }
}

@media (min-width: 900px) {
  .header-inner,
  .content-wrapper {
    max-width: 800px;
  }
}

@media (min-width: 1200px) {
  .header-inner,
  .content-wrapper {
    max-width: 900px;
  }
}
</style>
