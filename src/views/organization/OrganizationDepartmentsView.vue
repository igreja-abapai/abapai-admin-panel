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
      min-width="960px"
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
      <template #column-memberCount="{ item }">
        <span class="text-sm text-neutral-700 tabular-nums">
          {{ getMemberCount(item as Department) }}
        </span>
      </template>
      <template #column-hasLeader="{ item }">
        <span
          :class="[
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            departmentHasLeader(item as Department)
              ? 'bg-green-100 text-green-800'
              : 'bg-neutral-100 text-neutral-600',
          ]"
        >
          {{ departmentHasLeader(item as Department) ? 'Sim' : 'Não' }}
        </span>
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
    <BaseModal
      v-model="showDepartmentModal"
      :title="editingDepartment ? 'Editar Departamento' : 'Novo Departamento'"
      max-width="xl"
      form
      :error="formError"
      @submit="saveDepartment"
    >
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
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-2">Funções de Serviço</label>
        <MultiSelect
          v-model="linkedRoleIdsModel"
          :options="serviceRoleOptions"
          :disabled="!canManageRoles"
          placeholder="Selecione funções para adicionar"
          empty-options-text="Nenhuma função disponível"
        />
        <div v-if="linkedRoles.length" class="mt-3 space-y-2">
          <div
            v-for="linked in linkedRoles"
            :key="linked.serviceRoleId"
            class="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-surface-page px-3 py-2.5"
          >
            <span class="text-sm font-medium text-neutral-900">
              {{ getServiceRoleName(linked.serviceRoleId) }}
            </span>
            <label class="flex items-center gap-2 text-sm text-neutral-600 shrink-0">
              <input
                v-model="linked.isDefault"
                type="checkbox"
                class="rounded"
                :disabled="!canManageRoles"
              />
              Atribuir automaticamente
            </label>
          </div>
          <p class="text-xs text-neutral-500 leading-relaxed">
            Funções obrigatórias são atribuídas automaticamente aos membros do departamento.
            Funções opcionais apenas os tornam elegíveis para escalas.
          </p>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-2">Cargos Elegíveis</label>
        <MultiSelect
          v-model="linkedPositionIdsModel"
          :options="churchPositionOptions"
          :disabled="!canManagePositions"
          placeholder="Selecione cargos para sugerir ao vincular membros"
          empty-options-text="Nenhum cargo disponível"
        />
        <p class="mt-2 text-xs text-neutral-500 leading-relaxed">
          Cargos vinculados ao departamento são sugeridos ao vincular novos membros.
        </p>
      </div>
      <Checkbox v-model="departmentForm.isActive">Ativo</Checkbox>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="closeDepartmentModal">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon, EyeIcon } from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import BaseModal from '@/components/BaseModal.vue'
import Checkbox from '@/components/Checkbox.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import {
  organizationService,
  type Department,
  type DepartmentRoleEligibility,
  type DepartmentPositionEligibility,
  type ServiceRole,
  type ChurchPosition,
} from '@/services/organization'
import { useAuthStore } from '@/stores/auth'
import { DepartmentType, MemberDepartmentRole, enumToSelectOptions } from '@/constants/organization'
import { confirmDelete } from '@/composables/useConfirm'

const router = useRouter()
const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_departamentos'))
const canManageRoles = computed(() => authStore.hasPermission('gerenciar_funcoes_servico'))
const canManagePositions = computed(() => authStore.hasPermission('gerenciar_cargos_igreja'))

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
const serviceRoles = ref<ServiceRole[]>([])
const churchPositions = ref<ChurchPosition[]>([])

const showDepartmentModal = ref(false)
const editingDepartment = ref<Department | null>(null)
const linkedRoles = ref<{ serviceRoleId: number; isDefault: boolean }[]>([])
const initialRoleEligibilities = ref<DepartmentRoleEligibility[]>([])
const linkedPositionIds = ref<number[]>([])
const initialPositionEligibilities = ref<DepartmentPositionEligibility[]>([])

const linkedRoleIdsModel = computed({
  get: () => linkedRoles.value.map((role) => role.serviceRoleId),
  set: (roleIds: number[]) => {
    const currentIds = new Set(linkedRoles.value.map((role) => role.serviceRoleId))
    const nextIds = new Set(roleIds)

    linkedRoles.value = linkedRoles.value.filter((role) => nextIds.has(role.serviceRoleId))

    for (const serviceRoleId of roleIds) {
      if (!currentIds.has(serviceRoleId)) {
        linkedRoles.value.push({ serviceRoleId, isDefault: true })
      }
    }
  },
})

const linkedPositionIdsModel = computed({
  get: () => linkedPositionIds.value,
  set: (positionIds: number[]) => {
    linkedPositionIds.value = positionIds
  },
})

const departmentForm = ref({
  name: '',
  type: DepartmentType.DEPARTMENT as string,
  parentId: '',
  description: '',
  isActive: true,
})

const departmentTypeOptions = enumToSelectOptions(DepartmentType)

const departmentHeaders = computed<TableHeader<Department>[]>(() => [
  { key: 'name', label: 'Nome', width: 0.3, align: 'left' },
  { key: 'type', label: 'Tipo', width: 0.18, align: 'left' },
  { key: 'memberCount', label: 'Membros', width: 0.12, align: 'left' },
  { key: 'hasLeader', label: 'Possui líder', width: 0.16, align: 'left' },
  { key: 'isActive', label: 'Status', width: 0.14, align: 'left' },
])

function getActiveMemberLinks(department: Department) {
  return (department.memberDepartments || []).filter((link) => link.isActive)
}

function getMemberCount(department: Department): number {
  return getActiveMemberLinks(department).length
}

function departmentHasLeader(department: Department): boolean {
  return getActiveMemberLinks(department).some(
    (link) => link.role === MemberDepartmentRole.LEADER,
  )
}

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

const serviceRoleOptions = computed(() =>
  serviceRoles.value
    .filter((role) => role.isActive)
    .map((role) => ({ value: role.id, label: role.name })),
)

const churchPositionOptions = computed(() =>
  churchPositions.value
    .filter((position) => position.isActive)
    .map((position) => ({ value: position.id, label: position.name })),
)

function getServiceRoleName(serviceRoleId: number): string {
  return serviceRoles.value.find((role) => role.id === serviceRoleId)?.name || '—'
}

function goToDepartment(department: Department) {
  router.push(`/organizacao/departamentos/${department.id}`)
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [depts, rolesRes, positionsRes] = await Promise.all([
      organizationService.getDepartments(),
      organizationService.getServiceRoles(),
      organizationService.getChurchPositions(),
    ])
    departments.value = depts
    serviceRoles.value = rolesRes
    churchPositions.value = positionsRes
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
}

async function openDepartmentModal(department?: Department) {
  editingDepartment.value = department || null
  departmentForm.value = {
    name: department?.name || '',
    type: department?.type || DepartmentType.DEPARTMENT,
    parentId: department?.parentId ? String(department.parentId) : '',
    description: department?.description || '',
    isActive: department?.isActive ?? true,
  }
  formError.value = ''

  if (department) {
    const full = await organizationService.getDepartment(department.id)
    initialRoleEligibilities.value = [...(full.roleEligibilities || [])]
    linkedRoles.value = (full.roleEligibilities || []).map((elig) => ({
      serviceRoleId: elig.serviceRoleId,
      isDefault: elig.isDefault,
    }))
    initialPositionEligibilities.value = [...(full.positionEligibilities || [])]
    linkedPositionIds.value = (full.positionEligibilities || []).map(
      (elig) => elig.churchPositionId,
    )
  } else {
    initialRoleEligibilities.value = []
    linkedRoles.value = []
    initialPositionEligibilities.value = []
    linkedPositionIds.value = []
  }

  showDepartmentModal.value = true
}

async function syncDepartmentRoleEligibilities(departmentId: number) {
  if (!canManageRoles.value) return

  const initial = initialRoleEligibilities.value
  const current = linkedRoles.value

  const rolesToAdd = current.filter(
    (role) => !initial.some((elig) => elig.serviceRoleId === role.serviceRoleId),
  )
  const eligibilitiesToRemove = initial.filter(
    (elig) => !current.some((role) => role.serviceRoleId === elig.serviceRoleId),
  )
  const rolesToUpdate = current.filter((role) => {
    const existing = initial.find((elig) => elig.serviceRoleId === role.serviceRoleId)
    return existing && existing.isDefault !== role.isDefault
  })

  await Promise.all([
    ...rolesToAdd.map((role) =>
      organizationService.createDepartmentRoleEligibility({
        departmentId,
        serviceRoleId: role.serviceRoleId,
        isDefault: role.isDefault,
      }),
    ),
    ...rolesToUpdate.map((role) => {
      const existing = initial.find((elig) => elig.serviceRoleId === role.serviceRoleId)!
      return organizationService.updateDepartmentRoleEligibility(existing.id, {
        isDefault: role.isDefault,
      })
    }),
    ...eligibilitiesToRemove.map((elig) =>
      organizationService.deleteDepartmentRoleEligibility(elig.id),
    ),
  ])
}

async function syncDepartmentPositionEligibilities(departmentId: number) {
  if (!canManagePositions.value) return

  const initial = initialPositionEligibilities.value
  const currentIds = linkedPositionIds.value

  const positionsToAdd = currentIds.filter(
    (positionId) => !initial.some((elig) => elig.churchPositionId === positionId),
  )
  const eligibilitiesToRemove = initial.filter(
    (elig) => !currentIds.includes(elig.churchPositionId),
  )

  await Promise.all([
    ...positionsToAdd.map((churchPositionId) =>
      organizationService.createDepartmentPositionEligibility({
        departmentId,
        churchPositionId,
      }),
    ),
    ...eligibilitiesToRemove.map((elig) =>
      organizationService.deleteDepartmentPositionEligibility(elig.id),
    ),
  ])
}

function closeDepartmentModal() {
  showDepartmentModal.value = false
  editingDepartment.value = null
  linkedRoles.value = []
  initialRoleEligibilities.value = []
  linkedPositionIds.value = []
  initialPositionEligibilities.value = []
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
    let departmentId: number
    if (editingDepartment.value) {
      await organizationService.updateDepartment(editingDepartment.value.id, payload)
      departmentId = editingDepartment.value.id
    } else {
      const created = await organizationService.createDepartment(payload)
      departmentId = created.id
    }
    await syncDepartmentRoleEligibilities(departmentId)
    await syncDepartmentPositionEligibilities(departmentId)
    closeDepartmentModal()
    await loadData()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao salvar departamento'
  } finally {
    saving.value = false
  }
}

async function handleDeleteDepartment(department: Department) {
  await confirmDelete({
    message: `Tem certeza que deseja excluir "${department.name}"?`,
    onConfirm: async () => {
      await organizationService.deleteDepartment(department.id)
      await loadData()
    },
  })
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

async function handleEditDepartmentFromMenu() {
  const department = departments.value.find((d) => d.id === openDepartmentRowMenuId.value)
  closeDepartmentRowMenu()
  if (department) {
    await openDepartmentModal(department)
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
