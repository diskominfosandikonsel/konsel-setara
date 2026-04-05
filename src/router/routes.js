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
        path : 'KK1',
        name  :'Kartu Keluarga Baru',
        component: () => import('pages/Simcard/KK/KK1.vue'),
        meta: { showBottomNav: true }
      },      
      {
        path : 'KK2',
        name  :'Permohonan Perubahan Kartu Keluarga (Perubahan Data) WNI',
        component: () => import('pages/Simcard/KK/KK2.vue'),
        meta: { showBottomNav: true }
      },      
      {
        path : 'KK3',
        name  :'Permohonan Kartu Keluarga (KK) Baru Orang Asing Yang Memiliki Izin Tinggal Tetap',
        component: () => import('pages/Simcard/KK/KK3.vue'),
        meta: { showBottomNav: true }
      },      
      {
        path : 'PPD1',
        name  :'Permohonan Pindah Antar Kabupaten/Kota Antar Provinsi',
        component: () => import('pages/Simcard/PPD/PPD1.vue'),
        meta: { showBottomNav: true }
      },      
      {
        path : 'PPD2',
        name  :'Permohonan Pindah Antar Desa/Kelurahan Dalam Satu Kecamatan',
        component: () => import('pages/Simcard/PPD/PPD2.vue'),
        meta: { showBottomNav: true }
      },      
      {
        path : 'PPD3',
        name  :'Permohonan Pindah Dalam Satu Desa/Kelurahan',
        component: () => import('pages/Simcard/PPD/PPD3.vue'),
        meta: { showBottomNav: true }
      },      

      {
        path : 'LAHIR1',
        name  :'Surat Keterangan Kelahiran',
        component: () => import('pages/Simcard/Lahir/Lahir1.vue'),
        meta: { showBottomNav: true }
      },      
      {
        path : 'LAHIR2',
        name  :'Surat Keterangan Kelahiran (Anak Yang Tidak Diketahui Asal-Usulnya) ',
        component: () => import('pages/Simcard/Lahir/Lahir2.vue'),
        meta: { showBottomNav: true }
      },
      {
        path : 'MATI1',
        name  :'Pelaporan Lahir Mati ',
        component: () => import('pages/Simcard/Mati/Mati1.vue'),
        meta: { showBottomNav: true }
      },
      {
        path : 'MATI2',
        name  :'Pelaporan Kematian ',
        component: () => import('pages/Simcard/Mati/Mati2.vue'),
        meta: { showBottomNav: true }
       }      
      // SIMCARD
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
