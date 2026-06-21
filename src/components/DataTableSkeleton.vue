<template>
  <tr
    v-for="rowIdx in rows"
    :key="rowIdx"
    class="border-b border-neutral-200"
    aria-hidden="true"
  >
    <td v-if="showBatchActions" class="relative w-12 px-6 sm:w-16 sm:px-8">
      <div class="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded bg-neutral-100 animate-pulse" />
    </td>

    <td
      v-for="(header, headerIdx) in headers"
      :key="headerIdx"
      :class="[cellClasses(header), columnWidths[headerIdx], headerIdx === 0 ? 'pl-6' : '']"
    >
      <div v-if="isBadgeColumn(header)" :class="wrapperClasses(header)">
        <div class="h-6 w-16 bg-neutral-100 rounded-full animate-pulse" />
      </div>

      <div v-else :class="wrapperClasses(header)">
        <div
          class="h-4 bg-neutral-200 rounded animate-pulse"
          :class="lineWidthClass(rowIdx, headerIdx)"
        />
      </div>
    </td>

    <td v-if="hasActions" :class="['px-3 md:px-4 py-2 md:py-3 text-right', actionsColumnWidth]">
      <div class="flex gap-1 justify-end">
        <div class="w-8 h-8 bg-neutral-100 rounded-md animate-pulse" />
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
interface SkeletonHeader {
  key: string | number | symbol
  align?: 'left' | 'center' | 'right'
}

const BADGE_COLUMN_KEYS = new Set([
  'status',
  'isbatized',
  'isbaptized',
  'isactive',
  'role',
  'type',
  'situation',
  'situacao',
])

const LINE_WIDTHS = ['w-20', 'w-24', 'w-28', 'w-32'] as const

withDefaults(
  defineProps<{
    headers: SkeletonHeader[]
    rows?: number
    showBatchActions?: boolean
    hasActions?: boolean
    columnWidths?: string[]
    actionsColumnWidth?: string
  }>(),
  {
    rows: 8,
    showBatchActions: false,
    hasActions: false,
    columnWidths: () => [],
    actionsColumnWidth: 'w-[8%]',
  },
)

function isBadgeColumn(header: SkeletonHeader): boolean {
  const key = String(header.key).toLowerCase()
  return BADGE_COLUMN_KEYS.has(key) || key.endsWith('status')
}

function lineWidthClass(rowIdx: number, headerIdx: number): string {
  return LINE_WIDTHS[(rowIdx + headerIdx) % LINE_WIDTHS.length]
}

function cellClasses(header: SkeletonHeader): string {
  const classes = ['px-4 py-3 text-sm']

  if (header.align === 'left') {
    classes.push('text-left')
  } else if (header.align === 'right') {
    classes.push('text-right')
  } else {
    classes.push('text-center')
  }

  return classes.join(' ')
}

function wrapperClasses(header: SkeletonHeader): string {
  if (header.align === 'left') return 'flex justify-start'
  if (header.align === 'right') return 'flex justify-end'
  return 'flex justify-center'
}
</script>
