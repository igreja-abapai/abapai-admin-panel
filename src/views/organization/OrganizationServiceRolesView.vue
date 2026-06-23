<template>
  <div class="w-full">
    <div
      v-if="!embedded"
      class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
    >
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Funções de Serviço</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Cadastre as funções disponíveis para escalas e serviços.
        </p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="btn btn-primary w-full sm:w-auto"
        @click="openRoleModal()"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Nova Função
      </button>
    </div>

    <DataTable
      :card="true"
      :search="searchTerm"
      search-placeholder="Buscar funções..."
      :total-count="filteredRoles.length"
      :error="error || undefined"
      :data="filteredRoles"
      :headers="roleHeaders"
      :is-loading="loading"
      min-width="800px"
      row-key="id"
      @update:search="searchTerm = $event"
    >
      <template #column-name="{ item }">
        <span class="text-sm font-medium text-neutral-900">{{ (item as ServiceRole).name }}</span>
      </template>
      <template #column-category="{ item }">
        <span class="text-sm text-neutral-700">{{ (item as ServiceRole).category }}</span>
      </template>
      <template #column-isActive="{ item }">
        <span
          :class="[
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            (item as ServiceRole).isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-neutral-100 text-neutral-600',
          ]"
        >
          {{ (item as ServiceRole).isActive ? 'Ativo' : 'Inativo' }}
        </span>
      </template>
      <template #actions="{ item }">
        <RowActionMenu
          v-if="canManage"
          :actions="getRoleActions(item as ServiceRole)"
          aria-label="Opções da função"
        />
      </template>
    </DataTable>

    <BaseModal
      v-model="showRoleModal"
      :title="editingRole ? 'Editar Função' : 'Nova Função'"
      form
      :error="formError"
      @submit="saveRole"
    >
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
        <Input v-model="roleForm.name" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Categoria</label>
        <Select
          v-model="roleForm.category"
          :options="categoryOptions"
          placeholder="Selecione a categoria"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Descrição</label>
        <Input v-model="roleForm.description" />
      </div>
      <Checkbox v-model="roleForm.isActive">Ativo</Checkbox>
      <Checkbox v-model="roleForm.allowsGuestAssignment">
        Permite atribuir convidado externo
      </Checkbox>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showRoleModal = false">
          Cancelar
        </button>
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
import Select from '@/components/Select.vue'
import BaseModal from '@/components/BaseModal.vue'
import Checkbox from '@/components/Checkbox.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import { organizationService, type ServiceRole } from '@/services/organization'
import { useAuthStore } from '@/stores/auth'
import { ServiceRoleCategory, enumToSelectOptions } from '@/constants/organization'
import { confirmDelete } from '@/composables/useConfirm'
import { includesSearchAny } from '@/utils/searchText'

withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  {
    embedded: false,
  },
)

const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_funcoes_servico'))

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const searchTerm = ref('')

const roles = ref<ServiceRole[]>([])
const showRoleModal = ref(false)
const editingRole = ref<ServiceRole | null>(null)

const roleForm = ref<{
  name: string
  category: string
  description: string
  isActive: boolean
  allowsGuestAssignment: boolean
}>({
  name: '',
  category: ServiceRoleCategory.SUPPORT_AND_CARE,
  description: '',
  isActive: true,
  allowsGuestAssignment: false,
})

const categoryOptions = enumToSelectOptions(ServiceRoleCategory)

const roleHeaders = computed<TableHeader<ServiceRole>[]>(() => [
  { key: 'name', label: 'Nome', width: 0.4, align: 'left' },
  { key: 'category', label: 'Categoria', width: 0.3, align: 'left' },
  { key: 'isActive', label: 'Status', width: 0.3, align: 'left' },
])

const filteredRoles = computed(() => {
  if (!searchTerm.value.trim()) return roles.value
  return roles.value.filter((r) =>
    includesSearchAny(searchTerm.value, r.name, r.category),
  )
})

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    roles.value = await organizationService.getServiceRoles()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
}

function openRoleModal(role?: ServiceRole) {
  editingRole.value = role || null
  roleForm.value = {
    name: role?.name || '',
    category: role?.category || ServiceRoleCategory.SUPPORT_AND_CARE,
    description: role?.description || '',
    isActive: role?.isActive ?? true,
    allowsGuestAssignment: role?.allowsGuestAssignment ?? false,
  }
  formError.value = ''
  showRoleModal.value = true
}

async function saveRole() {
  saving.value = true
  formError.value = ''
  try {
    const payload = { ...roleForm.value }
    if (editingRole.value) {
      await organizationService.updateServiceRole(editingRole.value.id, payload)
    } else {
      await organizationService.createServiceRole(payload)
    }
    showRoleModal.value = false
    await loadData()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao salvar função'
  } finally {
    saving.value = false
  }
}

async function handleDeleteRole(role: ServiceRole) {
  await confirmDelete({
    message: `Tem certeza que deseja excluir "${role.name}"?`,
    onConfirm: async () => {
      await organizationService.deleteServiceRole(role.id)
      await loadData()
    },
  })
}

function getRoleActions(role: ServiceRole): RowActionMenuItem[] {
  return [
    { label: 'Editar', icon: PencilIcon, onClick: () => openRoleModal(role) },
    {
      label: 'Excluir',
      icon: TrashIcon,
      variant: 'danger',
      onClick: () => handleDeleteRole(role),
    },
  ]
}

onMounted(() => {
  loadData()
})

defineExpose({
  openCreate: () => openRoleModal(),
})
</script>
