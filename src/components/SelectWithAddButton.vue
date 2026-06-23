<template>
  <div
    class="flex w-full overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 hover:border-gray-300"
    :class="{ 'opacity-60': disabled }"
  >
    <div class="relative min-w-0 flex-1" ref="selectContainer">
      <button
        type="button"
        class="flex w-full items-center px-[14px] py-2.5 pr-10 text-left text-sm font-medium text-gray-800 disabled:cursor-not-allowed"
        :disabled="disabled"
        @click="toggleDropdown"
      >
        <span
          :class="[
            'block truncate pr-6',
            showAsPlaceholder ? 'text-gray-400' : 'text-gray-800',
          ]"
        >
          {{ displayText }}
        </span>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
          <ChevronDownIcon
            class="h-4 w-4 shrink-0 transition-transform"
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
              'fixed z-[10000] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg',
              isOpeningUpwards ? 'origin-bottom' : 'origin-top',
            ]"
            :style="dropdownStyle"
          >
            <div v-if="searchable" class="border-b border-gray-100 p-2">
              <input
                ref="searchInputRef"
                v-model="searchTerm"
                type="text"
                class="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                :placeholder="searchPlaceholder"
                @keydown.stop
              />
            </div>
            <div class="max-h-[220px] overflow-auto px-1.5 py-1">
              <button
                v-for="option in filteredOptions"
                :key="option.value || '__empty__'"
                type="button"
                class="flex w-full items-center justify-between rounded px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50"
                :class="[
                  isSelected(option.value) ? 'bg-primary-50 text-primary-700' : '',
                  option.value === '' ? 'text-gray-400' : 'text-gray-800',
                ]"
                @click="selectOption(option.value)"
              >
                <span class="truncate">{{ option.label }}</span>
                <font-awesome-icon
                  v-if="isSelected(option.value)"
                  icon="check"
                  class="text-xs text-primary-600"
                />
              </button>
              <p
                v-if="filteredOptions.length === 0"
                class="px-4 py-3 text-sm text-gray-400"
              >
                Nenhum resultado encontrado
              </p>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <div class="w-px shrink-0 self-stretch bg-gray-200" />

    <button
      type="button"
      class="flex shrink-0 items-center justify-center self-stretch rounded-r-lg px-3 text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary-600 disabled:cursor-not-allowed"
      :disabled="disabled || addDisabled"
      :title="addButtonTitle"
      @click="emit('add')"
    >
      <PlusIcon class="h-5 w-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { ChevronDownIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { includesSearch } from '@/utils/searchText'

const props = withDefaults(
  defineProps<{
    options: { value: string; label: string }[]
    modelValue: string
    disabled?: boolean
    addDisabled?: boolean
    placeholder?: string
    allowEmpty?: boolean
    emptyLabel?: string
    searchable?: boolean
    searchPlaceholder?: string
    addButtonTitle?: string
  }>(),
  {
    disabled: false,
    addDisabled: false,
    placeholder: 'Selecione uma opção',
    allowEmpty: true,
    emptyLabel: 'Selecione uma opção',
    searchable: true,
    searchPlaceholder: 'Buscar...',
    addButtonTitle: 'Adicionar novo',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'add'): void
}>()

const isOpen = ref(false)
const searchTerm = ref('')
const selectContainer = ref<HTMLElement | null>(null)
const dropdownMenu = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)
const dropdownStyle = ref<{ top: string; left: string; width: string }>({
  top: '0px',
  left: '0px',
  width: '0px',
})
const isOpeningUpwards = ref(false)

const displayOptions = computed(() => {
  if (!props.allowEmpty || props.options.some((option) => option.value === '')) {
    return props.options
  }
  return [{ value: '', label: props.emptyLabel }, ...props.options]
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchTerm.value.trim()) {
    return displayOptions.value
  }
  return displayOptions.value.filter(
    (option) =>
      option.value === '' || includesSearch(option.label, searchTerm.value),
  )
})

const displayText = computed(() => {
  if (props.modelValue === '') {
    if (props.allowEmpty) {
      const emptyOption = displayOptions.value.find((option) => option.value === '')
      return emptyOption?.label ?? props.emptyLabel
    }
    return props.placeholder
  }
  const selectedOption = displayOptions.value.find(
    (option) => option.value === props.modelValue,
  )
  return selectedOption?.label ?? props.placeholder
})

const showAsPlaceholder = computed(() => props.modelValue === '')

const isSelected = (value: string) => props.modelValue === value

const updateDropdownPosition = async () => {
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

const toggleDropdown = async () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchTerm.value = ''
    await updateDropdownPosition()
    await nextTick()
    searchInputRef.value?.focus()
  }
}

const selectOption = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (!isOpen.value) return

  const target = event.target as Node
  if (selectContainer.value?.contains(target)) return
  if (dropdownMenu.value?.contains(target)) return

  isOpen.value = false
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

const handleScroll = () => {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

const handleResize = () => {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

watch(isOpen, async (newValue) => {
  if (newValue) {
    await updateDropdownPosition()
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    document.addEventListener('mousedown', handleClickOutside, true)
  } else {
    window.removeEventListener('scroll', handleScroll, true)
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('mousedown', handleClickOutside, true)
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.removeEventListener('mousedown', handleClickOutside, true)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
})
</script>
