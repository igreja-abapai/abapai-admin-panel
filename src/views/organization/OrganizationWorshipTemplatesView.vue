<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Modelos de Culto</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Configure os templates de culto e as funções necessárias em cada um.
        </p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="btn btn-primary w-full sm:w-auto"
        @click="openTemplateModal()"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Novo modelo
      </button>
    </div>

    <WorshipTemplatesSkeleton v-if="loading" />

    <div v-else class="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
      <!-- Sidebar -->
      <div class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400 mb-3 px-1">
          {{ templates.length }} {{ templates.length === 1 ? 'modelo' : 'modelos' }}
        </p>

        <div v-if="templates.length === 0" class="py-10 text-center text-sm text-neutral-500">
          Nenhum modelo cadastrado.
        </div>

        <div v-else class="space-y-1.5">
          <button
            v-for="(template, index) in templates"
            :key="template.id"
            type="button"
            :class="[
              'w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
              selectedTemplate?.id === template.id
                ? 'border-primary-300 bg-primary-50/50 shadow-sm'
                : 'border-transparent hover:border-neutral-200 hover:bg-surface-page',
            ]"
            @click="selectTemplate(template)"
          >
            <div
              :class="[
                'flex h-[52px] w-[52px] shrink-0 flex-col items-center justify-center rounded-xl text-center',
                getTemplateAccent(index).badge,
              ]"
            >
              <span class="text-[10px] font-bold leading-none tracking-wide">
                {{ getWeekdayAbbreviation(template.defaultWeekday) }}
              </span>
              <span class="mt-1 text-[11px] font-semibold leading-none">
                {{ template.defaultTime || '--:--' }}
              </span>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-neutral-900 truncate leading-snug">
                {{ template.name }}
              </p>
              <p class="text-xs text-neutral-500 mt-1">
                {{ getTemplateStats(template).rolesCount }} funções ·
                {{ getTemplateStats(template).peopleCount }} pessoas
              </p>
            </div>

            <ChevronRightIcon
              v-if="selectedTemplate?.id === template.id"
              class="w-4 h-4 shrink-0 text-primary-500"
            />
          </button>
        </div>
      </div>

      <!-- Detail panel -->
      <div
        v-if="selectedTemplate"
        class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      >
        <div class="flex items-start justify-between gap-4 mb-5">
          <div class="flex items-start gap-3.5 min-w-0">
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600"
            >
              <ClipboardDocumentListIcon class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <h2 class="text-[17px] font-semibold leading-snug text-neutral-900 truncate">
                {{ selectedTemplate.name }}
              </h2>
              <div class="flex flex-wrap items-center gap-2 mt-2">
                <span
                  v-if="selectedTemplate.defaultWeekday"
                  class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-surface-page px-2.5 py-1 text-xs font-medium text-neutral-600"
                >
                  <CalendarDaysIcon class="w-3.5 h-3.5 text-neutral-400" />
                  {{ selectedTemplate.defaultWeekday }}
                </span>
                <span
                  v-if="selectedTemplate.defaultTime"
                  class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-surface-page px-2.5 py-1 text-xs font-medium text-neutral-600"
                >
                  <ClockIcon class="w-3.5 h-3.5 text-neutral-400" />
                  {{ selectedTemplate.defaultTime }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="canManage" class="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              class="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Editar modelo"
              @click="openTemplateModal(selectedTemplate)"
            >
              <PencilIcon class="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              class="p-2 text-neutral-400 hover:text-red-500 transition-colors"
              aria-label="Excluir modelo"
              @click="handleDeleteTemplate(selectedTemplate)"
            >
              <TrashIcon class="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
          <div class="rounded-xl border border-neutral-200 bg-surface-page px-4 py-3.5">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ClipboardDocumentListIcon class="w-[18px] h-[18px]" />
              </div>
              <div>
                <p class="text-2xl font-bold text-neutral-900 leading-none tabular-nums">
                  {{ selectedTemplateStats.rolesCount }}
                </p>
                <p class="text-xs text-neutral-500 mt-1.5">Funções</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-neutral-200 bg-surface-page px-4 py-3.5">
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <UsersIcon class="w-[18px] h-[18px]" />
              </div>
              <div>
                <p class="text-2xl font-bold text-neutral-900 leading-none tabular-nums">
                  {{ selectedTemplateStats.peopleCount }}
                </p>
                <p class="text-xs text-neutral-500 mt-1.5">Pessoas por culto</p>
              </div>
            </div>
          </div>
          <div class="rounded-xl border border-neutral-200 bg-surface-page px-4 py-3.5">
            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"
              >
                <ShieldCheckIcon class="w-[18px] h-[18px]" />
              </div>
              <div>
                <p class="text-2xl font-bold text-neutral-900 leading-none tabular-nums">
                  {{ selectedTemplateStats.requiredCount }}
                </p>
                <p class="text-xs text-neutral-500 mt-1.5">Obrigatórias</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-4 mb-4">
          <h3 class="text-[15px] font-semibold text-neutral-900">Funções exigidas</h3>
          <button
            v-if="canManage"
            type="button"
            class="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            @click="openTypeRoleModal()"
          >
            <PlusIcon class="w-4 h-4 text-neutral-500" />
            Adicionar função
          </button>
        </div>

        <div
          v-if="templateRoles.length === 0"
          class="rounded-xl border border-dashed border-neutral-200 bg-surface-page py-12 text-center"
        >
          <p class="text-sm text-neutral-500">Nenhuma função configurada para este modelo.</p>
        </div>

        <div v-else class="space-y-7">
          <section v-for="group in groupedTemplateRoles" :key="group.category">
            <div class="flex items-center gap-2.5 mb-3">
              <div
                :class="[
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  getCategoryStyle(group.category).icon,
                ]"
              >
                <component :is="getCategoryIcon(group.category)" class="w-3.5 h-3.5" />
              </div>
              <span class="text-[11px] font-bold uppercase tracking-[0.06em] text-neutral-800">
                {{ group.category }}
              </span>
              <span
                class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-100 px-1.5 text-[11px] font-semibold text-neutral-600"
              >
                {{ group.roles.length }}
              </span>
              <div class="h-px flex-1 bg-neutral-200"></div>
            </div>

            <div class="space-y-2">
              <div
                v-for="typeRole in group.roles"
                :key="typeRole.id"
                class="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3"
              >
                <div
                  :class="[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    getCategoryStyle(group.category).icon,
                  ]"
                >
                  <component :is="getCategoryIcon(group.category)" class="w-[18px] h-[18px]" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-neutral-900 leading-tight">
                    {{ typeRole.serviceRole?.name || 'Função' }}
                    <span v-if="typeRole.slotNumber > 1" class="text-neutral-400 font-medium">
                      (#{{ typeRole.slotNumber }})
                    </span>
                  </p>
                  <p class="text-xs text-neutral-500 mt-0.5">{{ group.category }}</p>
                </div>

                <div class="flex items-center gap-2.5 shrink-0">
                  <span
                    :class="[
                      'inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap',
                      typeRole.isRequired
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-neutral-100 text-neutral-600',
                    ]"
                  >
                    {{ typeRole.isRequired ? 'Obrigatória' : 'Opcional' }}
                  </span>

                  <div v-if="canManage" class="flex items-center">
                    <button
                      type="button"
                      class="p-1.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                      aria-label="Editar função"
                      @click="openTypeRoleModal(typeRole)"
                    >
                      <PencilIcon class="w-[18px] h-[18px]" />
                    </button>
                    <button
                      type="button"
                      class="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                      aria-label="Remover função"
                      @click="handleDeleteTypeRole(typeRole)"
                    >
                      <TrashIcon class="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div
        v-else
        class="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center text-neutral-500"
      >
        Selecione um modelo para ver e editar suas funções.
      </div>
    </div>

    <!-- Template modal -->
    <BaseModal
      v-model="showTemplateModal"
      :title="editingTemplate ? 'Editar Modelo' : 'Novo Modelo de Culto'"
      form
      :error="formError"
      @submit="saveTemplate"
    >
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
        <Input v-model="templateForm.name" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Dia padrão</label>
        <Select
          v-model="templateForm.defaultWeekday"
          :options="weekdayOptions"
          placeholder="Selecione"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1"
          >Horário padrão (HH:mm)</label
        >
        <Input v-model="templateForm.defaultTime" placeholder="19:00" />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Descrição</label>
        <Input v-model="templateForm.description" />
      </div>
      <Checkbox v-model="templateForm.isActive">Ativo</Checkbox>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showTemplateModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>

    <!-- Type role modal -->
    <BaseModal
      v-model="showTypeRoleModal"
      :title="editingTypeRole ? 'Editar Função' : 'Adicionar Função'"
      form
      :error="formError"
      @submit="saveTypeRole"
    >
      <div v-if="editingTypeRole">
        <label class="block text-sm font-medium text-neutral-700 mb-1">Função</label>
        <Input :model-value="editingTypeRole.serviceRole?.name || 'Função'" disabled />
      </div>
      <div v-else>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Função</label>
        <Select
          v-model="typeRoleForm.serviceRoleId"
          :options="roleOptions"
          placeholder="Selecione"
        />
      </div>
      <div v-if="!editingTypeRole">
        <label class="block text-sm font-medium text-neutral-700 mb-1">Quantidade</label>
        <Input v-model="typeRoleForm.quantity" type="number" min="1" max="20" />
      </div>
      <Checkbox v-if="editingTypeRole" v-model="typeRoleForm.isRequired">Obrigatória</Checkbox>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showTypeRoleModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ClockIcon,
  UsersIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import BaseModal from '@/components/BaseModal.vue'
import WorshipTemplatesSkeleton from '@/components/WorshipTemplatesSkeleton.vue'
import Checkbox from '@/components/Checkbox.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import {
  organizationService,
  type WorshipServiceType,
  type WorshipServiceTypeRole,
  type ServiceRole,
} from '@/services/organization'
import { useAuthStore } from '@/stores/auth'
import {
  ServiceRoleCategory,
  SERVICE_ROLE_CATEGORY_ORDER,
  Weekday,
  enumToSelectOptions,
} from '@/constants/organization'
import { confirmDelete, confirmRemove } from '@/composables/useConfirm'
import { getCategoryStyle, getCategoryIcon } from '@/utils/serviceRoleCategory'

const WEEKDAY_ABBREVIATIONS: Record<string, string> = {
  [Weekday.SUNDAY]: 'DOM',
  [Weekday.MONDAY]: 'SEG',
  [Weekday.TUESDAY]: 'TER',
  [Weekday.WEDNESDAY]: 'QUA',
  [Weekday.THURSDAY]: 'QUI',
  [Weekday.FRIDAY]: 'SEX',
  [Weekday.SATURDAY]: 'SÁB',
}

const TEMPLATE_ACCENTS = [
  { badge: 'bg-blue-50 text-blue-700' },
  { badge: 'bg-violet-50 text-violet-700' },
  { badge: 'bg-teal-50 text-teal-700' },
  { badge: 'bg-emerald-50 text-emerald-700' },
  { badge: 'bg-amber-50 text-amber-700' },
  { badge: 'bg-rose-50 text-rose-700' },
]

const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_escalas'))

const loading = ref(false)
const saving = ref(false)
const formError = ref('')

const templates = ref<WorshipServiceType[]>([])
const typeRoles = ref<WorshipServiceTypeRole[]>([])
const serviceRoles = ref<ServiceRole[]>([])
const selectedTemplate = ref<WorshipServiceType | null>(null)

const showTemplateModal = ref(false)
const showTypeRoleModal = ref(false)
const editingTemplate = ref<WorshipServiceType | null>(null)
const editingTypeRole = ref<WorshipServiceTypeRole | null>(null)

const templateForm = ref({
  name: '',
  defaultWeekday: '',
  defaultTime: '',
  description: '',
  isActive: true,
})

const typeRoleForm = ref({
  serviceRoleId: '',
  quantity: '1',
  isRequired: true,
})

const weekdayOptions = enumToSelectOptions(Weekday)

const templateRoles = computed(() =>
  typeRoles.value.filter((tr) => tr.worshipServiceTypeId === selectedTemplate.value?.id),
)

const selectedTemplateStats = computed(() =>
  selectedTemplate.value
    ? getTemplateStats(selectedTemplate.value)
    : { rolesCount: 0, peopleCount: 0, requiredCount: 0 },
)

const groupedTemplateRoles = computed(() => {
  const groups = new Map<string, WorshipServiceTypeRole[]>()

  for (const category of SERVICE_ROLE_CATEGORY_ORDER) {
    groups.set(category, [])
  }

  for (const typeRole of templateRoles.value) {
    const category =
      typeRole.serviceRole?.category || ServiceRoleCategory.SUPPORT_AND_CARE
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category)!.push(typeRole)
  }

  return SERVICE_ROLE_CATEGORY_ORDER.filter((category) => (groups.get(category)?.length || 0) > 0)
    .map((category) => ({
      category,
      roles: groups.get(category) || [],
    }))
})

const roleOptions = computed(() =>
  serviceRoles.value
    .filter((role) => role.isActive)
    .map((role) => ({ value: String(role.id), label: role.name })),
)

function getWeekdayAbbreviation(weekday?: string) {
  if (!weekday) return '—'
  return WEEKDAY_ABBREVIATIONS[weekday] || weekday.slice(0, 3).toUpperCase()
}

function getTemplateAccent(index: number) {
  return TEMPLATE_ACCENTS[index % TEMPLATE_ACCENTS.length]
}

function getTemplateStats(template: WorshipServiceType) {
  const roles = typeRoles.value.filter((tr) => tr.worshipServiceTypeId === template.id)
  return {
    rolesCount: roles.length,
    peopleCount: roles.length,
    requiredCount: roles.filter((role) => role.isRequired).length,
  }
}

async function loadData() {
  loading.value = true
  try {
    const [templatesRes, typeRolesRes, rolesRes] = await Promise.all([
      organizationService.getWorshipServiceTypes(),
      organizationService.getWorshipServiceTypeRoles(),
      organizationService.getServiceRoles(),
    ])
    templates.value = templatesRes
    typeRoles.value = typeRolesRes
    serviceRoles.value = rolesRes
    if (selectedTemplate.value) {
      selectedTemplate.value =
        templates.value.find((t) => t.id === selectedTemplate.value?.id) || templates.value[0] || null
    } else if (templates.value.length > 0) {
      selectedTemplate.value = templates.value[0]
    }
  } finally {
    loading.value = false
  }
}

function selectTemplate(template: WorshipServiceType) {
  selectedTemplate.value = template
}

function openTemplateModal(template?: WorshipServiceType) {
  editingTemplate.value = template || null
  templateForm.value = {
    name: template?.name || '',
    defaultWeekday: template?.defaultWeekday || '',
    defaultTime: template?.defaultTime || '',
    description: template?.description || '',
    isActive: template?.isActive ?? true,
  }
  formError.value = ''
  showTemplateModal.value = true
}

async function saveTemplate() {
  saving.value = true
  formError.value = ''
  try {
    const payload = {
      name: templateForm.value.name,
      defaultWeekday: templateForm.value.defaultWeekday || undefined,
      defaultTime: templateForm.value.defaultTime || undefined,
      description: templateForm.value.description || undefined,
      isActive: templateForm.value.isActive,
    }
    if (editingTemplate.value) {
      await organizationService.updateWorshipServiceType(editingTemplate.value.id, payload)
    } else {
      await organizationService.createWorshipServiceType(payload)
    }
    showTemplateModal.value = false
    await loadData()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao salvar modelo'
  } finally {
    saving.value = false
  }
}

async function handleDeleteTemplate(template: WorshipServiceType) {
  await confirmDelete({
    message: `Tem certeza que deseja excluir "${template.name}"?`,
    onConfirm: async () => {
      await organizationService.deleteWorshipServiceType(template.id)
      if (selectedTemplate.value?.id === template.id) {
        selectedTemplate.value = null
      }
      await loadData()
    },
  })
}

function openTypeRoleModal(typeRole?: WorshipServiceTypeRole) {
  editingTypeRole.value = typeRole || null
  typeRoleForm.value = {
    serviceRoleId: typeRole ? String(typeRole.serviceRoleId) : '',
    quantity: '1',
    isRequired: typeRole?.isRequired ?? true,
  }
  formError.value = ''
  showTypeRoleModal.value = true
}

async function saveTypeRole() {
  if (!selectedTemplate.value) return
  saving.value = true
  formError.value = ''
  try {
    if (editingTypeRole.value) {
      await organizationService.updateWorshipServiceTypeRole(editingTypeRole.value.id, {
        isRequired: typeRoleForm.value.isRequired,
      })
    } else {
      const quantity = Number(typeRoleForm.value.quantity) || 1
      if (quantity < 1 || quantity > 20) {
        formError.value = 'Informe uma quantidade entre 1 e 20'
        return
      }

      await organizationService.createWorshipServiceTypeRole({
        worshipServiceTypeId: selectedTemplate.value.id,
        serviceRoleId: Number(typeRoleForm.value.serviceRoleId),
        quantity,
      })
    }

    showTypeRoleModal.value = false
    editingTypeRole.value = null
    await loadData()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao salvar função'
  } finally {
    saving.value = false
  }
}

async function handleDeleteTypeRole(typeRole: WorshipServiceTypeRole) {
  await confirmRemove({
    message: 'Remover esta função do modelo?',
    onConfirm: async () => {
      await organizationService.deleteWorshipServiceTypeRole(typeRole.id)
      await loadData()
    },
  })
}

onMounted(loadData)
</script>
