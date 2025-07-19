<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center">
      <div :class="`p-2 ${iconBgColor} rounded-lg`">
        <component v-if="!loading" :is="icon" :class="`w-6 h-6 ${iconColor}`" />
        <div v-else class="w-6 h-6 bg-neutral-200 rounded animate-pulse"></div>
      </div>
      <div class="ml-4 flex-1">
        <p v-if="!loading" class="text-sm font-medium text-neutral-600">{{ title }}</p>
        <div v-else class="h-4 bg-neutral-200 rounded animate-pulse mb-2"></div>
        <p v-if="!loading" class="text-2xl font-bold text-neutral-900">{{ value }}</p>
        <div v-else class="h-8 bg-neutral-200 rounded animate-pulse w-12"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  title: string
  value: string | number
  icon: Component
  iconBgColor: string
  iconColor: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})
</script>
