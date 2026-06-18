<template>
  <label
    class="inline-flex items-start gap-2.5"
    :class="[disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer', labelClass]"
  >
    <span class="relative mt-0.5 flex shrink-0">
      <input
        type="checkbox"
        class="peer sr-only"
        :checked="isChecked"
        :disabled="disabled"
        :indeterminate="indeterminate"
        @change="handleChange"
      />
      <span
        class="flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-2 border-neutral-300 bg-white transition-all duration-150 peer-checked:border-primary-600 peer-checked:bg-primary-600 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/25 peer-disabled:opacity-60"
        :class="{ 'border-primary-600 bg-primary-600': isChecked || indeterminate }"
      >
        <svg
          v-if="isChecked && !indeterminate"
          class="h-3 w-3 text-white"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span
          v-else-if="indeterminate"
          class="h-0.5 w-2.5 rounded-full bg-white"
          aria-hidden="true"
        />
      </span>
    </span>
    <span v-if="$slots.default" class="min-w-0 flex-1 text-sm text-neutral-700">
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean | Array<string | number>
    value?: string | number
    disabled?: boolean
    indeterminate?: boolean
    labelClass?: string
  }>(),
  {
    disabled: false,
    indeterminate: false,
    labelClass: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [boolean | Array<string | number>]
}>()

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.value !== undefined && props.modelValue.includes(props.value)
  }

  return props.modelValue
})

function handleChange(event: Event) {
  if (props.disabled) return

  const target = event.target as HTMLInputElement

  if (Array.isArray(props.modelValue) && props.value !== undefined) {
    const next = [...props.modelValue]
    const index = next.indexOf(props.value)

    if (target.checked && index === -1) {
      next.push(props.value)
    } else if (!target.checked && index !== -1) {
      next.splice(index, 1)
    }

    emit('update:modelValue', next)
    return
  }

  emit('update:modelValue', target.checked)
}
</script>
