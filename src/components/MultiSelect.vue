<template>
  <div class="relative w-full" ref="selectContainer">
    <button
      type="button"
      :disabled="disabled"
      :class="[
        'w-full min-h-[42px] px-3 py-2 pr-10 text-left rounded-lg border transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
        disabled
          ? 'opacity-50 cursor-not-allowed bg-neutral-100 border-neutral-200'
          : 'bg-white border-neutral-300 hover:border-neutral-400 cursor-pointer',
        isOpen && !disabled && 'border-primary-500 ring-2 ring-primary-500',
      ]"
      @click="toggleDropdown"
    >
      <div class="flex flex-wrap items-center gap-1.5">
        <span
          v-for="badge in fixedBadges"
          :key="`fixed-${normalizeValue(badge.value)}`"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700"
          :title="badge.title"
        >
          {{ badge.label }}
        </span>

        <span
          v-for="value in modelValue"
          :key="`selected-${normalizeValue(value)}`"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
        >
          {{ getLabel(value) }}
          <button
            v-if="!disabled && !isReadonly(value)"
            type="button"
            class="rounded-full hover:bg-primary-200/60 p-0.5"
            :aria-label="`Remover ${getLabel(value)}`"
            @click.stop="removeValue(value)"
          >
            <XMarkIcon class="w-3.5 h-3.5" />
          </button>
        </span>

        <span
          v-if="!hasSelectedBadges"
          class="text-sm text-neutral-400"
        >
          {{ placeholder }}
        </span>
      </div>

      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDownIcon
          class="h-4 w-4 shrink-0 text-neutral-500 transition-transform"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen && !disabled"
          ref="dropdownMenu"
          :class="[
            'fixed z-[10000] bg-white rounded-lg border border-neutral-200 shadow-lg overflow-auto',
            isOpeningUpwards ? 'origin-bottom' : 'origin-top',
            dropdownMaxHeightClass,
          ]"
          :style="{
            ...dropdownStyle,
            ...(dropdownMaxHeightStyle ? { maxHeight: dropdownMaxHeightStyle } : {}),
          }"
        >
          <div v-if="availableOptions.length" class="px-1.5 py-1 flex flex-col gap-1">
            <button
              v-for="option in availableOptions"
              :key="normalizeValue(option.value)"
              type="button"
              class="w-full text-left px-4 py-2 text-sm text-neutral-800 rounded-lg transition-colors hover:bg-neutral-50"
              @click="addValue(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
          <p v-else class="px-4 py-3 text-sm text-neutral-500">
            {{ emptyOptionsText }}
          </p>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/vue/24/outline'

export interface MultiSelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface MultiSelectBadge {
  value: string | number
  label: string
  title?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: (string | number)[]
    options: MultiSelectOption[]
    fixedBadges?: MultiSelectBadge[]
    readonlyValues?: (string | number)[]
    placeholder?: string
    disabled?: boolean
    emptyOptionsText?: string
    dropdownMaxHeight?: string
  }>(),
  {
    fixedBadges: () => [],
    readonlyValues: () => [],
    placeholder: 'Selecione...',
    disabled: false,
    emptyOptionsText: 'Nenhuma opção disponível',
    dropdownMaxHeight: 'max-h-[200px]',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
}>()

defineOptions({
  inheritAttrs: false,
})

const isOpen = ref(false)
const selectContainer = ref<HTMLElement | null>(null)
const dropdownMenu = ref<HTMLElement | null>(null)
const dropdownStyle = ref<{ top: string; left: string; width: string }>({
  top: '0px',
  left: '0px',
  width: '0px',
})
const isOpeningUpwards = ref(false)

const dropdownMaxHeightClass = computed(() => {
  const value = props.dropdownMaxHeight
  if (value.startsWith('max-h-') || value.includes('[')) {
    return value
  }
  return ''
})

const dropdownMaxHeightStyle = computed(() => {
  const value = props.dropdownMaxHeight
  if (value.startsWith('max-h-') || value.includes('[')) {
    return ''
  }
  return value
})

const selectedValueSet = computed(() => {
  const values = [
    ...props.modelValue.map(normalizeValue),
    ...props.fixedBadges.map((badge) => normalizeValue(badge.value)),
  ]
  return new Set(values)
})

const hasSelectedBadges = computed(
  () => props.modelValue.length > 0 || props.fixedBadges.length > 0,
)

const availableOptions = computed(() =>
  props.options.filter(
    (option) => !option.disabled && !selectedValueSet.value.has(normalizeValue(option.value)),
  ),
)

function normalizeValue(value: string | number): string {
  return String(value)
}

function getLabel(value: string | number): string {
  const option = props.options.find((item) => normalizeValue(item.value) === normalizeValue(value))
  return option?.label || String(value)
}

function isReadonly(value: string | number): boolean {
  return props.readonlyValues.some((item) => normalizeValue(item) === normalizeValue(value))
}

function addValue(value: string | number) {
  if (selectedValueSet.value.has(normalizeValue(value))) return
  emit('update:modelValue', [...props.modelValue, value])
  isOpen.value = false
}

function removeValue(value: string | number) {
  if (isReadonly(value)) return
  emit(
    'update:modelValue',
    props.modelValue.filter((item) => normalizeValue(item) !== normalizeValue(value)),
  )
}

async function updateDropdownPosition() {
  if (!selectContainer.value || !isOpen.value) return

  await nextTick()
  const rect = selectContainer.value.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const padding = 4
  let top = rect.bottom + padding

  if (dropdownMenu.value) {
    const dropdownHeight = dropdownMenu.value.offsetHeight
    const spaceBelow = windowHeight - rect.bottom
    const spaceAbove = rect.top

    if (spaceBelow < dropdownHeight + padding && spaceAbove > spaceBelow) {
      top = rect.top - dropdownHeight - padding
      isOpeningUpwards.value = true
    } else {
      isOpeningUpwards.value = false
    }
  } else {
    isOpeningUpwards.value = false
  }

  dropdownStyle.value = {
    top: `${top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

async function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await updateDropdownPosition()
  }
}

function handleClickOutside(event: MouseEvent) {
  if (
    selectContainer.value &&
    !selectContainer.value.contains(event.target as Node) &&
    dropdownMenu.value &&
    !dropdownMenu.value.contains(event.target as Node)
  ) {
    isOpen.value = false
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

function handleScroll() {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

function handleResize() {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

watch(isOpen, async (newValue) => {
  if (newValue) {
    await updateDropdownPosition()
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
  } else {
    window.removeEventListener('scroll', handleScroll, true)
    window.removeEventListener('resize', handleResize)
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
})
</script>
