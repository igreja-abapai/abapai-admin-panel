<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Escalas</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Visualize e gerencie as escalas de culto por mês.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <SplitButton
          v-if="canManage"
          label="Gerar Cultos"
          :icon="SparklesIcon"
          variant="secondary"
          class="w-full sm:w-auto"
          toggle-title="Mais opções de geração"
          @click="openGenerateServicesModal()"
        >
          <template #menu>
            <button
              type="button"
              class="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
              @click="openGenerateAssignmentsModal()"
            >
              <SparklesIcon class="w-5 h-5 mr-3 text-neutral-400 shrink-0" />
              Gerar Escalas
            </button>
            <button
              type="button"
              class="flex items-center w-full px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="exportingSchedule || monthStats.total === 0"
              @click="openExportModal()"
            >
              <ArrowDownTrayIcon class="w-5 h-5 mr-3 text-neutral-400 shrink-0" />
              {{ exportingSchedule ? 'Gerando...' : 'Exportar escala' }}
            </button>
          </template>
        </SplitButton>
        <button
          v-if="canManage"
          type="button"
          class="btn btn-primary w-full sm:w-auto"
          @click="openCreateModal()"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          Novo culto
        </button>
      </div>
    </div>

    <WorshipSchedulesSkeleton v-if="loading" :show-list="false" />

    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
        <p class="text-2xl font-semibold text-neutral-900 tabular-nums">{{ monthStats.total }}</p>
        <p class="text-sm text-neutral-500 mt-1">Escalas no mês</p>
      </div>
      <div class="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
        <p class="text-2xl font-semibold text-blue-600 tabular-nums">{{ monthStats.published }}</p>
        <p class="text-sm text-neutral-500 mt-1">Publicadas</p>
      </div>
      <div class="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
        <p class="text-2xl font-semibold text-amber-600 tabular-nums">{{ monthStats.openSlots }}</p>
        <p class="text-sm text-neutral-500 mt-1">Vagas em aberto</p>
      </div>
    </div>

    <div class="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div class="flex items-center justify-between gap-4 px-6 py-5 border-b border-neutral-100">
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
            aria-label="Mês anterior"
            @click="prevMonth"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <span class="text-sm font-semibold text-neutral-900">
            {{ viewMonthLabel }}
          </span>
          <button
            type="button"
            class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
            aria-label="Próximo mês"
            @click="nextMonth"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
        <div v-if="canManage && monthStats.total > 0" class="flex items-center gap-2 shrink-0">
          <button
            v-if="monthAssignedSlots > 0"
            type="button"
            class="btn btn-secondary text-sm"
            @click="handleClearAssignments"
          >
            Limpar escalados
          </button>
          <button type="button" class="btn btn-secondary text-sm" @click="handleClearMonth">
            Deletar cultos
          </button>
        </div>
      </div>

      <div v-if="loading">
        <WorshipSchedulesSkeleton :show-stats="false" />
      </div>

      <div v-else-if="error" class="p-8 text-center">
        <p class="text-sm text-red-600">{{ error }}</p>
        <button type="button" class="btn btn-secondary mt-4" @click="loadServices">
          Tentar novamente
        </button>
      </div>

      <div v-else-if="groupedServices.length === 0" class="p-12 text-center">
        <p class="text-sm text-neutral-500">Nenhuma escala encontrada para este mês.</p>
      </div>

      <div v-else class="divide-y divide-neutral-100">
        <div
          v-for="group in groupedServices"
          :key="group.dateKey"
          class="flex gap-5 sm:gap-8 px-4 sm:px-6 py-5"
        >
          <div class="w-12 sm:w-14 shrink-0 text-center pt-0.5">
            <p
              :class="[
                'text-[11px] font-semibold uppercase tracking-[0.06em]',
                group.isToday ? 'text-primary-600' : 'text-neutral-400',
              ]"
            >
              {{ group.dayAbbr }}
            </p>
            <div v-if="group.isToday" class="mt-1">
              <span
                class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-lg font-bold text-white shadow-[0_4px_12px_rgba(50,130,207,0.4)]"
              >
                {{ group.dayNumber }}
              </span>
              <p class="text-[10px] font-semibold text-primary-600 mt-1">Hoje</p>
            </div>
            <p v-else class="text-[26px] font-bold leading-none text-neutral-900 mt-1.5">
              {{ group.dayNumber }}
            </p>
          </div>

          <div class="flex-1 min-w-0 space-y-3">
            <div
              v-for="service in group.services"
              :key="service.id"
              class="group relative flex items-center gap-3 sm:gap-4 rounded-xl border border-neutral-200 bg-white px-3 sm:px-4 py-3.5 hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer"
              @click="goToDetail(service)"
            >
              <div
                :class="[
                  'absolute left-0 top-3 bottom-3 w-1 rounded-full',
                  getServiceAccent(service.worshipServiceTypeId).bar,
                ]"
              ></div>

              <div class="flex items-center gap-2 w-[72px] shrink-0 pl-2">
                <span
                  :class="[
                    'h-2 w-2 rounded-full shrink-0',
                    getServiceAccent(service.worshipServiceTypeId).dot,
                  ]"
                ></span>
                <span class="text-sm font-bold text-neutral-900 tabular-nums">
                  {{ formatTime(service.scheduledAt) }}
                </span>
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-neutral-900 truncate">
                  {{ serviceDisplayName(service) }}
                </p>
                <div class="flex flex-wrap items-center gap-2 mt-1.5">
                  <span :class="getStatusDisplay(service).badgeClass">
                    {{ getStatusDisplay(service).label }}
                  </span>
                </div>
              </div>

              <div class="hidden md:flex items-center gap-3 shrink-0">
                <div class="hidden lg:flex items-center gap-1.5">
                  <template v-if="getAssignedVolunteers(service).length">
                    <div class="flex -space-x-2.5">
                      <Tooltip
                        v-for="(volunteer, index) in getAssignedVolunteers(service).slice(0, 4)"
                        :key="`${service.id}-${volunteer.member?.id ?? volunteer.guestName}-${index}`"
                        position="center"
                        width="auto"
                      >
                        <MemberAvatar
                          :name="volunteer.displayName"
                          :photo-url="volunteer.member?.photoUrl"
                          size="sm"
                          wrapper-class="border-2 border-white"
                        />
                        <template #content>
                          <span class="whitespace-nowrap">
                            {{
                              formatVolunteerTooltipLabel(
                                volunteer.roleNames,
                                volunteer.displayName,
                              )
                            }}
                          </span>
                        </template>
                      </Tooltip>
                    </div>
                    <span
                      v-if="getAssignedVolunteers(service).length > 4"
                      class="text-xs font-medium text-neutral-500"
                    >
                      +{{ getAssignedVolunteers(service).length - 4 }}
                    </span>
                  </template>
                  <span v-else class="text-xs text-neutral-400 whitespace-nowrap"
                    >Sem voluntários</span
                  >
                </div>

                <div class="flex items-center gap-2 shrink-0 w-[88px]">
                  <div class="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      :class="['h-full rounded-full transition-all', progressBarClass(service)]"
                      :style="{ width: `${progressPercent(service)}%` }"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-semibold text-neutral-600 tabular-nums whitespace-nowrap"
                  >
                    {{ filledSlots(service) }}/{{ totalSlots(service) }}
                  </span>
                </div>
              </div>

              <ChevronRightIcon
                class="w-4 h-4 text-neutral-300 shrink-0 group-hover:text-neutral-400"
              />

              <RowActionMenu
                :actions="getServiceActions(service)"
                aria-label="Opções da escala"
                :menu-width="176"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit service -->
    <BaseModal
      v-model="showEditModal"
      title="Editar Culto"
      form
      :error="formError"
      @submit="saveService"
    >
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
        <Input v-model="editForm.name" />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Data e hora</label>
        <Input v-model="editForm.scheduledAt" type="datetime-local" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-neutral-700 mb-1">Observações</label>
        <Input v-model="editForm.notes" />
      </div>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showEditModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">Salvar</ModalSubmitButton>
      </template>
    </BaseModal>

    <!-- Create from template -->
    <BaseModal
      v-model="showCreateModal"
      title="Novo Culto"
      subtitle="Crie um culto a partir de um modelo existente."
      form
      :error="formError"
      @submit="createService"
    >
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Modelo</label>
              <Select
                v-model="createForm.worshipServiceTypeId"
                :options="templateOptions"
                placeholder="Selecione"
                @update:model-value="onCreateTemplateChange"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">Modo de criação</label>
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <label class="flex items-center">
                  <input
                    v-model="createForm.mode"
                    type="radio"
                    value="single"
                    name="createMode"
                    class="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 focus:ring-primary-500 focus:ring-2"
                  />
                  <span class="ml-2 text-sm text-neutral-700">Data específica</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="createForm.mode"
                    type="radio"
                    value="weekday"
                    name="createMode"
                    class="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 focus:ring-primary-500 focus:ring-2"
                  />
                  <span class="ml-2 text-sm text-neutral-700">Por dia da semana</span>
                </label>
              </div>
            </div>

            <div v-if="createForm.mode === 'single'">
              <label class="block text-sm font-medium text-neutral-700 mb-1">Data e hora</label>
              <Input v-model="createForm.scheduledAt" type="datetime-local" required />
            </div>

            <template v-else>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Dia da semana</label>
                <Select
                  v-model="createForm.weekday"
                  :options="weekdayOptions"
                  placeholder="Selecione"
                  required
                />
                <p
                  v-if="selectedCreateTemplate?.defaultWeekday"
                  class="text-xs text-neutral-500 mt-1"
                >
                  Padrão do modelo: {{ selectedCreateTemplate.defaultWeekday }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">Quantidade</label>
                  <Input v-model="createForm.count" type="number" min="1" max="52" required />
                </div>
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">A partir de</label>
                  <Input v-model="createForm.startFrom" type="date" />
                </div>
              </div>
              <p v-if="selectedCreateTemplate?.defaultTime" class="text-xs text-neutral-500">
                Horário do modelo: {{ selectedCreateTemplate.defaultTime }}
              </p>
              <div
                v-if="weekdayPreviewDates.length"
                class="rounded-lg border border-neutral-200 bg-surface-page p-3"
              >
                <p class="text-xs font-medium text-neutral-600 mb-2">Datas previstas</p>
                <ul class="max-h-40 overflow-y-auto space-y-1">
                  <li
                    v-for="(preview, index) in weekdayPreviewDates"
                    :key="index"
                    class="text-sm text-neutral-700"
                  >
                    {{ preview }}
                  </li>
                </ul>
              </div>
            </template>

            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nome (opcional)</label>
              <Input v-model="createForm.name" />
            </div>

            <Checkbox v-model="createForm.createAsDraft">
              <span class="font-medium text-neutral-700">Criar como rascunho</span>
            </Checkbox>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showCreateModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">{{ createSubmitLabel }}</ModalSubmitButton>
      </template>
    </BaseModal>

    <!-- Generate services -->
    <BaseModal
      v-model="showGenerateServicesModal"
      title="Gerar cultos"
      subtitle="Cria cultos para todos os modelos ativos com dia padrão configurado, a partir de hoje no mês corrente."
      max-width="xl"
      form
      :error="formError"
      @submit="generateServices"
    >
      <template #icon>
        <CalendarDaysIcon class="h-5 w-5" />
      </template>

      <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Mês</label>
              <Select v-model="generateServicesForm.month" :options="monthOptions" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Ano</label>
              <Select v-model="generateServicesForm.year" :options="yearOptions" />
            </div>
      </div>

      <Checkbox v-model="generateServicesForm.alsoGenerateAssignments">
        <span class="font-medium text-neutral-800">Gerar escalas automaticamente</span>
        <span class="block text-xs text-neutral-500 mt-0.5 font-normal">
          Atribui membros às vagas dos cultos gerados.
        </span>
      </Checkbox>

      <WorshipScheduleRolesMembersForm
        v-if="generateServicesForm.alsoGenerateAssignments"
        v-model:selected-role-ids="generateServicesForm.autoAssignRoleIds"
        v-model:included-member-ids="servicesIncludedMemberIds"
        v-model:members-section-open="servicesMembersSectionOpen"
        v-model:roles-section-open="servicesRolesSectionOpen"
        :role-options="allRoleOptions"
        :members="servicesEligibleMembers"
        :members-loading="servicesEligibleMembersLoading"
      />

      <template v-if="generateServicesForm.alsoGenerateAssignments" #footer-summary>
        {{ servicesSelectionSummary }}
      </template>

      <template #footer-actions>
        <button
          type="button"
          class="btn btn-secondary"
          @click="showGenerateServicesModal = false"
        >
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">
          <template #icon>
            <CalendarDaysIcon class="h-4 w-4" />
          </template>
          Gerar cultos
        </ModalSubmitButton>
      </template>
    </BaseModal>

    <!-- Generate assignments -->
    <BaseModal
      v-model="showGenerateAssignmentsModal"
      title="Gerar escalas"
      subtitle="Atribui membros automaticamente às vagas em aberto dos cultos já criados no mês."
      max-width="xl"
      form
      :error="formError"
      @submit="generateAssignments"
    >
      <template #icon>
        <SparklesIcon class="h-5 w-5" />
      </template>

      <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Mês</label>
              <Select v-model="generateAssignmentsForm.month" :options="monthOptions" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Ano</label>
              <Select v-model="generateAssignmentsForm.year" :options="yearOptions" />
            </div>
      </div>

      <WorshipScheduleRolesMembersForm
        v-model:selected-role-ids="generateAssignmentsForm.autoAssignRoleIds"
        v-model:included-member-ids="assignmentsIncludedMemberIds"
        v-model:members-section-open="assignmentsMembersSectionOpen"
        v-model:roles-section-open="assignmentsRolesSectionOpen"
        :role-options="allRoleOptions"
        :members="assignmentsEligibleMembers"
        :members-loading="assignmentsEligibleMembersLoading"
      />

      <template #footer-summary>
        {{ assignmentsSelectionSummary }}
      </template>

      <template #footer-actions>
        <button
          type="button"
          class="btn btn-secondary"
          @click="showGenerateAssignmentsModal = false"
        >
          Cancelar
        </button>
        <ModalSubmitButton :loading="saving">
          <template #icon>
            <SparklesIcon class="h-4 w-4" />
          </template>
          Gerar escalas
        </ModalSubmitButton>
      </template>
    </BaseModal>

    <!-- Export schedule -->
    <BaseModal
      v-model="showExportModal"
      title="Exportar escala"
      subtitle="Selecione as funções e o formato para compartilhar a escala do mês."
      max-width="lg"
      form
      :error="exportFormError"
      @submit="exportSchedule"
    >
      <template #icon>
        <ArrowDownTrayIcon class="h-5 w-5" />
      </template>

      <div class="mb-4">
        <label class="block text-sm font-medium text-neutral-700 mb-1">Formato</label>
        <Select v-model="exportFormat" :options="exportFormatOptions" />
      </div>

      <div v-if="exportRoleOptions.length === 0" class="text-sm text-neutral-500">
        Nenhuma função com membros escalados neste mês.
      </div>
      <div v-else class="max-h-64 overflow-y-auto thin-scrollbar space-y-0.5">
        <label
          v-for="role in exportRoleOptions"
          :key="role.value"
          class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <Checkbox v-model="exportRoleIds" :value="role.value" />
          <div
            :class="[
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              getCategoryStyle(role.category).icon,
            ]"
          >
            <component :is="getCategoryIcon(role.category)" class="h-4 w-4" />
          </div>
          <span class="text-sm font-medium text-neutral-800">{{ role.label }}</span>
        </label>
      </div>

      <template #footer-actions>
        <button type="button" class="btn btn-secondary" @click="showExportModal = false">
          Cancelar
        </button>
        <ModalSubmitButton :loading="exportingSchedule" :disabled="exportRoleOptions.length === 0">
          <template #icon>
            <ArrowDownTrayIcon class="h-4 w-4" />
          </template>
          {{ exportSubmitLabel }}
        </ModalSubmitButton>
      </template>
    </BaseModal>

    <div style="position: absolute; left: -9999px; top: 0; width: 210mm" ref="pdfContainerRef">
      <WorshipScheduleMonthPdf
        v-if="pdfServices.length > 0"
        :month-label="pdfMonthLabel"
        :selected-roles-label="pdfSelectedRolesLabel"
        :services="pdfServices"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  PlusIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import WorshipSchedulesSkeleton from '@/components/WorshipSchedulesSkeleton.vue'
import SplitButton from '@/components/SplitButton.vue'
import Tooltip from '@/components/Tooltip.vue'
import BaseModal from '@/components/BaseModal.vue'
import Checkbox from '@/components/Checkbox.vue'
import ModalSubmitButton from '@/components/ModalSubmitButton.vue'
import RowActionMenu, { type RowActionMenuItem } from '@/components/RowActionMenu.vue'
import WorshipScheduleRolesMembersForm, {
  type WorshipScheduleEligibleMember,
} from '@/components/WorshipScheduleRolesMembersForm.vue'
import MemberAvatar from '@/components/MemberAvatar.vue'
import WorshipScheduleMonthPdf from '@/components/WorshipScheduleMonthPdf.vue'
import {
  organizationService,
  type AutoAssignIncompleteService,
  type GenerateWorshipServicesMonthResult,
  type ServiceRole,
  type WorshipService,
  type WorshipServiceType,
} from '@/services/organization'
import type { Member } from '@/services/members'
import { useAuthStore } from '@/stores/auth'
import {
  Weekday,
  WorshipServiceStatus,
  AssignmentStatus,
  enumToSelectOptions,
} from '@/constants/organization'
import { formatVolunteerTooltipLabel } from '@/utils/nameFormat'
import { isAssignmentFilled } from '@/utils/serviceAssignment'
import { getCategoryIcon, getCategoryStyle } from '@/utils/serviceRoleCategory'
import {
  buildWorshipSchedulePdfServices,
  type WorshipSchedulePdfService,
} from '@/utils/worshipSchedulePdf'
import { generateImageFromElement, generatePdfFromElement } from '@/utils/generatePdf'
import { confirmAction, confirmDelete, showAlert } from '@/composables/useConfirm'

const WEEKDAY_ABBREVIATIONS: Record<string, string> = {
  [Weekday.SUNDAY]: 'DOM',
  [Weekday.MONDAY]: 'SEG',
  [Weekday.TUESDAY]: 'TER',
  [Weekday.WEDNESDAY]: 'QUA',
  [Weekday.THURSDAY]: 'QUI',
  [Weekday.FRIDAY]: 'SEX',
  [Weekday.SATURDAY]: 'SÁB',
}

const JS_WEEKDAY_ABBREVIATIONS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']

const SERVICE_ACCENTS = [
  { bar: 'bg-violet-500', dot: 'bg-violet-500' },
  { bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { bar: 'bg-blue-500', dot: 'bg-blue-500' },
  { bar: 'bg-amber-500', dot: 'bg-amber-500' },
  { bar: 'bg-rose-500', dot: 'bg-rose-500' },
  { bar: 'bg-teal-500', dot: 'bg-teal-500' },
]

const router = useRouter()
const authStore = useAuthStore()
const canManage = computed(() => authStore.hasPermission('gerenciar_escalas'))

const now = new Date()
const viewMonth = ref(String(now.getMonth() + 1))
const viewYear = ref(String(now.getFullYear()))

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')

const services = ref<WorshipService[]>([])
const templates = ref<WorshipServiceType[]>([])
const serviceRoles = ref<ServiceRole[]>([])

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showGenerateServicesModal = ref(false)
const showGenerateAssignmentsModal = ref(false)
const showExportModal = ref(false)
const editingService = ref<WorshipService | null>(null)

const createForm = ref({
  worshipServiceTypeId: '',
  mode: 'single' as 'single' | 'weekday',
  scheduledAt: '',
  weekday: '',
  count: '4',
  startFrom: '',
  name: '',
  createAsDraft: false,
})

const weekdayOptions = enumToSelectOptions(Weekday)

const WEEKDAY_TO_JS: Record<string, number> = {
  [Weekday.SUNDAY]: 0,
  [Weekday.MONDAY]: 1,
  [Weekday.TUESDAY]: 2,
  [Weekday.WEDNESDAY]: 3,
  [Weekday.THURSDAY]: 4,
  [Weekday.FRIDAY]: 5,
  [Weekday.SATURDAY]: 6,
}

const editForm = ref({
  name: '',
  scheduledAt: '',
  notes: '',
})

const generateServicesForm = ref({
  month: String(now.getMonth() + 1),
  year: String(now.getFullYear()),
  alsoGenerateAssignments: false,
  autoAssignRoleIds: [] as number[],
})

const generateAssignmentsForm = ref({
  month: String(now.getMonth() + 1),
  year: String(now.getFullYear()),
  autoAssignRoleIds: [] as number[],
})

const servicesEligibleMembers = ref<WorshipScheduleEligibleMember[]>([])
const servicesIncludedMemberIds = ref<number[]>([])
const servicesEligibleMembersLoading = ref(false)
const servicesMembersSectionOpen = ref(false)
const servicesRolesSectionOpen = ref(true)

const assignmentsEligibleMembers = ref<WorshipScheduleEligibleMember[]>([])
const assignmentsIncludedMemberIds = ref<number[]>([])
const assignmentsEligibleMembersLoading = ref(false)
const assignmentsMembersSectionOpen = ref(false)
const assignmentsRolesSectionOpen = ref(true)

const exportingSchedule = ref(false)
const exportFormError = ref('')
const exportFormat = ref<'pdf' | 'png'>('png')
const exportRoleIds = ref<number[]>([])
const pdfContainerRef = ref<HTMLElement>()
const pdfMonthLabel = ref('')
const pdfSelectedRolesLabel = ref('')
const pdfServices = ref<WorshipSchedulePdfService[]>([])

function formatSelectionSummary(roleCount: number, memberCount: number) {
  const roleLabel = roleCount === 1 ? 'função' : 'funções'
  const memberLabel = memberCount === 1 ? 'membro' : 'membros'
  return `${roleCount} ${roleLabel} · ${memberCount} ${memberLabel}`
}

const servicesSelectionSummary = computed(() =>
  formatSelectionSummary(
    generateServicesForm.value.autoAssignRoleIds.length,
    servicesIncludedMemberIds.value.length,
  ),
)

const assignmentsSelectionSummary = computed(() =>
  formatSelectionSummary(
    generateAssignmentsForm.value.autoAssignRoleIds.length,
    assignmentsIncludedMemberIds.value.length,
  ),
)

const monthOptions = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

const yearOptions = computed(() => {
  const current = now.getFullYear()
  return [current - 1, current, current + 1].map((y) => ({
    value: String(y),
    label: String(y),
  }))
})

const allRoleOptions = computed(() =>
  serviceRoles.value
    .filter((role) => role.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((role) => ({
      value: role.id,
      label: role.name,
      category: role.category,
    })),
)

const exportRoleOptions = computed(() => {
  const assignedRoleIds = new Set<number>()

  for (const service of services.value) {
    for (const assignment of service.assignments || []) {
      if (isAssignmentFilled(assignment) && assignment.serviceRoleId) {
        assignedRoleIds.add(assignment.serviceRoleId)
      }
    }
  }

  return allRoleOptions.value.filter((role) => assignedRoleIds.has(role.value))
})

const exportFormatOptions = [
  { value: 'png', label: 'PNG (imagem)' },
  { value: 'pdf', label: 'PDF' },
]

const exportSubmitLabel = computed(() => {
  if (exportingSchedule.value) return 'Gerando...'

  if (exportFormat.value === 'png') return 'Exportar PNG'
  return 'Exportar PDF'
})

const viewMonthLabel = computed(() => {
  const month = monthOptions.find((option) => option.value === viewMonth.value)?.label
  return `${month} ${viewYear.value}`
})

const monthStats = computed(() => {
  const total = services.value.length
  const published = services.value.filter(
    (service) => service.status === WorshipServiceStatus.PUBLISHED,
  ).length
  const openSlots = services.value.reduce(
    (sum, service) => sum + Math.max(totalSlots(service) - filledSlots(service), 0),
    0,
  )
  return { total, published, openSlots }
})

const monthAssignedSlots = computed(() =>
  services.value.reduce((sum, service) => sum + filledSlots(service), 0),
)

interface ScheduleDateGroup {
  dateKey: string
  dayAbbr: string
  dayNumber: number
  isToday: boolean
  services: WorshipService[]
}

const groupedServices = computed<ScheduleDateGroup[]>(() => {
  const groups = new Map<string, ScheduleDateGroup>()
  const todayKey = toDateKey(new Date())

  const sorted = [...services.value].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  )

  for (const service of sorted) {
    const date = new Date(service.scheduledAt)
    const dateKey = toDateKey(date)

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        dateKey,
        dayAbbr: getDayAbbreviation(date, service.worshipServiceType?.defaultWeekday),
        dayNumber: date.getDate(),
        isToday: dateKey === todayKey,
        services: [],
      })
    }

    groups.get(dateKey)!.services.push(service)
  }

  return Array.from(groups.values())
})

const templateOptions = computed(() =>
  templates.value.map((t) => ({ value: String(t.id), label: t.name })),
)

const selectedCreateTemplate = computed(() =>
  templates.value.find((t) => String(t.id) === createForm.value.worshipServiceTypeId),
)

const weekdayPreviewDates = computed(() => {
  if (createForm.value.mode !== 'weekday' || !createForm.value.weekday) {
    return []
  }

  const jsWeekday = WEEKDAY_TO_JS[createForm.value.weekday]
  if (jsWeekday === undefined) {
    return []
  }

  const count = Number(createForm.value.count)
  if (!Number.isFinite(count) || count < 1) {
    return []
  }

  const startFrom = createForm.value.startFrom
    ? new Date(`${createForm.value.startFrom}T00:00:00`)
    : new Date()
  startFrom.setHours(0, 0, 0, 0)

  const time = selectedCreateTemplate.value?.defaultTime || '19:00'
  const dates = getNextWeekdayOccurrences(startFrom, jsWeekday, Math.min(count, 52))

  return dates.map((date) =>
    combineDateWithTime(date, time).toLocaleString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  )
})

const createSubmitLabel = computed(() => {
  if (saving.value) {
    return createForm.value.mode === 'weekday' ? 'Criando cultos...' : 'Criando...'
  }

  if (createForm.value.mode === 'weekday') {
    const count = Number(createForm.value.count)
    if (Number.isFinite(count) && count > 1) {
      return `Criar ${count} cultos`
    }
  }

  return 'Criar'
})

function toDateKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getDayAbbreviation(date: Date, defaultWeekday?: string) {
  if (defaultWeekday && WEEKDAY_ABBREVIATIONS[defaultWeekday]) {
    return WEEKDAY_ABBREVIATIONS[defaultWeekday]
  }
  return JS_WEEKDAY_ABBREVIATIONS[date.getDay()]
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function serviceDisplayName(service: WorshipService) {
  return service.name || service.worshipServiceType?.name || 'Culto'
}

function getServiceAccent(typeId?: number) {
  return SERVICE_ACCENTS[(typeId || 0) % SERVICE_ACCENTS.length]
}

function isServiceConfirmed(service: WorshipService) {
  const assignments = service.assignments || []
  if (assignments.length === 0) return false
  return assignments.every((assignment) => assignment.status === AssignmentStatus.CONFIRMED)
}

function getStatusDisplay(service: WorshipService) {
  const base = 'inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold'

  if (isServiceConfirmed(service)) {
    return { label: 'Confirmada', badgeClass: `${base} bg-green-50 text-green-700` }
  }

  if (service.status === WorshipServiceStatus.PUBLISHED) {
    return { label: 'Publicada', badgeClass: `${base} bg-blue-50 text-blue-700` }
  }

  if (service.status === WorshipServiceStatus.COMPLETED) {
    return { label: 'Concluída', badgeClass: `${base} bg-green-50 text-green-700` }
  }

  return { label: 'Rascunho', badgeClass: `${base} bg-neutral-100 text-neutral-600` }
}

interface AssignedVolunteer {
  member: Member | null
  guestName: string | null
  displayName: string
  roleNames: string[]
  serviceRoleId: number
  slotNumber: number
}

function getWorshipServiceTypeRoles(type?: WorshipServiceType) {
  return type?.typeRoles ?? type?.requiredRoles ?? []
}

function getRoleGroupOrder(service: WorshipService): Map<number, number> {
  const order = new Map<number, number>()
  const typeRoles = getWorshipServiceTypeRoles(service.worshipServiceType)

  if (typeRoles.length > 0) {
    for (const typeRole of typeRoles) {
      order.set(typeRole.serviceRoleId, typeRole.sortOrder)
    }
    return order
  }

  let index = 0
  for (const assignment of service.assignments || []) {
    if (!order.has(assignment.serviceRoleId)) {
      order.set(assignment.serviceRoleId, index++)
    }
  }

  return order
}

function getAssignedVolunteers(service: WorshipService): AssignedVolunteer[] {
  const volunteers = new Map<string, AssignedVolunteer>()
  const roleGroupOrder = getRoleGroupOrder(service)

  for (const assignment of service.assignments || []) {
    if (!isAssignmentFilled(assignment)) continue

    const roleName = assignment.serviceRole?.name || 'Função'
    const guestName = assignment.guestName?.trim()

    if (guestName) {
      const guestKey = `guest:${guestName.toLowerCase()}`
      const existing = volunteers.get(guestKey)

      if (!existing) {
        volunteers.set(guestKey, {
          member: null,
          guestName,
          displayName: guestName,
          roleNames: [roleName],
          serviceRoleId: assignment.serviceRoleId,
          slotNumber: assignment.slotNumber,
        })
        continue
      }

      if (!existing.roleNames.includes(roleName)) {
        existing.roleNames.push(roleName)
      }

      if (assignment.slotNumber < existing.slotNumber) {
        existing.slotNumber = assignment.slotNumber
        existing.serviceRoleId = assignment.serviceRoleId
      }
      continue
    }

    if (!assignment.member) continue

    const memberKey = String(assignment.member.id)
    const existing = volunteers.get(memberKey)

    if (!existing) {
      volunteers.set(memberKey, {
        member: assignment.member,
        guestName: null,
        displayName: assignment.member.name,
        roleNames: [roleName],
        serviceRoleId: assignment.serviceRoleId,
        slotNumber: assignment.slotNumber,
      })
      continue
    }

    if (!existing.roleNames.includes(roleName)) {
      existing.roleNames.push(roleName)
    }

    if (assignment.slotNumber < existing.slotNumber) {
      existing.slotNumber = assignment.slotNumber
      existing.serviceRoleId = assignment.serviceRoleId
    }
  }

  return Array.from(volunteers.values()).sort((a, b) => {
    const roleOrderA = roleGroupOrder.get(a.serviceRoleId) ?? Number.MAX_SAFE_INTEGER
    const roleOrderB = roleGroupOrder.get(b.serviceRoleId) ?? Number.MAX_SAFE_INTEGER
    if (roleOrderA !== roleOrderB) return roleOrderA - roleOrderB
    if (a.serviceRoleId !== b.serviceRoleId) return a.serviceRoleId - b.serviceRoleId
    if (a.slotNumber !== b.slotNumber) return a.slotNumber - b.slotNumber
    return a.displayName.localeCompare(b.displayName, 'pt-BR')
  })
}

function progressPercent(service: WorshipService) {
  const total = totalSlots(service)
  if (total === 0) return 0
  return Math.round((filledSlots(service) / total) * 100)
}

function progressBarClass(service: WorshipService) {
  const total = totalSlots(service)
  const filled = filledSlots(service)
  if (total === 0 || filled === 0) return 'bg-neutral-200'
  if (filled >= total) return 'bg-green-500'
  return 'bg-amber-500'
}

function totalSlots(service: WorshipService) {
  return service.assignments?.length || 0
}

function filledSlots(service: WorshipService) {
  return service.assignments?.filter(isAssignmentFilled).length || 0
}

function goToDetail(service: WorshipService) {
  router.push(`/organizacao/escalas/${service.id}`)
}

function toDatetimeLocalValue(value: string) {
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toDateInputValue(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getNextWeekdayOccurrences(startFrom: Date, jsWeekday: number, count: number) {
  const dates: Date[] = []
  const cursor = new Date(startFrom)

  while (cursor.getDay() !== jsWeekday) {
    cursor.setDate(cursor.getDate() + 1)
  }

  while (dates.length < count) {
    dates.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 7)
  }

  return dates
}

function combineDateWithTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map((part) => Number(part))
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number.isNaN(hours) ? 19 : hours,
    Number.isNaN(minutes) ? 0 : minutes,
    0,
    0,
  )
}

function onCreateTemplateChange() {
  const template = selectedCreateTemplate.value
  if (template?.defaultWeekday) {
    createForm.value.weekday = template.defaultWeekday
  }
}

function getServiceActions(service: WorshipService): RowActionMenuItem[] {
  return [
    { label: 'Ver detalhes', icon: EyeIcon, onClick: () => goToDetail(service) },
    {
      label: 'Editar',
      icon: PencilIcon,
      hidden: !canManage.value,
      onClick: () => openEditModal(service),
    },
    {
      label: 'Excluir',
      icon: TrashIcon,
      variant: 'danger',
      hidden: !canManage.value,
      onClick: () => handleDeleteService(service),
    },
  ]
}

function openEditModal(service: WorshipService) {
  editingService.value = service
  editForm.value = {
    name: service.name || '',
    scheduledAt: toDatetimeLocalValue(service.scheduledAt),
    notes: service.notes || '',
  }
  formError.value = ''
  showEditModal.value = true
}

async function saveService() {
  if (!editingService.value) return
  saving.value = true
  formError.value = ''
  try {
    await organizationService.updateWorshipService(editingService.value.id, {
      name: editForm.value.name || undefined,
      scheduledAt: new Date(editForm.value.scheduledAt).toISOString(),
      notes: editForm.value.notes || undefined,
    })
    showEditModal.value = false
    editingService.value = null
    await loadServices()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao salvar culto'
  } finally {
    saving.value = false
  }
}

async function handleDeleteService(service: WorshipService) {
  const label = service.name || service.worshipServiceType?.name || 'este culto'
  await confirmDelete({
    message: `Tem certeza que deseja excluir "${label}"?`,
    onConfirm: async () => {
      await organizationService.deleteWorshipService(service.id)
      await loadServices()
    },
  })
}

async function handleClearMonth() {
  const count = monthStats.value.total
  await confirmDelete({
    title: 'Deletar cultos',
    message: `Tem certeza que deseja excluir todos os ${count} cultos de ${viewMonthLabel.value}?`,
    confirmLabel: 'Deletar',
    onConfirm: async () => {
      await organizationService.deleteWorshipServicesForMonth(
        Number(viewMonth.value),
        Number(viewYear.value),
      )
      await loadServices()
    },
  })
}

async function handleClearAssignments() {
  const cultos = monthStats.value.total
  const escalados = monthAssignedSlots.value
  await confirmAction({
    title: 'Limpar escalados',
    message: `Remover todos os membros escalados (${escalados} atribuições) dos ${cultos} cultos de ${viewMonthLabel.value}? Os cultos serão mantidos.`,
    variant: 'danger',
    confirmLabel: 'Limpar escalados',
    onConfirm: async () => {
      await organizationService.clearWorshipServiceAssignmentsForMonth(
        Number(viewMonth.value),
        Number(viewYear.value),
      )
      await loadServices()
    },
  })
}

function openExportModal() {
  exportFormError.value = ''
  exportFormat.value = 'png'
  exportRoleIds.value = exportRoleOptions.value.map((role) => role.value)
  showExportModal.value = true
}

async function exportSchedule() {
  if (exportingSchedule.value) return

  exportFormError.value = ''

  if (exportRoleIds.value.length === 0) {
    exportFormError.value = 'Selecione ao menos uma função para exportar'
    return
  }

  const servicesForPdf = buildWorshipSchedulePdfServices(services.value, exportRoleIds.value)
  if (servicesForPdf.length === 0) {
    exportFormError.value =
      'Nenhuma escala preenchida encontrada para as funções selecionadas'
    return
  }

  const selectedRolesLabel = exportRoleOptions.value
    .filter((role) => exportRoleIds.value.includes(role.value))
    .map((role) => role.label)
    .join(' / ')

  exportingSchedule.value = true
  pdfMonthLabel.value = viewMonthLabel.value
  pdfSelectedRolesLabel.value = selectedRolesLabel
  pdfServices.value = servicesForPdf
  showExportModal.value = false

  try {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 200))

    const element = pdfContainerRef.value?.querySelector(
      '.worship-schedule-month-pdf',
    ) as HTMLElement
    if (!element) {
      await showAlert('Erro ao preparar exportação. Tente recarregar a página.')
      return
    }

    const monthName =
      monthOptions.find((option) => option.value === viewMonth.value)?.label || viewMonth.value
    const baseFilename = `Escala_${monthName}_${viewYear.value}`

    if (exportFormat.value === 'pdf') {
      await generatePdfFromElement(element, {
        filename: `${baseFilename}.pdf`,
        orientation: 'portrait',
        pagebreakMode: ['css', 'legacy'],
      })
    } else {
      await generateImageFromElement(element, {
        filename: baseFilename,
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao exportar escala'
    await showAlert(`Erro ao exportar escala: ${message}`)
  } finally {
    exportingSchedule.value = false
    pdfServices.value = []
    pdfMonthLabel.value = ''
    pdfSelectedRolesLabel.value = ''
  }
}

async function loadServices() {
  loading.value = true
  error.value = ''
  try {
    services.value = await organizationService.getWorshipServices(
      Number(viewMonth.value),
      Number(viewYear.value),
    )
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar escalas'
  } finally {
    loading.value = false
  }
}

function prevMonth() {
  let month = Number(viewMonth.value) - 1
  let year = Number(viewYear.value)
  if (month < 1) {
    month = 12
    year -= 1
  }
  viewMonth.value = String(month)
  viewYear.value = String(year)
  loadServices()
}

function nextMonth() {
  let month = Number(viewMonth.value) + 1
  let year = Number(viewYear.value)
  if (month > 12) {
    month = 1
    year += 1
  }
  viewMonth.value = String(month)
  viewYear.value = String(year)
  loadServices()
}

async function loadTemplates() {
  templates.value = await organizationService.getWorshipServiceTypes()
}

function openCreateModal() {
  createForm.value = {
    worshipServiceTypeId: '',
    mode: 'single',
    scheduledAt: '',
    weekday: '',
    count: '4',
    startFrom: toDateInputValue(),
    name: '',
    createAsDraft: false,
  }
  formError.value = ''
  showCreateModal.value = true
}

function openGenerateServicesModal() {
  generateServicesForm.value = {
    month: viewMonth.value,
    year: viewYear.value,
    alsoGenerateAssignments: false,
    autoAssignRoleIds: [],
  }
  servicesEligibleMembers.value = []
  servicesIncludedMemberIds.value = []
  servicesMembersSectionOpen.value = false
  servicesRolesSectionOpen.value = true
  formError.value = ''
  showGenerateServicesModal.value = true
}

function openGenerateAssignmentsModal() {
  generateAssignmentsForm.value = {
    month: viewMonth.value,
    year: viewYear.value,
    autoAssignRoleIds: [],
  }
  assignmentsEligibleMembers.value = []
  assignmentsIncludedMemberIds.value = []
  assignmentsMembersSectionOpen.value = false
  assignmentsRolesSectionOpen.value = true
  formError.value = ''
  showGenerateAssignmentsModal.value = true
}

async function loadEligibleMembersForRoles(
  roleIds: number[],
): Promise<WorshipScheduleEligibleMember[]> {
  const byMember = new Map<number, WorshipScheduleEligibleMember>()

  for (const roleId of roleIds) {
    const members = await organizationService.getEligibleMembersForRole(roleId)
    const roleName = serviceRoles.value.find((role) => role.id === roleId)?.name || 'Função'

    for (const member of members) {
      const memberId = Number(member.id)
      const existing = byMember.get(memberId)
      if (existing) {
        if (!existing.roleNames.includes(roleName)) {
          existing.roleNames.push(roleName)
        }
        if (!existing.photoUrl && member.photoUrl) {
          existing.photoUrl = member.photoUrl
        }
        continue
      }

      byMember.set(memberId, {
        id: memberId,
        name: member.name,
        photoUrl: member.photoUrl,
        roleNames: [roleName],
      })
    }
  }

  return Array.from(byMember.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

async function refreshServicesEligibleMembers() {
  if (
    !generateServicesForm.value.alsoGenerateAssignments ||
    generateServicesForm.value.autoAssignRoleIds.length === 0
  ) {
    servicesEligibleMembers.value = []
    servicesIncludedMemberIds.value = []
    return
  }

  servicesEligibleMembersLoading.value = true
  try {
    const members = await loadEligibleMembersForRoles(generateServicesForm.value.autoAssignRoleIds)
    servicesEligibleMembers.value = members
    servicesIncludedMemberIds.value = members.map((member) => member.id)
  } catch {
    servicesEligibleMembers.value = []
    servicesIncludedMemberIds.value = []
  } finally {
    servicesEligibleMembersLoading.value = false
  }
}

async function refreshAssignmentsEligibleMembers() {
  if (generateAssignmentsForm.value.autoAssignRoleIds.length === 0) {
    assignmentsEligibleMembers.value = []
    assignmentsIncludedMemberIds.value = []
    return
  }

  assignmentsEligibleMembersLoading.value = true
  try {
    const members = await loadEligibleMembersForRoles(
      generateAssignmentsForm.value.autoAssignRoleIds,
    )
    assignmentsEligibleMembers.value = members
    assignmentsIncludedMemberIds.value = members.map((member) => member.id)
  } catch {
    assignmentsEligibleMembers.value = []
    assignmentsIncludedMemberIds.value = []
  } finally {
    assignmentsEligibleMembersLoading.value = false
  }
}

function buildExcludedMemberIds(
  eligibleMembers: WorshipScheduleEligibleMember[],
  includedMemberIds: number[],
): number[] | undefined {
  const includedSet = new Set(includedMemberIds)
  const excluded = eligibleMembers
    .filter((member) => !includedSet.has(member.id))
    .map((member) => member.id)

  return excluded.length > 0 ? excluded : undefined
}

watch(
  () => [
    generateServicesForm.value.alsoGenerateAssignments,
    [...generateServicesForm.value.autoAssignRoleIds].sort((a, b) => a - b).join(','),
  ],
  () => {
    if (!showGenerateServicesModal.value) return
    void refreshServicesEligibleMembers()
  },
)

watch(
  () => [...generateAssignmentsForm.value.autoAssignRoleIds].sort((a, b) => a - b).join(','),
  () => {
    if (!showGenerateAssignmentsModal.value) return
    void refreshAssignmentsEligibleMembers()
  },
)

async function runGenerationWithConfirmation<T extends { proceedWithWarnings?: boolean }>(
  buildPayload: (proceedWithWarnings?: boolean) => T,
  request: (payload: T) => Promise<GenerateWorshipServicesMonthResult>,
) {
  let result = await request(buildPayload())

  if (result.requiresConfirmation) {
    let confirmedResult: GenerateWorshipServicesMonthResult | null = null
    const confirmed = await confirmAction({
      title: 'Continuar geração?',
      message:
        result.warningMessage ||
        'Não há pessoas suficientes para repetições na mesma semana. Deseja continuar mesmo assim?',
      variant: 'primary',
      confirmLabel: 'Continuar',
      onConfirm: async () => {
        confirmedResult = await request(buildPayload(true))
      },
    })

    if (!confirmed || !confirmedResult) {
      return null
    }

    return confirmedResult
  }

  return result
}

function formatServiceDateTime(value: string) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildIncompleteServicesMessage(incompleteServices: AutoAssignIncompleteService[]) {
  if (!incompleteServices.length) return ''

  const lines = incompleteServices.map(
    (service) =>
      `• ${service.serviceName} — ${formatServiceDateTime(service.scheduledAt)}: ${service.missingCount === 1 ? '1 vaga' : `${service.missingCount} vagas`} de ${service.serviceRoleName}`,
  )

  return ['Os cultos a seguir ficaram com vagas sem membro:', ...lines].join('\n')
}

async function showAutoAssignResultMessage(result: GenerateWorshipServicesMonthResult) {
  if (!result.autoAssign || result.autoAssign.totalSlots === 0) return

  const { assignedSlots, totalSlots, incompleteServices } = result.autoAssign
  const notAssigned = totalSlots - assignedSlots

  if (notAssigned > 0) {
    const details = buildIncompleteServicesMessage(incompleteServices)
    const message = [
      `${assignedSlots} de ${totalSlots} vagas foram atribuídas automaticamente.`,
      details,
    ]
      .filter(Boolean)
      .join('\n\n')

    await showAlert({
      title: 'Atribuição automática',
      message,
    })
    return
  }

  await showAlert({
    title: 'Atribuição automática',
    message: `Atribuição automática concluída: ${assignedSlots} vaga(s) preenchidas.`,
  })
}

async function generateServices() {
  saving.value = true
  formError.value = ''

  try {
    if (
      generateServicesForm.value.alsoGenerateAssignments &&
      generateServicesForm.value.autoAssignRoleIds.length === 0
    ) {
      formError.value = 'Selecione ao menos uma função para gerar escalas'
      return
    }

    const result = await runGenerationWithConfirmation(
      (proceedWithWarnings) => ({
        month: Number(generateServicesForm.value.month),
        year: Number(generateServicesForm.value.year),
        autoAssignRoleIds: generateServicesForm.value.alsoGenerateAssignments
          ? generateServicesForm.value.autoAssignRoleIds
          : undefined,
        excludedMemberIds: generateServicesForm.value.alsoGenerateAssignments
          ? buildExcludedMemberIds(
              servicesEligibleMembers.value,
              servicesIncludedMemberIds.value,
            )
          : undefined,
        proceedWithWarnings,
      }),
      (payload) => organizationService.generateWorshipServicesForMonth(payload),
    )

    if (!result) return

    viewMonth.value = generateServicesForm.value.month
    viewYear.value = generateServicesForm.value.year
    showGenerateServicesModal.value = false
    await loadServices()
    await showAutoAssignResultMessage(result)
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao gerar cultos'
  } finally {
    saving.value = false
  }
}

async function generateAssignments() {
  saving.value = true
  formError.value = ''

  try {
    if (generateAssignmentsForm.value.autoAssignRoleIds.length === 0) {
      formError.value = 'Selecione ao menos uma função para gerar escalas'
      return
    }

    const result = await runGenerationWithConfirmation(
      (proceedWithWarnings) => ({
        month: Number(generateAssignmentsForm.value.month),
        year: Number(generateAssignmentsForm.value.year),
        autoAssignRoleIds: generateAssignmentsForm.value.autoAssignRoleIds,
        excludedMemberIds: buildExcludedMemberIds(
          assignmentsEligibleMembers.value,
          assignmentsIncludedMemberIds.value,
        ),
        proceedWithWarnings,
      }),
      (payload) => organizationService.generateWorshipAssignmentsForMonth(payload),
    )

    if (!result) return

    viewMonth.value = generateAssignmentsForm.value.month
    viewYear.value = generateAssignmentsForm.value.year
    showGenerateAssignmentsModal.value = false
    await loadServices()
    await showAutoAssignResultMessage(result)
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao gerar escalas'
  } finally {
    saving.value = false
  }
}

async function createService() {
  saving.value = true
  formError.value = ''
  try {
    if (!createForm.value.worshipServiceTypeId) {
      formError.value = 'Selecione um modelo'
      return
    }

    if (createForm.value.mode === 'weekday') {
      if (!createForm.value.weekday) {
        formError.value = 'Selecione o dia da semana'
        return
      }

      const count = Number(createForm.value.count)
      if (!Number.isFinite(count) || count < 1 || count > 52) {
        formError.value = 'Informe uma quantidade entre 1 e 52'
        return
      }

      const created = await organizationService.createWorshipServicesFromTemplateByWeekday({
        worshipServiceTypeId: Number(createForm.value.worshipServiceTypeId),
        count,
        weekday: createForm.value.weekday,
        startFrom: createForm.value.startFrom
          ? new Date(`${createForm.value.startFrom}T00:00:00`).toISOString()
          : undefined,
        name: createForm.value.name || undefined,
        asDraft: createForm.value.createAsDraft,
      })

      showCreateModal.value = false
      await loadServices()

      if (created.length === 1) {
        router.push(`/organizacao/escalas/${created[0].id}`)
      }
      return
    }

    if (!createForm.value.scheduledAt) {
      formError.value = 'Informe a data e hora'
      return
    }

    const scheduledAt = new Date(createForm.value.scheduledAt).toISOString()
    const service = await organizationService.createWorshipServiceFromTemplate({
      worshipServiceTypeId: Number(createForm.value.worshipServiceTypeId),
      scheduledAt,
      name: createForm.value.name || undefined,
      asDraft: createForm.value.createAsDraft,
    })
    showCreateModal.value = false
    await loadServices()
    router.push(`/organizacao/escalas/${service.id}`)
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao criar culto'
  } finally {
    saving.value = false
  }
}

async function loadServiceRoles() {
  serviceRoles.value = await organizationService.getServiceRoles()
}

onMounted(async () => {
  await Promise.all([loadServices(), loadTemplates(), loadServiceRoles()])
})
</script>
