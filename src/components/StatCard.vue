<template>
  <component
    :is="to ? 'router-link' : 'div'"
    :to="to"
    class="bg-white rounded-2xl border border-neutral-200 p-5 block"
    :class="{ 'hover:border-neutral-300 hover:shadow-sm transition-all cursor-pointer': to }"
  >
    <div class="flex items-start justify-between mb-4">
      <div :class="`p-2.5 ${iconBgColor} rounded-xl`">
        <component v-if="!loading" :is="icon" :class="`w-5 h-5 ${iconColor}`" />
        <div v-else class="w-5 h-5 bg-neutral-200 rounded animate-pulse"></div>
      </div>
      <span
        v-if="badge && !loading"
        :class="`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`"
      >
        {{ badge }}
      </span>
      <div v-else-if="loading && badge" class="h-5 w-20 bg-neutral-100 rounded-full animate-pulse"></div>
    </div>
    <p v-if="!loading" class="text-3xl font-bold text-neutral-900 tracking-tight">{{ value }}</p>
    <div v-else class="h-9 bg-neutral-200 rounded animate-pulse w-14 mb-2"></div>
    <p v-if="!loading" class="text-sm text-neutral-500 mt-1">{{ title }}</p>
    <div v-else class="h-4 bg-neutral-100 rounded animate-pulse w-28 mt-2"></div>
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  title: string
  value: string | number
  icon: Component
  iconBgColor: string
  iconColor: string
  badge?: string
  badgeClass?: string
  loading?: boolean
  to?: RouteLocationRaw
}

withDefaults(defineProps<Props>(), {
  badge: '',
  badgeClass: 'bg-green-50 text-green-700',
  loading: false,
})
</script>
