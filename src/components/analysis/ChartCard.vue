<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
    <div class="flex items-center gap-2 mb-6">
      <component v-if="icon" :is="icon" class="w-5 h-5 text-primary-500 shrink-0" />
      <div>
        <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-neutral-500 mt-0.5 normal-case tracking-normal">{{ subtitle }}</p>
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  subtitle?: string
  icon?: Component
}>()
</script>
