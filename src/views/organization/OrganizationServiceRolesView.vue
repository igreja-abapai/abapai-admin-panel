<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
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
        <div v-if="canManage" class="flex justify-end" @click.stop>
          <button
            type="button"
            class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Opções da função"
            @click="toggleRoleRowMenu((item as ServiceRole).id, $event)"
          >
            <EllipsisVerticalIcon class="w-5 h-5" />
          </button>
        </div>
      </template>
    </DataTable>

    <Teleport to="body">
      <div
        v-if="openRoleRowMenuId && roleRowMenuStyle"
        class="role-row-menu fixed z-[10000] w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
        :style="roleRowMenuStyle"
        @click.stop
      >
        <button
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          @click="handleEditRoleFromMenu"
        >
          <PencilIcon class="w-4 h-4 text-neutral-500 shrink-0" />
          Editar
        </button>
        <button
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          @click="handleDeleteRoleFromMenu"
        >
          <TrashIcon class="w-4 h-4 shrink-0" />
          Excluir
        </button>
      </div>
    </Teleport>

    <div
      v-if="showRoleModal"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">
          {{ editingRole ? 'Editar Função' : 'Nova Função' }}
        </h2>
        <form class="space-y-4" @submit.prevent="saveRole">
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
          <label class="flex items-center gap-2 text-sm text-neutral-700">
            <input v-model="roleForm.isActive" type="checkbox" class="rounded" />
            Ativo
          </label>
          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn btn-secondary" @click="showRoleModal = false">
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
import { PlusIcon, PencilIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import { organizationService, type ServiceRole } from '@/services/organization'
import { useAuthStore } from '@/stores/auth'
import { ServiceRoleCategory, enumToSelectOptions } from '@/constants/organization'
import { confirmDelete } from '@/composables/useConfirm'

const ROW_MENU_WIDTH = 160
const ROW_MENU_HEIGHT = 88

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
const openRoleRowMenuId = ref<number | null>(null)
const roleRowMenuStyle = ref<{ top: string; left: string } | null>(null)

const roleForm = ref<{
  name: string
  category: string
  description: string
  isActive: boolean
}>({
  name: '',
  category: ServiceRoleCategory.SUPPORT_AND_CARE,
  description: '',
  isActive: true,
})

const categoryOptions = enumToSelectOptions(ServiceRoleCategory)

const roleHeaders = computed<TableHeader<ServiceRole>[]>(() => [
  { key: 'name', label: 'Nome', width: 0.4, align: 'left' },
  { key: 'category', label: 'Categoria', width: 0.3, align: 'left' },
  { key: 'isActive', label: 'Status', width: 0.3, align: 'left' },
])

const filteredRoles = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return roles.value
  return roles.value.filter(
    (r) => r.name.toLowerCase().includes(term) || r.category.toLowerCase().includes(term),
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

function closeRoleRowMenu() {
  openRoleRowMenuId.value = null
  roleRowMenuStyle.value = null
}

function toggleRoleRowMenu(roleId: number, event: MouseEvent) {
  if (openRoleRowMenuId.value === roleId) {
    closeRoleRowMenu()
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

  openRoleRowMenuId.value = roleId
  roleRowMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

function handleEditRoleFromMenu() {
  const role = roles.value.find((item) => item.id === openRoleRowMenuId.value)
  closeRoleRowMenu()
  if (role) {
    openRoleModal(role)
  }
}

async function handleDeleteRoleFromMenu() {
  const role = roles.value.find((item) => item.id === openRoleRowMenuId.value)
  closeRoleRowMenu()
  if (role) {
    await handleDeleteRole(role)
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (
    !target.closest('[aria-label="Opções da função"]') &&
    !target.closest('.role-row-menu')
  ) {
    closeRoleRowMenu()
  }
}

function handleScroll() {
  if (openRoleRowMenuId.value) {
    closeRoleRowMenu()
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
