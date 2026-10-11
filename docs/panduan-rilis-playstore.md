# 📱 Panduan & SOP Rilis Google Play Store - Konsel Setara

Dokumen ini adalah **SOP panduan resmi berkelanjutan** yang dapat digunakan kapan pun tim pengembang ingin melakukan pembaruan (*update*) dan mengunggah aplikasi **Konsel Setara** ke **Google Play Console**.

---

## 📌 1. Aturan Penomoran Versi (Dinamis: `MAJOR.MINOR.PATCH`)

Setiap kali akan merilis pembaruan, tentukan jenis perubahannya terlebih dahulu:

| Tipe Update | Kapan Digunakan? | Contoh Versi | Kebijakan `forceUpdate` di Backend |
| :--- | :--- | :---: | :---: |
| **MINOR** | Ada **fitur baru**, modul baru, atau menu layanan baru. | `1.4.0` ➔ **`1.5.0`** | **`true` (WAJIB UPDATE)**<br>Modal tidak ada tombol *"Nanti Saja"*. Pengguna wajib update agar data & menu baru sinkron. |
| **PATCH** | Hanya perbaikan teks (*typo*), penyesuaian warna/layout ringan, atau *hotfix* bug kecil tanpa mengubah struktur data/menu. | `1.5.0` ➔ **`1.5.1`** | **`false` (OPSIONAL)**<br>Modal ada tombol *"Nanti Saja"*. Pengguna tetap bisa memakai aplikasi secara fleksibel. |
| **MAJOR** | Perombakan total aplikasi, perubahan arsitektur besar-besaran. | `1.5.0` ➔ **`2.0.0`** | **`true` (WAJIB UPDATE)** |

> [!IMPORTANT]
> **Aturan Wajib Google Play (`versionCode`)**:
> `versionCode` adalah angka integer yang **WAJIB selalu naik (+1)** setiap kali mengunggah bundle baru ke Play Store, terlepas dari apakah perubahannya Minor atau Patch. Google Play akan menolak upload jika `versionCode` sama dengan versi sebelumnya.

---

## ✅ 2. Checklist File yang Diperbarui Setiap Rilis

Sebelum melakukan proses build, perbarui nomor versi pada file-file berikut:

1. **[frontend/android/app/build.gradle](file:///Users/simplephi/Documents/riswan/konsel-setara/frontend/android/app/build.gradle)** *(Wajib untuk Play Store)*:
   ```groovy
   defaultConfig {
       ...
       versionCode <NAIKKAN_ANGKA_SEBELUMNYA_PLUS_1>  // Contoh: 8
       versionName "<NOMOR_VERSI_BARU>"               // Contoh: "1.5.0"
   }
   ```
2. **[frontend/src/pages/Auth/LoginPage.vue](file:///Users/simplephi/Documents/riswan/konsel-setara/frontend/src/pages/Auth/LoginPage.vue)** *(Teks versi footer login)*:
   ```javascript
   appVersion: '<NOMOR_VERSI_BARU>' // Contoh: '1.5.0'
   ```
3. **[frontend/src/pages/ProfilPage.vue](file:///Users/simplephi/Documents/riswan/konsel-setara/frontend/src/pages/ProfilPage.vue)** *(Teks versi di profil)*:
   ```javascript
   appVersion: '<NOMOR_VERSI_BARU>' // Contoh: '1.5.0'
   ```
4. **[frontend/package.json](file:///Users/simplephi/Documents/riswan/konsel-setara/frontend/package.json)**:
   ```json
   "version": "<NOMOR_VERSI_BARU>"
   ```
5. **[frontend/src/App.vue](file:///Users/simplephi/Documents/riswan/konsel-setara/frontend/src/App.vue)** *(Bagian "What's new" pada Pop-up Update)*:
   - Pop-up ini akan tampil di smartphone pengguna versi lama jika `latestVersion` di backend lebih tinggi dari versi di HP mereka.
   - Poin-poin di `<div class="whats-new">` dapat disesuaikan atau dibiarkan teks umum (*Peningkatan performa, Fitur baru, Pembaruan keamanan*) yang selaras dengan Catatan Rilis (*Release Notes*) Google Play Console.

---

## 🛠️ 3. Perintah Eksekusi Build (.aab)

Jalankan 3 langkah perintah berikut di terminal:

```bash
# Langkah 1: Build aset web frontend
cd frontend
npm run build

# Langkah 2: Sinkronkan hasil build ke native Android Capacitor
npx cap sync android

# Langkah 3: Kompilasi bundle rilis yang ter-signing otomatis
cd android
./gradlew bundleRelease assembleRelease
```

### 📦 Lokasi File Artefak Hasil Build:
* **File untuk Play Store (`.aab`)**:  
  `frontend/android/app/build/outputs/bundle/release/app-release.aab`
* **File APK untuk testing langsung di HP (`.apk`)**:  
  `frontend/android/app/build/outputs/apk/release/app-release.apk`

---

## 🌐 4. Langkah Pengunggahan di Google Play Console

1. Buka peramban: [https://play.google.com/console](https://play.google.com/console)
2. Masuk ke akun developer dan pilih aplikasi **Konsel Setara**.
3. Di menu sidebar kiri: **Uji dan rilis** ➔ klik **Produksi** (*Production*).
4. Klik tombol **Buat rilis baru** (*Create new release*) di kanan atas.
5. Upload file: `frontend/android/app/build/outputs/bundle/release/app-release.aab`.
6. Tulis **Nama Rilis** (misal: `8 (1.5.0)`) dan tempelkan **Catatan Rilis (*Release Notes*)** yang menjelaskan poin-poin fitur baru atau perbaikan.
7. Klik **Berikutnya** ➔ periksa ringkasan (pastikan tidak ada tanda error merah) ➔ klik **Simpan dan Luncurkan ke Produksi**.
8. Status rilis akan berubah menjadi **"Sedang ditinjau" (*In review*)** (proses review Google berkisar antara 2 – 24 jam).

---

## 🔄 5. Sinkronisasi Backend (`/api/v1/app-version`) Pasca-Rilis

Pada [backend/index.js](file:///Users/simplephi/Documents/riswan/konsel-setara/backend/index.js), terdapat endpoint pengecekan versi:

```javascript
// Pengecekan Versi Aplikasi Mobile
app.get('/api/v1/app-version', (req, res) => {
  res.json({
    latestVersion: '<VERSI_BARU>', // Contoh: '1.5.0'
    storeUrl: 'https://play.google.com/store/apps/details?id=id.go.konaweselatankab.setara',
    forceUpdate: true // true jika MINOR/MAJOR, false jika PATCH
  });
});
```

> [!WARNING]
> **Aturan Waktu Eksekusi Backend**:  
> **JANGAN** mengubah nilai `latestVersion` di server produksi saat rilis masih berstatus *"Sedang ditinjau"* di Play Console.  
> **Ubah HANYA SETELAH** status rilis di Google Play Console telah berubah menjadi **"Tersedia di Google Play" (*Active*)** dan tombol *"Update"* sudah benar-benar terlihat di aplikasi Play Store smartphone.

> [!NOTE]
> **Hubungan Catatan Rilis Play Console & Pop-up Update In-App**:
> 1. **Di Play Console**: Catatan Rilis (*Release Notes*) yang ditulis saat membuat rilis adalah teks resmi yang akan dibaca pengguna di aplikasi Google Play Store saat membuka halaman aplikasi.
> 2. **Di Aplikasi Mobile (`frontend/src/App.vue`)**: Modal pop-up update (`<q-dialog>`) akan muncul di HP pengguna versi lama saat membuka aplikasi. Poin-poin *"What's new"* di modal ini berfungsi sebagai ringkasan pembaruan dan ajakan (*call-to-action*) agar pengguna segera menekan tombol **"Update Sekarang"**.
> 3. Teks *"What's new"* di [App.vue](file:///Users/simplephi/Documents/riswan/konsel-setara/frontend/src/App.vue) dapat dibiarkan teks universal (*Peningkatan performa, Fitur baru, Pembaruan keamanan*) atau disesuaikan sebelum build bundle rilis baru.

---

## 📜 6. Riwayat Versi Rilis Aplikasi

| Versi (`versionName`) | Kode (`versionCode`) | Tanggal Rilis | Tipe Update | Keterangan Singkat |
| :---: | :---: | :---: | :---: | :--- |
| **`1.6.3`** | **`12`** | 11 Okt 2026 | Minor (Wajib) | Penambahan Modul Layanan Koperasi & Katalog Pelaku UMKM Daerah (APLI DAKOP) dengan filter kecamatan, desa, sektor usaha, dan NIK. |
| `1.6.2` | `11` | Okt 2026 | Patch | Pembaruan optimasi visual dashboard dan perbaikan rute. |
| `1.6.1` | `10` | Okt 2026 | Patch | Optimasi upload logo menu admin & penambahan ikon warga bicara. |
| `1.5.0` | `8` | 28 Sep 2026 | Minor (Wajib) | Penambahan Fitur Statistik Pengunjung (Realtime Counter) & Menu RUP baru. |
| `1.4.0` | `7` | 02 Sep 2026 | Minor (Wajib) | Penambahan Modul SKM, Realisasi Permohonan, & Rebranding visual. |
| `1.3.0` | `6` | Agustus 2026 | Minor (Wajib) | Integrasi Layanan Publik Daerah Terpadu. |
