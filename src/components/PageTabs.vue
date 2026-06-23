<template>
  <nav
    class="mb-6 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-neutral-200"
    aria-label="Abas"
  >
    <router-link
      v-for="tab in tabs"
      :key="tab.key"
      :to="tab.to"
      class="-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
      :class="
        activeTab === tab.key
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
      "
    >
      {{ tab.label }}
    </router-link>
  </nav>
</template>

<script setup lang="ts">
export interface PageTab {
  key: string
  label: string
  to: string
}

defineProps<{
  tabs: PageTab[]
  activeTab: string
}>()
</script>
