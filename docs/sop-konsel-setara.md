# Standard Operating Procedure (SOP) Pengelolaan & Pelayanan Aplikasi Konsel SETARA

**Pemerintah Kabupaten Konawe Selatan**  
**Dinas Komunikasi, Informatika, dan Persandian (Diskominfo)**

---

## 📄 Ringkasan SOP

Aplikasi **Konsel SETARA** (Konawe Selatan Sejahtera & Responsive) berfungsi sebagai *Super App* / Portal Integrasi Layanan Publik dan Kepegawaian Kabupaten Konawe Selatan. Agar operasional aplikasi berjalan tertib, aman, responsif, dan sesuai prinsip **SPBE (Sistem Pemerintahan Berbasis Elektronik)**, disusunlah Standard Operating Procedure (SOP) ini.

---

## 🏛️ Struktur Peran & Tanggung Jawab (Stakeholders)

1. **Diskominfo (Admin Super App / Pengelola Core Gateway)**:
   - Penanggung jawab infrastruktur server, API Gateway, dan autentikasi terpadu.
   - Pengelola helpdesk utama dan penyedia integrasi notifikasi FCM.
2. **Perangkat Daerah (OPD) Pengampu Layanan Sektoral**:
   - Dinas P3A, Satpol PP & Damkar/BPBD, DPMPTSP, Bappeda/Bapperida, BKPSDM, BPKAD, Dinas Kesehatan, Nakertrans, dll.
   - Penanggung jawab isi data, verifikasi aduan, dan eksekusi tindak lanjut di lapangan.
3. **Masyarakat & Pengguna Layanan**:
   - Pengguna aplikasi mobile (Android/iOS) yang mengajukan laporan, permohonan izin, atau mengakses informasi publik.

---

## 📋 DAFTAR STANDARD OPERATING PROCEDURE (SOP)

---

### SOP 01: Pengelolaan & Pemeliharaan Sistem Utama (Core Administrator)

* **Tujuan**: Memastikan ketersediaan (*availability*), performa, dan pembaruan aplikasi Konsel SETARA secara berkelanjutan.
* **Pelaksana**: Tim Teknis / Programmer Diskominfo.
* **Prosedur Kerja**:
  1. **Monitoring Server & API**: Tim teknis melakukan pemantauan rutin server backend (`https://konsel-setara.konaweselatankab.go.id`) dan database setiap hari kerja.
  2. **Backup Data**: Lakukan backup *automated database* dan direktori `uploads` secara berkala (harian untuk database, mingguan untuk berkas upload).
  3. **Pembaruan Versi Aplikasi (App Version Update)**:
     - Apabila ada *release* fitur baru atau perbaikan *bug*, versi aplikasi diperbarui via API `/api/v1/app-version`.
     - Jika pembaruan bersifat krusial (keamanan/fitur utama), set flag `forceUpdate: true` agar aplikasi mobile mengarahkan pengguna memperbarui aplikasi di Google Play Store / App Store.
  4. **Pencegahan Downtime**: Pelaksanaan *maintenance* terjadwal dilakukan pada *off-peak hours* (pukul 22.00 - 04.00 WITA) dengan pemberitahuan sebelumnya di menu *Slider/Banner*.

---

### SOP 02: Interoperabilitas & Integrasi API Sektoral Baru (Antar-OPD)

* **Tujuan**: Menjadi panduan standar bagi OPD yang ingin menghubungkan aplikasi sektoralnya ke Konsel SETARA.
* **Pelaksana**: Diskominfo & Tim IT OPD Pengampu.
* **Prosedur Kerja**:
  1. **Pengajuan Integrasi**: OPD pengampu mengajukan permohonan integrasi API ke Dinas Kominfo.
  2. **Verifikasi Endpoint & Protocol**:
     - API harus berbasis REST API (JSON / FormData / Stream).
     - Menggunakan skema autentikasi baku (`Authorization: kikensbatara <token>` atau kustom OAuth2).
  3. **Pengetesan di Environment Staging**: Lakukan uji coba konektivitas API pada lingkungan pengembangan/uji coba.
  4. **Registrasi Service & Catalog**: API terverifikasi didaftarkan ke `katalog-matriks-api.md` dan dibuatkan wrapper service-nya di folder `frontend/src/services/`.
  5. **Penanganan API Downtime Sektoral**:
     - Jika server OPD mengalami gangguan (*down*), backend core Konsel SETARA akan memberikan respon graceful error tanpa mengganggu fungsi modul lainnya.
     - Diskominfo memberikan notifikasi teknis kepada tim IT OPD pengampu untuk tindakan perbaikan.

---

### SOP 03: Penanganan Laporan & Aduan Masyarakat (Service Level Agreement / SLA)

* **Tujuan**: Memastikan setiap laporan aduan warga (Warga Bicara / PERAK, SAPA KONSEL, SIPPADU) ditindaklanjuti secara tepat dan terukur.
* **Pelaksana**: Admin Diskominfo (Front-Office) & Verifikator OPD (Back-Office).
* **Standar Waktu Respon (SLA)**:
  * **Verifikasi Awal / Disposisi**: Maksimal **1 x 24 Jam**.
  * **Tindak Lanjut Lapangan / Respon OPD**: Maksimal **3 x 24 Jam** (tergantung bobot laporan).

* **Prosedur Kerja**:
  1. **Penerimaan Laporan**: Laporan masuk dari aplikasi mobile pengguna ke database server sektoral.
  2. **Verifikasi & Validasi**:
     - Admin memeriksa kelengkapan identitas pelapor, uraian kejadian, dan foto bukti dukung.
     - Laporan yang tidak valid/spam akan ditolak dengan alasan yang jelas.
  3. **Disposisi ke OPD Pengampu**: Laporan valid diteruskan ke Dashboard Admin OPD terkait (misal: Kasus KDRT ke Dinas P3A, Perizinan ke DPMPTSP).
  4. **Proses Tindak Lanjut & Pembaruan Status**:
     - OPD mengubah status laporan di sistem: `Menunggu` ➔ `Diproses` ➔ `Selesai` / `Ditolak`.
     - Petugas mengunggah bukti/keterangan penanganan.
  5. **Notifikasi Otomatis ke Pelapor**:
     - Setiap ada perubahan status, sistem mengirimkan **Push Notification FCM** langsung ke HP pelapor.

---

### SOP 04: Penanganan Darurat / Panic Button (FIRETAP & Emergency SAPA)

* **Tujuan**: Penanganan laporan keadaan darurat (bencana, kebakaran, ancaman keselamatan perempuan & anak) secara cepat (*realtime*).
* **Pelaksana**: Petugas Regu Piket Satpol PP & Damkar, BPBD, & Tim Reaksi Cepat (TRC) Dinas P3A.
* **Standar Waktu Respon (SLA)**: Response Time **< 15 Menit**.

* **Prosedur Kerja**:
  1. **Pemicu Darurat (Panic Button / Add Emergency)**: Pengguna menekan tombol darurat atau mengirim laporan kasus baru beserta koordinat lokasi GPS.
  2. **Alarm & Push Notification High-Priority**:
     - Sistem memicu sirine/notifikasi prioritas tinggi ke HP/Dashboard Satgas/Petugas terdekat.
  3. **Konfirmasi & Penugasan Satgas**:
     - Operator/Admin menugaskan personil satgas terdekat via API `/api/v1/server_kasus/addSatgas`.
  4. **Peluncuran Tim Reaksi Cepat (TRC)**: Petugas bergerak ke lokasi kejadian sesuai koordinat GPS pelapor.
  5. **Pelaporan Akhir Pasca Penanganan**: Petugas memperbarui status kejadian dan mengunggah foto penanganan di lokasi.

---

### SOP 05: Manajemen Push Notification Gateway (Server-to-Server FCM)

* **Tujuan**: Mengatur lalu lintas notifikasi dari server sektoral ke perangkat pengguna agar efisien dan tidak mengganggu.
* **Pelaksana**: Administrator Backend Konsel SETARA.
* **Prosedur Kerja**:
  1. **Pengiriman Notifikasi dari Server Eksternal**: Server OPD mengirim HTTP POST ke `POST /fcm/send-push` dengan format payload baku:
     ```json
     {
       "userId": "ID_USER_PENERIMA",
       "title": "Judul Notifikasi",
       "body": "Pesan Notifikasi",
       "data": { "type": "nama_modul", "laporanId": "12345" }
     }
     ```
  2. **Verifikasi Token Perangkat**: Backend Konsel SETARA memetakan `userId` ke `fcm_token` aktif di database.
  3. **Penerusan ke FCM Google**: Server menggunakan `google-auth-library` dan `node-fetch` untuk meneruskan payload ke API FCM HTTP v1.
  4. **Manajemen Storage & History Client**: Aplikasi mobile menyimpan riwayat notifikasi lokal (maksimal 50 notifikasi / 30 hari) secara otomatis.

---

### SOP 06: Keamanan Informasi & Tanggap Insiden Siber (Cyber Incident Response)

* **Tujuan**: Menjaga kerahasiaan data pribadi masyarakat (NIK, alamat, nomor telepon) dan keamanan infrastruktur.
* **Pelaksana**: Tim CSIRT Diskominfo (Computer Security Incident Response Team).
* **Prosedur Kerja**:
  1. **Enkripsi Data & Token**: Seluruh lalu lintas data wajib menggunakan protokol terenkripsi HTTPS (SSL/TLS). Token autentikasi wajib diperbarui saat logout.
  2. **Monitoring Log Akses**: Pemantauan log *unauthorized access* atau percobaan penembusan API secara periodik.
  3. **Penanganan Kebocoran/Insiden**:
     - Jika terdeteksi aktivitas mencurigakan, token yang terdampak di-invaliddasi segera.
     - Lakukan isolasi server dan audit keamanan kode.
