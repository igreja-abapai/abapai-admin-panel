<template>
  <div class="relative">
    <select
      :value="modelValue || ''"
      @change="handleChange"
      :disabled="disabled"
      class="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-neutral-900 appearance-none pr-10"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="String(option.value)"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Custom arrow icon -->
    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <svg
        class="w-4 h-4 text-neutral-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number | null
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value || null

  if (value === null) {
    emit('update:modelValue', null)
    return
  }

  // Try to convert to number if the original value was a number
  const option = props.options.find((opt) => String(opt.value) === value)
  if (option && typeof option.value === 'number') {
    emit('update:modelValue', Number(value))
  } else {
    emit('update:modelValue', value)
  }
}
</script>
