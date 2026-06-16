<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
    <div class="flex justify-between items-start gap-4">
      <div>
        <p class="text-sm font-medium text-neutral-500">{{ label }}</p>
        <h3 class="text-3xl font-bold text-neutral-900 mt-1">{{ value }}</h3>
        <p v-if="subtitle" class="text-sm text-neutral-500 mt-2">{{ subtitle }}</p>
      </div>
      <div :class="['p-2 rounded-lg shrink-0', iconClass]">
        <component :is="icon" class="w-6 h-6" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  value: string
  subtitle?: string
  icon: Component
  iconClass: string
}>()
</script>
