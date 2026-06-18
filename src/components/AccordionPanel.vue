<template>
  <div class="rounded-xl border border-neutral-200 bg-white overflow-hidden">
    <button
      type="button"
      class="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-neutral-50/80"
      :aria-expanded="open"
      @click="open = !open"
    >
      <div
        :class="[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
          iconClass,
        ]"
      >
        <slot name="icon">
          <MinusIcon v-if="open" class="h-4 w-4" />
          <PlusIcon v-else class="h-4 w-4" />
        </slot>
      </div>

      <span class="min-w-0 flex-1">
        <span class="block text-sm font-medium text-neutral-900">{{ title }}</span>
        <span v-if="subtitle" class="block text-xs text-neutral-500 mt-0.5 truncate">{{ subtitle }}</span>
      </span>

      <span
        v-if="badge"
        class="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
      >
        {{ badge }}
      </span>

      <ChevronDownIcon
        class="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <div v-show="open" class="border-t border-neutral-200">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, MinusIcon, PlusIcon } from '@heroicons/vue/24/outline'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    badge?: string
    iconClass?: string
  }>(),
  {
    subtitle: '',
    badge: '',
    iconClass: 'bg-primary-50 text-primary-600',
  },
)

const open = defineModel<boolean>('open', { required: true })
</script>
