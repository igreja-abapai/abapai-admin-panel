<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      :class="[
        'fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-sm p-4',
        zIndexClass,
      ]"
      @click.self="handleBackdropClick"
    >
      <component
        :is="form ? 'form' : 'div'"
        :class="panelClass"
        :role="form ? undefined : 'dialog'"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="subtitle ? subtitleId : undefined"
        @submit.prevent="form ? $emit('submit') : undefined"
        @click.stop
      >
        <div class="shrink-0 px-6 pt-6 pb-4">
          <div class="flex items-start gap-4">
            <div
              v-if="$slots.icon"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600"
            >
              <slot name="icon" />
            </div>

            <div class="min-w-0 flex-1 pt-0.5">
              <h2 :id="titleId" class="text-lg font-semibold text-neutral-900">
                {{ title }}
              </h2>
              <p v-if="subtitle" :id="subtitleId" class="text-sm text-neutral-500 mt-1 whitespace-pre-line">
                {{ subtitle }}
              </p>
            </div>

            <button
              v-if="showClose"
              type="button"
              class="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Fechar"
              @click="close"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div v-if="!noBody" :class="bodyClass">
          <slot />
        </div>

        <div
          v-if="$slots['footer-summary'] || $slots['footer-actions'] || error"
          class="shrink-0 border-t border-neutral-100 px-6 py-4"
        >
          <p v-if="error" class="text-sm text-red-600 mb-3">{{ error }}</p>

          <div class="flex items-center justify-between gap-4">
            <div class="min-w-0 text-sm text-neutral-500">
              <slot name="footer-summary" />
            </div>
            <div class="flex shrink-0 items-center justify-end gap-2">
              <slot name="footer-actions" />
            </div>
          </div>
        </div>
      </component>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    error?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    zIndex?: 'default' | 'confirm'
    showClose?: boolean
    closeOnBackdrop?: boolean
    form?: boolean
    bodyClass?: string
    noBody?: boolean
  }>(),
  {
    subtitle: '',
    error: '',
    maxWidth: 'lg',
    zIndex: 'default',
    showClose: true,
    closeOnBackdrop: true,
    form: false,
    bodyClass: 'flex-1 overflow-y-auto thin-scrollbar px-6 pb-4 min-h-0 space-y-4',
    noBody: false,
  },
)

const modelValue = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  submit: []
  close: []
}>()

const titleId = 'base-modal-title'
const subtitleId = 'base-modal-subtitle'

const maxWidthClass = computed(() => {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return widths[props.maxWidth]
})

const zIndexClass = computed(() =>
  props.zIndex === 'confirm' ? 'z-[10001]' : 'z-[10000]',
)

const panelClass = computed(
  () =>
    `bg-white rounded-2xl shadow-xl w-full ${maxWidthClass.value} max-h-[90vh] flex flex-col overflow-hidden`,
)

function close() {
  modelValue.value = false
  emitClose()
}

function handleBackdropClick() {
  if (!props.closeOnBackdrop) return
  close()
}

function emitClose() {
  emit('close')
}
</script>
