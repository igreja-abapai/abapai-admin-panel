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
        <h3 class="text-lg font-medium text-neutral-900">Membros ({{ totalMembers }})</h3>
      </div>

      <div v-if="error" class="px-6 py-4">
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>
      </div>

      <DataTable
        v-else
        :data="paginatedMembers"
        :headers="tableHeaders"
        :is-loading="loading"
        :pagination="paginationInfo"
        :clickable="true"
        min-width="800px"
        row-key="id"
        @row-click="handleRowClick"
        @sort="handleSort"
        @page-change="handlePageChange"
      >
        <!-- Custom Name Column -->
        <template #column-name="{ item }">
          <div class="flex items-center">
            <div
              v-if="item.photoUrl"
              class="w-8 h-8 rounded-full overflow-hidden border-2 border-neutral-200 mr-3 flex-shrink-0"
            >
              <img
                :src="item.photoUrl"
                :alt="`Foto de ${item.name}`"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0"
            >
              {{ getInitials(item.name) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-neutral-900 truncate">
                {{ item.name }}
              </div>
              <div class="text-xs text-neutral-500 md:hidden">
                {{ item.phone }}
              </div>
            </div>
          </div>
        </template>

        <!-- Custom Baptism Column -->
        <template #column-isBaptized="{ item }">
          <span
            v-if="item.isBaptized"
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
        </template>

        <!-- Custom Address Column -->
        <template #column-address="{ item }">
          <div
            class="truncate max-w-[200px]"
            :title="item.address?.streetName || 'Endereço não informado'"
          >
            {{ item.address?.streetName || 'Endereço não informado' }}
          </div>
        </template>

        <!-- Actions Column -->
        <template #actions="{ item }">
          <router-link
            :to="`/membros/detalhes/${item.id}`"
            class="text-primary-600 hover:text-primary-700 text-sm font-medium whitespace-nowrap"
            @click.stop
          >
            Ver Detalhes
          </router-link>
        </template>

        <!-- Empty State -->
        <template #empty>
          <div class="py-8 text-center">
            <UserGroupIcon class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p class="text-neutral-500">
              {{
                searchTerm
                  ? 'Nenhum membro encontrado com os filtros aplicados'
                  : 'Nenhum membro encontrado'
              }}
            </p>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import { membersService, type Member } from '@/services/members'
import { formatDate } from '@/utils/dateFormat'
import CustomSelect from '@/components/CustomSelect.vue'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'

const router = useRouter()
const loading = ref(false)
const members = ref<Member[]>([])
const searchTerm = ref('')
const baptismFilter = ref('')
const error = ref('')

// Sorting state - default to name ascending
const sortKey = ref<string>('name')
const sortDirection = ref<'asc' | 'desc' | 'none'>('asc')

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 10
const totalMembers = ref(0)
const totalPages = ref(1)

// Table headers
const tableHeaders = computed<TableHeader<Member>[]>(() => [
  {
    key: 'name',
    label: 'NOME',
    sortable: true,
    sortKey: 'name',
    sortDirection: sortKey.value === 'name' ? sortDirection.value : 'none',
    width: 0.25,
    align: 'left',
  },
  {
    key: 'birthdate',
    label: 'DATA DE NASCIMENTO',
    sortable: true,
    sortKey: 'birthdate',
    sortDirection: sortKey.value === 'birthdate' ? sortDirection.value : 'none',
    width: 0.15,
    formatter: (value) => formatDate(value),
  },
  {
    key: 'isBaptized',
    label: 'BATISMO',
    sortable: true,
    sortKey: 'isBaptized',
    sortDirection: sortKey.value === 'isBaptized' ? sortDirection.value : 'none',
    width: 0.15,
  },
  {
    key: 'address',
    label: 'ENDEREÇO',
    sortable: false,
    width: 0.15,
    align: 'left',
  },
  {
    key: 'phone',
    label: 'CONTATO',
    sortable: false,
    width: 0.2,
  },
])

const paginatedMembers = computed(() => members.value)

const paginationInfo = computed(() => {
  return {
    currentPage: currentPage.value,
    totalPages: totalPages.value || 1,
    totalItems: totalMembers.value,
    itemsPerPage,
  }
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

function handleRowClick(member: Member) {
  router.push(`/membros/detalhes/${member.id}`)
}

function handleSort(key: string) {
  if (sortKey.value === key) {
    // Cycle through: none -> asc -> desc -> none
    if (sortDirection.value === 'none') {
      sortDirection.value = 'asc'
    } else if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else {
      sortDirection.value = 'none'
      sortKey.value = ''
    }
  } else {
    sortKey.value = key
    sortDirection.value = 'asc'
  }
  // Reset to first page when sorting changes
  currentPage.value = 1
  loadMembers()
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadMembers()
}

async function loadMembers() {
  loading.value = true
  error.value = ''

  try {
    const params: any = {
      page: currentPage.value,
      limit: itemsPerPage,
    }

    // Add search filter
    if (searchTerm.value) {
      params.search = searchTerm.value
    }

    // Add baptism filter
    if (baptismFilter.value) {
      params.isBaptized = baptismFilter.value === 'true'
    }

    // Add sorting
    if (sortKey.value && sortDirection.value !== 'none') {
      params.sortBy = sortKey.value
      params.sortOrder = sortDirection.value.toUpperCase() as 'ASC' | 'DESC'
    }

    const response = await membersService.getMembers(params)
    members.value = response.data
    totalMembers.value = response.total
    totalPages.value = response.totalPages
  } catch (err: any) {
    console.error('Error loading members:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar membros'
  } finally {
    loading.value = false
  }
}

// Reset to first page when filters change and reload
watch([searchTerm, baptismFilter], () => {
  currentPage.value = 1
  loadMembers()
})

onMounted(() => {
  loadMembers()
})
</script>
