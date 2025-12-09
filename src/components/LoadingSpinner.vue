<template>
  <div class="flex justify-center items-center">
    <div
      :style="{ width: `${size}px`, height: `${size}px` }"
      class="animate-spin rounded-full border-b-2 border-primary-600"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: number
}

withDefaults(defineProps<Props>(), {
  size: 24,
})
</script>

