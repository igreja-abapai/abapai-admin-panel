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
              <button
                v-if="canManage && service.status === WorshipServiceStatus.PUBLISHED"
                type="button"
                class="btn btn-primary shadow-[0_4px_12px_rgba(34,197,94,0.35)]"
                :disabled="actionLoading"
                @click="confirmService"
              >
                <CheckIcon class="w-4 h-4 mr-2" />
                Confirmar escala
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
                  <MemberAvatar
                    v-if="getAssignmentAvatarName(assignment)"
                    :name="getAssignmentAvatarName(assignment)"
                    :photo-url="getAssignmentPhotoUrl(assignment)"
                    size="md"
                  />
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
                        v-if="isGuestAssignment(assignment)"
                        class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-violet-50 text-violet-700"
                      >
                        Convidado
                      </span>
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
                    <p
                      v-if="assignment.notes?.trim()"
                      class="text-sm text-neutral-500 mt-1 whitespace-pre-line"
                    >
                      <span class="text-neutral-400">Obs.:</span> {{ assignment.notes.trim() }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2.5 shrink-0 sm:ml-auto">
                  <span :class="slotStatusBadgeClass(assignment)">
                    {{ slotStatusLabel(assignment) }}
                  </span>
                  <button
                    v-if="canEditAssignments && isAssignmentFilled(assignment)"
                    type="button"
                    class="btn btn-secondary text-sm py-2 !text-red-600 !border-red-200 hover:!bg-red-50"
                    :disabled="saving"
                    @click="clearAssignment(assignment)"
                  >
                    Remover
                  </button>
                  <button
                    v-if="canEditAssignments"
                    type="button"
                    class="btn btn-secondary text-sm py-2"
                    :disabled="saving"
                    @click="openAssignModal(assignment)"
                  >
                    <PlusIcon v-if="!isAssignmentFilled(assignment)" class="w-4 h-4 mr-1" />
                    {{ isAssignmentFilled(assignment) ? 'Alterar' : 'Atribuir' }}
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
    <BaseModal
      v-if="assigningAssignment"
      v-model="showAssignModal"
      title="Atribuir Vaga"
      :subtitle="assignModalSubtitle"
      form
      :error="formError"
      @submit="saveAssignment"
    >
      <div v-if="allowsGuestAssignment" class="mb-4">
        <label class="block text-sm font-medium text-neutral-700 mb-2">Tipo de atribuição</label>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            :class="
              assignForm.assigneeType === 'member'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            "
            @click="assignForm.assigneeType = 'member'"
          >
            Membro da igreja
          </button>
          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            :class="
              assignForm.assigneeType === 'guest'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            "
            @click="assignForm.assigneeType = 'guest'"
          >
            Convidado externo
          </button>
        </div>
      </div>

      <div v-if="!allowsGuestAssignment || assignForm.assigneeType === 'member'">
        <label class="block text-sm font-medium text-neutral-700 mb-1">Membro elegível</label>
        <Select
          v-model="assignForm.memberId"
          :options="eligibleMemberOptions"
          placeholder="Selecione o membro"
        />
      </div>
      <div v-else>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Pregador convidado</label>
        <SelectWithAddButton
          v-model="assignForm.preacherId"
          :options="preacherOptions"
          add-button-title="Cadastrar novo pregador"
          @add="showPreacherModal = true"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Observações</label>
        <Input v-model="assignForm.notes" />
      </div>

      <template #footer-actions>
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="saving"
          @click="closeAssignModal"
        >
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>

    <PreacherFormModal
      v-model="showPreacherModal"
      @saved="handlePreacherCreated"
    />

    <!-- Copy modal -->
    <BaseModal
      v-model="showCopyModal"
      title="Copiar Atribuições"
      subtitle="Copia as atribuições de outra escala para esta (mesmas funções e slots)."
      form
      :error="formError"
      @submit="copyAssignments"
    >
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Escala de origem</label>
        <Select
          v-model="copyForm.sourceWorshipServiceId"
          :options="otherServiceOptions"
          placeholder="Selecione a escala"
        />
      </div>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showCopyModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Copiar</ModalSubmitButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckIcon,
  PlusIcon,
  UsersIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import SelectWithAddButton from '@/components/SelectWithAddButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import PreacherFormModal from '@/components/organization/PreacherFormModal.vue'
import { getCategoryIcon, getCategoryStyle } from '@/utils/serviceRoleCategory'
import {
  organizationService,
  type WorshipService,
  type ServiceAssignment,
  type WorshipServiceTypeRole,
  type Preacher,
} from '@/services/organization'
import type { Member } from '@/services/members'
import { useAuthStore } from '@/stores/auth'
import {
  WorshipServiceStatus,
  AssignmentStatus,
  ServiceRoleCategory,
  SERVICE_ROLE_CATEGORY_ORDER,
} from '@/constants/organization'
import { confirmAction, confirmRemove } from '@/composables/useConfirm'
import {
  getAssignmentAvatarName,
  getAssignmentDisplayName,
  getAssignmentPhotoUrl,
  isAssignmentFilled,
  isGuestAssignment,
} from '@/utils/serviceAssignment'
import { formatChurchDateTime, formatChurchScheduleDate, formatChurchTime } from '@/utils/churchDateTime'

const route = useRoute()
const authStore = useAuthStore()

const canManage = computed(() => authStore.hasPermission('gerenciar_escalas'))
const canPublish = computed(() => authStore.hasPermission('publicar_escalas'))
const canEditAssignments = computed(
  () =>
    canManage.value &&
    service.value?.status !== WorshipServiceStatus.CONFIRMED,
)

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
const showPreacherModal = ref(false)
const assigningAssignment = ref<ServiceAssignment | null>(null)
const preachers = ref<Preacher[]>([])

const assignModalSubtitle = computed(() => {
  const assignment = assigningAssignment.value
  if (!assignment) return ''

  const roleName = assignment.serviceRole?.name ?? ''
  if (assignment.slotNumber > 1) {
    return `${roleName} (#${assignment.slotNumber})`
  }

  return roleName
})

const assignForm = ref({
  assigneeType: 'member' as 'member' | 'guest',
  memberId: '',
  preacherId: '',
  notes: '',
})

const copyForm = ref({ sourceWorshipServiceId: '' })

const allowsGuestAssignment = computed(
  () => Boolean(assigningAssignment.value?.serviceRole?.allowsGuestAssignment),
)

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

const preacherOptions = computed(() =>
  preachers.value
    .filter((preacher) => preacher.isActive || preacher.id === Number(assignForm.value.preacherId))
    .map((preacher) => ({ value: String(preacher.id), label: preacher.name })),
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
  return formatChurchDateTime(value)
}

function formatScheduleDate(value: string) {
  return formatChurchScheduleDate(value)
}

function formatTime(value: string) {
  return formatChurchTime(value)
}

function summaryStatusBadgeClass(status: string) {
  const base =
    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium'
  if (status === WorshipServiceStatus.PUBLISHED) {
    return `${base} border-blue-200 bg-blue-50 text-blue-700`
  }
  if (status === WorshipServiceStatus.CONFIRMED) {
    return `${base} border-green-200 bg-green-50 text-green-700`
  }
  return `${base} border-neutral-200 bg-surface-page text-neutral-600`
}

function isAssignmentRequired(assignment: ServiceAssignment) {
  const typeRole = typeRoles.value.find(
    (role) =>
      role.serviceRoleId === assignment.serviceRoleId &&
      role.slotNumber === assignment.slotNumber,
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

function assignmentLabel(assignment: ServiceAssignment) {
  return getAssignmentDisplayName(assignment) || 'Vaga em aberto'
}

async function loadService(options?: { silent?: boolean }) {
  if (!options?.silent) {
    loading.value = true
  }
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
    if (!options?.silent) {
      loading.value = false
    }
  }
}

async function loadPreachers() {
  try {
    preachers.value = await organizationService.getPreachers()
  } catch {
    preachers.value = []
  }
}

async function openAssignModal(assignment: ServiceAssignment) {
  assigningAssignment.value = assignment
  const hasGuest = isGuestAssignment(assignment)
  assignForm.value = {
    assigneeType: hasGuest ? 'guest' : 'member',
    memberId: assignment.memberId ? String(assignment.memberId) : '',
    preacherId: assignment.preacherId ? String(assignment.preacherId) : '',
    notes: assignment.notes || '',
  }
  formError.value = ''
  showAssignModal.value = true

  if (hasGuest || assignment.serviceRole?.allowsGuestAssignment) {
    await loadPreachers()
  }

  if (!assignment.serviceRole?.allowsGuestAssignment || !hasGuest) {
    try {
      eligibleMembers.value = await organizationService.getEligibleMembersForAssignment(
        assignment.id,
      )
    } catch (err: any) {
      formError.value = err.response?.data?.message || 'Erro ao carregar opções'
    }
  }
}

function closeAssignModal() {
  showAssignModal.value = false
  assigningAssignment.value = null
}

async function handlePreacherCreated(preacher: Preacher) {
  await loadPreachers()
  assignForm.value.preacherId = String(preacher.id)
  assignForm.value.assigneeType = 'guest'
}

async function clearAssignment(assignment: ServiceAssignment) {
  if (!service.value) return

  await confirmRemove({
    message: 'Remover a atribuição desta vaga?',
    onConfirm: async () => {
      saving.value = true
      try {
        await organizationService.assignServiceAssignment(service.value!.id, {
          assignmentId: assignment.id,
          preacherId: null,
          guestName: null,
          notes: null,
        })
        await loadService({ silent: true })
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Erro ao remover atribuição'
      } finally {
        saving.value = false
      }
    },
  })
}

async function saveAssignment() {
  if (!service.value || !assigningAssignment.value) return
  saving.value = true
  formError.value = ''

  const preacherId = assignForm.value.preacherId
    ? Number(assignForm.value.preacherId)
    : undefined
  const memberId = assignForm.value.memberId ? Number(assignForm.value.memberId) : undefined

  if (allowsGuestAssignment.value && assignForm.value.assigneeType === 'guest') {
    if (!preacherId) {
      formError.value = 'Selecione o pregador convidado'
      saving.value = false
      return
    }
  } else if (!memberId) {
    formError.value = 'Selecione um membro'
    saving.value = false
    return
  }

  try {
    await organizationService.assignServiceAssignment(service.value.id, {
      assignmentId: assigningAssignment.value.id,
      memberId: allowsGuestAssignment.value && assignForm.value.assigneeType === 'guest'
        ? undefined
        : memberId,
      preacherId:
        allowsGuestAssignment.value && assignForm.value.assigneeType === 'guest'
          ? preacherId
          : null,
      guestName: null,
      notes: assignForm.value.notes.trim() || null,
    })
    await loadService({ silent: true })
    if (error.value) {
      formError.value = error.value
      return
    }
    closeAssignModal()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao atribuir vaga'
  } finally {
    saving.value = false
  }
}

async function confirmService() {
  if (!service.value) return

  await confirmAction({
    title: 'Confirmar escala',
    message:
      'Confirmar esta escala? Após confirmada, as atribuições não poderão mais ser alteradas.',
    variant: 'primary',
    confirmLabel: 'Confirmar',
    onConfirm: async () => {
      actionLoading.value = true
      try {
        service.value = await organizationService.confirmWorshipService(service.value!.id)
      } finally {
        actionLoading.value = false
      }
    },
  })
}

async function publishService() {
  if (!service.value) return

  await confirmAction({
    title: 'Publicar escala',
    message: 'Publicar esta escala?',
    variant: 'primary',
    confirmLabel: 'Publicar',
    onConfirm: async () => {
      service.value = await organizationService.publishWorshipService(service.value!.id)
    },
  })
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
