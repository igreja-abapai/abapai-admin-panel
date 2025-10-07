<template>
  <div>
    <div v-if="loading" class="text-sm text-neutral-500 mb-2">Carregando...</div>
    <div v-if="error" class="text-sm text-red-600 mb-2">{{ error }}</div>

    <div class="space-y-3">
      <div
        v-for="(event, idx) in rows"
        :key="event._key"
        class="bg-white border border-neutral-200 rounded-lg p-4 grid grid-cols-12 gap-3 items-end shadow-sm"
      >
        <!-- Row 1: time + title -->
        <div class="col-span-12 md:col-span-3">
          <label class="block text-sm font-medium text-neutral-700 mb-1">Horário</label>
          <input
            v-model="event.time"
            type="text"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            placeholder="Ex: 6H00"
          />
        </div>
        <div class="col-span-12 md:col-span-9">
          <label class="block text-sm font-medium text-neutral-700 mb-1">Título</label>
          <input
            v-model="event.name"
            type="text"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            placeholder="Ex: Culto Matutino"
          />
        </div>
        <!-- Row 2: days + actions -->
        <div class="col-span-12 md:col-span-9">
          <label class="block text-sm font-medium text-neutral-700 mb-1">Dias</label>
          <input
            v-model="event.days"
            type="text"
            class="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            placeholder="Ex: Segunda à sexta"
          />
        </div>
        <div class="col-span-12 md:col-span-3 mb-1 flex items-center gap-2 justify-start md:mt-0">
          <button
            @click="moveUp(idx)"
            class="px-2 py-1 rounded border border-neutral-300 text-sm"
            title="Subir"
          >
            ▲
          </button>
          <button
            @click="moveDown(idx)"
            class="px-2 py-1 rounded border border-neutral-300 text-sm"
            title="Descer"
          >
            ▼
          </button>
          <button
            @click="removeRow(idx, event)"
            class="px-2 py-1 rounded bg-red-100 text-red-700 text-sm"
            title="Remover"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-end">
      <button
        @click="addRow"
        class="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
      >
        Adicionar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, defineExpose } from 'vue'
import {
  scheduleEventsService,
  type ScheduleEvent,
  type CreateScheduleEventRequest,
  type UpdateScheduleEventRequest,
} from '@/services/schedule-events'

type EditableRow = {
  _key: string
  id?: number
  name: string
  time: string
  days: string | string[]
  position: number
}

const rows = reactive<EditableRow[]>([])
const loading = ref(false)
const error = ref('')

function toEditable(e: ScheduleEvent): EditableRow {
  return {
    _key: `${e.id}-${Math.random().toString(36).slice(2, 8)}`,
    id: e.id,
    name: e.name,
    time: e.time,
    days: Array.isArray(e.days) ? e.days.join(', ') : (e.days as string),
    position: e.position ?? 0,
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await scheduleEventsService.list()
    rows.splice(0, rows.length, ...data.sort((a, b) => a.position - b.position).map(toEditable))
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erro ao carregar programação'
  } finally {
    loading.value = false
  }
}

function addRow() {
  rows.push({ _key: `new-${Date.now()}`, name: '', time: '', days: '', position: rows.length })
}

function moveUp(index: number) {
  if (index <= 0) return
  const [item] = rows.splice(index, 1)
  rows.splice(index - 1, 0, item)
}

function moveDown(index: number) {
  if (index >= rows.length - 1) return
  const [item] = rows.splice(index, 1)
  rows.splice(index + 1, 0, item)
}

async function removeRow(index: number, row: EditableRow) {
  if (row.id) {
    try {
      await scheduleEventsService.remove(row.id)
    } catch {}
  }
  rows.splice(index, 1)
}

function toPayload(
  row: EditableRow,
  position: number,
): CreateScheduleEventRequest | UpdateScheduleEventRequest {
  const days = typeof row.days === 'string' ? row.days : row.days.join(', ')
  return { name: row.name, time: row.time, days, position }
}

async function save() {
  error.value = ''
  try {
    // Persist each row in current order
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const payload = toPayload(row, i)
      if (row.id) {
        await scheduleEventsService.update(row.id, payload)
      } else {
        const created = await scheduleEventsService.create(payload as CreateScheduleEventRequest)
        row.id = created.id
      }
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Erro ao salvar programação'
  } finally {
    await load()
  }
}

onMounted(load)

defineExpose({ save, load })
</script>
