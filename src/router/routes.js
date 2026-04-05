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
