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
        <RowActionMenu
          :actions="getUserActions(item as User)"
          aria-label="Opções do usuário"
        />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import RowActionMenu, { type RowActionMenuItem } from '@/components/RowActionMenu.vue'
import { usersService, type User } from '@/services/users'
import { confirmDelete } from '@/composables/useConfirm'

const loading = ref(false)
const users = ref<User[]>([])
const searchTerm = ref('')
const error = ref('')

const tableHeaders = computed<TableHeader<User>[]>(() => [
  { key: 'name', label: 'Nome', width: 0.24, align: 'left' },
  { key: 'email', label: 'E-mail', width: 0.24, align: 'left' },
  { key: 'role', label: 'Cargo', width: 0.16, align: 'left' },
  { key: 'createdAt', label: 'Data de criação', width: 0.18, align: 'left' },
  { key: 'status', label: 'Status', width: 0.12, align: 'left' },
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

function getUserActions(user: User): RowActionMenuItem[] {
  return [
    { label: 'Editar', icon: PencilIcon, to: `/usuarios/editar/${user.id}` },
    {
      label: 'Excluir',
      icon: TrashIcon,
      variant: 'danger',
      onClick: () => deleteUser(user),
    },
  ]
}

async function deleteUser(user: User) {
  await confirmDelete({
    message: 'Tem certeza que deseja excluir este usuário?',
    onConfirm: async () => {
      await usersService.deleteUser(user.id)
      const index = users.value.findIndex((u) => u.id === user.id)
      if (index > -1) {
        users.value.splice(index, 1)
      }
    },
  })
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

onMounted(() => {
  loadUsers()
})
</script>
