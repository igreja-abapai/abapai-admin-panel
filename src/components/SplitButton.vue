<template>
  <div class="flex relative" ref="containerRef">
    <!-- Main Action Button -->
    <button
      type="button"
      :class="[
        'flex items-center justify-center font-medium transition-colors duration-200 rounded-l-lg',
        variantMainClasses[variant],
        sizeClasses[size].main,
      ]"
      @click="$emit('click')"
      :disabled="disabled"
    >
      <component :is="icon" v-if="icon" :class="sizeClasses[size].icon" />
      {{ label }}
    </button>

    <!-- Dropdown Toggle -->
    <button
      type="button"
      :class="[
        'flex items-center justify-center transition-colors duration-200 rounded-r-lg',
        variantToggleClasses[variant],
        sizeClasses[size].toggle,
      ]"
      @click.stop="toggleMenu"
      :disabled="disabled"
      :title="toggleTitle"
    >
      <ChevronDownIcon :class="sizeClasses[size].chevron" />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden"
    >
      <div class="py-1">
        <slot name="menu"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

interface Props {
  label: string
  icon?: any
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  toggleTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  toggleTitle: 'Mais opções',
})

defineEmits(['click'])

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

/** Main segment: visible divider on the right (same bg as toggle, so use contrast border). */
const variantMainClasses = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 border border-primary-600 border-r-white/35',
  secondary:
    'bg-white text-neutral-800 hover:bg-neutral-50 border border-neutral-200 border-r-neutral-200',
}

const variantToggleClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 border border-primary-600 border-l-0',
  secondary:
    'bg-white text-neutral-800 hover:bg-neutral-50 border border-neutral-200 border-l-0',
}

const sizeClasses = {
  sm: {
    main: 'px-3 py-1.5 text-sm',
    toggle: 'px-1.5 py-1.5',
    icon: 'w-3.5 h-3.5 mr-1.5',
    chevron: 'w-3.5 h-3.5',
  },
  md: {
    main: 'px-4 py-2 text-sm',
    toggle: 'px-2 py-2',
    icon: 'w-4 h-4 mr-2',
    chevron: 'w-4 h-4',
  },
  lg: {
    main: 'px-6 py-3 text-base',
    toggle: 'px-3 py-3',
    icon: 'w-5 h-5 mr-3',
    chevron: 'w-5 h-5',
  },
}

// Close menu when a slot item is clicked
defineExpose({
  closeMenu: () => {
    isOpen.value = false
  },
})
</script>
