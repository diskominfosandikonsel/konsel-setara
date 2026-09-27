# Workflow: Integrasi SIPPADU ke Konsel-Setara

Fokus: Mengganti data dummy dengan data real dari API SIPPADU server yang sudah jalan.

## Pola Arsitektur (dari analisa Jdih dan SapaKonsel)

```
apiXxx.js (axios instance + token interceptor)
    |
xxx.service.js (wrapper method untuk setiap endpoint)
    |
stores/xxx.js (Pinia store: state + actions)
    |
pages/Xxx/*.vue (panggil store di mounted/onMounted)
```

- SapaKonsel -> serversapakonsel.konaweselatankab.go.id
- JDIH -> server.jdih.konaweselatankab.go.id
- SIPPADU -> server-sippadu.konaweselatankab.go.id (PAKAI INI, SUDAH JALAN)

## API SIPPADU Server yang Akan Dipakai

| Endpoint | Method | Keterangan |
|---|---|---|
| publish_peraturan/perda | GET | List semua perda |
| publish_peraturan/perkada | GET | List semua perkada |
| server_perda/view | POST | Perda + pagination |
| server_perkada/view | POST | Perkada + pagination |

## Task List

### FASE 1: Service dan Store
- [ ] Task 1.1 - Update sippadu.service.js: tambah getPerda(), getPerkada()
- [ ] Task 1.2 - Update stores/sippadu.js: tambah state dan actions

### FASE 2: Halaman Perda dan Perkada
- [ ] Task 2.1 - Renovasi Perda.vue: list data dari API
- [ ] Task 2.2 - Renovasi Perkada.vue: list data dari API

### FASE 3: Dashboard dan Riwayat (Nanti)
- [ ] Task 3.1 - Dashboard.vue: sambungkan berita ke API
- [ ] Task 3.2 - Riwayat.vue: hapus dummy, panggil API laporan
- [ ] Task 3.3 - Detail.vue: tampilkan data real

### FASE 4: Kirim Laporan (Nanti)
- [ ] Task 4.1 - Kirim laporan ke API
- [ ] Task 4.2 - Upload foto + keterangan

## File yang Diubah

```
frontend/src/
  services/
    sippadu.service.js        [EDIT] Tambah getPerda, getPerkada
  stores/
    sippadu.js               [EDIT] Tambah state dan action perda/perkada
  pages/Sippadu/
    Perda.vue                 [EDIT] Renovasi list data API
    Perkada.vue              [EDIT] Renovasi list data API
```
