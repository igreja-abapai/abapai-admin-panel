<template>
  <button
    type="submit"
    class="btn btn-primary relative inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span class="inline-flex items-center gap-2" :class="{ invisible: loading }" aria-hidden="true">
      <slot name="icon" />
      <slot />
    </span>
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <span
        class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"
      ></span>
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    loading: false,
    disabled: false,
  },
)
</script>
