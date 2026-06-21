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
          <div class="flex shrink-0 -space-x-2">
            <div class="h-7 w-7 bg-neutral-100 rounded-full animate-pulse ring-2 ring-white" />
            <div class="h-7 w-7 bg-neutral-100 rounded-full animate-pulse ring-2 ring-white" />
          </div>
          <div class="min-w-0 flex-1 space-y-2">
            <div class="h-4 bg-neutral-200 rounded animate-pulse w-32 max-w-full" />
            <div class="flex items-center gap-2">
              <div class="h-5 w-16 bg-neutral-100 rounded-full animate-pulse" />
              <div class="h-3 bg-neutral-100 rounded animate-pulse w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <div class="px-6 py-5 border-b border-neutral-100">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div class="flex items-start gap-4 min-w-0">
            <div class="flex shrink-0 -space-x-3">
              <div class="h-12 w-12 bg-neutral-100 rounded-full animate-pulse ring-2 ring-white" />
              <div class="h-12 w-12 bg-neutral-100 rounded-full animate-pulse ring-2 ring-white" />
            </div>
            <div class="space-y-2">
              <div class="h-6 bg-neutral-200 rounded animate-pulse w-44 max-w-full" />
              <div class="h-6 w-24 bg-neutral-100 rounded-full animate-pulse" />
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <div class="h-9 w-9 bg-neutral-100 rounded-lg animate-pulse" />
            <div class="h-9 w-9 bg-neutral-100 rounded-lg animate-pulse" />
            <div class="h-10 w-40 bg-neutral-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      <div class="px-6 py-5">
        <div class="flex items-center justify-between gap-4 mb-4">
          <div class="h-4 bg-neutral-200 rounded animate-pulse w-36" />
          <div class="h-4 bg-neutral-100 rounded animate-pulse w-20" />
        </div>

        <div class="space-y-2">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/40 px-4 py-3.5"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="h-10 w-10 bg-neutral-100 rounded-full animate-pulse shrink-0" />
              <div class="space-y-2">
                <div class="h-4 bg-neutral-200 rounded animate-pulse w-32 max-w-full" />
                <div class="h-3 bg-neutral-100 rounded animate-pulse w-16" />
              </div>
            </div>
            <div class="h-8 w-8 bg-neutral-100 rounded-lg animate-pulse shrink-0" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
