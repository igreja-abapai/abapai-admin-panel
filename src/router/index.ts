import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard, publicGuard } from '@/guards/auth'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores/auth'
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
        meta: { requiresAuth: true, permission: 'visualizar_membros' },
      },
      {
        path: 'membros/detalhes/:id',
        name: 'member-details',
        component: () => import('@/views/MemberDetailsView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_membros' },
      },
      {
        path: 'membros/editar/:id',
        name: 'edit-member',
        component: () => import('@/views/EditMemberView.vue'),
        meta: { requiresAuth: true, permission: 'editar_membros' },
      },
      {
        path: 'membros/cadastro',
        name: 'create-member',
        component: () => import('@/views/CreateMemberView.vue'),
        meta: { requiresAuth: true, permission: 'criar_membros' },
      },
      {
        path: 'membros/aniversariantes',
        name: 'members-birthdays',
        component: () => import('@/views/BirthdaysView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_membros' },
      },
      {
        path: 'pedidos-de-oracao',
        name: 'prayer-requests',
        component: () => import('@/views/PrayerRequestsView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_pedidos_oracao' },
      },
      {
        path: 'pedidos-de-oracao/novo',
        name: 'create-prayer-request',
        component: () => import('@/views/CreatePrayerRequestView.vue'),
        meta: { requiresAuth: true, permission: 'criar_pedidos_oracao' },
      },
      {
        path: 'usuarios',
        name: 'users',
        component: () => import('@/views/UsersView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_usuarios' },
      },
      {
        path: 'usuarios/novo',
        name: 'create-user',
        component: () => import('@/views/CreateUserView.vue'),
        meta: { requiresAuth: true, permission: 'criar_usuarios' },
      },
      {
        path: 'usuarios/editar/:id',
        name: 'edit-user',
        component: () => import('@/views/EditUserView.vue'),
        meta: { requiresAuth: true, permission: 'editar_usuarios' },
      },
      {
        path: 'perfil',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'website',
        name: 'website',
        component: () => import('@/views/WebsiteView.vue'),
        meta: { requiresAuth: true, permission: 'gerenciar_website' },
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
let authInitialized = false

router.beforeEach(async (to, from, next) => {
  if (!authInitialized) {
    await authService.init()
    authInitialized = true
  }

  const authStore = useAuthStore()
  const requiredPermission = to.meta.permission as string | undefined
  if (requiredPermission && !authStore.hasPermission(requiredPermission)) {
    return next({ path: '/login' })
  }
  next()
})

export default router
