<template>
  <div v-if="visibleActions.length > 0" class="flex justify-end" @click.stop>
    <button
      type="button"
      class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
      :aria-label="ariaLabel"
      @click="toggle"
    >
      <EllipsisVerticalIcon class="w-5 h-5" />
    </button>
  </div>

  <Teleport to="body">
    <div
      v-if="isOpen && menuStyle"
      class="fixed z-[10000] bg-white rounded-lg shadow-lg border border-neutral-200 py-1"
      :class="menuWidthClass"
      :style="menuStyle"
      @click.stop
    >
      <template v-for="action in visibleActions" :key="action.label">
        <router-link
          v-if="action.to"
          :to="action.to"
          :class="actionClass(action)"
          @click="close"
        >
          <component :is="action.icon" v-if="action.icon" class="w-4 h-4 shrink-0" />
          {{ action.label }}
        </router-link>
        <button v-else type="button" :class="actionClass(action)" @click="handleAction(action)">
          <component
            :is="action.icon"
            v-if="action.icon"
            :class="[
              'w-4 h-4 shrink-0',
              action.variant === 'danger' ? '' : 'text-neutral-500',
            ]"
          />
          {{ action.label }}
        </button>
      </template>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted, type Component } from 'vue'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import {
  calculateRowMenuPosition,
  closeActiveRowActionMenu,
  DEFAULT_ROW_MENU_ITEM_HEIGHT,
  DEFAULT_ROW_MENU_WIDTH,
  registerActiveRowActionMenu,
  unregisterActiveRowActionMenu,
} from '@/composables/useRowActionMenu'

export interface RowActionMenuItem {
  label: string
  icon?: Component
  to?: string
  variant?: 'default' | 'danger'
  hidden?: boolean
  onClick?: () => void
}

const props = withDefaults(
  defineProps<{
    actions: RowActionMenuItem[]
    ariaLabel?: string
    menuWidth?: number
    menuHeight?: number
  }>(),
  {
    ariaLabel: 'Opções',
    menuWidth: DEFAULT_ROW_MENU_WIDTH,
  },
)

const isOpen = ref(false)
const menuStyle = ref<{ top: string; left: string } | null>(null)

const visibleActions = computed(() => props.actions.filter((action) => !action.hidden))

const resolvedMenuHeight = computed(
  () => props.menuHeight ?? visibleActions.value.length * DEFAULT_ROW_MENU_ITEM_HEIGHT,
)

const menuWidthClass = computed(() => (props.menuWidth === 176 ? 'w-44' : 'w-40'))

function actionClass(action: RowActionMenuItem) {
  return [
    'flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors',
    action.variant === 'danger'
      ? 'text-red-600 hover:bg-red-50'
      : 'text-neutral-700 hover:bg-neutral-50',
  ]
}

function close() {
  isOpen.value = false
  menuStyle.value = null
  unregisterActiveRowActionMenu(instanceClose)
}

function instanceClose() {
  isOpen.value = false
  menuStyle.value = null
}

function toggle(event: MouseEvent) {
  if (isOpen.value) {
    close()
    return
  }

  registerActiveRowActionMenu(instanceClose)
  const button = event.currentTarget as HTMLElement
  menuStyle.value = calculateRowMenuPosition(
    button,
    props.menuWidth,
    resolvedMenuHeight.value,
  )
  isOpen.value = true
}

function handleAction(action: RowActionMenuItem) {
  close()
  action.onClick?.()
}

onUnmounted(() => {
  close()
})
</script>
