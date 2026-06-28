<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">
          Obreiros e Voluntários
        </h1>
        <p class="text-sm text-neutral-500 mt-1">
          Membros com cargo principal definido na igreja.
        </p>
      </div>
    </div>

    <DataTable
      :card="true"
      :clickable="true"
      :search="searchTerm"
      search-placeholder="Buscar por nome ou cargo..."
      :total-count="totalWorkers"
      :error="error || undefined"
      :data="workers"
      :headers="headers"
      :is-loading="loading"
      :pagination="paginationInfo"
      min-width="800px"
      row-key="id"
      @update:search="searchTerm = $event"
      @page-change="handlePageChange"
      @row-click="goToMember"
    >
      <template #column-name="{ item }">
        <div class="flex items-center gap-3 min-w-0">
          <MemberAvatar
            :name="(item as Member).name"
            :photo-url="(item as Member).photoUrl"
            size="sm"
          />
          <span class="text-sm font-medium text-neutral-900 truncate">
            {{ (item as Member).name }}
          </span>
        </div>
      </template>

      <template #column-primaryPosition="{ item }">
        <span class="text-sm text-neutral-900">
          {{ (item as Member).primaryPosition?.name || '—' }}
        </span>
      </template>

      <template #column-secondaryPosition="{ item }">
        <span class="text-sm text-neutral-600">
          {{ (item as Member).secondaryPosition?.name || '—' }}
        </span>
      </template>

      <template #column-phone="{ item }">
        <span class="text-sm text-neutral-600">
          {{ (item as Member).phone ? formatPhoneNumber((item as Member).phone) : '—' }}
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import { membersService, type Member } from '@/services/members'
import { formatPhoneNumber } from '@/utils/phoneMask'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const workers = ref<Member[]>([])
const currentPage = ref(1)
const itemsPerPage = 10
const totalWorkers = ref(0)
const totalPages = ref(1)

const headers: TableHeader<Member>[] = [
  { key: 'name', label: 'Nome', align: 'left' },
  { key: 'primaryPosition', label: 'Cargo principal', align: 'left' },
  { key: 'secondaryPosition', label: 'Cargo secundário', align: 'left' },
  { key: 'phone', label: 'Telefone', align: 'left' },
]

const paginationInfo = computed(() => ({
  currentPage: currentPage.value,
  totalPages: totalPages.value || 1,
  totalItems: totalWorkers.value,
  itemsPerPage,
}))

async function loadWorkers() {
  loading.value = true
  error.value = ''
  try {
    const response = await membersService.getMembers({
      page: currentPage.value,
      limit: itemsPerPage,
      isActive: true,
      withPrimaryPosition: true,
      sortBy: 'name',
      sortOrder: 'ASC',
      search: searchTerm.value || undefined,
    })

    workers.value = response.data
    totalWorkers.value = response.total
    totalPages.value = response.totalPages
  } catch {
    error.value = 'Erro ao carregar obreiros e voluntários.'
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadWorkers()
}

function goToMember(member: Member) {
  router.push(`/membros/detalhes/${member.id}`)
}

watch(searchTerm, () => {
  currentPage.value = 1
  loadWorkers()
})

onMounted(loadWorkers)
</script>
