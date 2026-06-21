<template>
  <div aria-hidden="true">
    <div v-if="showStats" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div
        v-for="i in 3"
        :key="`stat-${i}`"
        class="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm"
      >
        <div class="h-8 bg-neutral-200 rounded animate-pulse w-12 mb-3" />
        <div class="h-4 bg-neutral-100 rounded animate-pulse w-28" />
      </div>
    </div>

    <div v-if="showList" class="divide-y divide-neutral-100">
      <div
        v-for="groupIdx in 3"
        :key="groupIdx"
        class="flex gap-5 sm:gap-8 px-4 sm:px-6 py-5"
      >
        <div class="w-12 sm:w-14 shrink-0 text-center space-y-2">
          <div class="h-3 bg-neutral-100 rounded animate-pulse w-8 mx-auto" />
          <div class="h-8 bg-neutral-200 rounded animate-pulse w-10 mx-auto" />
        </div>

        <div class="flex-1 min-w-0 space-y-3">
          <div
            v-for="serviceIdx in groupIdx === 1 ? 2 : 1"
            :key="serviceIdx"
            class="flex items-center gap-3 sm:gap-4 rounded-xl border border-neutral-200 px-3 sm:px-4 py-3.5"
          >
            <div class="h-8 w-16 bg-neutral-100 rounded animate-pulse shrink-0" />
            <div class="flex-1 min-w-0 space-y-2">
              <div class="h-4 bg-neutral-200 rounded animate-pulse w-40 max-w-full" />
              <div class="h-5 w-20 bg-neutral-100 rounded-md animate-pulse" />
            </div>
            <div class="hidden md:flex items-center gap-3 shrink-0">
              <div class="flex -space-x-2">
                <div
                  v-for="avatarIdx in 3"
                  :key="avatarIdx"
                  class="h-7 w-7 bg-neutral-100 rounded-full animate-pulse ring-2 ring-white"
                />
              </div>
              <div class="h-1.5 w-16 bg-neutral-100 rounded-full animate-pulse" />
            </div>
            <div class="h-4 w-4 bg-neutral-100 rounded animate-pulse shrink-0" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    showStats?: boolean
    showList?: boolean
  }>(),
  {
    showStats: true,
    showList: true,
  },
)
</script>
