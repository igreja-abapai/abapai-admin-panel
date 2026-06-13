<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Usuários do Sistema</h1>
        <p class="text-sm text-neutral-500 mt-1">Gerencie os acessos e permissões do sistema.</p>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <router-link to="/usuarios/novo" class="btn btn-primary w-full sm:w-auto">
          <PlusIcon class="w-4 h-4 mr-2" />
          Novo Usuário
        </router-link>
      </div>
    </div>

    <DataTable
      :card="true"
      :search="searchTerm"
      search-placeholder="Buscar usuários..."
      :total-count="filteredUsers.length"
      :error="error || undefined"
      :data="filteredUsers"
      :headers="tableHeaders"
      :is-loading="loading"
      min-width="900px"
      row-key="id"
      @update:search="searchTerm = $event"
    >
      <template #column-name="{ item }">
        <div class="flex items-center min-w-0">
          <div
            class="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium shrink-0"
          >
            {{ getUserInitials(item) }}
          </div>
          <div class="ml-3 min-w-0">
            <p class="font-medium text-neutral-900 truncate text-sm">
              {{ item.firstName }} {{ item.lastName }}
            </p>
          </div>
        </div>
      </template>

      <template #column-email="{ item }">
        <span class="text-sm text-neutral-900">{{ item.email }}</span>
      </template>

      <template #column-role="{ item }">
        <span
          v-if="item.role"
          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize"
        >
          {{ item.role.name }}
        </span>
        <span v-else class="text-sm text-neutral-400">Sem cargo</span>
      </template>

      <template #column-createdAt="{ item }">
        <span class="text-sm text-neutral-500">{{ formatDate(item.createdAt) }}</span>
      </template>

      <template #column-status>
        <span
          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
        >
          Ativo
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex justify-end" @click.stop>
          <button
            type="button"
            class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Opções do usuário"
            @click="toggleRowMenu(item.id, $event)"
          >
            <EllipsisVerticalIcon class="w-5 h-5" />
          </button>
        </div>
      </template>

      <template #empty>
        <div class="py-10 text-center">
          <UserGroupIcon class="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p class="text-neutral-500">
            {{
              searchTerm
                ? 'Nenhum usuário encontrado com os filtros aplicados'
                : 'Nenhum usuário encontrado'
            }}
          </p>
        </div>
      </template>
    </DataTable>

    <Teleport to="body">
      <div
        v-if="openRowMenuId && rowMenuStyle"
        class="user-row-menu fixed z-[10000] w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
        :style="rowMenuStyle"
        @click.stop
      >
        <router-link
          :to="`/usuarios/editar/${openRowMenuId}`"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          @click="closeRowMenu"
        >
          <PencilIcon class="w-4 h-4 text-neutral-500 shrink-0" />
          Editar
        </router-link>
        <button
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          @click="handleDeleteFromMenu"
        >
          <TrashIcon class="w-4 h-4 shrink-0" />
          Excluir
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  PlusIcon,
  UserGroupIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import { usersService, type User } from '@/services/users'

const ROW_MENU_WIDTH = 160
const ROW_MENU_HEIGHT = 88

const loading = ref(false)
const users = ref<User[]>([])
const searchTerm = ref('')
const error = ref('')
const openRowMenuId = ref<number | null>(null)
const rowMenuStyle = ref<{ top: string; left: string } | null>(null)

const tableHeaders = computed<TableHeader<User>[]>(() => [
  { key: 'name', label: 'NOME', width: 0.24, align: 'left' },
  { key: 'email', label: 'EMAIL', width: 0.24, align: 'left' },
  { key: 'role', label: 'CARGO', width: 0.16, align: 'left' },
  { key: 'createdAt', label: 'DATA DE CRIAÇÃO', width: 0.18, align: 'left' },
  { key: 'status', label: 'STATUS', width: 0.12, align: 'left' },
])

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (user) =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search),
    )
  }

  return filtered
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function getUserInitials(user: User): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

function closeRowMenu() {
  openRowMenuId.value = null
  rowMenuStyle.value = null
}

function toggleRowMenu(userId: number, event: MouseEvent) {
  if (openRowMenuId.value === userId) {
    closeRowMenu()
    return
  }

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  let top = rect.bottom + 4
  let left = rect.right - ROW_MENU_WIDTH

  if (top + ROW_MENU_HEIGHT > window.innerHeight - 8) {
    top = rect.top - ROW_MENU_HEIGHT - 4
  }

  if (left < 8) {
    left = 8
  }

  openRowMenuId.value = userId
  rowMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

async function handleDeleteFromMenu() {
  const user = users.value.find((item) => item.id === openRowMenuId.value)
  closeRowMenu()
  if (user) {
    await deleteUser(user)
  }
}

async function deleteUser(user: User) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) {
    return
  }

  try {
    await usersService.deleteUser(user.id)
    const index = users.value.findIndex((u) => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
  } catch (err: any) {
    console.error('Error deleting user:', err)
    error.value = 'Erro ao excluir usuário'
  }
}

async function loadUsers() {
  loading.value = true
  error.value = ''

  try {
    users.value = await usersService.getUsers()
  } catch (err: any) {
    console.error('Error loading users:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar usuários'
  } finally {
    loading.value = false
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('[aria-label="Opções do usuário"]') && !target.closest('.user-row-menu')) {
    closeRowMenu()
  }
}

function handleScroll() {
  if (openRowMenuId.value) {
    closeRowMenu()
  }
}

onMounted(() => {
  loadUsers()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>
