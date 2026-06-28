<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Membros</h1>
        <p class="text-sm text-neutral-500 mt-1">Gerencie os cadastros da sua comunidade.</p>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <router-link to="/membros/cadastro" class="btn btn-primary w-full sm:w-auto">
          <PlusIcon class="w-4 h-4 mr-2" />
          Novo membro
        </router-link>
      </div>
    </div>

    <DataTable
      :card="true"
      :search="searchTerm"
      search-placeholder="Buscar membro..."
      :tabs="tableTabs"
      :active-tab="statusTab"
      show-filters
      :active-filters-count="activeFiltersCount"
      :error="error || undefined"
      :data="paginatedMembers"
      :headers="tableHeaders"
      :is-loading="loading"
      :pagination="paginationInfo"
      :clickable="true"
      min-width="900px"
      row-key="id"
      @update:search="searchTerm = $event"
      @tab-change="setStatusTab"
      @filters-click="openFiltersModal"
      @row-click="handleRowClick"
      @sort="handleSort"
      @page-change="handlePageChange"
    >
      <template #toolbar-actions>
        <div ref="membersMenuRef" class="relative shrink-0">
          <button
            type="button"
            class="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Opções da lista"
            @click="toggleMembersMenu"
          >
            <EllipsisHorizontalIcon class="w-5 h-5" />
          </button>
          <div
            v-if="membersMenuOpen"
            class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20"
          >
            <router-link
              to="/membros/ex-membros"
              class="block w-full px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
              @click="membersMenuOpen = false"
            >
              Ver ex-membros
            </router-link>
          </div>
        </div>
      </template>

      <template #column-name="{ item }">
        <div class="flex items-center min-w-0">
          <MemberAvatar :name="item.name" :photo-url="item.photoUrl" size="md" />
          <div class="ml-3 min-w-0">
            <p class="font-medium text-neutral-900 truncate text-sm">{{ item.name }}</p>
          </div>
        </div>
      </template>

      <template #column-birthdate="{ item }">
        <span class="text-sm text-neutral-700">
          {{ formatBirthdate(item as Member) }}
        </span>
      </template>

      <template #column-isBaptized="{ item }">
        <span
          v-if="item.isBaptized"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
        >
          Batizado
        </span>
        <span
          v-else
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
        >
          Não Batizado
        </span>
      </template>

      <template #column-status="{ item }">
        <span
          v-if="item.isActive"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"
        >
          Ativo
        </span>
        <span
          v-else
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700"
        >
          Ausente
        </span>
      </template>

      <template #column-phone="{ item }">
        <span class="text-sm text-neutral-700">
          {{ item.phone ? formatPhoneNumber(item.phone) : '—' }}
        </span>
      </template>

      <template #actions="{ item }">
        <RowActionMenu :actions="getMemberActions(item as Member)" aria-label="Opções do membro" />
      </template>

      <template #empty>
        <div class="py-10 text-center">
          <UserGroupIcon class="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p class="text-neutral-500">
            {{
              searchTerm || appliedBaptismFilter
                ? 'Nenhum membro encontrado com os filtros aplicados'
                : 'Nenhum membro encontrado'
            }}
          </p>
        </div>
      </template>
    </DataTable>

    <BaseModal v-model="filtersModalOpen" title="Filtros" max-width="md" @close="closeFiltersModal">
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-2">Batismo</label>
        <Select
          v-model="baptismFilterDraft"
          :options="[
            { value: 'true', label: 'Batizados' },
            { value: 'false', label: 'Não batizados' },
          ]"
          placeholder="Todos"
        />
      </div>

      <template #footer-summary>
        <button
          type="button"
          class="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          @click="clearFilters"
        >
          Limpar filtros
        </button>
      </template>
      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="closeFiltersModal">Cancelar</button>
        <button type="button" class="btn btn-primary" @click="applyFiltersModal">Aplicar</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  PlusIcon,
  UserGroupIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/vue/24/outline'
import { membersService, type Member } from '@/services/members'
import { formatDate } from '@/utils/dateFormat'
import { formatPhoneNumber } from '@/utils/phoneMask'
import Select from '@/components/Select.vue'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import RowActionMenu, { type RowActionMenuItem } from '@/components/RowActionMenu.vue'
import BaseModal from '@/components/BaseModal.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'

type StatusTab = 'all' | 'active' | 'inactive'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const members = ref<Member[]>([])
const searchTerm = ref('')
const baptismFilterDraft = ref('')
const appliedBaptismFilter = ref('')
const statusTab = ref<StatusTab>('all')
const filtersModalOpen = ref(false)
const error = ref('')
const membersMenuOpen = ref(false)
const membersMenuRef = ref<HTMLElement | null>(null)

const activeFiltersCount = computed(() => {
  let count = 0
  if (appliedBaptismFilter.value) count++
  return count
})

const tabCounts = ref({
  all: 0,
  active: 0,
  inactive: 0,
})

const statusTabs: { key: StatusTab; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Ativos' },
  { key: 'inactive', label: 'Ausentes' },
]

const tableTabs = computed(() =>
  statusTabs.map((tab) => ({
    key: tab.key,
    label: tab.label,
    count: tabCounts.value[tab.key],
  })),
)

const sortKey = ref<string>('name')
const sortDirection = ref<'asc' | 'desc' | 'none'>('asc')

const currentPage = ref(1)
const itemsPerPage = 10
const totalMembers = ref(0)
const totalPages = ref(1)

const tableHeaders = computed<TableHeader<Member>[]>(() => [
  {
    key: 'name',
    label: 'Membro',
    sortable: true,
    sortKey: 'name',
    sortDirection: sortKey.value === 'name' ? sortDirection.value : 'none',
    width: 0.28,
    align: 'left',
  },
  {
    key: 'birthdate',
    label: 'Data de nascimento',
    sortable: true,
    sortKey: 'birthdate',
    sortDirection: sortKey.value === 'birthdate' ? sortDirection.value : 'none',
    width: 0.16,
    align: 'left',
  },
  {
    key: 'isBaptized',
    label: 'Batismo',
    sortable: true,
    sortKey: 'isBaptized',
    sortDirection: sortKey.value === 'isBaptized' ? sortDirection.value : 'none',
    width: 0.14,
    align: 'left',
  },
  {
    key: 'status',
    label: 'Situação',
    sortable: false,
    width: 0.14,
    align: 'left',
  },
  {
    key: 'phone',
    label: 'Contato',
    sortable: false,
    width: 0.18,
    align: 'left',
  },
])

const paginatedMembers = computed(() => members.value)

const paginationInfo = computed(() => ({
  currentPage: currentPage.value,
  totalPages: totalPages.value || 1,
  totalItems: totalMembers.value,
  itemsPerPage,
}))

function formatBirthdate(member: Member): string {
  return member.birthdate ? formatDate(member.birthdate) : '—'
}

function statusTabFromQuery(status: unknown): StatusTab {
  if (typeof status !== 'string') return 'all'
  const normalized = status.toLowerCase()
  if (normalized === 'ausente') return 'inactive'
  if (normalized === 'ativo') return 'active'
  return 'all'
}

function applyFiltersFromQuery() {
  statusTab.value = statusTabFromQuery(route.query.status)
}

function setStatusTab(tab: StatusTab | string) {
  statusTab.value = tab as StatusTab
  currentPage.value = 1

  const query = { ...route.query }
  if (tab === 'inactive') {
    query.status = 'Ausente'
  } else if (tab === 'active') {
    query.status = 'Ativo'
  } else {
    delete query.status
  }

  router.replace({ query })
}

function getMemberActions(member: Member): RowActionMenuItem[] {
  return [
    { label: 'Ver detalhes', icon: EyeIcon, to: `/membros/detalhes/${member.id}` },
    { label: 'Editar membro', icon: PencilIcon, to: `/membros/editar/${member.id}` },
  ]
}

function toggleMembersMenu() {
  membersMenuOpen.value = !membersMenuOpen.value
}

function openFiltersModal() {
  baptismFilterDraft.value = appliedBaptismFilter.value
  filtersModalOpen.value = true
}

function closeFiltersModal() {
  filtersModalOpen.value = false
}

function applyFiltersModal() {
  appliedBaptismFilter.value = baptismFilterDraft.value
  currentPage.value = 1
  closeFiltersModal()
  loadMembers()
}

function clearFilters() {
  baptismFilterDraft.value = ''
}

function handleRowClick(member: Member) {
  router.push(`/membros/detalhes/${member.id}`)
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

async function loadTabCounts() {
  try {
    const [allRes, activeRes, inactiveRes] = await Promise.all([
      membersService.getMembers({ page: 1, limit: 1 }),
      membersService.getMembers({ page: 1, limit: 1, isActive: true }),
      membersService.getMembers({ page: 1, limit: 1, isActive: false }),
    ])

    tabCounts.value = {
      all: allRes.total,
      active: activeRes.total,
      inactive: inactiveRes.total,
    }
  } catch (err) {
    console.error('Error loading member tab counts:', err)
  }
}

async function loadMembers() {
  loading.value = true
  error.value = ''

  try {
    const params: {
      page: number
      limit: number
      search?: string
      isBaptized?: boolean
      isActive?: boolean
      sortBy?: string
      sortOrder?: 'ASC' | 'DESC'
    } = {
      page: currentPage.value,
      limit: itemsPerPage,
    }

    if (searchTerm.value) {
      params.search = searchTerm.value
    }

    if (appliedBaptismFilter.value) {
      params.isBaptized = appliedBaptismFilter.value === 'true'
    }

    if (statusTab.value === 'active') {
      params.isActive = true
    } else if (statusTab.value === 'inactive') {
      params.isActive = false
    }

    if (sortKey.value && sortDirection.value !== 'none') {
      params.sortBy = sortKey.value
      params.sortOrder = sortDirection.value.toUpperCase() as 'ASC' | 'DESC'
    }

    const response = await membersService.getMembers(params)
    members.value = response.data
    totalMembers.value = response.total
    totalPages.value = response.totalPages
  } catch (err: unknown) {
    console.error('Error loading members:', err)
    const apiError = err as { response?: { data?: { message?: string } } }
    error.value = apiError.response?.data?.message || 'Erro ao carregar membros'
  } finally {
    loading.value = false
  }
}

applyFiltersFromQuery()

watch([searchTerm, appliedBaptismFilter, statusTab], () => {
  currentPage.value = 1
  loadMembers()
})

watch(
  () => route.query.status,
  () => {
    const nextTab = statusTabFromQuery(route.query.status)
    if (nextTab !== statusTab.value) {
      statusTab.value = nextTab
    }
  },
)

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (membersMenuRef.value && !membersMenuRef.value.contains(target)) {
    membersMenuOpen.value = false
  }
}

onMounted(() => {
  loadMembers()
  loadTabCounts()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
