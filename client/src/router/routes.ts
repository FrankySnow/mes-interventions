import { RouteRecordRaw } from 'vue-router'
import MainLayout from 'layouts/MainLayout.vue'
import IndexPage from 'pages/IndexPage.vue'
import ProfilPage from 'pages/ProfilPage.vue'
import NewInterventionPage from 'pages/NewInterventionPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        component: IndexPage,
      },
      {
        name: 'Profil',
        path: '/profil',
        component: ProfilPage,
      },
      {
        name: 'New intervention',
        path: '/new-intervention',
        component: NewInterventionPage,
      },
      {
        path: '/:catchAll(.*)*',
        component: () => import('pages/ErrorNotFound.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  // {
  //   path: '/:catchAll(.*)*',
  //   component: () => import('pages/ErrorNotFound.vue'),
  // },
]

export default routes
