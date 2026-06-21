<template>
  <div
    class="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6"
    aria-hidden="true"
  >
    <div class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div class="h-3 bg-neutral-100 rounded animate-pulse w-24 mb-3 mx-1" />

      <div class="space-y-1.5">
        <div
          v-for="i in 4"
          :key="i"
          class="flex items-center gap-3 rounded-xl p-3"
        >
          <div class="h-[52px] w-[52px] bg-neutral-100 rounded-xl animate-pulse shrink-0" />
          <div class="min-w-0 flex-1 space-y-2">
            <div class="h-4 bg-neutral-200 rounded animate-pulse w-32 max-w-full" />
            <div class="h-3 bg-neutral-100 rounded animate-pulse w-40 max-w-full" />
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div class="flex items-start justify-between gap-4 mb-5">
        <div class="flex items-start gap-3.5 min-w-0">
          <div class="h-11 w-11 bg-neutral-100 rounded-xl animate-pulse shrink-0" />
          <div class="space-y-2">
            <div class="h-5 bg-neutral-200 rounded animate-pulse w-48 max-w-full" />
            <div class="flex gap-2">
              <div class="h-6 w-24 bg-neutral-100 rounded-full animate-pulse" />
              <div class="h-6 w-20 bg-neutral-100 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div class="flex gap-1 shrink-0">
          <div class="h-9 w-9 bg-neutral-100 rounded-lg animate-pulse" />
          <div class="h-9 w-9 bg-neutral-100 rounded-lg animate-pulse" />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
        <div
          v-for="i in 3"
          :key="i"
          class="rounded-xl border border-neutral-200 bg-surface-page px-4 py-3.5"
        >
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 bg-neutral-100 rounded-lg animate-pulse shrink-0" />
            <div class="space-y-2">
              <div class="h-7 bg-neutral-200 rounded animate-pulse w-10" />
              <div class="h-3 bg-neutral-100 rounded animate-pulse w-20" />
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4 mb-4">
        <div class="h-4 bg-neutral-200 rounded animate-pulse w-32" />
        <div class="h-8 w-36 bg-neutral-100 rounded-lg animate-pulse" />
      </div>

      <div class="space-y-2">
        <div
          v-for="i in 4"
          :key="i"
          class="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3"
        >
          <div class="h-9 w-9 bg-neutral-100 rounded-lg animate-pulse shrink-0" />
          <div class="min-w-0 flex-1 space-y-2">
            <div class="h-4 bg-neutral-200 rounded animate-pulse w-36 max-w-full" />
            <div class="h-3 bg-neutral-100 rounded animate-pulse w-24" />
          </div>
          <div class="h-8 w-24 bg-neutral-100 rounded-lg animate-pulse shrink-0" />
          <div class="h-6 w-20 bg-neutral-100 rounded-full animate-pulse shrink-0" />
        </div>
      </div>
    </div>
  </div>
</template>
