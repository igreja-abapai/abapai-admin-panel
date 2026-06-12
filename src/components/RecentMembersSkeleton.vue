<template>
  <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
    <div class="bg-white rounded-2xl border border-neutral-200">
      <div class="px-6 py-5 border-b border-neutral-100">
        <div class="h-4 bg-neutral-200 rounded animate-pulse w-36 mb-2"></div>
        <div class="h-3 bg-neutral-100 rounded animate-pulse w-48"></div>
      </div>
      <div class="px-6 divide-y divide-neutral-100">
        <div
          v-for="i in 4"
          :key="i"
          class="flex items-center justify-between py-4"
        >
          <div class="flex items-center">
            <div class="w-10 h-10 bg-neutral-100 rounded-full animate-pulse"></div>
            <div class="ml-3">
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-32 mb-2"></div>
              <div class="h-3 bg-neutral-100 rounded animate-pulse w-44"></div>
            </div>
          </div>
          <div class="h-3 bg-neutral-100 rounded animate-pulse w-20"></div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-neutral-200">
      <div class="px-6 py-5 border-b border-neutral-100">
        <div class="h-4 bg-neutral-200 rounded animate-pulse w-44 mb-2"></div>
        <div class="h-3 bg-neutral-100 rounded animate-pulse w-40"></div>
      </div>
      <div class="px-6 divide-y divide-neutral-100">
        <div
          v-for="i in 3"
          :key="`birthday-${i}`"
          class="flex items-center justify-between py-4"
        >
          <div class="flex items-center">
            <div class="w-10 h-10 bg-neutral-100 rounded-full animate-pulse"></div>
            <div class="ml-3">
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-36 mb-2"></div>
              <div class="h-3 bg-neutral-100 rounded animate-pulse w-28"></div>
            </div>
          </div>
          <div class="h-6 w-12 bg-orange-50 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-neutral-200">
      <div class="px-6 py-5 border-b border-neutral-100">
        <div class="h-4 bg-neutral-200 rounded animate-pulse w-40 mb-2"></div>
        <div class="h-3 bg-neutral-100 rounded animate-pulse w-36"></div>
      </div>
      <div class="px-6 divide-y divide-neutral-100">
        <div
          v-for="i in 3"
          :key="`prayer-${i}`"
          class="py-4"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 bg-neutral-100 rounded-full animate-pulse shrink-0"></div>
            <div class="flex-1">
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-28 mb-2"></div>
              <div class="h-3 bg-neutral-100 rounded animate-pulse w-full mb-2"></div>
              <div class="h-3 bg-neutral-100 rounded animate-pulse w-24"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pure skeleton component
</script>
