import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard, publicGuard } from '@/guards/auth'
import { authService } from '@/services/auth'
import LoginView from '@/views/LoginView.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const routes: RouteRecordRaw[] = [
  // Public Routes (No Layout)
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false },
    beforeEnter: publicGuard,
  },

  // Admin Panel Routes with Layout
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/home',
      },
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'membros',
        name: 'members',
        component: () => import('@/views/MembersView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'membros/detalhes/:id',
        name: 'member-details',
        component: () => import('@/views/MemberDetailsView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'membros/editar/:id',
        name: 'edit-member',
        component: () => import('@/views/EditMemberView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'membros/cadastro',
        name: 'create-member',
        component: () => import('@/views/CreateMemberView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'pedidos-de-oracao',
        name: 'prayer-requests',
        component: () => import('@/views/PrayerRequestsView.vue'),
        meta: { requiresAuth: true },
      },
    ],
    meta: { requiresAuth: true },
    beforeEnter: authGuard,
  },

  // Not Found Route
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Initialize auth on app start
router.beforeEach(async (to, from, next) => {
  await authService.init()
  next()
})

export default router
