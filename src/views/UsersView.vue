<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Usuários do Sistema</h1>
      <router-link to="/usuarios/novo" class="btn btn-primary">
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Usuário
      </router-link>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
            />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar usuários..."
              class="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-neutral-200">
        <h3 class="text-lg font-medium text-neutral-900">Usuários ({{ filteredUsers.length }})</h3>
      </div>

      <div class="overflow-x-auto">
        <div
          v-if="error"
          class="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {{ error }}
        </div>

        <div v-if="loading" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"
          ></div>
          <p class="mt-2 text-neutral-500">Carregando usuários...</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="text-center py-8">
          <UserGroupIcon class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p class="text-neutral-500">
            {{
              searchTerm
                ? 'Nenhum usuário encontrado com os filtros aplicados'
                : 'Nenhum usuário encontrado'
            }}
          </p>
        </div>

        <table v-else class="w-full">
          <thead class="bg-neutral-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Nome
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Cargo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Data de Criação
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-200">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-neutral-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div
                      class="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium"
                    >
                      {{ getUserInitials(user) }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-neutral-900">
                      {{ user.firstName }} {{ user.lastName }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-neutral-900">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="user.role" class="text-sm text-neutral-900">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize"
                  >
                    {{ user.role.name }}
                  </span>
                </div>
                <div v-else class="text-sm text-neutral-400">Sem cargo</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-neutral-500">{{ formatDate(user.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                >
                  Ativo
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <router-link
                    :to="`/usuarios/editar/${user.id}`"
                    class="text-primary-600 hover:text-primary-900 px-3 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    Editar
                  </router-link>
                  <button
                    @click="deleteUser(user)"
                    class="text-red-600 hover:text-red-900 px-3 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-800 hover:bg-red-200"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import { usersService, type User } from '@/services/users'

const loading = ref(false)
const users = ref<User[]>([])
const searchTerm = ref('')
const error = ref('')

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

async function deleteUser(user: User) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) {
    return
  }

  try {
    await usersService.deleteUser(user.id)
    // Remove from local list
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

onMounted(() => {
  loadUsers()
})
</script>
