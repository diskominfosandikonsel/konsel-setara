import MainLayout from 'layouts/MainLayout.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'news',
        component: () => import('pages/NewsPage.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'notifikasi',
        component: () => import('pages/NotifPage.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'profil',
        component: () => import('pages/ProfilPage.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'sapa_dashboard',
        component: () => import('pages/SapaKonsel/Dashboard.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'sapa_riwayat',
        component: () => import('pages/SapaKonsel/Riwayat.vue'),
        meta: { showBottomNav: false }
      },
      {
        path: 'sapa_detail',
        component: () => import('pages/SapaKonsel/Detail.vue'),
        meta: { showBottomNav: false }
      },
      {
        path: 'sapa_satgas',
        component: () => import('pages/SapaKonsel/Satgas.vue'),
        meta: { showBottomNav: false }
      },

      // SIPPADU
      {
        path: 'sippadu_dashboard',
        component: () => import('pages/Sippadu/Dashboard.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'Perda',
        component: () => import('pages/Sippadu/Perda.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'Perkada',
        component: () => import('pages/Sippadu/Perkada.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'sippadu_riwayat',
        component: () => import('pages/Sippadu/Riwayat.vue'),
        meta: { showBottomNav: false }
      },
      {
        path: 'sippadu_detail',
        component: () => import('pages/Sippadu/Detail.vue'),
        meta: { showBottomNav: false }
      },

      // PERAK
      {
        path: 'perak_dashboard',
        component: () => import('pages/PerakKonsel/Dashboard.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'biodata',
        component: () => import('pages/PerakKonsel/Biodata.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'tambahBiodata',
        component: () => import('pages/PerakKonsel/TambahBiodata.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'editBiodata',
        component: () => import('pages/PerakKonsel/EditBiodata.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'pendidikanFormal',
        component: () => import('pages/PerakKonsel/PendidikanFormal.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'detilePendidikan',
        component: () => import('src/pages/PerakKonsel/DetilePendidikan.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'tambahPendidikan',
        component: () => import('src/pages/PerakKonsel/TambahPendidikan.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'editPendidikan',
        component: () => import('src/pages/PerakKonsel/EditPendidikan.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'pengalamanKerja',
        component: () => import('src/pages/PerakKonsel/PengalamanKerja.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'tambahPengalaman',
        component: () => import('src/pages/PerakKonsel/TambahPengalaman.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'editPengalaman',
        component: () => import('src/pages/PerakKonsel/EditPengalaman.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'jabatan',
        component: () => import('src/pages/PerakKonsel/Jabatan.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'tambahJabatan',
        component: () => import('src/pages/PerakKonsel/TambahJabatan.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'editJabatan',
        component: () => import('src/pages/PerakKonsel/EditJabatan.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'lampiran',
        component: () => import('src/pages/PerakKonsel/Lampiran.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'tambahLampiran',
        component: () => import('src/pages/PerakKonsel/TambahLampiran.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'editLampiran',
        component: () => import('src/pages/PerakKonsel/EditLampiran.vue'),
        meta: { showBottomNav: true }
      },

      // SIMCARD
      {
        path: 'simcard_dashboard',
        component: () => import('pages/Simcard/Dashboard.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'simcard_login',
        component: () => import('pages/Simcard/Login.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'KK1',
        name: 'Kartu Keluarga Baru',
        component: () => import('pages/Simcard/KK/KK1.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'KK2',
        name: 'Permohonan Perubahan Kartu Keluarga (Perubahan Data) WNI',
        component: () => import('pages/Simcard/KK/KK2.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'KK3',
        name: 'Permohonan Kartu Keluarga (KK) Baru Orang Asing Yang Memiliki Izin Tinggal Tetap',
        component: () => import('pages/Simcard/KK/KK3.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'PPD1',
        name: 'Permohonan Pindah Antar Kabupaten/Kota Antar Provinsi',
        component: () => import('pages/Simcard/PPD/PPD1.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'PPD2',
        name: 'Permohonan Pindah Antar Desa/Kelurahan Dalam Satu Kecamatan',
        component: () => import('pages/Simcard/PPD/PPD2.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'PPD3',
        name: 'Permohonan Pindah Dalam Satu Desa/Kelurahan',
        component: () => import('pages/Simcard/PPD/PPD3.vue'),
        meta: { showBottomNav: true }
      },

      {
        path: 'LAHIR1',
        name: 'Surat Keterangan Kelahiran',
        component: () => import('pages/Simcard/Lahir/Lahir1.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'LAHIR2',
        name: 'Surat Keterangan Kelahiran (Anak Yang Tidak Diketahui Asal-Usulnya) ',
        component: () => import('pages/Simcard/Lahir/Lahir2.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'MATI1',
        name: 'Pelaporan Lahir Mati ',
        component: () => import('pages/Simcard/Mati/Mati1.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'MATI2',
        name: 'Pelaporan Kematian ',
        component: () => import('pages/Simcard/Mati/Mati2.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'login',
        component: () => import('pages/Auth/LoginPage.vue'),
        meta: { showBottomNav: false }
      },
      // SIMCARD

      // JDIH
      {
        path: 'jdih_dashboard',
        component: () => import('pages/Jdih/Dashboard.vue'),
        meta: { showBottomNav: false }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
