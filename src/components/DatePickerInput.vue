<template>
  <div class="app-date-picker">
    <VueDatePicker
      v-bind="$attrs"
      v-model="model"
      :enable-time-picker="enableTimePicker"
    />
  </div>
</template>

<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

withDefaults(
  defineProps<{
    enableTimePicker?: boolean
  }>(),
  {
    enableTimePicker: false,
  },
)

const model = defineModel<Date | null>()
</script>

<style scoped>
/**
 * @vuepic/vue-datepicker loads its CSS after Tailwind, so utility classes on the
 * picker often lose the cascade. Match Input.vue / Select.vue via CSS variables.
 */
.app-date-picker :deep(.dp__main) {
  width: 100%;
  --dp-font-size: 0.875rem;
  --dp-border-radius: 0.5rem;
  --dp-input-padding: 10px 30px 10px 12px;
  --dp-border-color: #e5e7eb;
  --dp-border-color-hover: #d1d5db;
  --dp-border-color-focus: #3b82f6;
}

.app-date-picker :deep(.dp__input) {
  min-height: 42px;
  box-sizing: border-box;
  color: #1f2937;
}

.app-date-picker :deep(.dp__input_focus) {
  box-shadow: 0 0 0 2px rgb(59 130 246 / 0.1);
}
</style>
