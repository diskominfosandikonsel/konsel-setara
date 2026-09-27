# Dokumentasi & Checklist Implementasi Admin Dashboard Konsel Setara

## 📌 Ringkasan Proyek

Project **`admin`** telah berhasil dibangun di dalam workspace **`konsel-setara/admin/`** menggunakan template modern **Shadcn UI (Vite + React + Tailwind CSS v4 + TypeScript)** dan terintegrasi penuh dengan backend API `konsel-setara`.

---

## 📋 Checklist Modul & Fitur

### 1. Setup & Infrastruktur
- [x] Template Vite-React + Shadcn UI terpasang di `konsel-setara/admin/`
- [x] Konfigurasi environment (`.env` dengan `VITE_API_URL` & `VITE_UPLOAD_URL`)
- [x] Axios API client (`admin/src/lib/api.ts`) dengan skema autentikasi `kikensbatara` + auto 401 redirect
- [x] Auth utility & custom hooks (`admin/src/lib/auth.ts`, `admin/src/hooks/use-auth.ts`)
- [x] Auth Guard (`admin/src/components/auth-guard.tsx`) untuk proteksi route admin
- [x] Custom Sidebar (`admin/src/components/app-sidebar.tsx`) dengan branding Konsel Setara & navigasi grup
- [x] Clean routing (`admin/src/config/routes.tsx`)

### 2. Autentikasi (`/auth/sign-in`)
- [x] Halaman Login modern (`admin/src/app/auth/sign-in/`)
- [x] Autentikasi langsung ke backend `POST /auth/login`
- [x] Penyimpanan token & profil pengguna di `localStorage`

### 3. Dashboard SKM (`/dashboard`)
- [x] **Summary Cards:** Skor Kepuasan (Rating / 5.0), Total Responden, Total Layanan
- [x] **Tren Kepuasan (Area Chart):** Grafik tren skor kepuasan 6 bulan terakhir
- [x] **Distribusi Rating (Bar Chart):** Distribusi kepuasan (Sangat Puas, Puas, Cukup, Kurang, Kecewa)
- [x] **Feed Ulasan Terbaru:** 5 komentar terbaru lengkap dengan nama, rating bintang, dan waktu
- [x] Terhubung ke `GET /api/v1/skm/getDashboard`

### 4. Kelola Ulasan SKM (`/ulasan`)
- [x] Data Table ulasan masuk dengan pagination & search
- [x] Kolom: Nama Responden, Layanan/Aplikasi, Rating Bintang, Komentar, Tanggal
- [x] Terhubung ke `POST /api/v1/skm/viewUlasan`

### 5. Kelola Aplikasi / Layanan (`/aplikasi`)
- [x] CRUD Layanan yang disurvei (Nama, Kategori, Keterangan)
- [x] Modal form Tambah & Edit dengan feedback interaktif (Sonner Toast)
- [x] Konfirmasi hapus layanan
- [x] Terhubung ke `POST /api/v1/skm/viewAplikasi`, `addAplikasi`, `editAplikasi`, `removeAplikasi`

### 6. Kelola Slider / Banner Mobile (`/slider`)
- [x] Grid visual preview banner yang tayang di aplikasi Android
- [x] Upload banner baru (multipart/form-data) + input target link/video
- [x] Edit link atau ganti gambar banner
- [x] Reorder posisi urutan banner (Tombol Naik / Turun) terhubung ke `POST /api/v1/slider/reorder`
- [x] Hapus banner + pembersihan file fisik di storage server

### 7. Menu Dinamis Mobile (`/menu`)
- [x] Backend endpoint baru (`backend/apiMysql/menu.js`) untuk CRUD & reorder menu
- [x] Inisialisasi otomatis tabel `menu_items` & seeding data default
- [x] Data table menu dengan pengaturan status aktif / non-aktif
- [x] **Live Preview Simulator Android Mobile:** Simulasi langsung tampilan grid menu di smartphone saat diubah admin
- [x] Integrasi ke `frontend/src/pages/IndexPage.vue` (Mobile Android) agar me-render menu secara dinamis dari API `GET /api/v1/menu/list`

### 8. Manajemen Pengguna Administrator (`/users`)
- [x] Backend endpoint baru (`backend/apiMysql/users.js`) untuk manajemen akun
- [x] Data table pengguna dengan pencarian dan filter
- [x] Modal Tambah Administrator & Edit Pengguna (Nama, Email, No HP, Role, Password Baru)
- [x] Badge Role: Super Administrator (menu_klp: 1), Admin OPD (menu_klp: 2), Pengguna (menu_klp: 3)
- [x] Proteksi keamanan (mencegah admin menghapus akun sendiri yang sedang aktif)

---

## 🚀 Cara Menjalankan Project Admin

1. Masuk ke direktori admin:
   ```bash
   cd /Users/simplephi/Documents/riswan/konsel-setara/admin
   ```
2. Jalankan development server:
   ```bash
   npm run dev
   ```
3. Buka di browser pada URL yang tampil (biasanya `http://localhost:5173`).
