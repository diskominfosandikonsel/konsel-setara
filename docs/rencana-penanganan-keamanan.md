# Rencana Penanganan Keamanan Konsel Setara

Tanggal penyusunan: 17 Oktober 2026  
Status: aktif — menjadi daftar kerja sebelum dan selama hardening keamanan

Audit ulang terakhir: 17 Oktober 2026 — pemeriksaan pasif produksi SKM, peninjauan source backend, dan `npm audit --omit=dev`

## Tujuan

Dokumen ini menyimpan urutan penanganan hasil pemeriksaan keamanan pada backend, web admin, dan aplikasi Android. Perubahan keamanan harus dilakukan bertahap, diuji, dan tidak boleh memutus API publik yang memang dipakai aplikasi mobile.

## Fondasi Hak Akses Admin

- [x] Menambahkan modul **Kelompok & Hak Akses** pada web admin.
- [x] Menyediakan matriks izin per menu: **Read, Add, Edit, Delete**.
- [x] Menyediakan kelompok bawaan **Administrator** dan **Admin OPD**.
- [x] Mengunci Administrator agar selalu memiliki akses penuh dan tidak dapat dihapus.
- [x] Membatasi pengelolaan kelompok hanya untuk Administrator.
- [x] Mendukung penambahan, perubahan, penonaktifan, dan penghapusan kelompok tambahan.
- [x] Memfilter sidebar dan halaman berdasarkan izin Read.
- [x] Memeriksa izin pada API untuk operasi administrasi utama.
- [x] Menghubungkan kelompok dinamis ke Manajemen User dan Hak Akses Pegawai.
- [ ] Uji integrasi menggunakan database staging dengan minimal satu akun untuk setiap kelompok.
- [ ] Verifikasi ulang izin setiap endpoint melalui pengujian negatif: tanpa token, token kelompok salah, dan tindakan yang tidak dicentang.

Catatan implementasi:

- ID `1` tetap Administrator dan ID `2` tetap Admin OPD agar kompatibel dengan data lama.
- Kelompok tambahan dimulai dari ID `100` agar tidak bertabrakan dengan role aplikasi lain yang sudah memakai ID `3` dan `4`.
- Tabel `access_groups` dan `access_group_permissions` dibuat otomatis oleh backend saat modul hak akses pertama kali digunakan.

## Ringkasan Temuan Audit Ulang SKM

Temuan berikut sudah dikonfirmasi melalui pemeriksaan source. Pemeriksaan produksi dilakukan secara pasif tanpa percobaan eksploitasi atau perubahan data.

| Tingkat | Temuan | Bukti/ruang lingkup | Status |
|---|---|---|---|
| Kritis | Endpoint administrasi sinkronisasi RUP tidak memakai autentikasi | `GET/POST /api/v1/rup/sync/config`, `POST /api/v1/rup/sync/trigger`, dan `GET /api/v1/rup/sync/logs`; endpoint baca produksi merespons HTTP 200 tanpa token | Terbuka, wajib ditutup segera |
| Kritis | Kredensial MongoDB pernah tersimpan di histori Git | Source aktif sudah memakai `MONGO_URI_WARGA_BICARA`, tetapi secret lama masih ada pada commit terdahulu | Source diperbaiki; rotasi secret dan audit histori belum terverifikasi |
| Tinggi | JWT tidak memiliki masa berlaku dan tidak ada revocation | Token membawa `menu_klp`; middleware tidak memeriksa ulang akun/akses pegawai pada setiap request | Belum ditangani |
| Tinggi | OTP reset password tidak memiliki batas percobaan | OTP enam digit, penyimpanan in-memory, tidak ada rate limit IP/email dan respons membedakan email terdaftar | Belum ditangani |
| Tinggi | Identitas pengisi SKM dipercaya dari request | `createdBy` pada `addUlasan` dan `checkStatus` dapat dipalsukan/diterka tanpa JWT | Belum ditangani |
| Tinggi | Registrasi token FCM mempercayai `userId` dari request | `save-token` dan `remove-token` tidak mewajibkan autentikasi | Belum ditangani |
| Tinggi | SQL injection masih tersedia pada route SKM lama | Query `addAplikasi`, `editAplikasi`, `removeAplikasi`, dan `viewUlasan` masih memakai interpolasi input | Belum ditangani |
| Tinggi | HTTP tidak dialihkan ke HTTPS | Domain SKM dan API versi HTTP merespons konten langsung, termasuk halaman login | Belum ditangani |
| Sedang/Tinggi | Data ulasan publik mengandung identitas | API dashboard/RUP mengembalikan ID, nama, komentar, rating, layanan, dan waktu | Perlu keputusan privasi dan anonimisasi |
| Sedang/Tinggi | Endpoint publik belum memiliki pembatasan | Login, register, OTP, ulasan, visitor, serta pagination publik belum memiliki rate limit/batas maksimum konsisten | Belum ditangani |

Catatan penting:

- Menghapus secret dari source aktif tidak membatalkan secret yang sudah pernah masuk histori Git. Kredensial lama harus dianggap terekspos sampai terbukti sudah dirotasi.
- Penghapusan akun, pencabutan akses pegawai, perubahan kelompok, atau penggantian password belum otomatis membatalkan JWT lama.
- `limit=0` atau nilai pagination tidak valid pada endpoint ulasan RUP dapat menghasilkan respons tanpa batas data.
- API produksi saat ini juga mengirim CORS wildcard, identitas framework, dan stack trace pada respons error.

## P0 — Kritis, Tangani Sebelum Rilis Berikutnya

### 1. Tutup endpoint berbahaya dan SQL injection

- [ ] Tambahkan autentikasi dan izin khusus RUP pada seluruh `/api/v1/rup/sync/*`; minimal hanya Administrator yang dapat mengubah konfigurasi atau memicu sinkronisasi.
- [ ] Tambahkan menu key/permission `rup` ke matriks hak akses sebelum memberikan akses kepada kelompok lain.
- [ ] Pisahkan endpoint RUP publik read-only dari endpoint konfigurasi, trigger, dan log operasional.
- [ ] Batasi tahun sinkronisasi, frekuensi cron, jumlah log, serta cegah sinkronisasi berulang yang membebani server.
- [ ] Ubah seluruh query interpolasi string pada `backend/apiMysql/skm.js` menjadi parameterized query.
- [ ] Audit ulang semua route `add`, `edit`, `remove`, `sync`, dan upload agar wajib autentikasi serta izin yang sesuai.
- [ ] Pastikan endpoint publik hanya bersifat baca atau hanya menerima data yang memang berasal dari pengguna aplikasi.
- [ ] Tambahkan pengujian untuk payload SQL injection pada pencarian, ID, nama, kategori, komentar, dan pagination.

Kriteria selesai: payload khusus tidak dapat mengubah struktur query; request tanpa izin selalu menerima HTTP 401/403; tidak ada endpoint mutasi admin yang terbuka.

### 2. Rotasi seluruh kredensial yang pernah tersimpan di source code

- [ ] Rotasi kredensial database/MongoDB yang pernah tertulis langsung di repository.
- [ ] Pindahkan semua secret ke environment variable atau secret manager server.
- [ ] Periksa histori Git; koordinasikan pembersihan histori dengan seluruh anggota tim sebelum force-update branch.
- [ ] Tambahkan secret scanning pada CI dan pre-commit.

Kriteria selesai: kredensial lama tidak lagi valid, source code tidak mengandung secret, dan scanner tidak menemukan secret aktif. Nilai secret tidak boleh dicantumkan dalam dokumen ini.

### 3. Amankan autentikasi dan sesi

- [ ] Tambahkan masa berlaku JWT (`exp`) yang pendek dan mekanisme refresh/re-login yang jelas.
- [ ] Tambahkan `token_version`/session version agar logout, perubahan password, penghapusan akun, perubahan role, dan pencabutan akses dapat membatalkan token lama.
- [ ] Periksa status akun dan penugasan kelompok aktif dari database pada request administrasi, bukan hanya mempercayai `menu_klp` di JWT.
- [ ] Pastikan hanya Administrator yang dapat mempromosikan user/pegawai ke kelompok Administrator; permission `users.update` atau `pegawai.update` saja tidak boleh cukup.
- [ ] Perbaiki middleware JWT agar token invalid langsung dihentikan dengan 401, bukan diteruskan.
- [ ] Terapkan rate limit pada login, OTP, register, lupa password, dan endpoint publik yang mahal.
- [ ] Gunakan OTP dari generator kriptografis, masa berlaku singkat, batas percobaan, serta invalidasi setelah berhasil.
- [ ] Simpan OTP dalam bentuk hash, ikat ke tujuan dan sesi reset, serta blokir sementara setelah beberapa percobaan salah.
- [ ] Samakan respons lupa password untuk mencegah enumerasi akun/email.
- [ ] Tambahkan pencatatan login gagal, perubahan role, dan perubahan hak akses.

Kriteria selesai: token kedaluwarsa ditolak, brute force dibatasi, OTP tidak dapat dipakai ulang, dan perubahan akses memiliki audit trail.

### 4. Amankan notifikasi FCM

- [ ] Wajibkan autentikasi pada registrasi/penghapusan token FCM.
- [ ] Ambil identitas pengguna dari token JWT, bukan menerima `userId` bebas dari request.
- [ ] Batasi endpoint pengiriman notifikasi hanya untuk kelompok/tindakan yang berwenang.
- [ ] Ubah pemeriksaan `NOTIF_API_KEY` menjadi fail-closed: server harus menolak request dan gagal start/menonaktifkan route jika secret kosong.
- [ ] Rotasi API key notifikasi bila pernah dibagikan dan gunakan perbandingan secret yang aman.
- [ ] Validasi tujuan, ukuran payload, dan jenis notifikasi.

Kriteria selesai: pengguna tidak dapat mendaftarkan token atas nama akun lain dan pihak anonim tidak dapat mengirim notifikasi.

### 5. Jaga integritas dan privasi data SKM

- [ ] Wajibkan JWT untuk `addUlasan` bila kebijakan survei hanya untuk pengguna login.
- [ ] Ambil identitas pengulas dari JWT; jangan menerima `createdBy` bebas dari body.
- [ ] Bila survei anonim tetap diperlukan, gunakan token survei satu-kali, rate limit, dan mekanisme anti-spam tanpa menyimpan nama.
- [ ] Validasi `rating` sebagai bilangan bulat 1–5, pastikan `aplikasi_id` benar-benar terdaftar, dan batasi panjang komentar.
- [ ] Lindungi `checkStatus` agar pengguna hanya dapat membaca status ulasannya sendiri.
- [ ] Anonimkan nama pada dashboard publik dan jangan mengirim ID internal yang tidak diperlukan.
- [ ] Terapkan batas maksimum pagination; larang `limit=0`, `NaN`, nilai negatif, dan nilai terlalu besar.
- [ ] Tentukan kebijakan moderasi komentar serta retensi data pribadi SKM.

Kriteria selesai: skor tidak dapat dimanipulasi melalui rating di luar rentang/spam, identitas tidak dapat dipalsukan, dan API publik tidak membocorkan data pribadi.

## P1 — Tinggi, Tangani Setelah P0 Stabil

### 6. Hardening upload file

- [ ] Terapkan batas ukuran file pada seluruh konfigurasi Multer.
- [ ] Validasi MIME type dan signature/magic bytes, bukan hanya ekstensi.
- [ ] Jangan mengizinkan upload SVG aktif kecuali sudah disanitasi; cegah file HTML/script tersimpan pada origin API.
- [ ] Gunakan nama file acak dan cegah path traversal.
- [ ] Pisahkan penyimpanan file publik dan file sensitif.
- [ ] Pastikan file yang diganti/dihapus tidak meninggalkan orphan file tanpa proses pembersihan aman.

### 7. Hardening HTTP dan error handling

- [ ] Tambahkan `helmet` dan kebijakan header keamanan yang sesuai.
- [ ] Batasi CORS ke domain admin/mobile yang benar per environment; hindari wildcard produksi.
- [ ] Jangan mengirim stack trace atau pesan database mentah kepada client.
- [ ] Terapkan request body limit dan timeout yang wajar.
- [ ] Paksa HTTPS di produksi serta evaluasi HSTS setelah semua subdomain siap.
- [ ] Terapkan redirect permanen HTTP ke HTTPS pada domain SKM dan domain API sebelum mengaktifkan HSTS.
- [ ] Tambahkan CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, dan proteksi framing.
- [ ] Nonaktifkan header `X-Powered-By` di produksi.

### 8. Hardening aplikasi Android dan frontend

- [ ] Hapus penyimpanan password plaintext dari fitur “ingat saya”; simpan token melalui secure storage/Keystore.
- [ ] Nonaktifkan cleartext traffic pada build produksi.
- [ ] Evaluasi `android:allowBackup` dan nonaktifkan bila data autentikasi dapat ikut tercadangkan.
- [ ] Sanitasi atau hilangkan penggunaan `v-html` pada konten yang tidak sepenuhnya dipercaya.
- [ ] Pindahkan token sensitif dari `localStorage` ke mekanisme yang lebih tahan XSS; untuk web evaluasi cookie `HttpOnly`, `Secure`, dan `SameSite`.
- [ ] Ubah sumber HTTP eksternal menjadi HTTPS atau proxy server yang aman.
- [ ] Pastikan URL API lokal tidak masuk ke build produksi.

## P2 — Pemeliharaan dan Pencegahan

### 9. Perbarui dependency rentan

Hasil baseline audit pada 17 Oktober 2026:

- Backend: 24 temuan (2 critical, 10 high, 10 moderate, 2 low).
- Admin: 1 temuan high.
- Frontend: 13 temuan (3 critical, 10 high).

Daftar kerja:

- [ ] Backend: perbarui minimal `multer`, `joi`, `firebase-admin`, `nodemailer`, serta rantai `proxy-addr` dan `websocket-driver` ke versi yang sudah diperbaiki.
- [ ] Android: perbarui `@capacitor/android` melewati versi rentan `8.3.4`, lalu lakukan `cap sync` dan regresi native.
- [ ] Frontend: perbarui Vue/server-renderer dan rantai `tar` ke versi yang sudah diperbaiki.
- [ ] Admin: perbarui `source-map-js` melalui dependency induknya.
- [ ] Buat branch khusus pembaruan dependency dan lockfile.
- [ ] Prioritaskan paket langsung yang berdampak pada autentikasi, upload, database, email, Android, HTTP client, PDF, dan framework UI.
- [ ] Hindari `npm audit fix --force` tanpa menilai breaking change.
- [ ] Jalankan build, unit/integration test, dan smoke test Android setelah setiap kelompok upgrade.
- [ ] Tambahkan audit dependency terjadwal pada CI.

### 10. Logging, audit, backup, dan respons insiden

- [ ] Buat tabel audit untuk login, perubahan user, perubahan kelompok, perubahan izin, dan operasi delete.
- [ ] Jangan mencatat password, token, OTP, atau secret pada log.
- [ ] Atur retensi dan akses log.
- [ ] Uji backup serta prosedur restore database.
- [ ] Susun daftar kontak dan langkah rotasi credential ketika insiden terjadi.

## Urutan Eksekusi yang Disarankan

1. Segera tutup endpoint `/api/v1/rup/sync/*` dan lakukan verifikasi negatif tanpa token.
2. Verifikasi rotasi secret MongoDB yang pernah masuk histori Git.
3. Perbaiki JWT expiry/revocation, pemeriksaan akun aktif, login, dan OTP.
4. Wajibkan identitas JWT pada SKM serta amankan registrasi token FCM.
5. Parameterisasi seluruh SQL lama dan batasi semua input/pagination.
6. Paksa HTTPS, batasi CORS, hilangkan stack trace, dan pasang header keamanan.
7. Deploy dan uji modul Kelompok & Hak Akses di staging, termasuk pencegahan promosi ke Administrator.
8. Amankan upload, storage token, serta semua render HTML dinamis.
9. Upgrade dependency secara bertahap dan lakukan regresi Android/backend/admin.
10. Lakukan penetration test ulang dan dokumentasikan bukti hasilnya.

## Checklist Sebelum Produksi

- [ ] Backup database berhasil dibuat dan diuji restore.
- [ ] Akun Administrator cadangan tersedia dan disimpan aman.
- [ ] Admin OPD hanya melihat serta mengubah data sesuai kewenangannya.
- [ ] Kelompok read-only tidak melihat tombol mutasi dan mendapat 403 bila memanggil API mutasi langsung.
- [ ] Tidak ada secret atau konfigurasi localhost dalam commit rilis.
- [ ] Semua build lulus dan endpoint utama memiliki smoke test.
- [ ] Log tidak mengandung data sensitif.
- [ ] Ada rencana rollback untuk backend, admin, dan Android.

## Catatan Perubahan

| Tanggal | Perubahan | Status |
|---|---|---|
| 17 Oktober 2026 | Baseline audit keamanan dan daftar prioritas dibuat | Selesai |
| 17 Oktober 2026 | Fondasi kelompok serta matriks hak akses admin diimplementasikan | Menunggu uji staging/database |
| 17 Oktober 2026 | Audit ulang SKM: endpoint RUP tanpa autentikasi terkonfirmasi di produksi | P0 belum ditangani |
| 17 Oktober 2026 | Audit ulang autentikasi, OTP, FCM, integritas ulasan, HTTP, dan privasi data publik | Masuk rencana P0/P1 |
| 17 Oktober 2026 | Audit dependency backend/admin/frontend diperbarui | Menunggu upgrade bertahap |
