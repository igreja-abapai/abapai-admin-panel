<template>
  <svg
    :class="['animate-spin shrink-0', sizeClass, spinnerClass]"
    :style="sizeStyle"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="status"
  >
    <circle
      class="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    />
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const props = withDefaults(
  defineProps<{
    size?: SpinnerSize | number
    class?: string
  }>(),
  {
    size: 'md',
    class: '',
  },
)

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

const sizeClass = computed(() => {
  if (typeof props.size === 'number') return ''
  return SIZE_CLASSES[props.size]
})

const sizeStyle = computed(() => {
  if (typeof props.size !== 'number') return undefined
  return {
    width: `${props.size}px`,
    height: `${props.size}px`,
  }
})

const spinnerClass = computed(() => props.class)
</script>
