const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/',
        alias: 'carte',
        component: () => import('pages/Carte.vue'),
      },
      {
        path: 'calendrier',
        component: () => import('pages/Calendrier.vue'),
      },
      {
        path: 'statistiques',
        component: () => import('pages/Statistiques.vue'),
      },
    ],
  },
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '*',
        component: () => import('pages/Error404.vue'),
      },
    ],
  })
}

export default routes
