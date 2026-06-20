<template>
  <div class="flex justify-center items-center">
    <Spinner :size="size" />
  </div>
</template>

<script setup lang="ts">
import Spinner from '@/components/Spinner.vue'

withDefaults(
  defineProps<{
    size?: number
  }>(),
  {
    size: 24,
  },
)
</script>
