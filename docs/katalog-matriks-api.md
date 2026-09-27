# Katalog & Matriks API Integrasi Konsel SETARA

Dokumen ini memuat katalog dan matriks integrasi API untuk seluruh modul aplikasi sektoral dan layanan publik yang terhubung ke dalam ekosistem aplikasi **Konsel SETARA** (Konawe Selatan Sejahtera & Responsive).

---

## 📊 Tabel Matriks Katalog API Integrasi Konsel SETARA

| No | Menu Layanan pada Konsel SETARA | Aplikasi Sektoral Asal | Perangkat Daerah (OPD) Pengampu | Metode / Protokol | Base URL & Endpoint Utama | Status Interoperabilitas |
|---|---|---|---|---|---|---|
| **1** | Aduan Warga & Tenaga Kerja | **PERAK** | Dinas Kominfo & Dinas Nakertrans | REST API (JSON & Binary Octet-Stream) | `https://serverperak.konaweselatankab.go.id/api/v1/`<br>• `POST /keterangan_umum/view`<br>• `POST /keterangan_umum/addData`<br>• `POST /laporan` | Aktif (Live) |
| **2** | Perlindungan Perempuan & Anak | **SAPA KONSEL** | Dinas P3A | REST API (JSON & Multipart Form) | `https://serversapakonsel.konaweselatankab.go.id/api/v1/`<br>• `GET /publish_beranda/infografis`<br>• `POST /publish_laporan/uploadEmergency`<br>• `POST /publish_laporan/view` | Aktif (Live) |
| **3** | Tanggap Bencana & Kebakaran | **FIRETAP** | Satpol PP & Damkar / BPBD | REST API (JSON & Binary Stream) | `https://server-firetap.konaweselatankab.go.id/`<br>• `POST /auth/login`<br>• `GET /api/v1/publish_beranda/`<br>• `POST /api/v1/server_kasus/addMobile` | Aktif (Live) |
| **4** | Perizinan Berusaha & Peraturan | **SIPPADU** | DPMPTSP | REST API (JSON & Binary Octet-Stream) | `https://server-sippadu.konaweselatankab.go.id/api/v1/`<br>• `GET /publish_peraturan/perda`<br>• `GET /publish_peraturan/perkada`<br>• `POST /publish_laporan/addData` | Aktif (Live) |
| **5** | PPID & Produk Hukum Daerah | **Portal JDIH** | Bagian Hukum Setda & Diskominfo | REST API (JSON) | `https://server.jdih.konaweselatankab.go.id/api/v1/`<br>• `POST /publish_produk_hukum/views`<br>• `POST /publish_produk_hukum/getOne`<br>• `POST /publish_dokumen/view` | Aktif (Live) |
| **6** | Satu Data Daerah | **Portal Data SDI** | Bappeda & Dinas Kominfo | REST API / SPLP (JSON) | `http://81.17.99.110:5005/api/public/`<br>• `GET /opd`<br>• `GET /dashboard`<br>• `GET /daerah` | Aktif (Live) |
| **7** | Layanan Riset, Inovasi & Kesehatan | **ERIDA** (MANIS) | Bapperida & Dinas Kesehatan | REST API (JSON & Multipart Form) | `https://server-erida.konaweselatankab.go.id/api/v1/`<br>• `GET /publish_manis/getRiset`<br>• `POST /server_penelitian/createIzin`<br>• `POST /server_krenova/view` | Aktif (Live) |
| **8** | Layanan Kepegawaian | **SIMCARD** | BKPSDM | REST API (JSON) | `https://server-simcard.konaweselatankab.go.id/`<br>• `GET /checkAuth/checkAuth`<br>• `POST /api/v1/permohonan_KK_baru/view`<br>• `POST /server_pengguna/view` | Aktif (Live) |
| **9** | Kemitraan CSR Perusahaan | **Portal CSR** | Bappeda | REST API (JSON & Multipart Form) | `https://server-csr.konaweselatankab.go.id/`<br>• `POST /api/v1/publish/homeCSR/homeCSRview`<br>• `POST /api/v1/publish/registrasiMitra`<br>• `POST /api/v1/kegiatan_csr/addPengajuan` | Aktif (Live) |
| **10** | Permohonan Hibah / Bansos | **Portal Hibah** | BPKAD & Bagian Kesra Setda | REST API (JSON) | `https://server.hibah.konaweselatankab.go.id/`<br>• `GET /public/v1/dashboard/kecamatan`<br>• `POST /public/v1/dashboard/viewIndividu`<br>• `POST /public/v1/dashboard/searchNik` | Aktif (Live) |
| **11** | Portal Berita & Informasi Publik | **Web Portal Konsel** | Dinas Kominfo | REST API (JSON Public) | `https://server-web.konaweselatankab.go.id/api/v1/`<br>• `POST /web_publish_berita/view`<br>• `POST /web_publish_video/view`<br>• `POST /web_publish_pengumuman/view` | Aktif (Live) |
| **12** | Core Gateway & Push Notification | **Backend Konsel SETARA** | Dinas Kominfo | REST API & Push FCM v1 Protocol | `https://konsel-setara.konaweselatankab.go.id/`<br>• `USE /auth`<br>• `GET /api/v1/profile`<br>• `USE /fcm`<br>• `GET /api/v1/app-version` | Aktif (Live) |

---

## 🔍 Detail Rincian Integrasi Per Aplikasi Sektoral

### 1. PERAK (Aduan Warga & Layanan Tenaga Kerja)
* **OPD Pengampu**: Dinas Kominfo & Dinas Nakertrans Kabupaten Konawe Selatan
* **Base URL**: `https://serverperak.konaweselatankab.go.id/api/v1/`
* **Autentikasi**: Header `Authorization: kikensbatara <token>`
* **Endpoint Kunci**:
  * `POST /m_kecamatan/list` - Dapatkan daftar kecamatan
  * `POST /m_des_kel/list` - Dapatkan daftar desa/kelurahan
  * `POST /keterangan_umum/view` - Mengambil biodata/profil pengguna
  * `POST /keterangan_umum/addData` - Menambah/mengisi biodata
  * `POST /pendidikan_formal/view` - Riwayat pendidikan formal
  * `POST /pengalaman_kerja/view` - Riwayat pengalaman kerja
  * `POST /laporan` - Upload foto laporan (Payload Stream, Content-Type: `application/octet-stream`, Custom Header: `File-Name`)

### 2. SAPA KONSEL (Perlindungan Perempuan & Anak)
* **OPD Pengampu**: Dinas Pemberdayaan Perempuan & Perlindungan Anak (P3A)
* **Base URL**: `https://serversapakonsel.konaweselatankab.go.id/api/v1/`
* **Autentikasi**: Header `Authorization: kikensbatara <token>`
* **Endpoint Kunci**:
  * `GET /publish_beranda/infografis` - Data statistik dan infografis kekerasan/penanganan
  * `POST /publish_laporan/uploadEmergency` - Pengajuan aduan darurat / panic button
  * `POST /publish_laporan/view` - Riwayat aduan laporan masyarakat
  * `POST /publish_laporan/isi_laporan` - Detail aduan spesifik
  * `POST /client_artikel/view` - Artikel & edukasi perlindungan anak/perempuan

### 3. FIRETAP (Tanggap Bencana & Kebakaran)
* **OPD Pengampu**: Satpol PP & Damkar / BPBD
* **Base URL**: `https://server-firetap.konaweselatankab.go.id/`
* **Autentikasi**: Header `Authorization: xxx <token>`
* **Endpoint Kunci**:
  * `POST /auth/login` & `POST /auth/signup_mobile` - Autentikasi khusus petugas/pengguna Firetap
  * `GET /api/v1/publish_beranda/` - Summary dashboard kebakaran & darurat
  * `POST /api/v1/server_kasus/view` - Daftar laporan insiden kebakaran & bencana
  * `POST /api/v1/server_kasus/addMobile` - Pelaporan darurat baru dari mobile
  * `POST /api/v1/publishKasus/uploadImage` - Upload foto kejadian bencana (Octet-Stream)
  * `GET /api/v1/publishTelepon/view` - Daftar nomor telepon darurat daerah
  * `POST /api/v1/updateLocation/` - Pembaruan lokasi realtime GPS pengguna/satgas

### 4. SIPPADU (Perizinan Berusaha & Peraturan Daerah)
* **OPD Pengampu**: Dinas Penanaman Modal & Pelayanan Terpadu Satu Pintu (DPMPTSP)
* **Base URL**: `https://server-sippadu.konaweselatankab.go.id/api/v1/`
* **Autentikasi**: Header `Authorization: kikensbatara <token>`
* **Endpoint Kunci**:
  * `GET /publish_peraturan/perda` - Daftar Peraturan Daerah (PERDA) perizinan
  * `GET /publish_peraturan/perkada` - Daftar Peraturan Kepala Daerah (PERKADA)
  * `POST /publish_laporan/view` - Status pengajuan izin/laporan pemohon
  * `POST /publish_laporan/addData` - Pengajuan laporan perizinan baru
  * `POST /laporan` - Upload berkas/foto pendukung (Octet-stream dengan `File-Name`)

### 5. JDIH (Jaringan Dokumentasi & Informasi Hukum)
* **OPD Pengampu**: Bagian Hukum Setda / Dinas Kominfo
* **Base URL**: `https://server.jdih.konaweselatankab.go.id/api/v1/`
* **Autentikasi**: Header `Authorization: kikensbatara <token>`
* **Endpoint Kunci**:
  * `POST /publish_produk_hukum/views` - Daftar seluruh produk hukum daerah
  * `POST /publish_produk_hukum/getOne` - Detail lengkap dokumen produk hukum
  * `POST /publish_dokumen/view` - Berkas digital peraturan & perundang-undangan

### 6. Satu Data Daerah (Portal Data SDI)
* **OPD Pengampu**: Bappeda & Dinas Kominfo
* **Base URL**: `http://81.17.99.110:5005/api/public/`
* **Autentikasi**: Public Endpoint (Tidak memerlukan token)
* **Endpoint Kunci**:
  * `GET /opd` - Daftar OPD produsen data
  * `GET /dashboard` - Indikator makro dan statistik sektoral daerah
  * `GET /daerah` - Informasi profil wilayah Konawe Selatan

### 7. ERIDA / MANIS (E-Riset, Inovasi & Layanan Kesehatan)
* **OPD Pengampu**: Badan Perencanaan Pembangunan, Research & Inovasi Daerah (Bapperida) / Dinas Kesehatan
* **Base URL**: `https://server-erida.konaweselatankab.go.id/api/v1/`
* **Autentikasi**: Header `Authorization: kikensbatara <token>`
* **Endpoint Kunci**:
  * `GET /publish_manis/getRiset` - Katalog data riset daerah
  * `GET /publish_manis/getKrenova` - Data Kreasi & Inovasi Masyarakat (KRENOVA)
  * `POST /server_penelitian/view` - Daftar pengajuan izin penelitian
  * `POST /server_penelitian/createIzin` - Pengajuan rekomendasi izin penelitian baru (Multipart Form)
  * `POST /server_krenova/view` & `POST /server_krenova/addData` - Pengelolaan inovasi daerah

### 8. SIMCARD (Sistem Informasi Kepegawaian BKPSDM)
* **OPD Pengampu**: Badan Kepegawaian & Pengembangan Sumber Daya Manusia (BKPSDM)
* **Base URL**: `https://server-simcard.konaweselatankab.go.id/`
* **Autentikasi**: Header `Authorization: kikensbatara <token>`
* **Endpoint Kunci**:
  * `GET /checkAuth/checkAuth` - Validasi status autentikasi ASN
  * `POST /api/v1/permohonan_KK_baru/view` - Layanan administrasi kepegawaian
  * `POST /server_pengguna/view` - Data profil kepegawaian pengguna

### 9. Portal CSR (Kemitraan Perusahaan & Tanggung Jawab Sosial)
* **OPD Pengampu**: Badan Perencanaan Pembangunan Daerah (Bappeda)
* **Base URL**: `https://server-csr.konaweselatankab.go.id/`
* **Autentikasi**: Header `Authorization: kikensbatara <token>`
* **Endpoint Kunci**:
  * `POST /api/v1/publish/homeCSR/homeCSRview` - Summary kegiatan CSR di Konawe Selatan
  * `POST /api/v1/publish/kegiatanCSR/kegiatanCSRview` - Daftar program & kegiatan CSR
  * `POST /api/v1/publish/registrasiMitra` - Pendaftaran perusahaan mitra CSR baru
  * `POST /api/v1/kegiatan_csr/addPengajuan` - Pengajuan partisipasi program CSR
  * `POST /api/v1/list_pengajuan/uploadEviden` - Upload bukti realisasi kegiatan CSR (Multipart)

### 10. Portal Hibah & Bansos (Bantuan Sosial Daerah)
* **OPD Pengampu**: BPKAD & Bagian Kesra Setda
* **Base URL**: `https://server.hibah.konaweselatankab.go.id/`
* **Autentikasi**: Header `Authorization: kikensbatara <token>`
* **Endpoint Kunci**:
  * `GET /public/v1/dashboard/kecamatan` - Master kecamatan penerima hibah
  * `POST /public/v1/dashboard/jmlBantuanIndividu` - Summary penerima hibah perorangan
  * `POST /public/v1/dashboard/viewIndividu` - Data distribusi hibah individu
  * `POST /public/v1/dashboard/viewKelompok` - Data distribusi hibah lembaga/kelompok
  * `POST /public/v1/dashboard/searchNik` - Pencarian status penerima bantuan berdasarkan NIK
  * `POST /public/v1/dashboard/viewUkt` - Data bantuan Beasiswa UKT Mahasiswa

### 11. Web Portal Berita Konsel (Informasi Publik)
* **OPD Pengampu**: Dinas Kominfo
* **Base URL**: `https://server-web.konaweselatankab.go.id/api/v1/`
* **Autentikasi**: Public (Tanpa token untuk menghindari penolakan CORS)
* **Endpoint Kunci**:
  * `POST /web_publish_berita/view` - Daftar berita pembangunan daerah
  * `POST /web_publish_video/view` - Galeri video kegiatan pimpinan & Pemkab
  * `POST /web_publish_pengumuman/view` - Pengumuman resmi pemerintah daerah

### 12. Backend Core Konsel SETARA, Layanan SKM, Realisasi & FCM Gateway
* **OPD Pengampu**: Dinas Kominfo & Lintas OPD Kabupaten Konawe Selatan
* **Base URL**: `https://konsel-setara.konaweselatankab.go.id/`
* **Autentikasi**: JWT Bearer Token / Firebase Service Account OAuth2
* **Endpoint Kunci**:
  * `/auth` - Endpoint login/register terpusat pengguna Konsel SETARA
  * `GET /api/v1/checkAuth` - Sesi token validator
  * `GET /api/v1/profile` - Manajemen profil pengguna terpadu
  * `GET /api/v1/slider` - Banner pengumuman/informasi di beranda utama
  * `POST /fcm/send-push` - Gateway pengiriman Push Notification Server-to-Server via Firebase Cloud Messaging HTTP v1 API
  * `GET /api/v1/app-version` - Pengecekan versi aplikasi Android/iOS dan force-update status
  * **Survei Kepuasan Masyarakat (SKM) & IKM**:
    * `POST /api/v1/skm/add` - Submit formulir kuesioner survei kepuasan masyarakat
    * `POST /api/v1/skm/views` - Rekapitulasi data ulasan/survei masuk dengan filter rating & periode
    * `GET /api/v1/skm/rekap-unsur` - Agregasi nilai per 9 unsur standar SKM (Permenpan RB)
    * `GET /api/v1/skm/ikm` - Perhitungan nilai Indeks Kepuasan Masyarakat dan kategori mutu layanan
  * **Monitoring Realisasi Layanan**:
    * `POST /api/v1/realisasi/view` - Daftar tracking realisasi permohonan layanan publik
    * `POST /api/v1/realisasi/summary` - Agregat statistik status pemrosesan dokumen (Diajukan, Diproses, Selesai, Ditolak)
  * **Manajemen Pegawai & Petugas Pelayanan**:
    * `POST /api/v1/pegawai/view` - Mengambil daftar data pegawai/petugas pelayanan OPD
    * `POST /api/v1/pegawai/add` - Menambah master data aparatur/petugas
    * `POST /api/v1/pegawai/update` & `POST /api/v1/pegawai/delete` - Pembaruan & penghapusan data pegawai

---

## 🔐 Standardisasi Keamanan & Protokol Interoperabilitas

1. **Skema Autentikasi Standard**:
   * Sebagian besar API sektoral menggunakan skema custom bearer: `Authorization: kikensbatara <token>`.
   * Modul FIRETAP menggunakan skema: `Authorization: xxx <token>`.
2. **Format Data & Payload**:
   * Data exchange: JSON (`application/json`).
   * Upload Dokumen/Foto: `multipart/form-data` atau `application/octet-stream` dengan custom header `File-Name`.
3. **Mekanisme Server-to-Server Push Notification**:
   * Seluruh aplikasi sektoral eksternal dapat memicu Push Notification ke aplikasi mobile Konsel SETARA melalui endpoint backend core `POST /fcm/send-push` dengan payload baku (`userId`, `title`, `body`, `data: { type, laporanId }`).

