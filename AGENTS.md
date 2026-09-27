# PANDUAN & ATURAN PENGEMBANGAN (AGENTS.MD)
Proyek: **Konsel Setara (Konawe Selatan)**

Dokumen ini adalah acuan kerja utama untuk AI Assistant / Agent agar selalu selaras dengan alur kerja, batasan teknis, dan fokus pengembangan proyek tanpa melakukan tindakan yang tidak diinginkan secara berulang.

---

## 🎯 FOKUS UTAMA PROYEK

1. **Aplikasi Mobile Android (`frontend/`)**:
   - Stack: Quasar Framework (Vue 3, Pinia) + `@capacitor/android`.
   - Port Dev Server: `http://localhost:9000`.
   - **Fokus Fitur Saat Ini**: Implementasi **Statistik Pengunjung (Visitor Counter)** yang tampil langsung di aplikasi mobile Android (bukan di web admin).

2. **Backend API (`backend/`)**:
   - Stack: Express.js, MySQL (Database `konsel_setara`, `erida`, `perak`).
   - Entry Point: `index.js`.
   - Port Dev: `5025`.

3. **Web Admin Dashboard (`admin/`)**:
   - Stack: Vite + React + Tailwind + Shadcn UI.
   - Port Dev: `5173`.

---

## 🚫 BATASAN & LARANGAN KERAS (CONSTRAINTS)

### 1. Perilaku Agent & Tooling
- ❌ **Dilarang Menjalankan Browser Subagent / Browser Otomatis**: Jangan membuka browser automation / visual test tools kecuali diminta secara eksplisit oleh pengguna. User melakukan review visual secara mandiri di browser/HP lokal.
- ❌ **Dilarang Menggunakan Scratchpad / File Sampah**: Jangan membuat file sementara, skrip scratch, atau file uji coba di direktori proyek yang mengotori source code.
- ❌ **Jangan Melakukan Asumsi Tanpa Konfirmasi**: Jika ada opsi arsitektur atau perubahan alur data, diskusikan terlebih dahulu sebelum mengeksekusi perubahan besar.

### 2. Git & Kolaborasi Tim (Multi-Developer)
- ❌ **Dilarang Melakukan `git push` Tanpa Perintah Eksplisit**: Jangan pernah menjalankan perintah `git push` kecuali jika user secara spesifik menginstruksikan untuk push.
- ⚠️ **Wajib Cek Remote Sebelum Push**: Proyek ini dikerjakan bersama tim (multi-kontributor). Selalu lakukan `git fetch origin` / pantau status remote agar tidak menimpa pekerjaan tim lain yang sedang aktif.
- ❌ **Dilarang Commit File Binary & Backup**:
  - Dilarang menambahkan file `.zip`, `.tar`, `.rar`, atau artefak build hasil compile (`dist/`).
  - Dilarang menambahkan file backup lokal (`*.backup`, `*.bak`, `*.old`).
  - Jaga [.gitignore](file:///Users/simplephi/Documents/riswan/konsel-setara/.gitignore) tetap bersih dan disiplin.

### 3. Konfigurasi Lingkungan (Environment)
- ⚠️ **Perhatikan Target API**:
  - File [frontend/src/api/api.js](file:///Users/simplephi/Documents/riswan/konsel-setara/frontend/src/api/api.js) default mengarah ke server produksi (`https://konsel-setara.konaweselatankab.go.id/`).
  - Saat menguji fitur lokal baru, pastikan koordinasikan pergantian `baseURL` (`localhost:5025` / IP lokal) dan jangan sampai URL lokal ter-push secara tidak sengaja ke production.

---

## 📋 STANDAR IMPLEMENTASI FITUR PENGUNJUNG (VISITOR COUNTER)

1. **Pencatatan (Hit)**:
   - Terjadi di background saat aplikasi Android dibuka pertama kali dalam 1 hari.
   - Menggunakan mekanisme cache/storage harian (`localStorage`) agar tidak terjadi spam hit setiap kali user berpindah halaman.
2. **Penyajian Data di Mobile Android (`frontend/`)**:
   - Menampilkan metrik sederhana: **Hari Ini**, **Bulan Ini**, dan **Total Kunjungan**.
   - Desain: **Minimalis, kompak, dan subtle strip** di bagian bawah [IndexPage.vue](file:///Users/simplephi/Documents/riswan/konsel-setara/frontend/src/pages/IndexPage.vue) (tidak mendominasi halaman, hanya sebagai pelengkap).
3. **Penyajian Data di Web Admin (`admin/`)**:
   - Dibuatkan halaman/modul tersendiri untuk statistik keseluruhan secara komprehensif (grafik tren harian, bulanan, dan analitik lengkap).
