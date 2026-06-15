<template>
  <div class="w-full">
    <div class="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Ex-membros</h1>
      <router-link to="/membros" class="btn btn-secondary w-full sm:w-auto">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Voltar para Membros
      </router-link>
    </div>

    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="relative">
        <MagnifyingGlassIcon
          class="absolute left-3 top-1/2 z-10 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none"
        />
        <Input
          v-model="searchTerm"
          type="text"
          placeholder="Pesquisar..."
          input-class="pl-10"
        />
      </div>
    </div>

    <div class="bg-white rounded-lg shadow w-full">
      <div class="px-6 py-4 border-b border-neutral-200">
        <h3 class="text-lg font-medium text-neutral-900">Ex-membros ({{ totalMembers }})</h3>
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
        :clickable="false"
        min-width="700px"
        row-key="id"
        @sort="handleSort"
        @page-change="handlePageChange"
      >
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
              class="w-8 h-8 bg-neutral-400 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 flex-shrink-0"
            >
              {{ getInitials(item.name) }}
            </div>
            <div class="text-sm font-medium text-neutral-900 truncate">{{ item.name }}</div>
          </div>
        </template>

        <template #actions="{ item }">
          <button
            type="button"
            class="link text-sm whitespace-nowrap disabled:opacity-50"
            :disabled="restoringId === item.id"
            @click="handleRestore(item)"
          >
            {{ restoringId === item.id ? 'Restaurando...' : 'Restaurar' }}
          </button>
        </template>

        <template #empty>
          <div class="py-8 text-center">
            <UserGroupIcon class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p class="text-neutral-500">
              {{
                searchTerm
                  ? 'Nenhum ex-membro encontrado com os filtros aplicados'
                  : 'Nenhum ex-membro encontrado'
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
import { ArrowLeftIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import { membersService, type Member } from '@/services/members'
import { formatDate } from '@/utils/dateFormat'
import Input from '@/components/Input.vue'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'

const loading = ref(false)
const members = ref<Member[]>([])
const searchTerm = ref('')
const error = ref('')
const restoringId = ref<string | null>(null)

const sortKey = ref<string>('name')
const sortDirection = ref<'asc' | 'desc' | 'none'>('asc')

const currentPage = ref(1)
const itemsPerPage = 10
const totalMembers = ref(0)
const totalPages = ref(1)

const tableHeaders = computed<TableHeader<Member>[]>(() => [
  {
    key: 'name',
    label: 'Nome',
    sortable: true,
    sortKey: 'name',
    sortDirection: sortKey.value === 'name' ? sortDirection.value : 'none',
    width: 0.35,
    align: 'left',
  },
  {
    key: 'birthdate',
    label: 'Data de nascimento',
    sortable: true,
    sortKey: 'birthdate',
    sortDirection: sortKey.value === 'birthdate' ? sortDirection.value : 'none',
    width: 0.2,
    formatter: (value) => formatDate(value),
  },
  {
    key: 'deletedAt',
    label: 'Data de exclusão',
    sortable: true,
    sortKey: 'deletedAt',
    sortDirection: sortKey.value === 'deletedAt' ? sortDirection.value : 'none',
    width: 0.2,
    formatter: (value) => formatDate(value),
  },
  {
    key: 'phone',
    label: 'Contato',
    sortable: false,
    width: 0.25,
  },
])

const paginatedMembers = computed(() => members.value)

const paginationInfo = computed(() => ({
  currentPage: currentPage.value,
  totalPages: totalPages.value || 1,
  totalItems: totalMembers.value,
  itemsPerPage,
}))

function getInitials(name?: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function handleSort(key: string) {
  if (sortKey.value === key) {
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
    const params: Record<string, unknown> = {
      page: currentPage.value,
      limit: itemsPerPage,
      deletedOnly: true,
    }

    if (searchTerm.value) {
      params.search = searchTerm.value
    }

    if (sortKey.value && sortDirection.value !== 'none') {
      params.sortBy = sortKey.value
      params.sortOrder = sortDirection.value.toUpperCase()
    }

    const response = await membersService.getMembers(params)
    members.value = response.data
    totalMembers.value = response.total
    totalPages.value = response.totalPages
  } catch (err: any) {
    console.error('Error loading former members:', err)
    error.value = err.response?.data?.message || 'Erro ao carregar ex-membros'
  } finally {
    loading.value = false
  }
}

async function handleRestore(member: Member) {
  restoringId.value = member.id
  error.value = ''

  try {
    await membersService.restoreMember(member.id)
    await loadMembers()
  } catch (err: any) {
    console.error('Error restoring member:', err)
    error.value = err.response?.data?.message || 'Erro ao restaurar membro'
  } finally {
    restoringId.value = null
  }
}

watch(searchTerm, () => {
  currentPage.value = 1
  loadMembers()
})

onMounted(() => {
  loadMembers()
})
</script>
