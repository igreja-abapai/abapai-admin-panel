<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Pregadores</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Cadastre pregadores convidados para facilitar as escalas.
        </p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="btn btn-primary w-full sm:w-auto"
        @click="openCreateModal()"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Pregador
      </button>
    </div>

    <DataTable
      :card="true"
      :clickable="true"
      :search="searchTerm"
      search-placeholder="Buscar pregadores..."
      :total-count="filteredPreachers.length"
      :error="error || undefined"
      :data="filteredPreachers"
      :headers="headers"
      :is-loading="loading"
      min-width="720px"
      row-key="id"
      @update:search="searchTerm = $event"
      @row-click="goToPreacher"
    >
      <template #column-name="{ item }">
        <div class="flex items-center gap-3">
          <MemberAvatar
            :name="(item as Preacher).name"
            :photo-url="(item as Preacher).photoUrl"
            size="sm"
          />
          <span class="text-sm font-medium text-neutral-900">
            {{ (item as Preacher).name }}
          </span>
        </div>
      </template>
      <template #column-phone="{ item }">
        <span class="text-sm text-neutral-600">
          {{ (item as Preacher).phone ? formatPhoneNumber((item as Preacher).phone!) : '—' }}
        </span>
      </template>
      <template #column-isActive="{ item }">
        <span
          :class="[
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            (item as Preacher).isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-neutral-100 text-neutral-600',
          ]"
        >
          {{ (item as Preacher).isActive ? 'Ativo' : 'Inativo' }}
        </span>
      </template>
      <template #actions="{ item }">
        <RowActionMenu
          v-if="canManage"
          :actions="getPreacherActions(item as Preacher)"
          aria-label="Opções"
        />
      </template>
    </DataTable>

    <PreacherFormModal
      v-model="showModal"
      :preacher="editing"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import RowActionMenu, { type RowActionMenuItem } from '@/components/RowActionMenu.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import PreacherFormModal from '@/components/organization/PreacherFormModal.vue'
import { organizationService, type Preacher } from '@/services/organization'
import { useAuthStore } from '@/stores/auth'
import { confirmDelete } from '@/composables/useConfirm'
import { includesSearch } from '@/utils/searchText'
import { formatPhoneNumber } from '@/utils/phoneMask'

const authStore = useAuthStore()
const router = useRouter()
const canManage = computed(() => authStore.hasPermission('gerenciar_escalas'))

const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const preachers = ref<Preacher[]>([])
const showModal = ref(false)
const editing = ref<Preacher | null>(null)

const headers: TableHeader<Preacher>[] = [
  { key: 'name', label: 'Nome', align: 'left' },
  { key: 'phone', label: 'Telefone', align: 'left' },
  { key: 'isActive', label: 'Status', align: 'left' },
]

const filteredPreachers = computed(() => {
  if (!searchTerm.value.trim()) return preachers.value
  return preachers.value.filter(
    (preacher) =>
      includesSearch(preacher.name, searchTerm.value) ||
      includesSearch(preacher.phone || '', searchTerm.value),
  )
})

async function loadPreachers() {
  loading.value = true
  error.value = ''
  try {
    preachers.value = await organizationService.getPreachers()
  } catch {
    error.value = 'Erro ao carregar pregadores.'
  } finally {
    loading.value = false
  }
}

function openCreateModal(preacher?: Preacher) {
  editing.value = preacher ?? null
  showModal.value = true
}

function goToPreacher(preacher: Preacher) {
  router.push(`/organizacao/pregadores/${preacher.id}`)
}

function handleSaved() {
  loadPreachers()
}

function getPreacherActions(preacher: Preacher): RowActionMenuItem[] {
  return [
    {
      label: 'Editar',
      icon: PencilIcon,
      onClick: () => openCreateModal(preacher),
    },
    {
      label: 'Excluir',
      icon: TrashIcon,
      variant: 'danger',
      onClick: () => deletePreacher(preacher),
    },
  ]
}

async function deletePreacher(preacher: Preacher) {
  await confirmDelete({
    message: `Excluir o pregador "${preacher.name}"?`,
    onConfirm: async () => {
      try {
        await organizationService.deletePreacher(preacher.id)
        await loadPreachers()
      } catch (err: unknown) {
        error.value = err instanceof Error ? err.message : 'Erro ao excluir pregador.'
      }
    },
  })
}

onMounted(loadPreachers)
</script>
