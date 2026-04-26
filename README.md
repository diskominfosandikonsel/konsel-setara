# Konsel Setara (konselsetara)

Konsel Setara

## Tech Stack

```bash
Frontend
Node v24.12.0 (alt node v20+ )
@quasar/app-vite 2.4.0

Mobile
@capacitor/android 8.3.0
@capacitor/cli 8.3.0
@capacitor/core 8.3.0

Backend
Node v24.12.0 (alt node v20+ )
Express.js 5.2.1
```

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
# Quasar installed globally
quasar dev
# Quasar not installed globally
npx quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Build the app for mobile production

```bash
npm run build
#jika belum ada folder android
npx cap add android
npx cap sync
# untuk di windows
npx cap sync android
npx cap open android
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

---

## 🔔 Panduan Integrasi Push Notification untuk Modul Baru

### Package yang Ditambahkan (Push Notification Stack)

Fitur ini menggunakan library berikut yang sudah di-install dan di-setup:

**Backend (Server):**

- `firebase-admin` (Untuk inisialisasi dan konfigurasi credentials Firebase)
- `node-fetch` (Untuk mengeksekusi HTTP Request pengiriman push ke API FCM v1)
- `google-auth-library` (Untuk membuat token otorisasi Bearer OAuth2 ke server Google FCM)

Perintah install jika tim backend membuat server pengirim dari nol (scratch):

```bash
npm install node-fetch@2
```

**Frontend (Mobile):**

- `@capacitor/push-notifications` (Client listener untuk Android/iOS)
- Pinia Store `notifikasi.js` (Penyimpanan state lokal dengan `localStorage`)

Perintah install di frontend:

```bash
npm install @capacitor/push-notifications
npx cap sync
```

Jika tim ingin menambahkan fitur Push Notification ke modul baru di dalam aplikasi (seperti modul SIPPADU), ikuti alur standar berikut:

### 1. Struktur Payload dari Backend (Trigger Pengirim)

Pastikan modul backend yang mengirimkan notifikasi ke Firebase menyertakan parameter `type` dan ID unik pada bagian `data`. Inilah yang akan dikenali oleh Frontend untuk melakukan navigasi.

Contoh payload `data` dari backend:

```json
{
  "type": "nama_modul", // misal: "sippadu" atau "sapakonsel"
  "laporanId": "12345" // id atau parameter apapun untuk navigasi
}
```

### 2. Tangkap Navigasi di Frontend (`frontend/src/App.vue`)

Buka file `App.vue` dan scroll ke bagian `PushNotifications.addListener('pushNotificationActionPerformed', ...)` dan `navigateToDetail(data)`.

Tambahkan blok kondisi `else if` untuk tipe modul Anda.
**Wajib menggunakan format jembatan history (dengan `await`)** seperti contoh di bawah agar tombol _Back_ Android berfungsi normal:

```javascript
// Di dalam method navigateToDetail(data) di App.vue
else if (data.type === 'nama_modul' && data.laporanId) {
  const target = '/detail_modul/' + data.laporanId

  if (this.$route.path !== '/riwayat_modul' && this.$route.path !== target) {
    // Membangun jembatan history kilat
    await this.$router.replace('/')
    await this.$router.push('/riwayat_modul')
    await this.$router.push(target)
  } else {
    await this.$router.push(target)
  }
}
```

### 3. Tambahkan Tampilan di Halaman Notifikasi (`frontend/src/pages/NotifPage.vue`)

Agar tipe notifikasi Anda memunculkan _badge_ dan ikon khusus di daftar riwayat notifikasi, buka `NotifPage.vue` dan tambahkan di helper:

- Pada fungsi `getTypeLabel(type)` tambahkan: `nama_modul: 'NAMA MODUL'`
- Pada fungsi `getTypeClass(type)` tambahkan: `nama_modul: 'type-namamodul'`
- Pada fungsi `onNotifClick(notif)` tambahkan percabangan rute yang mengarah ke halaman yang sesuai.

_Styling badge label bisa ditambah di bagian `<style scoped>` (opsional)._

### 4. Komunikasi Antar Server (Trigger dari Aplikasi Eksternal)

Jika aplikasi/modul eksternal (seperti Server SIPPADU atau Server SAPA KONSEL) ingin mengirim notifikasi ke aplikasi mobile Konsel Setara, mereka harus melakukan HTTP Request ke **Backend Konsel Setara**.

**Alur Kerja Server-to-Server:**

1. Server Eksternal menyiapkan data notifikasi (`title`, `body`, `type`, dsb).
2. Server Eksternal menembak API Backend Konsel Setara (contoh: `POST /api/fcm/send-push`).
3. Backend Konsel Setara akan menerima request ini, mengekstrak _token device_ milik user (jika yang dikirim dari eksternal hanya `user_id`), lalu meneruskannya ke Google FCM v1 menggunakan `node-fetch`.
4. Google FCM mengirimkan notifikasi langsung ke HP User.

**Contoh Payload dari Server Eksternal ke Backend Konsel Setara:**

```javascript
// HTTP POST ke -> https://api-konsel-setara.com/api/fcm/send
body: JSON.stringify({
  userId: "id_user_penerima", // Backend kita yang akan mencari fcm_token berdasarkan ID ini
  title: "Laporan Diterima",
  body: "Laporan Anda sedang diproses oleh petugas.",
  data: {
    type: "sippadu",
    laporanId: "12345",
  },
});
```

### Catatan Tambahan:

- Penyimpanan riwayat notifikasi ke dalam perangkat `localStorage` (via `stores/notifikasi.js`) sudah berjalan otomatis. Beban memori dijaga dengan auto-cleanup maksimal 50 notif ter-baru atau terpakai maksimum rentang 30 hari.
- Token manajemen (hapus/update ketika login/logout) sudah dimanajemen secara terpusat oleh antarmuka sistem lama di `stores/auth.js`. Berlaku untuk semua akun/modul.
