<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  financesService,
  type FinancialTransaction,
  type FinancialTransactionType,
  type MonthlySummary,
} from '@/services/finances'
import DataTable, { type TableHeader } from '@/components/DataTable.vue'
import Select from '@/components/Select.vue'
import Input from '@/components/Input.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const loading = ref(true)
const error = ref<string | null>(null)

const transactions = ref<FinancialTransaction[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const filterFromDate = ref<Date | null>(null)
const filterToDate = ref<Date | null>(null)
const typeFilter = ref<FinancialTransactionType | ''>('')
const categoryFilter = ref('')

const typeFilterOptions = [
  { value: '', label: 'Todos' },
  { value: 'Entrada', label: 'Entrada' },
  { value: 'Saída', label: 'Saída' },
]

const formTypeOptions = [
  { value: 'Entrada', label: 'Entrada' },
  { value: 'Saída', label: 'Saída' },
]

function dateToIsoDate(d: Date | null): string {
  if (!d) return ''
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const showForm = ref(false)
const saving = ref(false)

const monthlySummary = ref<MonthlySummary | null>(null)
const summaryLoading = ref(false)

const form = ref<{
  date: Date | null
  type: FinancialTransactionType
  category: string
  amount: number | null
  description: string
}>({
  date: startOfToday(),
  type: 'Entrada',
  category: '',
  amount: null,
  description: '',
})

const tableHeaders: TableHeader<FinancialTransaction>[] = [
  { key: 'date', label: 'Data', align: 'left', sortable: true },
  { key: 'type', label: 'Tipo', align: 'left' },
  { key: 'category', label: 'Categoria', align: 'left' },
  { key: 'description', label: 'Descrição', align: 'left' },
  { key: 'amount', label: 'Valor', align: 'right' },
]

const paginationInfo = computed(() => {
  const totalPages = Math.max(1, Math.ceil(total.value / limit.value) || 1)
  return {
    currentPage: page.value,
    totalPages,
    totalItems: total.value,
    itemsPerPage: limit.value,
  }
})

async function loadTransactions() {
  try {
    loading.value = true
    error.value = null
    const response = await financesService.getTransactions({
      page: page.value,
      limit: limit.value,
      fromDate: dateToIsoDate(filterFromDate.value) || undefined,
      toDate: dateToIsoDate(filterToDate.value) || undefined,
      type: (typeFilter.value as FinancialTransactionType) || undefined,
      category: categoryFilter.value || undefined,
    })
    transactions.value = response.data
    total.value = response.total
  } catch (err) {
    console.error('Error loading transactions:', err)
    error.value = 'Erro ao carregar transações financeiras.'
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  try {
    summaryLoading.value = true
    const today = new Date()
    const month = today.getMonth() + 1
    const year = today.getFullYear()
    monthlySummary.value = await financesService.getMonthlySummary(month, year)
  } catch (err) {
    console.error('Error loading finance summary:', err)
  } finally {
    summaryLoading.value = false
  }
}

function resetForm() {
  form.value = {
    date: startOfToday(),
    type: 'Entrada',
    category: '',
    amount: null,
    description: '',
  }
}

async function handleCreateTransaction() {
  if (!form.value.amount || form.value.amount <= 0 || !form.value.date) {
    return
  }
  try {
    saving.value = true
    await financesService.createTransaction({
      date: dateToIsoDate(form.value.date),
      type: form.value.type,
      category: form.value.category,
      amount: form.value.amount,
      description: form.value.description || undefined,
    })
    showForm.value = false
    resetForm()
    await loadTransactions()
    await loadSummary()
  } catch (err) {
    console.error('Error creating transaction:', err)
    error.value = 'Erro ao salvar transação financeira.'
  } finally {
    saving.value = false
  }
}

function handlePageChange(newPage: number) {
  page.value = newPage
  loadTransactions()
}

onMounted(() => {
  loadTransactions()
  loadSummary()
})

async function handleExportExcel() {
  try {
    const today = new Date()
    const month = today.getMonth() + 1
    const year = today.getFullYear()
    const blob = await financesService.downloadMonthlyExcel(month, year)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `finance-${year}-${String(month).padStart(2, '0')}.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Error exporting Excel:', err)
    error.value = 'Erro ao exportar Excel.'
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-neutral-900 font-medium text-[28px]">Finanças</h1>
        <p class="text-neutral-500 text-sm">Controle de entradas e saídas financeiras da igreja</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn btn-secondary" @click="handleExportExcel">
          Exportar Excel
        </button>
        <button class="btn btn-primary" @click="showForm = true">
          Nova transação
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" v-if="monthlySummary">
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-neutral-500">Receitas do mês</p>
        <p class="text-2xl font-semibold text-green-700 mt-1">
          {{
            monthlySummary.totalIncome.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })
          }}
        </p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-neutral-500">Despesas do mês</p>
        <p class="text-2xl font-semibold text-red-700 mt-1">
          {{
            monthlySummary.totalExpense.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })
          }}
        </p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <p class="text-sm text-neutral-500">Saldo do mês</p>
        <p
          class="text-2xl font-semibold mt-1"
          :class="monthlySummary.netBalance >= 0 ? 'text-green-700' : 'text-red-700'"
        >
          {{
            monthlySummary.netBalance.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })
          }}
        </p>
      </div>
    </div>

    <div class="finance-dp bg-white rounded-lg shadow p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">De</label>
          <VueDatePicker
            v-model="filterFromDate"
            :enable-time-picker="false"
            placeholder="dd/mm/aaaa"
            format="dd/MM/yyyy"
            locale="pt-BR"
            select-text="Selecionar"
            cancel-text="Cancelar"
            class="w-full"
            @update:model-value="loadTransactions"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">Até</label>
          <VueDatePicker
            v-model="filterToDate"
            :enable-time-picker="false"
            placeholder="dd/mm/aaaa"
            format="dd/MM/yyyy"
            locale="pt-BR"
            select-text="Selecionar"
            cancel-text="Cancelar"
            class="w-full"
            @update:model-value="loadTransactions"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">Tipo</label>
          <Select
            v-model="typeFilter"
            :options="typeFilterOptions"
            placeholder="Todos"
            @update:model-value="loadTransactions"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-neutral-700 mb-2">Categoria</label>
          <Input
            v-model="categoryFilter"
            placeholder="Ex: Dízimos, Ofertas, Aluguel"
            @keyup.enter="loadTransactions"
          />
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <h3 class="text-lg font-medium text-neutral-900">Transações</h3>
        <span class="text-sm text-neutral-500">Total: {{ total }}</span>
      </div>

      <div v-if="error" class="px-6 py-4">
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>
      </div>

      <DataTable
        v-else
        :data="transactions"
        :headers="tableHeaders"
        :is-loading="loading"
        :pagination="paginationInfo"
        row-key="id"
        min-width="800px"
        @page-change="handlePageChange"
      >
        <template #column-date="{ item }">
          {{ new Date(item.date).toLocaleDateString('pt-BR') }}
        </template>
        <template #column-type="{ item }">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              item.type === 'Entrada'
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800',
            ]"
          >
            {{ item.type }}
          </span>
        </template>
        <template #column-amount="{ item }">
          <span class="font-medium" :class="item.type === 'Entrada' ? 'text-green-700' : 'text-red-700'">
            {{
              Number(item.amount).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            }}
          </span>
        </template>
      </DataTable>
    </div>

    <div
      v-if="showForm"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      @click.self="showForm = false"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 class="text-xl font-semibold text-neutral-900 mb-4">Nova transação</h2>

        <div class="finance-dp space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Data</label>
            <VueDatePicker
              v-model="form.date"
              :enable-time-picker="false"
              placeholder="dd/mm/aaaa"
              format="dd/MM/yyyy"
              locale="pt-BR"
              select-text="Selecionar"
              cancel-text="Cancelar"
              class="w-full"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">Tipo</label>
              <Select v-model="form.type" :options="formTypeOptions" placeholder="Tipo" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">Valor</label>
              <Input
                :model-value="form.amount ?? ''"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                input-class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                @update:model-value="
                  (v) => {
                    form.amount =
                      v === '' || v === null || v === undefined ? null : Number(v)
                  }
                "
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Categoria</label>
            <Input v-model="form.category" placeholder="Ex: Dízimos, Ofertas" />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-2">Descrição</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-3 py-2.5 border border-inputBorder rounded-lg text-sm text-gray-800 bg-white transition-colors placeholder:text-txt-light"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button class="btn btn-secondary" @click="showForm = false" :disabled="saving">
            Cancelar
          </button>
          <button class="btn btn-primary" @click="handleCreateTransaction" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * @vuepic/vue-datepicker loads its CSS after Tailwind, so utility classes on `ui.input`
 * often lose the cascade. Match Input.vue / Select.vue (text-sm + py-2.5) via the
 * picker’s own CSS variables and a direct input min-height.
 */
.finance-dp :deep(.dp__main) {
  --dp-font-size: 0.875rem;
  /* default was 6px 30px 6px 12px — increase vertical padding only */
  --dp-input-padding: 10px 30px 10px 12px;
}

.finance-dp :deep(.dp__input) {
  min-height: 42px;
  box-sizing: border-box;
}
</style>
