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

      // SIPPADU
      {
        path: 'sippadu_dashboard',
        component: () => import('pages/Sippadu/Dashboard.vue'),
        meta: { showBottomNav: true }
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
