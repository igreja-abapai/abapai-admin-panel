<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Membros</h1>
      <router-link to="/membros/cadastro" class="btn btn-primary">
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Membro
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
              placeholder="Buscar membros..."
              class="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <select
            v-model="statusFilter"
            class="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Members List -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-neutral-200">
        <h3 class="text-lg font-medium text-neutral-900">Membros ({{ filteredMembers.length }})</h3>
      </div>

      <div class="p-6">
        <div v-if="loading" class="text-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"
          ></div>
          <p class="mt-2 text-neutral-500">Carregando membros...</p>
        </div>

        <div v-else-if="filteredMembers.length === 0" class="text-center py-8">
          <UserGroupIcon class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p class="text-neutral-500">
            {{
              searchTerm || statusFilter
                ? 'Nenhum membro encontrado com os filtros aplicados'
                : 'Nenhum membro encontrado'
            }}
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <div class="flex items-center">
              <div
                class="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium"
              >
                {{ getInitials(member.givenName, member.familyName) }}
              </div>
              <div class="ml-4">
                <p class="font-medium text-neutral-900">
                  {{ member.givenName }} {{ member.familyName }}
                </p>
                <p class="text-sm text-neutral-600">{{ member.email }}</p>
                <p class="text-xs text-neutral-500">{{ member.phone }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  member.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800',
                ]"
              >
                {{ member.status === 'active' ? 'Ativo' : 'Inativo' }}
              </span>

              <router-link
                :to="`/membros/detalhes/${member.id}`"
                class="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Ver detalhes
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/vue/24/outline'

interface Member {
  id: string
  givenName: string
  familyName: string
  email: string
  phone: string
  status: 'active' | 'inactive'
}

const loading = ref(false)
const members = ref<Member[]>([])
const searchTerm = ref('')
const statusFilter = ref('')

const filteredMembers = computed(() => {
  let filtered = members.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (member) =>
        member.givenName.toLowerCase().includes(search) ||
        member.familyName.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search),
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter((member) => member.status === statusFilter.value)
  }

  return filtered
})

function getInitials(givenName?: string, familyName?: string): string {
  return `${givenName?.[0] || ''}${familyName?.[0] || ''}`.toUpperCase()
}

onMounted(async () => {
  loading.value = true

  try {
    // TODO: Fetch real data from API
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    members.value = [
      {
        id: '1',
        givenName: 'João',
        familyName: 'Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-9999',
        status: 'active',
      },
      {
        id: '2',
        givenName: 'Maria',
        familyName: 'Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 88888-8888',
        status: 'active',
      },
      {
        id: '3',
        givenName: 'Pedro',
        familyName: 'Oliveira',
        email: 'pedro.oliveira@email.com',
        phone: '(11) 77777-7777',
        status: 'inactive',
      },
      {
        id: '4',
        givenName: 'Ana',
        familyName: 'Costa',
        email: 'ana.costa@email.com',
        phone: '(11) 66666-6666',
        status: 'active',
      },
    ]
  } catch (error) {
    console.error('Error loading members:', error)
  } finally {
    loading.value = false
  }
})
</script>
