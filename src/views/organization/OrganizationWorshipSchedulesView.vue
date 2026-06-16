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
        <button
          v-if="canManage"
          type="button"
          class="btn btn-secondary w-full sm:w-auto"
          @click="openGenerateModal()"
        >
          <SparklesIcon class="w-4 h-4 mr-2" />
          Gerar mês
        </button>
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

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
      <div class="flex items-center justify-start gap-4 px-6 py-5 border-b border-neutral-100">
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

      <div v-if="loading" class="p-12 text-center">
        <div
          class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"
        ></div>
        <p class="text-sm text-neutral-500">Carregando escalas...</p>
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
                      <div
                        v-for="(volunteer, index) in getAssignedVolunteers(service).slice(0, 4)"
                        :key="`${service.id}-${volunteer.id}-${index}`"
                        :class="[
                          'flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold',
                          getAvatarColor(volunteer.name),
                        ]"
                        :title="volunteer.name"
                      >
                        {{ getInitials(volunteer.name) }}
                      </div>
                    </div>
                    <span
                      v-if="getAssignedVolunteers(service).length > 4"
                      class="text-xs font-medium text-neutral-500"
                    >
                      +{{ getAssignedVolunteers(service).length - 4 }}
                    </span>
                  </template>
                  <span v-else class="text-xs text-neutral-400 whitespace-nowrap">Sem voluntários</span>
                </div>

                <div class="flex items-center gap-2 shrink-0 w-[88px]">
                  <div class="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      :class="['h-full rounded-full transition-all', progressBarClass(service)]"
                      :style="{ width: `${progressPercent(service)}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-semibold text-neutral-600 tabular-nums whitespace-nowrap">
                    {{ filledSlots(service) }}/{{ totalSlots(service) }}
                  </span>
                </div>
              </div>

              <ChevronRightIcon class="w-4 h-4 text-neutral-300 shrink-0 group-hover:text-neutral-400" />

              <button
                v-if="canManage"
                type="button"
                class="p-1 text-neutral-300 hover:text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors shrink-0"
                aria-label="Opções da escala"
                @click.stop="toggleServiceRowMenu(service.id, $event)"
              >
                <EllipsisVerticalIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="openServiceRowMenuId && serviceRowMenuStyle"
        class="service-row-menu fixed z-[10000] w-44 bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
        :style="serviceRowMenuStyle"
        @click.stop
      >
        <button
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          @click="handleViewServiceFromMenu"
        >
          <EyeIcon class="w-4 h-4 text-neutral-500 shrink-0" />
          Ver detalhes
        </button>
        <button
          v-if="canManage"
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          @click="handleEditServiceFromMenu"
        >
          <PencilIcon class="w-4 h-4 text-neutral-500 shrink-0" />
          Editar
        </button>
        <button
          v-if="canManage"
          type="button"
          class="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          @click="handleDeleteServiceFromMenu"
        >
          <TrashIcon class="w-4 h-4 shrink-0" />
          Excluir
        </button>
      </div>
    </Teleport>

    <!-- Edit service -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">Editar Culto</h2>
        <form class="space-y-4" @submit.prevent="saveService">
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

    <!-- Create from template -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div class="px-6 pt-6 pb-4 shrink-0">
          <h2 class="text-lg font-semibold text-neutral-900">Novo Culto</h2>
        </div>
        <form class="flex flex-col min-h-0 flex-1" @submit.prevent="createService">
          <div class="overflow-y-auto px-6 space-y-4 flex-1 min-h-0">
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
                <p v-if="selectedCreateTemplate?.defaultWeekday" class="text-xs text-neutral-500 mt-1">
                  Padrão do modelo: {{ selectedCreateTemplate.defaultWeekday }}
                </p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-neutral-700 mb-1">Quantidade</label>
                  <Input
                    v-model="createForm.count"
                    type="number"
                    min="1"
                    max="52"
                    required
                  />
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

            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="createForm.createAsDraft"
                type="checkbox"
                class="mt-0.5 w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span>
                <span class="block text-sm font-medium text-neutral-700 mb-5">Criar como rascunho</span>
              </span>
            </label>
          </div>
          <div class="shrink-0 px-6 py-4 border-t border-neutral-100">
            <p v-if="formError" class="text-sm text-red-600 mb-3">{{ formError }}</p>
            <div class="flex justify-end gap-2">
              <button type="button" class="btn btn-secondary" @click="showCreateModal = false">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ createSubmitLabel }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Generate month -->
    <div
      v-if="showGenerateModal"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 class="text-lg font-semibold text-neutral-900 mb-4">Gerar Escalas do Mês</h2>
        <p class="text-sm text-neutral-500 mb-4">
          Cria instâncias de culto para todos os modelos ativos com dia padrão configurado.
        </p>
        <form class="space-y-4" @submit.prevent="generateMonth">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Mês</label>
              <Select v-model="generateForm.month" :options="monthOptions" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Ano</label>
              <Select v-model="generateForm.year" :options="yearOptions" />
            </div>
          </div>
          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn btn-secondary" @click="showGenerateModal = false">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Gerando...' : 'Gerar' }}
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
import {
  PlusIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import Input from '@/components/Input.vue'
import Select from '@/components/Select.vue'
import {
  organizationService,
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

const ROW_MENU_WIDTH = 176
const ROW_MENU_HEIGHT = 132

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

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
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

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showGenerateModal = ref(false)
const editingService = ref<WorshipService | null>(null)
const openServiceRowMenuId = ref<number | null>(null)
const serviceRowMenuStyle = ref<{ top: string; left: string } | null>(null)

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

const generateForm = ref({
  month: String(now.getMonth() + 1),
  year: String(now.getFullYear()),
})

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

function getAssignedVolunteers(service: WorshipService): Member[] {
  const volunteers = new Map<string, Member>()
  for (const assignment of service.assignments || []) {
    if (assignment.member) {
      volunteers.set(String(assignment.member.id), assignment.member)
    }
  }
  return Array.from(volunteers.values())
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
  return (
    service.assignments?.filter((a) => a.memberId || a.servingGroupId).length || 0
  )
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

function closeServiceRowMenu() {
  openServiceRowMenuId.value = null
  serviceRowMenuStyle.value = null
}

function toggleServiceRowMenu(serviceId: number, event: MouseEvent) {
  if (openServiceRowMenuId.value === serviceId) {
    closeServiceRowMenu()
    return
  }

  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  let top = rect.bottom + 4
  let left = rect.right - ROW_MENU_WIDTH
  const menuHeight = canManage.value ? ROW_MENU_HEIGHT : 44

  if (top + menuHeight > window.innerHeight - 8) {
    top = rect.top - menuHeight - 4
  }

  if (left < 8) {
    left = 8
  }

  openServiceRowMenuId.value = serviceId
  serviceRowMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

function handleViewServiceFromMenu() {
  const service = services.value.find((item) => item.id === openServiceRowMenuId.value)
  closeServiceRowMenu()
  if (service) {
    goToDetail(service)
  }
}

function handleEditServiceFromMenu() {
  const service = services.value.find((item) => item.id === openServiceRowMenuId.value)
  closeServiceRowMenu()
  if (service) {
    openEditModal(service)
  }
}

async function handleDeleteServiceFromMenu() {
  const service = services.value.find((item) => item.id === openServiceRowMenuId.value)
  closeServiceRowMenu()
  if (service) {
    await handleDeleteService(service)
  }
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
  if (!confirm(`Excluir "${label}"?`)) return
  try {
    await organizationService.deleteWorshipService(service.id)
    await loadServices()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao excluir culto'
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (
    !target.closest('[aria-label="Opções da escala"]') &&
    !target.closest('.service-row-menu')
  ) {
    closeServiceRowMenu()
  }
}

function handleScroll() {
  if (openServiceRowMenuId.value) {
    closeServiceRowMenu()
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

function openGenerateModal() {
  generateForm.value = {
    month: viewMonth.value,
    year: viewYear.value,
  }
  formError.value = ''
  showGenerateModal.value = true
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

async function generateMonth() {
  saving.value = true
  formError.value = ''
  try {
    await organizationService.generateWorshipServicesForMonth(
      Number(generateForm.value.month),
      Number(generateForm.value.year),
    )
    viewMonth.value = generateForm.value.month
    viewYear.value = generateForm.value.year
    showGenerateModal.value = false
    await loadServices()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Erro ao gerar escalas'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadServices(), loadTemplates()])
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
})
</script>
