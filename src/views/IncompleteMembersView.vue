<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">
          Membros com dados incompletos
        </h1>
        <p class="text-sm text-neutral-500 mt-1">
          Cadastros com campos importantes ainda não preenchidos.
        </p>
      </div>
      <router-link to="/membros" class="btn btn-secondary w-full sm:w-auto">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Voltar para Membros
      </router-link>
    </div>

    <DataTable
      :card="true"
      :clickable="true"
      :search="searchTerm"
      search-placeholder="Buscar membro..."
      :total-count="totalMembers"
      :error="error || undefined"
      :data="members"
      :headers="headers"
      :is-loading="loading"
      :pagination="paginationInfo"
      min-width="800px"
      row-key="id"
      @update:search="searchTerm = $event"
      @page-change="handlePageChange"
      @row-click="goToEditMember"
    >
      <template #column-name="{ item }">
        <div class="flex items-center gap-3 min-w-0">
          <MemberAvatar
            :name="(item as IncompleteMemberRow).name"
            :photo-url="(item as IncompleteMemberRow).photoUrl"
            size="sm"
          />
          <span class="text-sm font-medium text-neutral-900 truncate">
            {{ (item as IncompleteMemberRow).name }}
          </span>
        </div>
      </template>

      <template #column-missingFields="{ item }">
        <span class="text-sm text-neutral-600">
          {{ (item as IncompleteMemberRow).missingFieldsLabel }}
        </span>
      </template>

      <template #empty>
        <div class="py-10 text-center">
          <UserGroupIcon class="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p class="text-neutral-500">
            {{
              searchTerm
                ? 'Nenhum membro encontrado com os filtros aplicados'
                : 'Nenhum membro com dados incompletos'
            }}
          </p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon, UserGroupIcon } from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import { membersService, type Member } from '@/services/members'
import { formatMemberMissingFields } from '@/utils/memberIncompleteFields'

interface IncompleteMemberRow extends Member {
  missingFieldsLabel: string
}

const router = useRouter()

const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const members = ref<IncompleteMemberRow[]>([])
const currentPage = ref(1)
const itemsPerPage = 10
const totalMembers = ref(0)
const totalPages = ref(1)

const headers: TableHeader<IncompleteMemberRow>[] = [
  { key: 'name', label: 'Membro', align: 'left' },
  { key: 'missingFields', label: 'Dados faltando', align: 'left' },
]

const paginationInfo = computed(() => ({
  currentPage: currentPage.value,
  totalPages: totalPages.value || 1,
  totalItems: totalMembers.value,
  itemsPerPage,
}))

function mapMemberRow(member: Member): IncompleteMemberRow {
  return {
    ...member,
    missingFieldsLabel: formatMemberMissingFields(member),
  }
}

async function loadMembers() {
  loading.value = true
  error.value = ''
  try {
    const response = await membersService.getMembers({
      page: currentPage.value,
      limit: itemsPerPage,
      incompleteProfile: true,
      sortBy: 'name',
      sortOrder: 'ASC',
      search: searchTerm.value || undefined,
    })

    members.value = response.data.map(mapMemberRow)
    totalMembers.value = response.total
    totalPages.value = response.totalPages
  } catch {
    error.value = 'Erro ao carregar membros com dados incompletos.'
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadMembers()
}

function goToEditMember(member: IncompleteMemberRow) {
  router.push(`/membros/editar/${member.id}`)
}

watch(searchTerm, () => {
  currentPage.value = 1
  loadMembers()
})

onMounted(loadMembers)
</script>
