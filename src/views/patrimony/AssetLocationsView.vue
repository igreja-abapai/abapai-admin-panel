<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Locais</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Gerencie os locais físicos onde os bens ficam na igreja.
        </p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="btn btn-primary w-full sm:w-auto"
        @click="openModal()"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Local
      </button>
    </div>

    <DataTable
      :card="true"
      :search="searchTerm"
      search-placeholder="Buscar locais..."
      :total-count="filteredLocations.length"
      :error="error || undefined"
      :data="filteredLocations"
      :headers="headers"
      :is-loading="loading"
      min-width="640px"
      row-key="id"
      @update:search="searchTerm = $event"
    >
      <template #column-name="{ item }">
        <span class="text-sm font-medium text-neutral-900">{{ (item as AssetLocation).name }}</span>
      </template>
      <template #column-isActive="{ item }">
        <span
          :class="[
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            (item as AssetLocation).isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-neutral-100 text-neutral-600',
          ]"
        >
          {{ (item as AssetLocation).isActive ? 'Ativo' : 'Inativo' }}
        </span>
      </template>
      <template #actions="{ item }">
        <RowActionMenu
          v-if="canManage"
          :actions="getLocationActions(item as AssetLocation)"
          aria-label="Opções"
        />
      </template>
    </DataTable>

    <BaseModal
      v-model="showModal"
      :title="editing ? 'Editar Local' : 'Novo Local'"
      form
      :error="formError"
      @submit="save"
    >
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
        <Input v-model="form.name" required />
      </div>
      <Checkbox v-model="form.isActive">Ativo</Checkbox>
      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showModal = false">Cancelar</button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import RowActionMenu, { type RowActionMenuItem } from '@/components/RowActionMenu.vue'
import Input from '@/components/Input.vue'
import BaseModal from '@/components/BaseModal.vue'
import Checkbox from '@/components/Checkbox.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import { assetsService } from '@/services/assets'
import type { AssetLocation } from '@/types/assets'
import { useAuthStore } from '@/stores/auth'
import { confirmDelete } from '@/composables/useConfirm'
import { includesSearch } from '@/utils/searchText'

const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_patrimonio'))

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const searchTerm = ref('')
const locations = ref<AssetLocation[]>([])
const showModal = ref(false)
const editing = ref<AssetLocation | null>(null)
const form = ref({ name: '', isActive: true })

const headers: TableHeader<AssetLocation>[] = [
  { key: 'name', label: 'Nome', align: 'left' },
  { key: 'isActive', label: 'Status', align: 'left' },
]

const filteredLocations = computed(() => {
  if (!searchTerm.value.trim()) return locations.value
  return locations.value.filter((l) => includesSearch(l.name, searchTerm.value))
})

async function loadLocations() {
  loading.value = true
  error.value = ''
  try {
    locations.value = await assetsService.getLocations()
  } catch {
    error.value = 'Erro ao carregar locais.'
  } finally {
    loading.value = false
  }
}

function openModal(location?: AssetLocation) {
  editing.value = location ?? null
  form.value = {
    name: location?.name ?? '',
    isActive: location?.isActive ?? true,
  }
  formError.value = ''
  showModal.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  try {
    if (editing.value) {
      await assetsService.updateLocation(editing.value.id, form.value)
    } else {
      await assetsService.createLocation(form.value)
    }
    showModal.value = false
    await loadLocations()
  } catch (err: unknown) {
    formError.value = err instanceof Error ? err.message : 'Erro ao salvar local.'
  } finally {
    saving.value = false
  }
}

async function handleDeleteLocation(location: AssetLocation) {
  const confirmed = await confirmDelete(`o local "${location.name}"`)
  if (!confirmed) return
  try {
    await assetsService.deleteLocation(location.id)
    await loadLocations()
  } catch {
    error.value = 'Não foi possível excluir o local.'
  }
}

function getLocationActions(location: AssetLocation): RowActionMenuItem[] {
  return [
    { label: 'Editar', icon: PencilIcon, onClick: () => openModal(location) },
    {
      label: 'Excluir',
      icon: TrashIcon,
      variant: 'danger',
      onClick: () => handleDeleteLocation(location),
    },
  ]
}

onMounted(() => {
  loadLocations()
})
</script>
