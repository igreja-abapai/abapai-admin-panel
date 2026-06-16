<template>
  <div class="w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Pedidos de Oração</h1>
        <p class="text-sm text-neutral-500 mt-1">Acompanhe e gerencie os pedidos recebidos.</p>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <router-link to="/pedidos-de-oracao/novo" class="btn btn-primary w-full sm:w-auto">
          <PlusIcon class="w-4 h-4 mr-2" />
          Novo pedido
        </router-link>
      </div>
    </div>

    <DataTable
      :card="true"
      :search="searchTerm"
      search-placeholder="Buscar pedido..."
      :total-count="filteredRequests.length"
      show-filters
      :active-filters-count="activeFiltersCount"
      :error="error || undefined"
      :data="paginatedRequests"
      :headers="tableHeaders"
      :is-loading="loading"
      :pagination="paginationInfo"
      :clickable="false"
      min-width="900px"
      row-key="id"
      @update:search="searchTerm = $event"
      @filters-click="openFiltersModal"
      @sort="handleSort"
      @page-change="handlePageChange"
    >
      <template #column-name="{ item }">
          <div class="min-w-0">
            <p class="font-medium text-neutral-900 truncate text-sm">{{ item.name }}</p>
            <p v-if="item.phone" class="text-xs text-neutral-500 mt-0.5 truncate">
              {{ formatPhoneNumber(item.phone) }}
            </p>
          </div>
        </template>

        <template #column-request="{ item }">
          <p class="text-sm text-neutral-700 line-clamp-2" :title="item.request">
            {{ item.request }}
          </p>
        </template>

        <template #column-area="{ item }">
          <span
            v-if="item.area"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
          >
            {{ item.area }}
          </span>
          <span v-else class="text-sm text-neutral-400">—</span>
        </template>

        <template #column-createdAt="{ item }">
          <span class="text-sm text-neutral-700">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template #actions="{ item }">
          <div class="flex justify-end" @click.stop>
            <button
              type="button"
              class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Opções do pedido"
              @click="toggleRowMenu(item.id, $event)"
            >
              <EllipsisVerticalIcon class="w-5 h-5" />
            </button>
          </div>
        </template>

        <template #empty>
          <div class="py-10 text-center">
            <PrayingIcon class="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p class="text-neutral-500">
              {{
                searchTerm || appliedAreaFilter
                  ? 'Nenhum pedido encontrado com os filtros aplicados'
                  : 'Nenhum pedido de oração encontrado'
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
            <label class="block text-sm font-medium text-neutral-700 mb-2">Área</label>
            <Select
              v-model="areaFilterDraft"
              :options="areaFilterOptions"
              placeholder="Todas as áreas"
            />
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
        class="prayer-row-menu fixed z-[10000] w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
        :style="rowMenuStyle"
        @click.stop
      >
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  PlusIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import PrayingIcon from '@/components/icons/PrayingIcon.vue'
import { prayerRequestsService, type PrayerRequest } from '@/services/prayer-requests'
import { formatPhoneNumber } from '@/utils/phoneMask'
import Select from '@/components/Select.vue'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import { confirmDelete } from '@/composables/useConfirm'

const AREA_OPTIONS = [
  'Família',
  'Trabalho',
  'Profissional',
  'Saúde',
  'Espiritual',
  'Financeiro',
  'Outro',
] as const

const loading = ref(false)
const requests = ref<PrayerRequest[]>([])
const searchTerm = ref('')
const areaFilterDraft = ref('')
const appliedAreaFilter = ref('')
const filtersModalOpen = ref(false)
const error = ref('')
const openRowMenuId = ref<string | null>(null)
const rowMenuStyle = ref<{ top: string; left: string } | null>(null)

const sortKey = ref<string>('createdAt')
const sortDirection = ref<'asc' | 'desc' | 'none'>('desc')

const currentPage = ref(1)
const itemsPerPage = 10

const ROW_MENU_WIDTH = 160
const ROW_MENU_HEIGHT = 44

const areaFilterOptions = [
  { value: '', label: 'Todas as áreas' },
  ...AREA_OPTIONS.map((area) => ({ value: area, label: area })),
]

const activeFiltersCount = computed(() => {
  let count = 0
  if (appliedAreaFilter.value) count++
  return count
})

const filteredRequests = computed(() => {
  let filtered = requests.value

  if (appliedAreaFilter.value) {
    filtered = filtered.filter((request) => request.area === appliedAreaFilter.value)
  }

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (request) =>
        request.name.toLowerCase().includes(search) ||
        request.request.toLowerCase().includes(search) ||
        (request.area && request.area.toLowerCase().includes(search)) ||
        (request.phone && request.phone.includes(search)),
    )
  }

  if (sortKey.value && sortDirection.value !== 'none') {
    filtered = [...filtered].sort((a, b) => {
      const direction = sortDirection.value === 'asc' ? 1 : -1

      if (sortKey.value === 'createdAt') {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction
        )
      }

      if (sortKey.value === 'name') {
        return a.name.localeCompare(b.name, 'pt-BR') * direction
      }

      if (sortKey.value === 'area') {
        return (a.area || '').localeCompare(b.area || '', 'pt-BR') * direction
      }

      return 0
    })
  }

  return filtered
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRequests.value.length / itemsPerPage)),
)

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRequests.value.slice(start, start + itemsPerPage)
})

const paginationInfo = computed(() => ({
  currentPage: currentPage.value,
  totalPages: totalPages.value,
  totalItems: filteredRequests.value.length,
  itemsPerPage,
}))

const tableHeaders = computed<TableHeader<PrayerRequest>[]>(() => [
  {
    key: 'name',
    label: 'Solicitante',
    sortable: true,
    sortKey: 'name',
    sortDirection: sortKey.value === 'name' ? sortDirection.value : 'none',
    width: 0.18,
    align: 'left',
  },
  {
    key: 'request',
    label: 'Pedido',
    sortable: false,
    width: 0.36,
    align: 'left',
  },
  {
    key: 'area',
    label: 'Área',
    sortable: true,
    sortKey: 'area',
    sortDirection: sortKey.value === 'area' ? sortDirection.value : 'none',
    width: 0.14,
    align: 'left',
  },
  {
    key: 'createdAt',
    label: 'Data',
    sortable: true,
    sortKey: 'createdAt',
    sortDirection: sortKey.value === 'createdAt' ? sortDirection.value : 'none',
    width: 0.14,
    align: 'left',
  },
])

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

function openFiltersModal() {
  areaFilterDraft.value = appliedAreaFilter.value
  filtersModalOpen.value = true
}

function closeFiltersModal() {
  filtersModalOpen.value = false
}

function applyFiltersModal() {
  appliedAreaFilter.value = areaFilterDraft.value
  currentPage.value = 1
  closeFiltersModal()
}

function clearFilters() {
  areaFilterDraft.value = ''
}

function closeRowMenu() {
  openRowMenuId.value = null
  rowMenuStyle.value = null
}

function toggleRowMenu(requestId: string, event: MouseEvent) {
  if (openRowMenuId.value === requestId) {
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

  openRowMenuId.value = requestId
  rowMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

async function handleDeleteFromMenu() {
  const request = requests.value.find((item) => item.id === openRowMenuId.value)
  closeRowMenu()
  if (request) {
    await deleteRequest(request)
  }
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
}

function handlePageChange(page: number) {
  currentPage.value = page
}

async function deleteRequest(request: PrayerRequest) {
  await confirmDelete({
    message: 'Tem certeza que deseja excluir este pedido de oração?',
    onConfirm: async () => {
      await prayerRequestsService.deletePrayerRequest(request.id)
      const index = requests.value.findIndex((r) => r.id === request.id)
      if (index > -1) {
        requests.value.splice(index, 1)
      }
    },
  })
}

async function loadPrayerRequests() {
  loading.value = true
  error.value = ''

  try {
    requests.value = await prayerRequestsService.getPrayerRequests()
  } catch (err: unknown) {
    console.error('Error loading prayer requests:', err)
    const apiError = err as { response?: { data?: { message?: string } } }
    error.value = apiError.response?.data?.message || 'Erro ao carregar pedidos de oração'
  } finally {
    loading.value = false
  }
}

watch([searchTerm, appliedAreaFilter], () => {
  currentPage.value = 1
})

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('[aria-label="Opções do pedido"]') && !target.closest('.prayer-row-menu')) {
    closeRowMenu()
  }
}

function handleScroll() {
  if (openRowMenuId.value) {
    closeRowMenu()
  }
}

onMounted(() => {
  loadPrayerRequests()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>
