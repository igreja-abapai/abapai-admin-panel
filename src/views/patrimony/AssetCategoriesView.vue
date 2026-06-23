<template>
  <div class="w-full">
    <div
      v-if="!embedded"
      class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
    >
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Categorias</h1>
        <p class="text-sm text-neutral-500 mt-1">Gerencie as categorias de bens patrimoniais.</p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="btn btn-primary w-full sm:w-auto"
        @click="openModal()"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Nova Categoria
      </button>
    </div>

    <DataTable
      :card="true"
      :search="searchTerm"
      search-placeholder="Buscar categorias..."
      :total-count="filteredCategories.length"
      :error="error || undefined"
      :data="filteredCategories"
      :headers="headers"
      :is-loading="loading"
      min-width="640px"
      row-key="id"
      @update:search="searchTerm = $event"
    >
      <template #column-name="{ item }">
        <span class="text-sm font-medium text-neutral-900">{{ (item as AssetCategory).name }}</span>
      </template>
      <template #column-isActive="{ item }">
        <span
          :class="[
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            (item as AssetCategory).isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-neutral-100 text-neutral-600',
          ]"
        >
          {{ (item as AssetCategory).isActive ? 'Ativo' : 'Inativo' }}
        </span>
      </template>
      <template #actions="{ item }">
        <RowActionMenu
          v-if="canManage"
          :actions="getCategoryActions(item as AssetCategory)"
          aria-label="Opções"
        />
      </template>
    </DataTable>

    <BaseModal
      v-model="showModal"
      :title="editing ? 'Editar Categoria' : 'Nova Categoria'"
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
import type { AssetCategory } from '@/types/assets'
import { useAuthStore } from '@/stores/auth'
import { confirmDelete } from '@/composables/useConfirm'
import { includesSearch } from '@/utils/searchText'

withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  {
    embedded: false,
  },
)

const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_patrimonio'))

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const searchTerm = ref('')
const categories = ref<AssetCategory[]>([])
const showModal = ref(false)
const editing = ref<AssetCategory | null>(null)
const form = ref({ name: '', isActive: true })

const headers: TableHeader<AssetCategory>[] = [
  { key: 'name', label: 'Nome', align: 'left' },
  { key: 'isActive', label: 'Status', align: 'left' },
]

const filteredCategories = computed(() => {
  if (!searchTerm.value.trim()) return categories.value
  return categories.value.filter((c) => includesSearch(c.name, searchTerm.value))
})

async function loadCategories() {
  loading.value = true
  error.value = ''
  try {
    categories.value = await assetsService.getCategories()
  } catch {
    error.value = 'Erro ao carregar categorias.'
  } finally {
    loading.value = false
  }
}

function openModal(category?: AssetCategory) {
  editing.value = category ?? null
  form.value = {
    name: category?.name ?? '',
    isActive: category?.isActive ?? true,
  }
  formError.value = ''
  showModal.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  try {
    if (editing.value) {
      await assetsService.updateCategory(editing.value.id, form.value)
    } else {
      await assetsService.createCategory(form.value)
    }
    showModal.value = false
    await loadCategories()
  } catch (err: unknown) {
    formError.value =
      err instanceof Error ? err.message : 'Erro ao salvar categoria.'
  } finally {
    saving.value = false
  }
}

async function handleDeleteCategory(category: AssetCategory) {
  const confirmed = await confirmDelete(`a categoria "${category.name}"`)
  if (!confirmed) return
  try {
    await assetsService.deleteCategory(category.id)
    await loadCategories()
  } catch {
    error.value = 'Não foi possível excluir a categoria.'
  }
}

function getCategoryActions(category: AssetCategory): RowActionMenuItem[] {
  return [
    { label: 'Editar', icon: PencilIcon, onClick: () => openModal(category) },
    {
      label: 'Excluir',
      icon: TrashIcon,
      variant: 'danger',
      onClick: () => handleDeleteCategory(category),
    },
  ]
}

onMounted(() => {
  loadCategories()
})

defineExpose({
  openCreate: () => openModal(),
})
</script>
