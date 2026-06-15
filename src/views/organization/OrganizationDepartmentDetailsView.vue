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
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
        ></div>
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
          <div>
            <dt class="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Funções de Serviço
            </dt>
            <dd class="mt-1">
              <div
                v-if="departmentRoleEligibilities.length"
                class="flex flex-wrap gap-2"
              >
                <span
                  v-for="elig in departmentRoleEligibilities"
                  :key="elig.id"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {{ elig.serviceRole?.name || '—' }}
                </span>
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
          <div v-if="canManage" class="flex justify-end" @click.stop>
            <button
              type="button"
              class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Opções do vínculo"
              @click="toggleMemberRowMenu((item as MemberDepartment).id, $event)"
            >
              <EllipsisVerticalIcon class="w-5 h-5" />
            </button>
          </div>
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

    <Teleport to="body">
      <div
        v-if="openMemberRowMenuId && memberRowMenuStyle"
        class="member-row-menu fixed z-[10000] w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
        :style="memberRowMenuStyle"
        @click.stop
      >
        <button
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          @click="handleRemoveMemberFromMenu"
        >
          <TrashIcon class="w-4 h-4 shrink-0" />
          Remover
        </button>
      </div>
    </Teleport>

    <!-- Edit department modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">Editar Departamento</h2>
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
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Funções de Serviço</label>
            <MultiSelect
              v-model="linkedRoleIds"
              :options="serviceRoleOptions"
              :disabled="!canManageRoles"
              placeholder="Selecione funções para adicionar"
              empty-options-text="Nenhuma função disponível"
            />
          </div>
          <label class="flex items-center gap-2 text-sm text-neutral-700">
            <input v-model="departmentForm.isActive" type="checkbox" class="rounded" />
            Ativo
          </label>
          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn btn-secondary" @click="showEditModal = false">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add member modal -->
    <div
      v-if="showMemberModal"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">Vincular Membro</h2>
        <form class="space-y-4" @submit.prevent="saveMemberDepartment">
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
          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn btn-secondary" @click="showMemberModal = false">
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
import { useRoute } from 'vue-router'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import MultiSelect from '@/components/MultiSelect.vue'
import {
  organizationService,
  type Department,
  type MemberDepartment,
  type DepartmentRoleEligibility,
  type ServiceRole,
} from '@/services/organization'
import { membersService, type Member } from '@/services/members'
import { useAuthStore } from '@/stores/auth'
import {
  DepartmentType,
  MemberDepartmentRole,
  enumToSelectOptions,
} from '@/constants/organization'

const ROW_MENU_WIDTH = 160
const ROW_MENU_HEIGHT = 44

const route = useRoute()
const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_departamentos'))
const canManageRoles = computed(() => authStore.hasPermission('gerenciar_funcoes_servico'))

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const memberSearchTerm = ref('')

const department = ref<Department | null>(null)
const allDepartments = ref<Department[]>([])
const serviceRoles = ref<ServiceRole[]>([])
const members = ref<Member[]>([])

const showEditModal = ref(false)
const showMemberModal = ref(false)
const openMemberRowMenuId = ref<number | null>(null)
const memberRowMenuStyle = ref<{ top: string; left: string } | null>(null)

const linkedRoleIds = ref<number[]>([])
const initialRoleEligibilities = ref<DepartmentRoleEligibility[]>([])

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
  { key: 'member', label: 'MEMBRO', width: 0.45, align: 'left' },
  { key: 'role', label: 'FUNÇÃO', width: 0.3, align: 'left' },
  { key: 'isActive', label: 'STATUS', width: 0.25, align: 'left' },
])

const departmentMembers = computed(() => department.value?.memberDepartments || [])

const departmentRoleEligibilities = computed(() => department.value?.roleEligibilities || [])

const filteredMembers = computed(() => {
  const term = memberSearchTerm.value.trim().toLowerCase()
  if (!term) return departmentMembers.value
  return departmentMembers.value.filter(
    (link) =>
      link.member?.name?.toLowerCase().includes(term) ||
      link.role.toLowerCase().includes(term),
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

async function loadDepartment() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    const [dept, depts, rolesRes, membersRes] = await Promise.all([
      organizationService.getDepartment(id),
      organizationService.getDepartments(),
      organizationService.getServiceRoles(),
      membersService.getMembers({ isPaginated: false, isActive: true }),
    ])
    department.value = dept
    allDepartments.value = depts
    serviceRoles.value = rolesRes
    members.value = membersRes.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar departamento'
  } finally {
    loading.value = false
  }
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
  linkedRoleIds.value = departmentRoleEligibilities.value.map((elig) => elig.serviceRoleId)
  formError.value = ''
  showEditModal.value = true
}

async function syncDepartmentRoleEligibilities() {
  if (!canManageRoles.value || !department.value) return

  const initialRoleIds = initialRoleEligibilities.value.map((elig) => elig.serviceRoleId)
  const rolesToAdd = linkedRoleIds.value.filter((roleId) => !initialRoleIds.includes(roleId))
  const eligibilitiesToRemove = initialRoleEligibilities.value.filter(
    (elig) => !linkedRoleIds.value.includes(elig.serviceRoleId),
  )

  await Promise.all([
    ...rolesToAdd.map((serviceRoleId) =>
      organizationService.createDepartmentRoleEligibility({
        departmentId: department.value!.id,
        serviceRoleId,
        isDefault: true,
      }),
    ),
    ...eligibilitiesToRemove.map((elig) =>
      organizationService.deleteDepartmentRoleEligibility(elig.id),
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
  if (!confirm(`Remover "${link.member?.name}" deste departamento?`)) return
  try {
    await organizationService.deleteMemberDepartment(link.id)
    await loadDepartment()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao remover vínculo'
  }
}

function closeMemberRowMenu() {
  openMemberRowMenuId.value = null
  memberRowMenuStyle.value = null
}

function toggleMemberRowMenu(linkId: number, event: MouseEvent) {
  if (openMemberRowMenuId.value === linkId) {
    closeMemberRowMenu()
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

  openMemberRowMenuId.value = linkId
  memberRowMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

async function handleRemoveMemberFromMenu() {
  const link = departmentMembers.value.find((item) => item.id === openMemberRowMenuId.value)
  closeMemberRowMenu()
  if (link) {
    await handleRemoveMember(link)
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (
    !target.closest('[aria-label="Opções do vínculo"]') &&
    !target.closest('.member-row-menu')
  ) {
    closeMemberRowMenu()
  }
}

function handleScroll() {
  if (openMemberRowMenuId.value) {
    closeMemberRowMenu()
  }
}

onMounted(() => {
  loadDepartment()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>
