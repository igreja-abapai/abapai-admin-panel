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
            <div
              v-if="item.photoUrl"
              class="w-10 h-10 rounded-full overflow-hidden shrink-0"
            >
              <img
                :src="item.photoUrl"
                :alt="`Foto de ${item.name}`"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              :class="[
                'w-10 h-10 text-white rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                getAvatarColor(item.name),
              ]"
            >
              {{ getInitials(item.name) }}
            </div>
            <div class="ml-3 min-w-0">
              <p class="font-medium text-neutral-900 truncate text-sm">{{ item.name }}</p>
              <p class="text-xs text-neutral-500 mt-0.5">
                {{ getMemberSinceLabel(item.admissionDate) || 'Membro' }}
              </p>
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
          <div class="flex justify-end" @click.stop>
            <button
              type="button"
              class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Opções do membro"
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
                searchTerm || appliedBaptismFilter
                  ? 'Nenhum membro encontrado com os filtros aplicados'
                  : 'Nenhum membro encontrado'
              }}
            </p>
          </div>
        </template>
    </DataTable>

    <Teleport to="body">
      <div
        v-if="filtersModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeFiltersModal"
      >
        <div
          class="bg-white rounded-2xl border border-neutral-200 shadow-lg w-full max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="filters-modal-title"
          @click.stop
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 id="filters-modal-title" class="text-lg font-semibold text-neutral-900">Filtros</h2>
            <button
              type="button"
              class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Fechar filtros"
              @click="closeFiltersModal"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="px-6 py-5">
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
          </div>

          <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-neutral-100">
            <button
              type="button"
              class="text-sm font-medium text-neutral-600 hover:text-neutral-900"
              @click="clearFilters"
            >
              Limpar filtros
            </button>
            <div class="flex items-center gap-3">
              <button type="button" class="btn btn-secondary" @click="closeFiltersModal">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" @click="applyFiltersModal">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="openRowMenuId && rowMenuStyle"
        class="member-row-menu fixed z-[10000] w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
        :style="rowMenuStyle"
        @click.stop
      >
        <router-link
          :to="`/membros/detalhes/${openRowMenuId}`"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          @click="closeRowMenu"
        >
          <EyeIcon class="w-4 h-4 text-neutral-500 shrink-0" />
          Ver detalhes
        </router-link>
        <router-link
          :to="`/membros/editar/${openRowMenuId}`"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          @click="closeRowMenu"
        >
          <PencilIcon class="w-4 h-4 text-neutral-500 shrink-0" />
          Editar membro
        </router-link>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  PlusIcon,
  UserGroupIcon,
  EllipsisVerticalIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/vue/24/outline'
import { membersService, type Member } from '@/services/members'
import { formatDate, getMemberSinceLabel } from '@/utils/dateFormat'
import { formatPhoneNumber } from '@/utils/phoneMask'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'

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
const openRowMenuId = ref<string | null>(null)
const rowMenuStyle = ref<{ top: string; left: string } | null>(null)
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

const avatarColors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-violet-500']

const ROW_MENU_WIDTH = 160
const ROW_MENU_HEIGHT = 88

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

function getInitials(name?: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string): string {
  const index =
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length
  return avatarColors[index]
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

function closeRowMenu() {
  openRowMenuId.value = null
  rowMenuStyle.value = null
}

function toggleRowMenu(memberId: string, event: MouseEvent) {
  if (openRowMenuId.value === memberId) {
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

  openRowMenuId.value = memberId
  rowMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
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
  if (!target.closest('[aria-label="Opções do membro"]') && !target.closest('.member-row-menu')) {
    closeRowMenu()
  }
}

function handleScroll() {
  if (openRowMenuId.value) {
    closeRowMenu()
  }
}

onMounted(() => {
  loadMembers()
  loadTabCounts()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>
