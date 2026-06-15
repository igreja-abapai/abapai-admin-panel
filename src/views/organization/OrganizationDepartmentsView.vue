<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Departamentos</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Gerencie departamentos, ministérios e vínculos de membros.
        </p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="btn btn-primary w-full sm:w-auto"
        @click="openDepartmentModal()"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo Departamento
      </button>
    </div>

    <DataTable
      :card="true"
      :clickable="true"
      :search="searchTerm"
      search-placeholder="Buscar departamentos..."
      :total-count="filteredDepartments.length"
      :error="error || undefined"
      :data="filteredDepartments"
      :headers="departmentHeaders"
      :is-loading="loading"
      min-width="800px"
      row-key="id"
      @update:search="searchTerm = $event"
      @row-click="goToDepartment"
    >
      <template #column-name="{ item }">
        <span class="text-sm font-medium text-neutral-900">{{ (item as Department).name }}</span>
      </template>
      <template #column-type="{ item }">
        <span class="text-sm text-neutral-700">{{ (item as Department).type }}</span>
      </template>
      <template #column-isActive="{ item }">
        <span
          :class="[
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            (item as Department).isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-neutral-100 text-neutral-600',
          ]"
        >
          {{ (item as Department).isActive ? 'Ativo' : 'Inativo' }}
        </span>
      </template>
      <template #actions="{ item }">
        <div class="flex justify-end" @click.stop>
          <button
            type="button"
            class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Opções do departamento"
            @click="toggleDepartmentRowMenu((item as Department).id, $event)"
          >
            <EllipsisVerticalIcon class="w-5 h-5" />
          </button>
        </div>
      </template>
    </DataTable>

    <Teleport to="body">
      <div
        v-if="openDepartmentRowMenuId && departmentRowMenuStyle"
        class="department-row-menu fixed z-[10000] w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
        :style="departmentRowMenuStyle"
        @click.stop
      >
        <button
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          @click="handleViewDepartmentFromMenu"
        >
          <EyeIcon class="w-4 h-4 text-neutral-500 shrink-0" />
          Ver detalhes
        </button>
        <button
          v-if="canManage"
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          @click="handleEditDepartmentFromMenu"
        >
          <PencilIcon class="w-4 h-4 text-neutral-500 shrink-0" />
          Editar
        </button>
        <button
          v-if="canManage"
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          @click="handleDeleteDepartmentFromMenu"
        >
          <TrashIcon class="w-4 h-4 shrink-0" />
          Excluir
        </button>
      </div>
    </Teleport>

    <!-- Department modal -->
    <div
      v-if="showDepartmentModal"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">
          {{ editingDepartment ? 'Editar Departamento' : 'Novo Departamento' }}
        </h2>
        <form class="space-y-4" @submit.prevent="saveDepartment">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
            <Input v-model="departmentForm.name" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
            <Select
              v-model="departmentForm.type"
              :options="departmentTypeOptions"
              placeholder="Selecione o tipo"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Departamento pai</label>
            <Select
              v-model="departmentForm.parentId"
              :options="parentDepartmentOptions"
              placeholder="Nenhum"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Descrição</label>
            <Input v-model="departmentForm.description" />
          </div>
          <label class="flex items-center gap-2 text-sm text-neutral-700">
            <input v-model="departmentForm.isActive" type="checkbox" class="rounded" />
            Ativo
          </label>
          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn btn-secondary" @click="closeDepartmentModal">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon, EyeIcon } from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import { organizationService, type Department } from '@/services/organization'
import { useAuthStore } from '@/stores/auth'
import { DepartmentType, enumToSelectOptions } from '@/constants/organization'

const router = useRouter()
const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_departamentos'))

const ROW_MENU_WIDTH = 160
const ROW_MENU_HEIGHT = 132

const openDepartmentRowMenuId = ref<number | null>(null)
const departmentRowMenuStyle = ref<{ top: string; left: string } | null>(null)

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const searchTerm = ref('')

const departments = ref<Department[]>([])

const showDepartmentModal = ref(false)
const editingDepartment = ref<Department | null>(null)

const departmentForm = ref({
  name: '',
  type: DepartmentType.DEPARTMENT as string,
  parentId: '',
  description: '',
  isActive: true,
})

const departmentTypeOptions = enumToSelectOptions(DepartmentType)

const departmentHeaders = computed<TableHeader<Department>[]>(() => [
  { key: 'name', label: 'NOME', width: 0.45, align: 'left' },
  { key: 'type', label: 'TIPO', width: 0.3, align: 'left' },
  { key: 'isActive', label: 'STATUS', width: 0.25, align: 'left' },
])

const filteredDepartments = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return departments.value
  return departments.value.filter(
    (d) =>
      d.name.toLowerCase().includes(term) ||
      d.type.toLowerCase().includes(term) ||
      d.parent?.name?.toLowerCase().includes(term),
  )
})

const parentDepartmentOptions = computed(() =>
  departments.value
    .filter((d) => !editingDepartment.value || d.id !== editingDepartment.value.id)
    .map((d) => ({ value: String(d.id), label: d.name })),
)

function goToDepartment(department: Department) {
  router.push(`/organizacao/departamentos/${department.id}`)
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    departments.value = await organizationService.getDepartments()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
}

function openDepartmentModal(department?: Department) {
  editingDepartment.value = department || null
  departmentForm.value = {
    name: department?.name || '',
    type: department?.type || DepartmentType.DEPARTMENT,
    parentId: department?.parentId ? String(department.parentId) : '',
    description: department?.description || '',
    isActive: department?.isActive ?? true,
  }
  formError.value = ''
  showDepartmentModal.value = true
}

function closeDepartmentModal() {
  showDepartmentModal.value = false
  editingDepartment.value = null
}

async function saveDepartment() {
  saving.value = true
  formError.value = ''
  try {
    const payload = {
      name: departmentForm.value.name,
      type: departmentForm.value.type,
      description: departmentForm.value.description || undefined,
      isActive: departmentForm.value.isActive,
      parentId: departmentForm.value.parentId ? Number(departmentForm.value.parentId) : undefined,
    }
    if (editingDepartment.value) {
      await organizationService.updateDepartment(editingDepartment.value.id, payload)
    } else {
      await organizationService.createDepartment(payload)
    }
    closeDepartmentModal()
    await loadData()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao salvar departamento'
  } finally {
    saving.value = false
  }
}

async function handleDeleteDepartment(department: Department) {
  if (!confirm(`Excluir "${department.name}"?`)) return
  try {
    await organizationService.deleteDepartment(department.id)
    await loadData()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao excluir departamento'
  }
}

function closeDepartmentRowMenu() {
  openDepartmentRowMenuId.value = null
  departmentRowMenuStyle.value = null
}

function toggleDepartmentRowMenu(departmentId: number, event: MouseEvent) {
  if (openDepartmentRowMenuId.value === departmentId) {
    closeDepartmentRowMenu()
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

  openDepartmentRowMenuId.value = departmentId
  departmentRowMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

function handleViewDepartmentFromMenu() {
  const department = departments.value.find((d) => d.id === openDepartmentRowMenuId.value)
  closeDepartmentRowMenu()
  if (department) {
    goToDepartment(department)
  }
}

function handleEditDepartmentFromMenu() {
  const department = departments.value.find((d) => d.id === openDepartmentRowMenuId.value)
  closeDepartmentRowMenu()
  if (department) {
    openDepartmentModal(department)
  }
}

async function handleDeleteDepartmentFromMenu() {
  const department = departments.value.find((d) => d.id === openDepartmentRowMenuId.value)
  closeDepartmentRowMenu()
  if (department) {
    await handleDeleteDepartment(department)
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (
    !target.closest('[aria-label="Opções do departamento"]') &&
    !target.closest('.department-row-menu')
  ) {
    closeDepartmentRowMenu()
  }
}

function handleScroll() {
  if (openDepartmentRowMenuId.value) {
    closeDepartmentRowMenu()
  }
}

onMounted(() => {
  loadData()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>
