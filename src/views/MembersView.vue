<template>
  <div class="w-full">
    <!-- Header -->
    <div class="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Membros</h1>
      <router-link to="/membros/cadastro" class="btn btn-primary w-full sm:w-auto">
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
        <div class="md:w-48">
          <CustomSelect
            v-model="baptismFilter"
            :options="[
              { value: 'true', label: 'Batizados' },
              { value: 'false', label: 'Não batizados' },
            ]"
            placeholder="Selecionar filtro"
          />
        </div>
      </div>
    </div>

    <!-- Members Table -->
    <div class="bg-white rounded-lg shadow w-full">
      <div class="px-6 py-4 border-b border-neutral-200">
        <h3 class="text-lg font-medium text-neutral-900">Membros ({{ filteredMembers.length }})</h3>
      </div>

      <div class="overflow-x-auto bg-white">
        <table class="w-full table-fixed bg-white" style="min-width: 800px">
          <thead class="bg-neutral-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                style="width: 25%"
              >
                NOME
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell"
                style="width: 15%"
              >
                DATA DE NASCIMENTO
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell"
                style="width: 15%"
              >
                BATISMO
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell"
                style="width: 15%"
              >
                ENDEREÇO
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell"
                style="width: 20%"
              >
                CONTATO
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                style="width: 10%"
              >
                AÇÃO
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-neutral-200">
            <tr v-if="error">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-neutral-500">
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {{ error }}
                </div>
              </td>
            </tr>

            <tr v-else-if="loading">
              <td colspan="6" class="px-6 py-4 text-center">
                <div
                  class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"
                ></div>
                <p class="mt-2 text-neutral-500">Carregando membros...</p>
              </td>
            </tr>

            <tr v-else-if="filteredMembers.length === 0">
              <td colspan="6" class="px-6 py-4 text-center">
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
              class="hover:bg-neutral-50 transition-colors cursor-pointer"
              @click="navigateToMemberDetails(member.id)"
            >
              <td class="px-6 py-4 overflow-hidden">
                <div class="flex items-center">
                  <div
                    v-if="member.photoUrl"
                    class="w-8 h-8 rounded-full overflow-hidden border-2 border-neutral-200 mr-3 flex-shrink-0"
                  >
                    <img
                      :src="member.photoUrl"
                      :alt="`Foto de ${member.name}`"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    v-else
                    class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0"
                  >
                    {{ getInitials(member.name) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium text-neutral-900 truncate">
                      {{ member.name }}
                    </div>
                    <div class="text-xs text-neutral-500 md:hidden">
                      {{ member.phone }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-neutral-900 hidden md:table-cell">
                {{ formatDate(member.birthdate) }}
              </td>
              <td class="px-6 py-4 text-sm text-neutral-900 hidden lg:table-cell">
                <span
                  v-if="member.isBaptized"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  Batizado
                </span>
                <span
                  v-else
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                  Não Batizado
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-neutral-900 hidden lg:table-cell overflow-hidden">
                <div
                  class="truncate"
                  :title="member.address?.streetName || 'Endereço não informado'"
                >
                  {{ member.address?.streetName || 'Endereço não informado' }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-neutral-900 hidden md:table-cell whitespace-nowrap">
                {{ member.phone }}
              </td>
              <td class="px-6 py-4 text-sm font-medium">
                <router-link
                  :to="`/membros/detalhes/${member.id}`"
                  class="text-primary-600 hover:text-primary-700"
                  @click.stop
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
import { useRouter } from 'vue-router'
import { PlusIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import { membersService, type Member } from '@/services/members'
import { formatDate } from '@/utils/dateFormat'
import CustomSelect from '@/components/CustomSelect.vue'

const router = useRouter()
const loading = ref(false)
const members = ref<Member[]>([])
const searchTerm = ref('')
const baptismFilter = ref('')
const error = ref('')

const filteredMembers = computed(() => {
  let filtered = members.value

  // Apply search filter
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (member) =>
        member.name.toLowerCase().includes(search) ||
        (member.email && member.email.toLowerCase().includes(search)) ||
        member.phone.toLowerCase().includes(search),
    )
  }

  // Apply baptism filter
  if (baptismFilter.value) {
    const isBaptized = baptismFilter.value === 'true'
    filtered = filtered.filter((member) => member.isBaptized === isBaptized)
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

function navigateToMemberDetails(memberId: string) {
  router.push(`/membros/detalhes/${memberId}`)
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
