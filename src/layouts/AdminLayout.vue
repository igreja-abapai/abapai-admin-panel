<template>
  <div class="flex bg-[#f7f8f9] min-h-screen">
    <!-- Mobile menu button -->
    <button
      @click="toggleHamburger"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
    >
      <Bars3Icon class="w-6 h-6 text-neutral-600" />
    </button>

    <!-- Top Navigation Bar - Full Width -->
    <header class="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-neutral-200">
      <div
        class="flex items-center justify-between px-6 py-2"
        :class="{
          'lg:pl-64': sidebarOpen && !sidebarCollapsed,
          'lg:pl-20': sidebarOpen && sidebarCollapsed,
        }"
      >
        <!-- Left side - Hamburger menu -->
        <div class="flex items-center">
          <button
            @click="toggleHamburger"
            class="p-2 ml-5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Bars3Icon class="w-7 h-7" />
          </button>
        </div>

        <!-- Right side - User profile and notifications -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <button
            class="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <BellIcon class="w-[24px] h-[24px]" />
            <!-- <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> -->
          </button>

          <!-- User Profile Dropdown -->
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-3 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium"
                >
                  {{ authStore.userInitials }}
                </div>
                <div class="hidden md:block text-left">
                  <p class="text-sm font-medium text-neutral-900">
                    {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                  </p>
                  <p class="text-xs text-neutral-500">
                    {{ authStore.user?.email }}
                  </p>
                </div>
                <ChevronDownIcon class="w-4 h-4 text-neutral-500" />
              </div>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50"
            >
              <div class="px-4 py-2 border-b border-neutral-100">
                <p class="text-sm font-medium text-neutral-900">
                  {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
                </p>
                <p class="text-xs text-neutral-500">{{ authStore.user?.email }}</p>
                <p
                  v-if="authStore.userRole"
                  class="text-xs text-primary-600 font-medium capitalize"
                >
                  {{ authStore.userRole }}
                </p>
              </div>
              <button
                @click="showChangePasswordModal = true"
                class="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 11c0-1.104.896-2 2-2s2 .896 2 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2c0-1.104.896-2 2-2zm0 0V7m0 4v4"
                  />
                </svg>
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
        'fixed inset-y-0 left-0 z-40 bg-white shadow-lg transition-all duration-300 ease-in-out pt-20 flex flex-col overflow-visible px-3',
        !sidebarOpen ? 'w-0' : sidebarCollapsed ? 'w-20' : 'w-64',
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div
          class="flex items-center justify-center mb-12"
          v-if="sidebarOpen"
          :class="sidebarCollapsed ? 'w-14 h-14' : ''"
        >
          <router-link to="/home" class="flex items-center justify-center w-[80%] h-full">
            <img
              :src="logoSrc"
              :class="sidebarCollapsed ? 'w-12 h-12' : 'w-[85px] h-[85px]'"
              class="object-contain rounded-lg"
              alt="Abapai Logo"
            />
          </router-link>
        </div>
        <!-- Navigation Menu -->
        <div class="flex flex-col justify-between h-full pb-6">
          <ul class="space-y-2 px-0">
            <li class="flex">
              <router-link to="/home" class="w-full">
                <span
                  :class="[
                    'flex items-center px-4 py-2 rounded-xl transition-all duration-200',
                    $route.path === '/home'
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'hover:bg-neutral-100',
                    sidebarCollapsed ? 'justify-center' : 'justify-start',
                    'w-full',
                  ]"
                >
                  <span class="flex items-center justify-center w-10 h-10">
                    <HomeIcon class="w-5 h-5" />
                  </span>
                  <span v-show="!sidebarCollapsed" class="label">Home</span>
                </span>
              </router-link>
            </li>
            <li v-if="authStore.hasPermission('visualizar_membros')" class="flex">
              <router-link to="/membros" class="w-full">
                <span
                  :class="[
                    'flex items-center px-4 py-2 rounded-xl transition-all duration-200',
                    $route.path.startsWith('/membros')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'hover:bg-neutral-100',
                    sidebarCollapsed ? 'justify-center' : 'justify-start',
                    'w-full',
                  ]"
                >
                  <span class="flex items-center justify-center w-10 h-10">
                    <UserGroupIcon class="w-5 h-5" />
                  </span>
                  <span v-show="!sidebarCollapsed" class="label">Membros</span>
                </span>
              </router-link>
            </li>
            <li v-if="authStore.hasPermission('visualizar_pedidos_oracao')" class="flex">
              <router-link to="/pedidos-de-oracao" class="w-full">
                <span
                  :class="[
                    'flex items-center px-4 py-2 rounded-xl transition-all duration-200',
                    $route.path === '/pedidos-de-oracao'
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'hover:bg-neutral-100',
                    sidebarCollapsed ? 'justify-center' : 'justify-start',
                    'w-full',
                  ]"
                >
                  <span class="flex items-center justify-center w-10 h-10">
                    <HeartIcon class="w-5 h-5" />
                  </span>
                  <span v-show="!sidebarCollapsed" class="label">Oração</span>
                </span>
              </router-link>
            </li>
            <li v-if="authStore.hasPermission('visualizar_usuarios')" class="flex">
              <router-link to="/usuarios" class="w-full">
                <span
                  :class="[
                    'flex items-center px-4 py-2 rounded-xl transition-all duration-200',
                    $route.path.startsWith('/usuarios')
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'hover:bg-neutral-100',
                    sidebarCollapsed ? 'justify-center' : 'justify-start',
                    'w-full',
                  ]"
                >
                  <span class="flex items-center justify-center w-10 h-10">
                    <UsersIcon class="w-5 h-5" />
                  </span>
                  <span v-show="!sidebarCollapsed" class="label">Usuários do Sistema</span>
                </span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <div
      class="flex-1 flex flex-col pt-20"
      :class="{
        'lg:ml-64': sidebarOpen && !sidebarCollapsed,
        'lg:ml-20': sidebarOpen && sidebarCollapsed,
      }"
    >
      <!-- Main Content -->
      <main class="flex w-full justify-center flex-1">
        <div class="w-full max-w-7xl p-6">
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
    <div
      v-if="showChangePasswordModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h2 class="text-lg font-semibold mb-4">Alterar senha</h2>
        <form @submit.prevent="handleChangePassword">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Senha atual</label>
            <input
              v-model="changePasswordForm.currentPassword"
              type="password"
              required
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Nova senha</label>
            <input
              v-model="changePasswordForm.newPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="mb-4">
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
          <div v-if="changePasswordError" class="mb-2 text-red-600 text-sm">
            {{ changePasswordError }}
          </div>
          <div v-if="changePasswordSuccess" class="mb-2 text-green-600 text-sm">
            {{ changePasswordSuccess }}
          </div>
          <div class="flex justify-end gap-2 mt-4">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showChangePasswordModal = false"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="changingPassword || !isChangePasswordFormValid"
            >
              <span
                v-if="changingPassword"
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
              ></span>
              {{ changingPassword ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
        <button
          @click="showChangePasswordModal = false"
          class="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bars3Icon,
  HomeIcon,
  UserGroupIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
  BellIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth'
import abapaiLogo from '@/assets/images/abapai_logo.png'

const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(true) // Start with sidebar open
const sidebarCollapsed = ref(false)
const userMenuOpen = ref(false)

const isDesktop = ref(window.innerWidth >= 1024)
const logoSrc = abapaiLogo

onMounted(() => {
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

function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    userMenuOpen.value = false
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
