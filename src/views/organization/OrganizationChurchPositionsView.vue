<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Cargos</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Cadastre os cargos oficiais da igreja atribuídos aos membros.
        </p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="btn btn-primary w-full sm:w-auto"
        @click="openPositionModal()"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Cargo
      </button>
    </div>

    <DataTable
      :card="true"
      :search="searchTerm"
      search-placeholder="Buscar cargos..."
      :total-count="filteredPositions.length"
      :error="error || undefined"
      :data="filteredPositions"
      :headers="positionHeaders"
      :is-loading="loading"
      min-width="800px"
      row-key="id"
      @update:search="searchTerm = $event"
    >
      <template #column-name="{ item }">
        <span class="text-sm font-medium text-neutral-900">{{ (item as ChurchPosition).name }}</span>
      </template>
      <template #column-category="{ item }">
        <span class="text-sm text-neutral-700">{{ (item as ChurchPosition).category }}</span>
      </template>
      <template #column-isActive="{ item }">
        <span
          :class="[
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            (item as ChurchPosition).isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-neutral-100 text-neutral-600',
          ]"
        >
          {{ (item as ChurchPosition).isActive ? 'Ativo' : 'Inativo' }}
        </span>
      </template>
      <template #actions="{ item }">
        <div v-if="canManage" class="flex justify-end" @click.stop>
          <button
            type="button"
            class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Opções do cargo"
            @click="togglePositionRowMenu((item as ChurchPosition).id, $event)"
          >
            <EllipsisVerticalIcon class="w-5 h-5" />
          </button>
        </div>
      </template>
    </DataTable>

    <Teleport to="body">
      <div
        v-if="openPositionRowMenuId && positionRowMenuStyle"
        class="position-row-menu fixed z-[10000] w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
        :style="positionRowMenuStyle"
        @click.stop
      >
        <button
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          @click="handleEditPositionFromMenu"
        >
          <PencilIcon class="w-4 h-4 text-neutral-500 shrink-0" />
          Editar
        </button>
        <button
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          @click="handleDeletePositionFromMenu"
        >
          <TrashIcon class="w-4 h-4 shrink-0" />
          Excluir
        </button>
      </div>
    </Teleport>

    <BaseModal
      v-model="showPositionModal"
      :title="editingPosition ? 'Editar Cargo' : 'Novo Cargo'"
      form
      :error="formError"
      @submit="savePosition"
    >
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
        <Input v-model="positionForm.name" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Categoria</label>
        <Select
          v-model="positionForm.category"
          :options="categoryOptions"
          placeholder="Selecione a categoria"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Descrição</label>
        <Input v-model="positionForm.description" />
      </div>
      <Checkbox v-model="positionForm.isActive">Ativo</Checkbox>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showPositionModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import BaseModal from '@/components/BaseModal.vue'
import Checkbox from '@/components/Checkbox.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import { organizationService, type ChurchPosition } from '@/services/organization'
import { useAuthStore } from '@/stores/auth'
import { ChurchPositionCategory, enumToSelectOptions } from '@/constants/organization'
import { confirmDelete } from '@/composables/useConfirm'

const ROW_MENU_WIDTH = 160
const ROW_MENU_HEIGHT = 88

const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_cargos_igreja'))

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const searchTerm = ref('')

const positions = ref<ChurchPosition[]>([])
const showPositionModal = ref(false)
const editingPosition = ref<ChurchPosition | null>(null)
const openPositionRowMenuId = ref<number | null>(null)
const positionRowMenuStyle = ref<{ top: string; left: string } | null>(null)

const positionForm = ref<{
  name: string
  category: string
  description: string
  isActive: boolean
}>({
  name: '',
  category: ChurchPositionCategory.MINISTERIAL,
  description: '',
  isActive: true,
})

const categoryOptions = enumToSelectOptions(ChurchPositionCategory)

const positionHeaders = computed<TableHeader<ChurchPosition>[]>(() => [
  { key: 'name', label: 'Nome', width: 0.4, align: 'left' },
  { key: 'category', label: 'Categoria', width: 0.3, align: 'left' },
  { key: 'isActive', label: 'Status', width: 0.3, align: 'left' },
])

const filteredPositions = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return positions.value
  return positions.value.filter(
    (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
  )
})

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    positions.value = await organizationService.getChurchPositions()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
}

function openPositionModal(position?: ChurchPosition) {
  editingPosition.value = position || null
  positionForm.value = {
    name: position?.name || '',
    category: position?.category || ChurchPositionCategory.MINISTERIAL,
    description: position?.description || '',
    isActive: position?.isActive ?? true,
  }
  formError.value = ''
  showPositionModal.value = true
}

async function savePosition() {
  saving.value = true
  formError.value = ''
  try {
    const payload = { ...positionForm.value }
    if (editingPosition.value) {
      await organizationService.updateChurchPosition(editingPosition.value.id, payload)
    } else {
      await organizationService.createChurchPosition(payload)
    }
    showPositionModal.value = false
    await loadData()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao salvar cargo'
  } finally {
    saving.value = false
  }
}

async function handleDeletePosition(position: ChurchPosition) {
  await confirmDelete({
    message: `Tem certeza que deseja excluir "${position.name}"?`,
    onConfirm: async () => {
      await organizationService.deleteChurchPosition(position.id)
      await loadData()
    },
  })
}

function closePositionRowMenu() {
  openPositionRowMenuId.value = null
  positionRowMenuStyle.value = null
}

function togglePositionRowMenu(positionId: number, event: MouseEvent) {
  if (openPositionRowMenuId.value === positionId) {
    closePositionRowMenu()
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

  openPositionRowMenuId.value = positionId
  positionRowMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

function handleEditPositionFromMenu() {
  const position = positions.value.find((p) => p.id === openPositionRowMenuId.value)
  closePositionRowMenu()
  if (position) {
    openPositionModal(position)
  }
}

function handleDeletePositionFromMenu() {
  const position = positions.value.find((p) => p.id === openPositionRowMenuId.value)
  closePositionRowMenu()
  if (position) {
    handleDeletePosition(position)
  }
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.position-row-menu')) {
    closePositionRowMenu()
  }
}

onMounted(() => {
  loadData()
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>
