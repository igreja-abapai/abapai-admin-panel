<template>
  <div class="layout-container bg-[#f7f9fb] min-h-screen">
    <!-- Mobile menu button -->
    <button
      @click="toggleSidebar"
      class="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
    >
      <Bars3Icon class="w-6 h-6 text-neutral-600" />
    </button>

    <!-- Sidebar -->
    <nav
      :class="[
        'sidebar fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out',
        {
          'translate-x-0': sidebarOpen || isDesktop,
          '-translate-x-full': !sidebarOpen && !isDesktop,
        },
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-center mt-8 mb-12 mx-6 gap-3">
          <router-link to="/home">
            <div
              class="w-[70px] h-[70px] bg-primary-600 rounded-lg flex items-center justify-center"
            >
              <span class="text-white text-xl font-bold">A</span>
            </div>
          </router-link>
        </div>

        <!-- Navigation Menu -->
        <div class="flex flex-col justify-between h-full pb-6 space-y-10">
          <ul class="space-y-2">
            <li>
              <router-link
                to="/home"
                class="menu-item"
                :class="{ active: $route.path === '/home' }"
              >
                <HomeIcon class="w-5 h-5" />
                <span class="label">Home</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/membros"
                class="menu-item"
                :class="{ active: $route.path.startsWith('/membros') }"
              >
                <UserGroupIcon class="w-5 h-5" />
                <span class="label">Membros</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/pedidos-de-oracao"
                class="menu-item"
                :class="{ active: $route.path === '/pedidos-de-oracao' }"
              >
                <HeartIcon class="w-5 h-5" />
                <span class="label">Oração</span>
              </router-link>
            </li>
            <li>
              <button @click="handleLogout" class="menu-item w-full text-left">
                <ArrowRightOnRectangleIcon class="w-5 h-5" />
                <span class="label">Sair</span>
              </button>
            </li>
          </ul>

          <!-- User Profile -->
          <div class="px-6">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
              <div
                class="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium"
              >
                {{ authStore.userInitials }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-neutral-900 truncate">
                  {{ authStore.user?.givenName }} {{ authStore.user?.familyName }}
                </p>
                <p class="text-xs text-neutral-600 truncate">
                  {{ authStore.user?.email }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="content lg:ml-64">
      <main class="w-full max-w-6xl p-6">
        <router-view />
      </main>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen"
      @click="closeSidebar"
      class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Bars3Icon,
  HomeIcon,
  UserGroupIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/auth'

const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const isDesktop = ref(window.innerWidth >= 1024)

onMounted(() => {
  window.addEventListener('resize', () => {
    isDesktop.value = window.innerWidth >= 1024
  })
})

const pageTitle = computed(() => {
  const route = router.currentRoute.value
  const titles: Record<string, string> = {
    '/home': 'Home',
    '/membros': 'Membros',
    '/pedidos-de-oracao': 'Pedidos de Oração',
  }
  return titles[route.path] || 'Dashboard'
})

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

async function handleLogout() {
  await authService.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  display: flex;
}

.sidebar {
  transition: transform 0.3s ease-in-out;
}

.content {
  flex: 1;
  min-height: 100vh;
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    z-index: 40;
  }
}
</style>
