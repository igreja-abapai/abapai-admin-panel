<template>
  <div class="w-full">
    <div class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Detalhes do Departamento</h1>
      <div class="flex gap-2">
        <router-link to="/organizacao/departamentos" class="btn btn-secondary">
          <ArrowLeftIcon class="w-4 h-4 mr-2" />
          Voltar
        </router-link>
        <button
          v-if="canManage && department"
          type="button"
          class="btn btn-primary"
          @click="openEditModal"
        >
          <PencilIcon class="w-4 h-4 mr-2" />
          Editar
        </button>
      </div>
    </div>

    <div v-if="loading" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <Spinner size="xl" class="text-primary-600 mx-auto mb-4" />
        <p class="text-neutral-500">Carregando detalhes do departamento...</p>
      </div>
    </div>

    <div v-else-if="error" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <p class="text-neutral-500">{{ error }}</p>
        <button type="button" class="btn btn-primary mt-4" @click="loadDepartment">
          Tentar Novamente
        </button>
      </div>
    </div>

    <template v-else-if="department">
      <div class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-semibold text-neutral-900">{{ department.name }}</h2>
        <div class="flex flex-wrap items-center gap-2 mt-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ department.type }}
          </span>
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              department.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-neutral-100 text-neutral-600',
            ]"
          >
            {{ department.isActive ? 'Ativo' : 'Inativo' }}
          </span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-base font-semibold text-neutral-900 mb-4">Informações</h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Nome</dt>
            <dd class="text-sm text-neutral-900 mt-1">{{ department.name }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Tipo</dt>
            <dd class="text-sm text-neutral-900 mt-1">{{ department.type }}</dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Departamento pai
            </dt>
            <dd class="text-sm text-neutral-900 mt-1">
              {{ department.parent?.name || '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</dt>
            <dd class="text-sm text-neutral-900 mt-1">
              {{ department.isActive ? 'Ativo' : 'Inativo' }}
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Funções de Serviço
            </dt>
            <dd class="mt-1.5">
              <div
                v-if="departmentRoleEligibilities.length"
                class="flex flex-wrap gap-1.5"
              >
                <div
                  v-for="elig in departmentRoleEligibilities"
                  :key="elig.id"
                  class="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-surface-page px-2.5 py-1.5"
                >
                  <span class="text-xs font-medium text-neutral-900">
                    {{ elig.serviceRole?.name || '—' }}
                  </span>
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold',
                      elig.isDefault
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-neutral-100 text-neutral-600',
                    ]"
                  >
                    <span
                      :class="[
                        'w-1 h-1 rounded-full',
                        elig.isDefault ? 'bg-amber-500' : 'bg-neutral-400',
                      ]"
                    />
                    {{ elig.isDefault ? 'Obrigatória' : 'Opcional' }}
                  </span>
                </div>
              </div>
              <span v-else class="text-sm text-neutral-900">—</span>
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">Descrição</dt>
            <dd class="text-sm text-neutral-900 mt-1">
              {{ department.description || '—' }}
            </dd>
          </div>
        </dl>
      </div>

      <DataTable
        :card="true"
        :search="memberSearchTerm"
        search-placeholder="Buscar membros..."
        :total-count="filteredMembers.length"
        total-label="Membros"
        :data="filteredMembers"
        :headers="memberHeaders"
        min-width="700px"
        row-key="id"
        @update:search="memberSearchTerm = $event"
      >
        <template #toolbar-actions>
          <button
            v-if="canManage"
            type="button"
            class="btn btn-primary shrink-0"
            @click="openMemberModal()"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Vincular Membro
          </button>
        </template>
        <template #column-member="{ item }">
          <span class="text-sm font-medium text-neutral-900">
            {{ (item as MemberDepartment).member?.name || '—' }}
          </span>
        </template>
        <template #column-role="{ item }">
          <span class="text-sm text-neutral-700">{{ (item as MemberDepartment).role }}</span>
        </template>
        <template #column-isActive="{ item }">
          <span
            :class="[
              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
              (item as MemberDepartment).isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-neutral-100 text-neutral-600',
            ]"
          >
            {{ (item as MemberDepartment).isActive ? 'Ativo' : 'Inativo' }}
          </span>
        </template>
        <template #actions="{ item }">
          <RowActionMenu
            v-if="canManage"
            :actions="getMemberLinkActions(item as MemberDepartment)"
            aria-label="Opções do vínculo"
          />
        </template>
        <template #empty>
          <div class="py-10 text-center">
            <p class="text-neutral-500">
              {{
                memberSearchTerm
                  ? 'Nenhum membro encontrado com os filtros aplicados'
                  : 'Nenhum membro vinculado a este departamento'
              }}
            </p>
          </div>
        </template>
      </DataTable>
      </div>
    </template>

    <!-- Edit department modal -->
    <BaseModal
      v-model="showEditModal"
      title="Editar Departamento"
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
        <button type="button" class="btn btn-secondary" @click="showEditModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>

    <!-- Add member modal -->
    <BaseModal
      v-model="showMemberModal"
      title="Vincular Membro"
      form
      :error="formError"
      @submit="saveMemberDepartment"
    >
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Membro</label>
        <Select
          v-model="memberForm.memberId"
          :options="memberOptions"
          placeholder="Selecione o membro"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Função no departamento</label>
        <Select
          v-model="memberForm.role"
          :options="memberDepartmentRoleOptions"
          placeholder="Selecione a função"
        />
      </div>
      <div
        v-if="suggestedPositionNames.length"
        class="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5"
      >
        <p class="text-xs font-medium text-blue-900 mb-1">Cargos sugeridos para este departamento</p>
        <p class="text-sm text-blue-800">{{ suggestedPositionNames.join(', ') }}</p>
      </div>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showMemberModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import RowActionMenu, { type RowActionMenuItem } from '@/components/RowActionMenu.vue'
import Spinner from '@/components/Spinner.vue'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import BaseModal from '@/components/BaseModal.vue'
import Checkbox from '@/components/Checkbox.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import {
  organizationService,
  type Department,
  type MemberDepartment,
  type DepartmentRoleEligibility,
  type DepartmentPositionEligibility,
  type ServiceRole,
  type ChurchPosition,
} from '@/services/organization'
import { membersService, type Member } from '@/services/members'
import { useAuthStore } from '@/stores/auth'
import { confirmRemove } from '@/composables/useConfirm'
import { includesSearchAny } from '@/utils/searchText'
import {
  DepartmentType,
  MemberDepartmentRole,
  enumToSelectOptions,
} from '@/constants/organization'

const route = useRoute()
const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_departamentos'))
const canManageRoles = computed(() => authStore.hasPermission('gerenciar_funcoes_servico'))
const canManagePositions = computed(() => authStore.hasPermission('gerenciar_cargos_igreja'))

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const memberSearchTerm = ref('')

const department = ref<Department | null>(null)
const allDepartments = ref<Department[]>([])
const serviceRoles = ref<ServiceRole[]>([])
const churchPositions = ref<ChurchPosition[]>([])
const members = ref<Member[]>([])

const showEditModal = ref(false)
const showMemberModal = ref(false)

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

const departmentForm = ref<{
  name: string
  type: string
  parentId: string
  description: string
  isActive: boolean
}>({
  name: '',
  type: DepartmentType.DEPARTMENT,
  parentId: '',
  description: '',
  isActive: true,
})

const memberForm = ref({
  memberId: '',
  role: MemberDepartmentRole.MEMBER,
})

const departmentTypeOptions = enumToSelectOptions(DepartmentType)
const memberDepartmentRoleOptions = enumToSelectOptions(MemberDepartmentRole)

const memberHeaders = computed<TableHeader<MemberDepartment>[]>(() => [
  { key: 'member', label: 'Membro', width: 0.45, align: 'left' },
  { key: 'role', label: 'Função', width: 0.3, align: 'left' },
  { key: 'isActive', label: 'Status', width: 0.25, align: 'left' },
])

const departmentMembers = computed(() => department.value?.memberDepartments || [])

const departmentRoleEligibilities = computed(() => department.value?.roleEligibilities || [])

const departmentPositionEligibilities = computed(
  () => department.value?.positionEligibilities || [],
)

const suggestedPositionNames = computed(() =>
  departmentPositionEligibilities.value
    .map((elig) => elig.churchPosition?.name || getChurchPositionName(elig.churchPositionId))
    .filter(Boolean),
)

const filteredMembers = computed(() => {
  if (!memberSearchTerm.value.trim()) return departmentMembers.value
  return departmentMembers.value.filter((link) =>
    includesSearchAny(memberSearchTerm.value, link.member?.name, link.role),
  )
})

const parentDepartmentOptions = computed(() =>
  allDepartments.value
    .filter((d) => d.id !== department.value?.id)
    .map((d) => ({ value: String(d.id), label: d.name })),
)

const memberOptions = computed(() =>
  members.value.map((m) => ({ value: String(m.id), label: m.name })),
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

async function loadDepartment() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    const [dept, depts, rolesRes, positionsRes, membersRes] = await Promise.all([
      organizationService.getDepartment(id),
      organizationService.getDepartments(),
      organizationService.getServiceRoles(),
      organizationService.getChurchPositions(),
      membersService.getMembers({ isPaginated: false, isActive: true }),
    ])
    department.value = dept
    allDepartments.value = depts
    serviceRoles.value = rolesRes
    churchPositions.value = positionsRes
    members.value = membersRes.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar departamento'
  } finally {
    loading.value = false
  }
}

function getServiceRoleName(serviceRoleId: number): string {
  return serviceRoles.value.find((role) => role.id === serviceRoleId)?.name || '—'
}

function getChurchPositionName(churchPositionId: number): string {
  return churchPositions.value.find((position) => position.id === churchPositionId)?.name || '—'
}

function openEditModal() {
  if (!department.value) return
  departmentForm.value = {
    name: department.value.name,
    type: department.value.type,
    parentId: department.value.parentId ? String(department.value.parentId) : '',
    description: department.value.description || '',
    isActive: department.value.isActive,
  }
  initialRoleEligibilities.value = [...departmentRoleEligibilities.value]
  linkedRoles.value = departmentRoleEligibilities.value.map((elig) => ({
    serviceRoleId: elig.serviceRoleId,
    isDefault: elig.isDefault,
  }))
  initialPositionEligibilities.value = [...departmentPositionEligibilities.value]
  linkedPositionIds.value = departmentPositionEligibilities.value.map(
    (elig) => elig.churchPositionId,
  )
  formError.value = ''
  showEditModal.value = true
}

async function syncDepartmentRoleEligibilities() {
  if (!canManageRoles.value || !department.value) return

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
        departmentId: department.value!.id,
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

async function syncDepartmentPositionEligibilities() {
  if (!canManagePositions.value || !department.value) return

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
        departmentId: department.value!.id,
        churchPositionId,
      }),
    ),
    ...eligibilitiesToRemove.map((elig) =>
      organizationService.deleteDepartmentPositionEligibility(elig.id),
    ),
  ])
}

async function saveDepartment() {
  if (!department.value) return
  saving.value = true
  formError.value = ''
  try {
    department.value = await organizationService.updateDepartment(department.value.id, {
      name: departmentForm.value.name,
      type: departmentForm.value.type,
      description: departmentForm.value.description || undefined,
      isActive: departmentForm.value.isActive,
      parentId: departmentForm.value.parentId
        ? Number(departmentForm.value.parentId)
        : undefined,
    })
    await syncDepartmentRoleEligibilities()
    await syncDepartmentPositionEligibilities()
    await loadDepartment()
    showEditModal.value = false
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao salvar departamento'
  } finally {
    saving.value = false
  }
}

function openMemberModal() {
  memberForm.value = {
    memberId: '',
    role: MemberDepartmentRole.MEMBER,
  }
  formError.value = ''
  showMemberModal.value = true
}

async function saveMemberDepartment() {
  if (!department.value) return
  saving.value = true
  formError.value = ''
  try {
    await organizationService.createMemberDepartment({
      memberId: Number(memberForm.value.memberId),
      departmentId: department.value.id,
      role: memberForm.value.role,
    })
    showMemberModal.value = false
    await loadDepartment()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao vincular membro'
  } finally {
    saving.value = false
  }
}

async function handleRemoveMember(link: MemberDepartment) {
  await confirmRemove({
    message: `Remover "${link.member?.name}" deste departamento?`,
    onConfirm: async () => {
      await organizationService.deleteMemberDepartment(link.id)
      await loadDepartment()
    },
  })
}

function getMemberLinkActions(link: MemberDepartment): RowActionMenuItem[] {
  return [
    {
      label: 'Remover',
      icon: TrashIcon,
      variant: 'danger',
      onClick: () => handleRemoveMember(link),
    },
  ]
}

onMounted(() => {
  loadDepartment()
})
</script>
