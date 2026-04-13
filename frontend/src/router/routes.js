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
        path: 'news/:id',
        component: () => import('pages/NewsDetailPage.vue'),
        meta: { showBottomNav: false }
      },

      {
        path: 'notifikasi',
        component: () => import('pages/NotifPage.vue'),
        meta: { showBottomNav: true, requiresAuth: true }
      },
      // PROFILE
      {
        path: 'profil',
        component: () => import('pages/ProfilPage.vue'),
        meta: { showBottomNav: true, requiresAuth: true }
      },
      {
        path: 'edit_profile',
        component: () => import('pages/Profile/EditProfilePage.vue'),
        meta: { showBottomNav: false, requiresAuth: true }
      },
      {
        path: 'account_settings',
        component: () => import('pages/Profile/AccountSettingsPage.vue'),
        meta: { showBottomNav: false , requiresAuth: true}
      },
      {
        path: 'delete_account',
        component: () => import('pages/Profile/DeleteAccountPage.vue'),
        meta: { showBottomNav: false , requiresAuth: true}
      },
      {
        path: 'change_email',
        component: () => import('pages/Profile/ChangeEmailPage.vue'),
        meta: { showBottomNav: false , requiresAuth: true}
      },
      {
        path: 'change_password',
        component: () => import('pages/Profile/ChangePasswordPage.vue'),
        meta: { showBottomNav: false , requiresAuth: true}
      },
      // PROFILE END
      //Legal Start
      {
        path: 'user_guide',
        component: () => import('pages/Legal/GuidePage.vue'),
        meta: { showBottomNav: false , requiresAuth: true}
      },
      {
        path: 'privacy_policy',
        component: () => import('pages/Legal/PrivacyPage.vue'),
        meta: { showBottomNav: false , requiresAuth: true}
      },
      {
        path: 'terms_conditions',
        component: () => import('pages/Legal/TermsPage.vue'),
        meta: { showBottomNav: false , requiresAuth: true}
      },
      // Legal End
      {
        path: 'sapa_dashboard',
        component: () => import('pages/SapaKonsel/Dashboard.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'sapa_edukasi',
        component: () => import('pages/SapaKonsel/Edukasi.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'sapa_edukasi/:id',
        component: () => import('pages/SapaKonsel/DetailEdukasi.vue'),
        meta: { showBottomNav: false }
      },
      {
        path: 'sapa_riwayat',
        component: () => import('pages/SapaKonsel/Riwayat.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'sapa_detail',
        component: () => import('pages/SapaKonsel/Detail.vue'),
        meta: { showBottomNav: false, requiresAuth: true }
      },
      {
        path: 'sapa_satgas',
        component: () => import('pages/SapaKonsel/Satgas.vue'),
        meta: { showBottomNav: false }
      },
      {
        path: 'erida_dashboard',
        component: () => import('pages/Erida/Dashboard.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'erida_penelitian',
        component: () => import('pages/Erida/Penelitian.vue'),
        meta: { showBottomNav: false, requiresAuth: true }
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
        path: 'sippadu_aduan/:type',
        component: () => import('pages/Sippadu/Aduan.vue'),
        meta: { showBottomNav: false }
      },
      {
        path: 'sippadu_riwayat',
        component: () => import('pages/Sippadu/Riwayat.vue'),
        meta: { showBottomNav: false }
      },
      {
        path: 'sippadu_detail/:id',
        component: () => import('pages/Sippadu/Detail.vue'),
        meta: { showBottomNav: false }
      },

      // FIRETAP
      {
        path: 'firetap_dashboard',
        component: () => import('pages/Firetap/Dashboard.vue'),
        meta: { showBottomNav: true, requiresAuth: true }
      },
      {
        path: 'firetap_lapor',
        component: () => import('pages/Firetap/Lapor.vue'),
        meta: { showBottomNav: false, requiresAuth: true }
      },
      {
        path: 'firetap_riwayat',
        component: () => import('pages/Firetap/Riwayat.vue'),
        meta: { showBottomNav: false, requiresAuth: true }
      },
      {
        path: 'firetap_detail/:id',
        component: () => import('pages/Firetap/Detail.vue'),
        meta: { showBottomNav: false, requiresAuth: true }
      },


      // PERAK
      {
        path: 'perak_dashboard',
        component: () => import('pages/PerakKonsel/Dashboard.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'biodata',
        component: () => import('pages/PerakKonsel/biodata.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'tambahBiodata',
        component: () => import('pages/PerakKonsel/tambahBiodata.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'editBiodata',
        component: () => import('pages/PerakKonsel/editBiodata.vue'),
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
      {
        path: 'register',
        component: () => import('pages/Auth/RegisPage.vue'),
        meta: { showBottomNav: false }
      },
      {
        path: 'lupa-password',
        component: () => import('pages/Auth/LupapassPage.vue'),
        meta: { showBottomNav: false }
      },
      // SIMCARD

      // JDIH
      {
        path: 'jdih_dashboard',
        component: () => import('pages/Jdih/Dashboard.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'peraturanDaerah',
        component: () => import('pages/Jdih/Perda.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'peraturanBupati',
        component: () => import('pages/Jdih/Perbup.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'keputusanBupati',
        component: () => import('pages/Jdih/Keputusan.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'instruksiBupati',
        component: () => import('pages/Jdih/Instruksi.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'keputusanSKPD',
        component: () => import('pages/Jdih/KeputusanSKPD.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'pemdes',
        component: () => import('pages/Jdih/Pemdes.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'detilData',
        component: () => import('pages/Jdih/detilData.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'sk',
        component: () => import('pages/Jdih/Sk.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'sop',
        component: () => import('pages/Jdih/Sop.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'putusan',
        component: () => import('pages/Jdih/Putusan.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'dll',
        component: () => import('pages/Jdih/Dll.vue'),
        meta: { showBottomNav: true }
      },
      {
        path: 'detilDokumen',
        component: () => import('pages/Jdih/DetilDokumen.vue'),
        meta: { showBottomNav: true }
      },
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
