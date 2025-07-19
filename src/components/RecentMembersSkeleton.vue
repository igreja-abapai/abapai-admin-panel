<template>
  <div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-neutral-200">
      <h3 class="text-lg font-medium text-neutral-900">Membros Recentes</h3>
    </div>
    <div class="p-6">
      <div class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
        >
          <div class="flex items-center">
            <div class="w-10 h-10 bg-neutral-200 rounded-full animate-pulse"></div>
            <div class="ml-4">
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-32 mb-2"></div>
              <div class="h-3 bg-neutral-200 rounded animate-pulse w-48"></div>
            </div>
          </div>
          <div class="h-4 bg-neutral-200 rounded animate-pulse w-20"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props needed - this is a pure skeleton component
</script>
