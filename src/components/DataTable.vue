<template>
  <div>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse" :class="minWidthClass">
        <thead>
          <tr>
            <!-- Batch Selection Header -->
            <th v-if="showBatchActions" scope="col" class="relative w-12 px-6 sm:w-16 sm:px-8">
              <input
                ref="checkboxAll"
                type="checkbox"
                class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                :checked="allCurrentPageSelected"
                :indeterminate="indeterminate"
                @change="toggleAll"
              />
            </th>
            <th
              v-for="(header, idx) in headers"
              :key="idx"
              scope="col"
              :class="[getHeaderClasses(header), columnWidths[idx], idx === 0 ? 'pl-6' : '']"
              @click="header.sortable && header.sortKey && handleSort(header.sortKey)"
            >
              <div :class="getHeaderContentClasses(header)">
                {{ header.label }}
                <span v-if="header.sortable" class="ml-2">
                  <svg
                    v-if="header.sortDirection === 'desc'"
                    class="h-4 w-4 text-neutral-600 mb-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <svg
                    v-else-if="header.sortDirection === 'asc'"
                    class="h-4 w-4 text-neutral-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <svg
                    v-else
                    class="h-4 w-4 text-neutral-400 hover:text-neutral-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm0 14a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3A1 1 0 0110 17z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </th>
            <th
              v-if="hasActions"
              scope="col"
              :class="[
                'px-4 py-3 text-right text-sm font-semibold text-neutral-600 bg-neutral-50 border-b border-neutral-200',
                actionsColumnWidth,
              ]"
            ></th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <tr v-if="isLoading">
            <td :colspan="colspan" class="px-3 md:px-4 py-6 md:py-8 text-center">
              <div class="flex justify-center items-center">
                <LoadingSpinner :size="28" />
              </div>
            </td>
          </tr>
          <!-- Empty State -->
          <tr v-else-if="!data || data.length === 0">
            <td :colspan="colspan" class="px-3 md:px-4 py-6 md:py-8 text-center text-neutral-500">
              <slot name="empty">
                <p>Nenhum item encontrado</p>
              </slot>
            </td>
          </tr>
          <!-- Data Rows -->
          <template v-else>
            <tr
              v-for="(item, idx) in data"
              :key="getRowKey(item, idx)"
              :class="[
                'transition-colors duration-200',
                selectedItems.includes(getRowId(item)) ? 'bg-primary-50' : 'hover:bg-neutral-50',
                clickable ? 'cursor-pointer' : '',
              ]"
              @click="clickable && handleRowClick(item)"
            >
              <!-- Batch Selection Cell -->
              <td v-if="showBatchActions" class="relative w-12 px-6 sm:w-16 sm:px-8">
                <input
                  v-if="isItemSelectable(item)"
                  type="checkbox"
                  :checked="isItemSelected(getRowId(item))"
                  class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  @change="toggleItemSelection(getRowId(item))"
                  @click.stop
                />
              </td>
              <!-- Data Cells -->
              <td
                v-for="(header, headerIdx) in headers"
                :key="headerIdx"
                :class="[
                  getCellClasses(header, headerIdx),
                  columnWidths[headerIdx],
                  headerIdx === 0 ? 'pl-6' : '',
                ]"
                @click="header.clickable && handleCellClick(item, header)"
              >
                <!-- Custom Column Content -->
                <div
                  v-if="$slots[`column-${String(header.key)}`]"
                  :class="getCellWrapperClasses(header)"
                >
                  <slot
                    :name="`column-${String(header.key)}`"
                    :value="getValue(item, header.key)"
                    :item="item"
                    :header="header"
                  />
                </div>
                <!-- Default Cell Rendering -->
                <div v-else class="truncate" :class="getCellContentClasses(header)">
                  {{ formatValue(getValue(item, header.key), header) }}
                </div>
              </td>
              <!-- Actions Cell -->
              <td
                v-if="hasActions"
                :class="[
                  'px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right border-b border-neutral-200',
                  actionsColumnWidth,
                ]"
              >
                <div class="flex gap-0.5 md:gap-1 justify-end whitespace-nowrap">
                  <slot name="actions" :item="item" :index="idx" />
                  <button
                    v-if="showDeleteButton && isDeletable(item)"
                    type="button"
                    class="inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                    @click.stop="handleDelete(item)"
                    title="Excluir"
                  >
                    <TrashIcon class="text-xs md:text-sm" />
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <!-- Pagination -->
    <div v-if="pagination" class="mt-5 flex items-center justify-between px-6 py-1 pb-6">
      <span class="text-sm text-neutral-600">
        Página {{ pagination.currentPage }} de {{ pagination.totalPages }}
      </span>
      <div class="flex items-center gap-2">
        <button
          class="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          :disabled="pagination.currentPage === 1"
          @click="handlePageChange(pagination.currentPage - 1)"
        >
          Anterior
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-md hover:bg-primary-700 transition-colors"
          disabled
        >
          {{ pagination.currentPage }}
        </button>
        <button
          class="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          :disabled="pagination.currentPage === pagination.totalPages"
          @click="handlePageChange(pagination.currentPage + 1)"
        >
          Próximo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed, watch } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from './LoadingSpinner.vue'

// Types
export interface TableHeader<T = any> {
  key: keyof T | string
  label: string
  sortable?: boolean
  sortKey?: string
  sortDirection?: 'asc' | 'desc' | 'none'
  align?: 'left' | 'center' | 'right'
  width?: string | number // Support both Tailwind classes and fractional numbers
  clickable?: boolean
  formatter?: (value: any) => string
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage?: number
}

export interface DataTableProps<T = any> {
  data: T[]
  headers: TableHeader<T>[]
  isLoading?: boolean
  pagination?: PaginationInfo
  showBatchActions?: boolean
  showDeleteButton?: boolean
  showActions?: boolean
  clickable?: boolean
  minWidth?: string
  rowKey?: keyof T | ((item: T, index: number) => string | number)
  deletableKey?: keyof T | string
  selectableKey?: keyof T | string
}

// Props
const props = withDefaults(defineProps<DataTableProps<T>>(), {
  isLoading: false,
  showBatchActions: false,
  showDeleteButton: false,
  showActions: true,
  clickable: false,
  minWidth: '1000px',
  rowKey: () => 'id',
})

// Emits
const emit = defineEmits<{
  (e: 'sort', sortKey: string): void
  (e: 'pageChange', page: number): void
  (e: 'rowClick', item: T): void
  (e: 'cellClick', item: T, header: TableHeader<T>): void
  (e: 'delete', item: T): void
  (e: 'batchSelectionChange', selectedItems: (string | number)[]): void
}>()

// Slots
defineSlots<{
  [key: `column-${string}`]: (props: { value: any; item: T; header: TableHeader<T> }) => void
  actions: (props: { item: T; index: number }) => void
  empty: () => void
}>()

// Refs
const checkboxAll = ref<HTMLInputElement>()
const selectedItems = ref<(string | number)[]>([])

// Computed
const minWidthClass = computed(() => `min-w-[${props.minWidth}]`)

const hasActions = computed(() => {
  return props.showActions || props.showDeleteButton
})

// Calculate column widths with flexible system
const columnWidths = computed(() => {
  const headers = props.headers || []
  const totalColumns =
    headers.length + (props.showBatchActions ? 1 : 0) + (hasActions.value ? 1 : 0)

  // Calculate fixed widths and remaining space
  let fixedWidthSum = 0
  let flexibleColumns = 0
  const widths: string[] = []

  // Process each header
  headers.forEach((header) => {
    if (header.width) {
      if (typeof header.width === 'number') {
        // Fractional width (e.g., 0.1 = 10%)
        const percentage = Math.round(header.width * 100)
        widths.push(`w-[${percentage}%]`)
        fixedWidthSum += header.width
      } else {
        // Tailwind class (e.g., 'w-1/6')
        widths.push(header.width)
        // Estimate width from Tailwind class
        if (header.width.includes('1/12')) fixedWidthSum += 1 / 12
        else if (header.width.includes('1/6')) fixedWidthSum += 1 / 6
        else if (header.width.includes('1/5')) fixedWidthSum += 1 / 5
        else if (header.width.includes('1/4')) fixedWidthSum += 1 / 4
        else if (header.width.includes('1/3')) fixedWidthSum += 1 / 3
        else if (header.width.includes('1/2')) fixedWidthSum += 1 / 2
        else if (header.width.includes('2/3')) fixedWidthSum += 2 / 3
        else if (header.width.includes('3/4')) fixedWidthSum += 3 / 4
        else if (header.width.includes('4/5')) fixedWidthSum += 4 / 5
        else if (header.width.includes('5/6')) fixedWidthSum += 5 / 6
        else if (header.width.includes('11/12')) fixedWidthSum += 11 / 12
        else if (header.width.includes('w-')) {
          // Custom width class, assume it's fixed
          fixedWidthSum += 0.1 // Small fixed amount
        }
      }
    } else {
      flexibleColumns++
    }
  })

  // Calculate remaining space for flexible columns
  const remainingSpace = Math.max(0, 1 - fixedWidthSum)
  const flexibleWidth = flexibleColumns > 0 ? remainingSpace / flexibleColumns : 0

  // Fill in flexible widths
  const result: string[] = []
  let flexibleIndex = 0
  headers.forEach((header, index) => {
    if (header.width) {
      if (typeof header.width === 'number') {
        const percentage = Math.round(header.width * 100)
        result.push(`w-[${percentage}%]`)
      } else {
        result.push(header.width)
      }
    } else {
      // Flexible column - distribute remaining space equally
      if (flexibleWidth > 0) {
        const percentage = Math.round(flexibleWidth * 100)
        result.push(`w-[${percentage}%]`)
      } else {
        // Fallback to equal distribution
        const equalWidth = 1 / totalColumns
        const percentage = Math.round(equalWidth * 100)
        result.push(`w-[${percentage}%]`)
      }
      flexibleIndex++
    }
  })

  return result
})

const actionsColumnWidth = computed(() => {
  // Actions column gets a fixed small width
  return 'w-[8%]'
})

const colspan = computed(() => {
  let count = props.headers?.length || 0
  if (props.showBatchActions) count++
  if (hasActions.value) count++
  return count
})

const indeterminate = computed(() => {
  const selectableItems = getSelectableItems()
  const selectedSelectableItems = selectedItems.value.filter((id) => selectableItems.includes(id))
  return (
    selectedSelectableItems.length > 0 && selectedSelectableItems.length < selectableItems.length
  )
})

const allCurrentPageSelected = computed(() => {
  const selectableItems = getSelectableItems()
  return (
    selectableItems.length > 0 && selectableItems.every((id) => selectedItems.value.includes(id))
  )
})

// Methods
const getRowKey = (item: T, index: number): string | number => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(item, index)
  }
  return (item as any)[props.rowKey] || index
}

const getRowId = (item: T): string | number => {
  return getRowKey(item, 0)
}

const getValue = (item: T, key: string | keyof T): any => {
  if (typeof key === 'string' && key.includes('.')) {
    const keys = key.split('.')
    let value = item as any
    for (const k of keys) {
      value = value?.[k]
    }
    return value
  }
  return (item as any)[String(key)]
}

const formatValue = (value: any, header: TableHeader<T>): string => {
  if (header.formatter) {
    return header.formatter(value)
  }
  return value ?? '-'
}

const getHeaderClasses = (header: TableHeader<T>) => {
  const baseClasses = [
    'px-4 py-3 text-sm font-semibold text-neutral-600 bg-neutral-50 border-b border-neutral-200',
  ]

  // Sortable
  if (header.sortable) {
    baseClasses.push('cursor-pointer hover:bg-neutral-100')
  }

  return baseClasses.join(' ')
}

const getHeaderContentClasses = (header: TableHeader<T>) => {
  const baseClasses = ['flex items-center']

  // Alignment
  if (header.align === 'left') {
    baseClasses.push('justify-start')
  } else if (header.align === 'right') {
    baseClasses.push('justify-end')
  } else {
    baseClasses.push('justify-center')
  }

  return baseClasses.join(' ')
}

const getCellClasses = (header: TableHeader<T>, headerIdx: number) => {
  const baseClasses = ['px-4 py-3 text-sm border-b border-neutral-200']

  // Alignment
  if (header.align === 'left') {
    baseClasses.push('text-left')
  } else if (header.align === 'right') {
    baseClasses.push('text-right')
  } else {
    baseClasses.push('text-center')
  }

  // Clickable
  if (header.clickable) {
    baseClasses.push('cursor-pointer hover:text-primary-600 transition-colors')
  }

  return baseClasses.join(' ')
}

const getCellWrapperClasses = (header: TableHeader<T>) => {
  const classes = []

  // Apply alignment based on header setting
  if (header.align === 'left') {
    classes.push('flex justify-start')
  } else if (header.align === 'right') {
    classes.push('flex justify-end')
  } else {
    classes.push('flex justify-center')
  }

  return classes.join(' ')
}

const getCellContentClasses = (header: TableHeader<T>) => {
  const classes = []

  // Special styling for first column (usually ID)
  if (header.key === 'id' || header.key === 'customId') {
    classes.push('text-primary-600 font-medium')
  } else {
    classes.push('text-neutral-900')
  }

  return classes.join(' ')
}

const handleSort = (sortKey: string) => {
  emit('sort', sortKey)
}

const handlePageChange = (page: number) => {
  emit('pageChange', page)
}

const handleRowClick = (item: T) => {
  emit('rowClick', item)
}

const handleCellClick = (item: T, header: TableHeader<T>) => {
  emit('cellClick', item, header)
}

const handleDelete = (item: T) => {
  emit('delete', item)
}

// Batch selection methods
const getSelectableItems = (): (string | number)[] => {
  return props.data.filter((item) => isItemSelectable(item)).map((item) => getRowId(item))
}

const isItemSelectable = (item: T): boolean => {
  if (props.selectableKey) {
    return Boolean((item as any)[props.selectableKey])
  }
  return true
}

const isDeletable = (item: T): boolean => {
  if (props.deletableKey) {
    return Boolean((item as any)[props.deletableKey])
  }
  return true
}

const toggleAll = () => {
  const selectableItems = getSelectableItems()
  if (allCurrentPageSelected.value) {
    // Deselect all
    const newSelection = selectedItems.value.filter((id) => !selectableItems.includes(id))
    selectedItems.value = newSelection
  } else {
    // Select all
    const newItems = selectableItems.filter((id) => !selectedItems.value.includes(id))
    selectedItems.value = [...selectedItems.value, ...newItems]
  }
  emit('batchSelectionChange', selectedItems.value)
}

const toggleItemSelection = (itemId: string | number) => {
  const item = props.data.find((item) => getRowId(item) === itemId)
  if (!item || !isItemSelectable(item)) {
    return
  }

  const current = selectedItems.value
  if (current.includes(itemId)) {
    selectedItems.value = current.filter((id) => id !== itemId)
  } else {
    selectedItems.value = [...current, itemId]
  }
  emit('batchSelectionChange', selectedItems.value)
}

const isItemSelected = (itemId: string | number): boolean => {
  return selectedItems.value.includes(itemId)
}

// Watch for indeterminate state changes
watch(indeterminate, (value) => {
  if (checkboxAll.value) {
    checkboxAll.value.indeterminate = value
  }
})

// Expose methods for parent components
defineExpose({
  clearSelection: () => {
    selectedItems.value = []
    emit('batchSelectionChange', [])
  },
  getSelectedItems: () => selectedItems.value,
})
</script>
