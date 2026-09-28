# 📌 MASTER ROADMAP & PLAN PENGEMBANGAN: KONSEL SETARA

Dokumen ini adalah **panduan acuan rencana kerja terpusat**. Kapan pun Anda memulai sesi kerja dan menanyakan _"apa plan selanjutnya?"_, dokumen ini menjadi acuan status pekerjaan yang sudah selesai dan antrean fitur yang siap dikerjakan.

---

## 🏆 STATUS TERAKHIR (RILIS v1.6.0 / v1.6.1)

| Komponen                        |        Status        | Catatan Rilis                                                                                                                               |
| :------------------------------ | :------------------: | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Mobile Android**              | 🚀 **LIVE & UPDATE** | Versi `1.6.0` (kode `9`) live di Play Store. Bundle versi `1.6.1` (kode `10`, dukungan logo dinamis) sudah diunggah ke Google Play Console. |
| **Backend Visitor & Menu**      |    ✅ **SELESAI**    | Endpoint `/api/v1/visitors/*` & `/api/v1/menu/upload` aktif melayani aplikasi & admin.                                                      |
| **Plan 1: Upload Logo Dinamis** |    ✅ **SELESAI**    | Admin web bisa upload logo gambar mandiri, backend melayani static storage & mobile `IndexPage.vue` otomatis render logo remote.            |

---

## 🚀 PRIORITAS PENGEMBANGAN BERIKUTNYA

```mermaid
flowchart LR
    A[v1.6.1 Diunggah ke Play Store] --> B[✅ PLAN 1: Upload Logo Dinamis SELESAI]
    B --> C[🎯 FOKUS SEKARANG: PLAN 2 Dashboard Analitik Pengunjung di Admin]
    C --> D[🛠️ PLAN 3: DEX Obfuscation R8 & Optimasi Android]
```

---

## 🛠️ ROADMAP PENGEMBANGAN FITUR SELANJUTNYA

### ✅ PLAN 1: Sistem Upload Logo & Menu Dinamis (Admin, Backend & Mobile) — [SELESAI]

> **Status**: **100% Selesai**. Backend endpoint upload aktif, Web Admin memiliki picker upload & preview live mock, dan Mobile Android v1.6.1 telah mendukung pembacaan URL remote.

---

### 🎯 PLAN 2: Modul Analitik & Statistik Pengunjung di Web Admin (`admin/`) — [FOKUS SAAT INI]

> **Tujuan Utama**: Menyajikan dashboard pemantauan statistik pengunjung aplikasi Konsel Setara secara komprehensif bagi pimpinan dan pengelola sistem Diskominfo.

#### 1. Sisi Backend (`backend/`):

- **Endpoint Baru**: `GET /api/v1/visitors/analytics?range=7|30|year`
- **Payload Respons**:
  - Ringkasan KPI: Total Pengunjung, Pengunjung Hari Ini, Bulan Ini, Rata-rata Harian, Hari Puncak (_Peak Day_).
  - Data Tren Harian: Array `{ date: '2026-09-28', count: 145 }` untuk kebutuhan grafik.
  - Komposisi Platform: Breakdown jumlah kunjungan dari `android`, `ios`, dan `web`.

#### 2. Sisi Web Admin (`admin/`):

- **Menu Baru Sidebar**: **Statistik Pengunjung** (`/visitors` atau `/analytics`).
- **Komponen Visual**:
  - **4 Kartu KPI Ringkasan**: Desain modern dengan badge persentase tren naik/turun.
  - **Grafik Tren Interaktif**: Visualisasi Area/Line Chart menggunakan library `recharts`.
  - **Filter Rentang Waktu**: Tombol cepat _7 Hari_, _30 Hari_, _Bulan Ini_, _Tahun Ini_.
  - **Tabel Log Kunjungan**: Rincian harian beserta jumlah hit per tanggal.

---

### 🛠️ PLAN 3: Optimalisasi Kode DEX & Obfuscation R8 (`frontend/android`)
> **Tujuan Utama**: Memenuhi standar kualitas DEX Google Play Console (tenggat Feb 2027) dengan menaikkan persentase DEX Obfuscation di atas 25% dan memperkecil ukuran bundle aplikasi.

#### Rincian Tindakan:
1. **Konfigurasi `build.gradle`**:
   - Aktifkan `minifyEnabled true` dan `shrinkResources true` pada `buildTypes.release`.
2. **Aturan ProGuard (`proguard-rules.pro`)**:
   - Lindungi antarmuka JavaScript-to-Native Capacitor (`@JavascriptInterface`).
   - Pertahankan plugin Capacitor (App, Browser, Device, Splash, dll.) agar tidak hilang/error saat di-obfuscate R8.
3. **Penyusutan Ukuran**:
   - Menyusutkan ukuran DEX uncompressed dari 15.3 MB menjadi jauh lebih ramping.
4. **Opsional (UI Layout)**:
   - Evaluasi peringatan deprecated API fullscreen/window insets untuk kompatibilitas Android 15+.

---

## 📌 CARA PENGGUNAAN PLAN INI

Setiap kali membuka sesi proyek berikutnya, Anda cukup mengatakan:  
👉 **"Lanjutkan Plan 2 (Dashboard Analitik Pengunjung di Admin)"** atau **"Lanjutkan Plan 3 (Optimalisasi DEX R8 Android)"**, dan kita langsung mengeksekusi sesuai prioritas!

