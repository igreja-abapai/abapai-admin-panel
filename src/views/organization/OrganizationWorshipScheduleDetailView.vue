<template>
  <div class="w-full">
    <div class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Detalhes da Escala</h1>
      <router-link to="/organizacao/escalas" class="btn btn-secondary w-full sm:w-auto">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Voltar
      </router-link>
    </div>

    <div v-if="loading" class="rounded-xl border border-neutral-200 bg-white py-12 text-center text-neutral-500">
      Carregando...
    </div>

    <template v-else-if="service">
      <!-- Summary card -->
      <div class="rounded-xl border border-neutral-200 bg-white shadow-sm p-5 sm:p-6 mb-6">
        <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div class="flex items-start gap-4 min-w-0">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600"
            >
              <CalendarDaysIcon class="w-6 h-6" />
            </div>
            <div class="min-w-0">
              <h2 class="text-xl sm:text-2xl font-semibold text-neutral-900 leading-tight">
                {{ service.name || service.worshipServiceType?.name || 'Escala de Culto' }}
              </h2>
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-surface-page px-2.5 py-1 text-xs font-medium text-neutral-600"
                >
                  <CalendarDaysIcon class="w-3.5 h-3.5 text-neutral-400" />
                  {{ formatScheduleDate(service.scheduledAt) }}
                </span>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-surface-page px-2.5 py-1 text-xs font-medium text-neutral-600"
                >
                  <ClockIcon class="w-3.5 h-3.5 text-neutral-400" />
                  {{ formatTime(service.scheduledAt) }}
                </span>
                <span :class="summaryStatusBadgeClass(service.status)">
                  {{ service.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 shrink-0">
            <div class="flex items-center gap-4">
              <div class="relative h-16 w-16 shrink-0">
                <svg class="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#e5e5e5"
                    stroke-width="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#3282CF"
                    stroke-width="3"
                    stroke-linecap="round"
                    pathLength="100"
                    :stroke-dasharray="`${fillPercent} 100`"
                  />
                </svg>
                <span
                  class="absolute inset-0 flex items-center justify-center text-sm font-bold text-neutral-900"
                >
                  {{ fillPercent }}%
                </span>
              </div>
              <p class="text-sm text-neutral-600">
                <span class="font-semibold text-neutral-900">{{ filledSlotsCount }}</span>
                /{{ totalSlotsCount }} vagas preenchidas
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                v-if="canManage && service.status === WorshipServiceStatus.DRAFT"
                type="button"
                class="btn btn-secondary"
                @click="openCopyModal()"
              >
                Copiar de outra escala
              </button>
              <button
                v-if="canPublish && service.status === WorshipServiceStatus.DRAFT"
                type="button"
                class="btn btn-primary shadow-[0_4px_12px_rgba(50,130,207,0.35)]"
                :disabled="actionLoading"
                @click="publishService"
              >
                <CheckIcon class="w-4 h-4 mr-2" />
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Slots card -->
      <div class="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-5 sm:px-6 py-5 border-b border-neutral-100">
          <div>
            <h2 class="text-base font-semibold text-neutral-900">Vagas da escala</h2>
            <p class="text-sm text-neutral-500 mt-1">Atribua membros a cada função.</p>
          </div>
          <span
            class="inline-flex items-center gap-1.5 self-start rounded-full border border-neutral-200 bg-surface-page px-3 py-1.5 text-xs font-medium text-neutral-600"
          >
            <UsersIcon class="w-4 h-4 text-neutral-400" />
            {{ filledSlotsCount }} de {{ totalSlotsCount }} preenchidas
          </span>
        </div>

        <div v-if="!groupedAssignments.length" class="p-8 text-center text-neutral-500">
          Nenhuma vaga configurada para este culto.
        </div>

        <div v-else class="px-5 sm:px-6 py-5 space-y-8">
          <section v-for="group in groupedAssignments" :key="group.category">
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
                {{ group.filled }}/{{ group.total }}
              </span>
              <div class="h-px flex-1 bg-neutral-200"></div>
            </div>

            <div class="space-y-2">
              <div
                v-for="assignment in group.assignments"
                :key="assignment.id"
                class="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3.5"
              >
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    v-if="assignment.member"
                    :class="[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      getAvatarColor(assignment.member.name),
                    ]"
                  >
                    {{ getInitials(assignment.member.name) }}
                  </div>
                  <div
                    v-else
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400"
                  >
                    <UserIcon class="w-5 h-5" />
                  </div>

                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="text-sm font-semibold text-neutral-900">
                        {{ assignment.serviceRole?.name }}
                        <span v-if="assignment.slotNumber > 1" class="text-neutral-400 font-medium">
                          (#{{ assignment.slotNumber }})
                        </span>
                      </p>
                      <span
                        v-if="isAssignmentRequired(assignment)"
                        class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-primary-50 text-primary-600"
                      >
                        Obrigatória
                      </span>
                    </div>
                    <p
                      :class="[
                        'text-sm mt-0.5 truncate',
                        isAssignmentFilled(assignment)
                          ? 'text-neutral-700'
                          : 'text-neutral-400 italic',
                      ]"
                    >
                      {{ assignmentLabel(assignment) }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2.5 shrink-0 sm:ml-auto">
                  <span :class="slotStatusBadgeClass(assignment)">
                    {{ slotStatusLabel(assignment) }}
                  </span>
                  <button
                    v-if="canManage"
                    type="button"
                    class="btn btn-secondary text-sm py-2"
                    @click="openAssignModal(assignment)"
                  >
                    <PlusIcon class="w-4 h-4 mr-1" />
                    Atribuir
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>

    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <!-- Assign modal -->
    <div
      v-if="showAssignModal && assigningAssignment"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 class="text-lg font-semibold text-neutral-900 mb-1">Atribuir Vaga</h2>
        <p class="text-sm text-neutral-500 mb-4">
          {{ assigningAssignment.serviceRole?.name }}
          <span v-if="assigningAssignment.slotNumber > 1">
            (#{{ assigningAssignment.slotNumber }})
          </span>
        </p>

        <form class="space-y-4" @submit.prevent="saveAssignment">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Membro elegível</label>
            <Select
              v-model="assignForm.memberId"
              :options="eligibleMemberOptions"
              placeholder="Selecione o membro"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Observações</label>
            <Input v-model="assignForm.notes" />
          </div>
          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn btn-secondary" @click="closeAssignModal">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Copy modal -->
    <div
      v-if="showCopyModal"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">Copiar Atribuições</h2>
        <p class="text-sm text-neutral-500 mb-4">
          Copia as atribuições de outra escala para esta (mesmas funções e slots).
        </p>
        <form class="space-y-4" @submit.prevent="copyAssignments">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Escala de origem</label>
            <Select
              v-model="copyForm.sourceWorshipServiceId"
              :options="otherServiceOptions"
              placeholder="Selecione a escala"
            />
          </div>
          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn btn-secondary" @click="showCopyModal = false">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Copiando...' : 'Copiar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Component } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
  PlusIcon,
  UsersIcon,
  UserIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  UserGroupIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/vue/24/outline'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import {
  organizationService,
  type WorshipService,
  type ServiceAssignment,
  type WorshipServiceTypeRole,
} from '@/services/organization'
import type { Member } from '@/services/members'
import { useAuthStore } from '@/stores/auth'
import {
  WorshipServiceStatus,
  AssignmentStatus,
  ServiceRoleCategory,
  SERVICE_ROLE_CATEGORY_ORDER,
} from '@/constants/organization'

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
]

const route = useRoute()
const authStore = useAuthStore()

const canManage = computed(() => authStore.hasPermission('gerenciar_escalas'))
const canPublish = computed(() => authStore.hasPermission('publicar_escalas'))

const loading = ref(true)
const saving = ref(false)
const actionLoading = ref(false)
const error = ref('')
const formError = ref('')

const service = ref<WorshipService | null>(null)
const allServices = ref<WorshipService[]>([])
const eligibleMembers = ref<Member[]>([])
const typeRoles = ref<WorshipServiceTypeRole[]>([])

const showAssignModal = ref(false)
const showCopyModal = ref(false)
const assigningAssignment = ref<ServiceAssignment | null>(null)

const assignForm = ref({
  memberId: '',
  notes: '',
})

const copyForm = ref({ sourceWorshipServiceId: '' })

const sortedAssignments = computed(() => {
  const list = service.value?.assignments || []
  return [...list].sort((a, b) => {
    const catA = a.serviceRole?.category || ''
    const catB = b.serviceRole?.category || ''
    const catOrderA = SERVICE_ROLE_CATEGORY_ORDER.indexOf(catA as (typeof SERVICE_ROLE_CATEGORY_ORDER)[number])
    const catOrderB = SERVICE_ROLE_CATEGORY_ORDER.indexOf(catB as (typeof SERVICE_ROLE_CATEGORY_ORDER)[number])
    const orderA = catOrderA === -1 ? 999 : catOrderA
    const orderB = catOrderB === -1 ? 999 : catOrderB
    if (orderA !== orderB) return orderA - orderB

    const roleCompare = (a.serviceRole?.name || '').localeCompare(b.serviceRole?.name || '')
    if (roleCompare !== 0) return roleCompare
    return a.slotNumber - b.slotNumber
  })
})

interface AssignmentCategoryGroup {
  category: string
  assignments: ServiceAssignment[]
  filled: number
  total: number
}

const groupedAssignments = computed<AssignmentCategoryGroup[]>(() => {
  const groups = new Map<string, ServiceAssignment[]>()

  for (const category of SERVICE_ROLE_CATEGORY_ORDER) {
    groups.set(category, [])
  }

  for (const assignment of sortedAssignments.value) {
    const category =
      assignment.serviceRole?.category || ServiceRoleCategory.SUPPORT_AND_CARE
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category)!.push(assignment)
  }

  return SERVICE_ROLE_CATEGORY_ORDER.filter((category) => (groups.get(category)?.length || 0) > 0).map(
    (category) => {
      const assignments = groups.get(category) || []
      return {
        category,
        assignments,
        filled: assignments.filter(isAssignmentFilled).length,
        total: assignments.length,
      }
    },
  )
})

const totalSlotsCount = computed(() => sortedAssignments.value.length)

const filledSlotsCount = computed(
  () => sortedAssignments.value.filter(isAssignmentFilled).length,
)

const fillPercent = computed(() => {
  if (totalSlotsCount.value === 0) return 0
  return Math.round((filledSlotsCount.value / totalSlotsCount.value) * 100)
})

const eligibleMemberOptions = computed(() =>
  eligibleMembers.value.map((m) => ({ value: String(m.id), label: m.name })),
)

const otherServiceOptions = computed(() =>
  allServices.value
    .filter((s) => s.id !== service.value?.id)
    .map((s) => ({
      value: String(s.id),
      label: `${formatDateTime(s.scheduledAt)} — ${s.name || s.worshipServiceType?.name || 'Culto'}`,
    })),
)

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatScheduleDate(value: string) {
  const formatted = new Date(value).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function summaryStatusBadgeClass(status: string) {
  const base =
    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium'
  if (status === WorshipServiceStatus.PUBLISHED) {
    return `${base} border-blue-200 bg-blue-50 text-blue-700`
  }
  if (status === WorshipServiceStatus.COMPLETED) {
    return `${base} border-green-200 bg-green-50 text-green-700`
  }
  return `${base} border-neutral-200 bg-surface-page text-neutral-600`
}

function isAssignmentFilled(assignment: ServiceAssignment) {
  return Boolean(assignment.memberId || assignment.servingGroupId)
}

function isAssignmentRequired(assignment: ServiceAssignment) {
  const typeRole = typeRoles.value.find(
    (role) => role.serviceRoleId === assignment.serviceRoleId,
  )
  return typeRole?.isRequired ?? false
}

function slotStatusBadgeClass(assignment: ServiceAssignment) {
  const base = 'inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold'
  if (isAssignmentFilled(assignment)) {
    if (assignment.status === AssignmentStatus.CONFIRMED) {
      return `${base} bg-green-50 text-green-700`
    }
    return `${base} bg-yellow-50 text-yellow-700`
  }
  return `${base} bg-orange-50 text-orange-700`
}

function slotStatusLabel(assignment: ServiceAssignment) {
  if (!isAssignmentFilled(assignment)) return AssignmentStatus.EMPTY
  return assignment.status
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getCategoryStyle(category: string) {
  const styles: Record<string, { icon: string }> = {
    [ServiceRoleCategory.DIRECTION_AND_WORD]: { icon: 'bg-blue-50 text-blue-600' },
    [ServiceRoleCategory.WORSHIP]: { icon: 'bg-violet-50 text-violet-600' },
    [ServiceRoleCategory.MEDIA_AND_SOUND]: { icon: 'bg-teal-50 text-teal-600' },
    [ServiceRoleCategory.RECEPTION]: { icon: 'bg-amber-50 text-amber-600' },
    [ServiceRoleCategory.SUPPORT_AND_CARE]: { icon: 'bg-rose-50 text-rose-600' },
  }
  return styles[category] || { icon: 'bg-neutral-100 text-neutral-600' }
}

function getCategoryIcon(category: string): Component {
  const icons: Record<string, Component> = {
    [ServiceRoleCategory.DIRECTION_AND_WORD]: MicrophoneIcon,
    [ServiceRoleCategory.WORSHIP]: MusicalNoteIcon,
    [ServiceRoleCategory.MEDIA_AND_SOUND]: VideoCameraIcon,
    [ServiceRoleCategory.RECEPTION]: UserGroupIcon,
    [ServiceRoleCategory.SUPPORT_AND_CARE]: HeartIcon,
  }
  return icons[category] || ClipboardDocumentListIcon
}

function assignmentLabel(assignment: ServiceAssignment) {
  if (assignment.servingGroup) {
    const members = assignment.servingGroup.members
      ?.map((m) => m.member?.name)
      .filter(Boolean)
      .join(' · ')
    return members ? `Grupo: ${assignment.servingGroup.name} (${members})` : `Grupo: ${assignment.servingGroup.name}`
  }
  if (assignment.member) return assignment.member.name
  return 'Vaga em aberto'
}

async function loadService() {
  loading.value = true
  error.value = ''
  try {
    const id = Number(route.params.id)
    service.value = await organizationService.getWorshipService(id)

    if (service.value.worshipServiceTypeId) {
      const allTypeRoles = await organizationService.getWorshipServiceTypeRoles()
      typeRoles.value = allTypeRoles.filter(
        (role) => role.worshipServiceTypeId === service.value!.worshipServiceTypeId,
      )
    } else {
      typeRoles.value = []
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar escala'
  } finally {
    loading.value = false
  }
}

async function openAssignModal(assignment: ServiceAssignment) {
  assigningAssignment.value = assignment
  assignForm.value = {
    memberId: assignment.memberId ? String(assignment.memberId) : '',
    notes: assignment.notes || '',
  }
  formError.value = ''
  showAssignModal.value = true

  try {
    eligibleMembers.value = await organizationService.getEligibleMembersForAssignment(assignment.id)
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao carregar opções'
  }
}

function closeAssignModal() {
  showAssignModal.value = false
  assigningAssignment.value = null
}

async function saveAssignment() {
  if (!service.value || !assigningAssignment.value) return
  saving.value = true
  formError.value = ''
  try {
    await organizationService.assignServiceAssignment(service.value.id, {
      assignmentId: assigningAssignment.value.id,
      memberId: assignForm.value.memberId ? Number(assignForm.value.memberId) : undefined,
      notes: assignForm.value.notes || undefined,
    })
    closeAssignModal()
    await loadService()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao atribuir vaga'
  } finally {
    saving.value = false
  }
}

async function publishService() {
  if (!service.value || !confirm('Publicar esta escala?')) return
  actionLoading.value = true
  try {
    service.value = await organizationService.publishWorshipService(service.value.id)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao publicar escala'
  } finally {
    actionLoading.value = false
  }
}

async function openCopyModal() {
  copyForm.value = { sourceWorshipServiceId: '' }
  formError.value = ''
  showCopyModal.value = true
  try {
    allServices.value = await organizationService.getWorshipServices()
  } catch {
    allServices.value = []
  }
}

async function copyAssignments() {
  if (!service.value) return
  saving.value = true
  formError.value = ''
  try {
    service.value = await organizationService.copyWorshipServiceAssignments(
      service.value.id,
      Number(copyForm.value.sourceWorshipServiceId),
    )
    showCopyModal.value = false
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao copiar atribuições'
  } finally {
    saving.value = false
  }
}

onMounted(loadService)
</script>
