<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Membros</h1>
      <router-link to="/membros/cadastro" class="btn btn-primary">
        <PlusIcon class="w-4 h-4 mr-2" />
        Cadastrar Membro
      </router-link>
    </div>

    <!-- Search -->
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
              placeholder="Pesquisar..."
              class="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Members Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-neutral-200">
        <h3 class="text-lg font-medium text-neutral-900">Membros ({{ filteredMembers.length }})</h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-neutral-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                NOME
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                DATA DE NASCIMENTO
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                ENDEREÇO
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                CONTATO
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
              >
                AÇÃO
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-200">
            <tr v-if="error">
              <td colspan="5" class="px-6 py-4">
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {{ error }}
                </div>
              </td>
            </tr>

            <tr v-else-if="loading">
              <td colspan="5" class="px-6 py-4 text-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"
                ></div>
                <p class="mt-2 text-neutral-500">Carregando membros...</p>
              </td>
            </tr>

            <tr v-else-if="filteredMembers.length === 0">
              <td colspan="5" class="px-6 py-4 text-center">
                <UserGroupIcon class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p class="text-neutral-500">
                  {{
                    searchTerm
                      ? 'Nenhum membro encontrado com os filtros aplicados'
                      : 'Nenhum membro encontrado'
                  }}
                </p>
              </td>
            </tr>

            <tr
              v-else
              v-for="member in filteredMembers"
              :key="member.id"
              class="hover:bg-neutral-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3"
                  >
                    {{ getInitials(member.name) }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-neutral-900">
                      {{ member.name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {{ formatDate(member.birthdate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {{ member.address?.streetName || 'Endereço não informado' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                {{ member.phone }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <router-link
                  :to="`/membros/detalhes/${member.id}`"
                  class="text-primary-600 hover:text-primary-700"
                >
                  Ver Detalhes
                </router-link>
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
import { membersService, type Member } from '@/services/members'

const loading = ref(false)
const members = ref<Member[]>([])
const searchTerm = ref('')
const error = ref('')

const filteredMembers = computed(() => {
  let filtered = members.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (member) =>
        member.name.toLowerCase().includes(search) ||
        (member.email && member.email.toLowerCase().includes(search)) ||
        member.phone.toLowerCase().includes(search),
    )
  }

  return filtered
})

function getInitials(name?: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Data não informada'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

async function loadMembers() {
  loading.value = true
  error.value = ''

  try {
    members.value = await membersService.getMembers()
  } catch (err: any) {
    console.error('Error loading members:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar membros'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadMembers()
})
</script>
