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
        path: 'membros/ex-membros',
        name: 'former-members',
        component: () => import('@/views/FormerMembersView.vue'),
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
        path: 'analises',
        name: 'analysis',
        component: () => import('@/views/AnalysisView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_analises' },
      },
      {
        path: 'financas',
        name: 'finances',
        component: () => import('@/views/FinanceTransactionsView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_financas' },
      },
      {
        path: 'patrimonio/inventario',
        name: 'patrimony-inventory',
        component: () => import('@/views/patrimony/AssetsInventoryView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_patrimonio' },
      },
      {
        path: 'patrimonio/inventario/:id',
        name: 'patrimony-asset-details',
        component: () => import('@/views/patrimony/AssetDetailsView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_patrimonio' },
      },
      {
        path: 'patrimonio/locais',
        name: 'patrimony-locations',
        component: () => import('@/views/patrimony/AssetLocationsView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_patrimonio' },
      },
      {
        path: 'patrimonio/categorias',
        name: 'patrimony-categories',
        component: () => import('@/views/patrimony/AssetCategoriesView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_patrimonio' },
      },
      {
        path: 'website',
        name: 'website',
        component: () => import('@/views/WebsiteView.vue'),
        meta: { requiresAuth: true, permission: 'gerenciar_website' },
      },
      {
        path: 'organizacao/departamentos',
        name: 'organization-departments',
        component: () => import('@/views/organization/OrganizationDepartmentsView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_organizacao' },
      },
      {
        path: 'organizacao/departamentos/:id',
        name: 'organization-department-details',
        component: () => import('@/views/organization/OrganizationDepartmentDetailsView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_organizacao' },
      },
      {
        path: 'organizacao/cargos',
        name: 'organization-church-positions',
        component: () => import('@/views/organization/OrganizationChurchPositionsView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_organizacao' },
      },
      {
        path: 'organizacao/funcoes',
        name: 'organization-service-roles',
        component: () => import('@/views/organization/OrganizationServiceRolesView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_organizacao' },
      },
      {
        path: 'organizacao/cultos',
        name: 'organization-worship-templates',
        component: () => import('@/views/organization/OrganizationWorshipTemplatesView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_organizacao' },
      },
      {
        path: 'organizacao/grupos',
        name: 'organization-serving-groups',
        component: () => import('@/views/organization/OrganizationServingGroupsView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_organizacao' },
      },
      {
        path: 'organizacao/escalas',
        name: 'organization-worship-schedules',
        component: () => import('@/views/organization/OrganizationWorshipSchedulesView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_organizacao' },
      },
      {
        path: 'organizacao/escalas/:id',
        name: 'organization-worship-schedule-detail',
        component: () => import('@/views/organization/OrganizationWorshipScheduleDetailView.vue'),
        meta: { requiresAuth: true, permission: 'visualizar_organizacao' },
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
