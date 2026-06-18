<template>
  <div class="flex bg-surface-page min-h-screen">
    <!-- Mobile menu button -->
    <button
      @click="toggleHamburger"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
    >
      <Bars3Icon class="w-6 h-6 text-neutral-600" />
    </button>

    <!-- Top Navigation Bar -->
    <header
      :class="[
        'fixed top-0 right-0 z-30 bg-white border-b border-neutral-200 h-16',
        sidebarOpen && !sidebarCollapsed
          ? 'lg:left-64'
          : sidebarOpen && sidebarCollapsed
            ? 'lg:left-20'
            : 'left-0',
      ]"
    >
      <div class="flex items-center gap-3 px-4 h-full">
        <button
          @click="toggleHamburger"
          class="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors shrink-0"
        >
          <Bars3Icon class="w-6 h-6" />
        </button>

        <div class="flex-1 max-w-sm hidden sm:block">
          <div class="relative">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Pesquisar"
              class="w-full pl-10 pr-3 py-2 bg-surface-page border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-colors"
            />
          </div>
        </div>

        <div class="flex items-center gap-2 ml-auto shrink-0">
          <!-- Notifications -->
          <div class="relative">
            <button
              class="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors"
              @click="toggleNotificationsDropdown"
            >
              <span class="relative inline-flex">
                <BellIcon class="w-[24px] h-[24px]" />
                <span
                  v-if="notificationsStore.unreadCount(authStore.user?.id || 0) > 0"
                  class="absolute -top-2 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] leading-none font-medium flex items-center justify-center rounded-full"
                  >{{ notificationsStore.unreadCount(authStore.user?.id || 0) }}</span
                >
              </span>
            </button>
            <!-- Notifications Dropdown -->
            <div
              v-if="notificationsDropdownOpen"
              class="absolute -right-8 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50"
              style="max-height: 400px; overflow-y: auto"
            >
              <div
                class="px-4 py-2 border-b border-neutral-100 font-semibold text-neutral-900 flex items-center justify-between gap-2"
              >
                <span>Notificações</span>
                <div class="flex items-center gap-2">
                  <button
                    v-if="notificationsStore.unreadCount(authStore.user?.id || 0) > 0"
                    class="text-xs font-medium text-primary-600 hover:text-primary-700 whitespace-nowrap"
                    @click="markAllNotificationsAsRead"
                  >
                    Marcar todas como lidas
                  </button>
                  <button
                    class="text-neutral-400 hover:text-neutral-700 shrink-0"
                    @click="notificationsDropdownOpen = false"
                  >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                </div>
              </div>
              <div v-if="notificationsStore.loading" class="p-4 space-y-2">
                <div v-for="i in 3" :key="i" class="animate-pulse flex flex-col gap-2">
                  <div class="h-4 w-2/3 bg-neutral-200 rounded"></div>
                  <div class="h-3 w-1/2 bg-neutral-100 rounded"></div>
                </div>
              </div>
              <div
                v-else-if="notificationsStore.notifications.length === 0"
                class="p-4 text-neutral-500"
              >
                Nenhuma notificação.
              </div>
              <ul v-else class="divide-y divide-neutral-100">
                <li
                  v-for="notification in notificationsStore.notifications"
                  :key="notification.id"
                  class="px-4 py-3 hover:bg-neutral-50 cursor-pointer flex flex-col"
                  :class="{
                    'bg-primary-50': !notification.readBy.some((u) => u.id === authStore.user?.id),
                  }"
                  @click="notificationsStore.markAsRead(notification.id)"
                >
                  <div class="font-medium text-neutral-900 mb-1">{{ notification.title }}</div>
                  <div class="text-neutral-700 text-sm mb-1" v-html="notification.message"></div>
                  <div class="text-xs text-neutral-400">
                    {{ new Date(notification.createdAt).toLocaleString('pt-BR') }}
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- User Profile Dropdown -->
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 bg-white border border-neutral-200 rounded-full hover:bg-neutral-50 transition-colors max-w-[280px]"
            >
              <div
                class="w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              >
                {{ authStore.userInitials }}
              </div>
              <div class="hidden md:block text-center min-w-0">
                <p class="text-sm font-semibold text-neutral-900 leading-tight truncate">
                  {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                </p>
                <p class="text-xs text-neutral-500 leading-tight truncate">
                  {{ authStore.user?.email }}
                </p>
              </div>
              <ChevronDownIcon class="hidden md:block w-4 h-4 text-neutral-400 shrink-0" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50"
            >
              <div class="px-4 py-2 border-b border-neutral-100">
                <p class="text-sm font-medium text-neutral-900">
                  {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                </p>
                <p
                  v-if="authStore.userRole"
                  class="text-xs text-primary-600 font-medium capitalize"
                >
                  {{ authStore.userRole }}
                </p>
              </div>
              <router-link
                to="/perfil"
                @click="userMenuOpen = false"
                class="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
              >
                <UserIcon class="w-4 h-4" />
                <span>Minha Conta</span>
              </router-link>
              <button
                @click="showChangePasswordModal = true"
                class="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
              >
                <KeyIcon class="w-4 h-4" />
                <span>Alterar senha</span>
              </button>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
              >
                <ArrowRightOnRectangleIcon class="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <nav
      :class="[
        'fixed inset-y-0 left-0 z-40 bg-white border-r border-neutral-200 transition-all duration-300 ease-in-out flex flex-col overflow-hidden',
        !sidebarOpen ? 'w-0' : sidebarCollapsed ? 'w-20' : 'w-64',
      ]"
    >
      <div
        v-if="sidebarOpen"
        class="h-16 shrink-0 flex items-center px-4 mt-4"
      >
        <router-link
          to="/home"
          :class="['flex items-center gap-3 min-w-0', sidebarCollapsed ? 'justify-center w-full' : '']"
        >
          <img
            :src="logoSrc"
            :class="sidebarCollapsed ? 'w-9 h-9' : 'w-12 h-12'"
            class="object-contain rounded-lg shrink-0"
            alt="Igreja Aba Pai"
          />
          <div v-show="!sidebarCollapsed" class="min-w-0">
            <p class="text-base font-semibold text-neutral-900 leading-tight truncate">
              Igreja Aba Pai
            </p>
            <p class="text-[10px] font-medium tracking-wider text-neutral-400 mt-0.5 truncate">
              PAINEL ADMINISTRATIVO
            </p>
          </div>
        </router-link>
      </div>

      <div class="sidebar-nav-scroll flex-1 overflow-y-auto px-3 py-4 mt-3">
        <ul class="space-y-1">
          <li>
            <router-link to="/home" class="block">
              <span :class="navItemClass($route.path === '/home')">
                <HomeIcon class="w-5 h-5 shrink-0" />
                <span v-show="!sidebarCollapsed">Home</span>
              </span>
            </router-link>
          </li>

          <li v-if="authStore.hasPermission('visualizar_membros')">
            <button
              type="button"
              @click="membrosDropdownOpen = !membrosDropdownOpen"
              :class="[
                navItemClass(isMembrosSectionActive()),
                'w-full',
                sidebarCollapsed ? 'justify-center' : '',
              ]"
            >
              <UserGroupIcon class="w-5 h-5 shrink-0" />
              <span v-show="!sidebarCollapsed" class="flex-1 text-left">Membros</span>
              <ChevronDownIcon
                v-show="!sidebarCollapsed"
                :class="[
                  'w-4 h-4 shrink-0 transition-transform',
                  isMembrosSectionActive() ? 'text-primary-600' : 'text-neutral-400',
                  membrosDropdownOpen ? 'rotate-180' : '',
                ]"
              />
            </button>
            <ul v-show="membrosDropdownOpen && !sidebarCollapsed" class="mt-1.5 space-y-1">
              <li>
                <router-link to="/membros" :class="subNavItemClass($route.path === '/membros')">
                  Cadastros
                </router-link>
              </li>
              <li>
                <router-link
                  to="/membros/aniversariantes"
                  :class="subNavItemClass($route.path === '/membros/aniversariantes')"
                >
                  Aniversariantes
                </router-link>
              </li>
            </ul>
          </li>

          <li v-if="authStore.hasPermission('visualizar_organizacao')">
            <button
              type="button"
              @click="organizacaoDropdownOpen = !organizacaoDropdownOpen"
              :class="[
                navItemClass(isOrganizacaoSectionActive()),
                'w-full',
                sidebarCollapsed ? 'justify-center' : '',
              ]"
            >
              <CalendarDaysIcon class="w-5 h-5 shrink-0" />
              <span v-show="!sidebarCollapsed" class="flex-1 text-left">Organização</span>
              <ChevronDownIcon
                v-show="!sidebarCollapsed"
                :class="[
                  'w-4 h-4 shrink-0 transition-transform',
                  isOrganizacaoSectionActive() ? 'text-primary-600' : 'text-neutral-400',
                  organizacaoDropdownOpen ? 'rotate-180' : '',
                ]"
              />
            </button>
            <ul v-show="organizacaoDropdownOpen && !sidebarCollapsed" class="mt-1.5 space-y-1">
              <li>
                <router-link
                  to="/organizacao/departamentos"
                  :class="subNavItemClass($route.path === '/organizacao/departamentos')"
                >
                  Departamentos
                </router-link>
              </li>
              <li>
                <router-link
                  to="/organizacao/cargos"
                  :class="subNavItemClass($route.path === '/organizacao/cargos')"
                >
                  Cargos
                </router-link>
              </li>
              <li>
                <router-link
                  to="/organizacao/funcoes"
                  :class="subNavItemClass($route.path === '/organizacao/funcoes')"
                >
                  Funções de Serviço
                </router-link>
              </li>
              <li>
                <router-link
                  to="/organizacao/cultos"
                  :class="subNavItemClass($route.path === '/organizacao/cultos')"
                >
                  Modelos de Culto
                </router-link>
              </li>
              <li>
                <router-link
                  to="/organizacao/escalas"
                  :class="subNavItemClass($route.path.startsWith('/organizacao/escalas'))"
                >
                  Escalas
                </router-link>
              </li>
              <li>
                <router-link
                  to="/organizacao/grupos"
                  :class="subNavItemClass($route.path === '/organizacao/grupos')"
                >
                  Grupos de Serviço
                </router-link>
              </li>
            </ul>
          </li>

          <li v-if="authStore.hasPermission('visualizar_analises')">
            <router-link to="/analises" class="block">
              <span :class="navItemClass($route.path === '/analises')">
                <ChartBarIcon class="w-5 h-5 shrink-0" />
                <span v-show="!sidebarCollapsed">Análises</span>
              </span>
            </router-link>
          </li>

          <li v-if="authStore.hasPermission('visualizar_pedidos_oracao')">
            <router-link to="/pedidos-de-oracao" class="block">
              <span :class="navItemClass($route.path === '/pedidos-de-oracao')">
                <PrayingIcon class="w-5 h-5 shrink-0" />
                <span v-show="!sidebarCollapsed">Oração</span>
              </span>
            </router-link>
          </li>

          <li v-if="authStore.hasPermission('gerenciar_website')">
            <router-link to="/website" class="block">
              <span :class="navItemClass($route.path.startsWith('/website'))">
                <GlobeAltIcon class="w-5 h-5 shrink-0" />
                <span v-show="!sidebarCollapsed">Website</span>
              </span>
            </router-link>
          </li>

          <li v-if="authStore.hasPermission('visualizar_usuarios')">
            <router-link to="/usuarios" class="block">
              <span :class="navItemClass($route.path.startsWith('/usuarios'))">
                <ShieldCheckIcon class="w-5 h-5 shrink-0" />
                <span v-show="!sidebarCollapsed">Usuários do Sistema</span>
              </span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Main Content Area -->
    <div
      class="flex-1 flex flex-col pt-16"
      :class="{
        'lg:ml-64': sidebarOpen && !sidebarCollapsed,
        'lg:ml-20': sidebarOpen && sidebarCollapsed,
      }"
    >
      <!-- Main Content -->
      <main class="flex w-full justify-center flex-1">
        <div class="w-full max-w-screen-2xl py-6 px-10">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen && !isDesktop"
      @click="closeSidebar"
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
    />

    <!-- Change Password Modal -->
    <BaseModal
      v-model="showChangePasswordModal"
      title="Alterar senha"
      max-width="md"
      form
      :error="changePasswordError"
      @submit="handleChangePassword"
    >
      <div>
        <label class="block text-sm font-medium mb-1">Senha atual</label>
        <input
          v-model="changePasswordForm.currentPassword"
          type="password"
          required
          class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Nova senha</label>
        <input
          v-model="changePasswordForm.newPassword"
          type="password"
          required
          minlength="6"
          class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Confirmar nova senha</label>
        <input
          v-model="changePasswordForm.confirmPassword"
          type="password"
          required
          minlength="6"
          class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p
          v-if="
            changePasswordForm.newPassword &&
            changePasswordForm.confirmPassword &&
            changePasswordForm.newPassword !== changePasswordForm.confirmPassword
          "
          class="text-xs text-red-500 mt-1"
        >
          As senhas não coincidem
        </p>
      </div>
      <p v-if="changePasswordSuccess" class="text-green-600 text-sm">
        {{ changePasswordSuccess }}
      </p>

      <template #footer-actions>
        <button
          type="button"
          class="btn btn-secondary"
          @click="showChangePasswordModal = false"
        >
          Cancelar
        </button>
        <ModalSubmitButton :loading="changingPassword" :disabled="!isChangePasswordFormValid">
          Salvar
        </ModalSubmitButton>
      </template>
    </BaseModal>

    <ConfirmModal />
  </div>
</template>

<script setup lang="ts">
import ConfirmModal from '@/components/ConfirmModal.vue'
import BaseModal from '@/components/BaseModal.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Bars3Icon,
  HomeIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ChevronDownIcon,
  KeyIcon,
  UserIcon,
  GlobeAltIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/outline'
import PrayingIcon from '@/components/icons/PrayingIcon.vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { authService } from '@/services/auth'
import abapaiLogo from '@/assets/images/abapai_logo.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const sidebarOpen = ref(true) // Start with sidebar open
const sidebarCollapsed = ref(false)
const userMenuOpen = ref(false)
const membrosDropdownOpen = ref(false)
const organizacaoDropdownOpen = ref(false)
const notificationsDropdownOpen = ref(false)

const isDesktop = ref(window.innerWidth >= 1024)
const logoSrc = abapaiLogo

function navItemClass(active: boolean) {
  return [
    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm w-full',
    active
      ? 'bg-primary-50 text-primary-600 font-semibold'
      : 'text-neutral-600 font-medium hover:bg-neutral-50 hover:text-neutral-800',
    sidebarCollapsed.value ? 'justify-center' : '',
  ]
}

function subNavItemClass(active: boolean) {
  return [
    'block ml-8 pl-3 pr-3 py-2.5 rounded-lg transition-colors text-sm',
    active
      ? 'bg-primary-50 text-primary-600 font-semibold'
      : 'text-neutral-600 font-medium hover:bg-neutral-50 hover:text-neutral-800',
  ]
}

function isMembrosSectionActive(): boolean {
  return route.path.startsWith('/membros')
}

function isOrganizacaoSectionActive(): boolean {
  return route.path.startsWith('/organizacao')
}

function syncSidebarDropdowns() {
  membrosDropdownOpen.value = route.path.startsWith('/membros')
  organizacaoDropdownOpen.value = route.path.startsWith('/organizacao')
}

watch(() => route.path, syncSidebarDropdowns)

// Fetch notifications on mount
onMounted(() => {
  syncSidebarDropdowns()
  notificationsStore.fetchNotifications()
  // Set initial sidebar state based on screen size
  sidebarOpen.value = window.innerWidth >= 1024
  sidebarCollapsed.value = false

  window.addEventListener('resize', () => {
    const wasDesktop = isDesktop.value
    isDesktop.value = window.innerWidth >= 1024

    // If switching from mobile to desktop, open sidebar
    if (!wasDesktop && isDesktop.value) {
      sidebarOpen.value = true
      sidebarCollapsed.value = false
    }
    // If switching from desktop to mobile, close sidebar
    else if (wasDesktop && !isDesktop.value) {
      sidebarOpen.value = false
      sidebarCollapsed.value = false
    }
  })

  // Close user menu when clicking outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function toggleHamburger() {
  if (isDesktop.value) {
    // On desktop, toggle collapsed state
    sidebarCollapsed.value = !sidebarCollapsed.value
    sidebarOpen.value = true
  } else {
    // On mobile, open/close sidebar
    sidebarOpen.value = !sidebarOpen.value
    sidebarCollapsed.value = false
  }
}

function closeSidebar() {
  sidebarOpen.value = false
  sidebarCollapsed.value = false
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function toggleNotificationsDropdown() {
  notificationsDropdownOpen.value = !notificationsDropdownOpen.value
  if (notificationsDropdownOpen.value) {
    notificationsStore.fetchNotifications()
  }
}

async function markAllNotificationsAsRead() {
  const userId = authStore.user?.id
  if (!userId) return
  await notificationsStore.markAllAsRead(userId)
}

function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    userMenuOpen.value = false
  }
  if (!target.closest('.relative')) {
    notificationsDropdownOpen.value = false
  }
}

async function handleLogout() {
  await authService.logout()
  router.push('/login')
}

const showChangePasswordModal = ref(false)
const changingPassword = ref(false)
const changePasswordError = ref('')
const changePasswordSuccess = ref('')
const changePasswordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const isChangePasswordFormValid = computed(() => {
  return (
    changePasswordForm.value.currentPassword.length >= 1 &&
    changePasswordForm.value.newPassword.length >= 6 &&
    changePasswordForm.value.newPassword === changePasswordForm.value.confirmPassword
  )
})
async function handleChangePassword() {
  if (!isChangePasswordFormValid.value) return
  changingPassword.value = true
  changePasswordError.value = ''
  changePasswordSuccess.value = ''
  try {
    await authService.changePassword(
      changePasswordForm.value.currentPassword,
      changePasswordForm.value.newPassword,
    )
    changePasswordSuccess.value = 'Senha alterada com sucesso!'
    changePasswordForm.value.currentPassword = ''
    changePasswordForm.value.newPassword = ''
    changePasswordForm.value.confirmPassword = ''
  } catch (err: any) {
    changePasswordError.value = err.response?.data?.message || 'Erro ao alterar senha'
  } finally {
    changingPassword.value = false
  }
}
</script>

<style scoped>
.sidebar-nav-scroll::-webkit-scrollbar {
  display: none;
}
</style>
