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
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 whitespace-nowrap"
          >
            {{ item.area }}
          </span>
          <span v-else class="text-sm text-neutral-400">—</span>
        </template>

        <template #column-createdAt="{ item }">
          <span class="text-sm text-neutral-700">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template #actions="{ item }">
          <RowActionMenu
            v-if="canDelete"
            :actions="getRequestActions(item as PrayerRequest)"
            aria-label="Opções do pedido"
          />
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

    <BaseModal
      v-model="filtersModalOpen"
      title="Filtros"
      max-width="md"
      @close="closeFiltersModal"
    >
      <label class="block text-sm font-medium text-neutral-700 mb-2">Área</label>
      <Select
        v-model="areaFilterDraft"
        :options="areaFilterOptions"
        placeholder="Todas as áreas"
      />

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
        <button type="button" class="btn btn-secondary" @click="closeFiltersModal">
          Cancelar
        </button>
        <button type="button" class="btn btn-primary" @click="applyFiltersModal">
          Aplicar
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import PrayingIcon from '@/components/icons/PrayingIcon.vue'
import { prayerRequestsService, type PrayerRequest } from '@/services/prayer-requests'
import { formatPhoneNumber } from '@/utils/phoneMask'
import Select from '@/components/Select.vue'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import RowActionMenu, { type RowActionMenuItem } from '@/components/RowActionMenu.vue'
import BaseModal from '@/components/BaseModal.vue'
import { confirmDelete } from '@/composables/useConfirm'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const canDelete = computed(() => authStore.hasPermission('excluir_pedidos_oracao'))

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

const sortKey = ref<string>('createdAt')
const sortDirection = ref<'asc' | 'desc' | 'none'>('desc')

const currentPage = ref(1)
const itemsPerPage = 10

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
    width: 0.33,
    align: 'left',
  },
  {
    key: 'area',
    label: 'Área',
    sortable: true,
    sortKey: 'area',
    sortDirection: sortKey.value === 'area' ? sortDirection.value : 'none',
    width: 0.17,
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

function getRequestActions(request: PrayerRequest): RowActionMenuItem[] {
  return [
    {
      label: 'Excluir',
      icon: TrashIcon,
      variant: 'danger',
      onClick: () => deleteRequest(request),
    },
  ]
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

onMounted(() => {
  loadPrayerRequests()
})
</script>
