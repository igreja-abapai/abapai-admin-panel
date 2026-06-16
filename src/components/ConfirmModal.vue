<template>
  <Teleport to="body">
    <div
      v-if="state.open"
      class="fixed inset-0 z-[10001] flex items-center justify-center bg-black/40 p-4"
      @click.self="handleBackdropClick"
    >
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="messageId"
        @click.stop
      >
        <h2 :id="titleId" class="text-lg font-semibold text-neutral-900 mb-2">
          {{ state.title }}
        </h2>
        <p :id="messageId" class="text-sm text-neutral-600 whitespace-pre-line">
          {{ state.message }}
        </p>
        <p v-if="state.error" class="text-sm text-red-600 mt-3">
          {{ state.error }}
        </p>
        <div class="flex justify-end gap-2 mt-6">
          <button
            v-if="state.mode !== 'alert'"
            type="button"
            class="btn btn-secondary"
            :disabled="state.loading"
            @click="onCancel"
          >
            {{ state.cancelLabel }}
          </button>
          <button
            type="button"
            :class="confirmButtonClass"
            :disabled="state.loading"
            :aria-busy="state.loading"
            @click="onConfirm"
          >
            <span
              class="inline-flex items-center justify-center"
              :class="{ invisible: state.loading }"
              aria-hidden="true"
            >
              {{ state.confirmLabel }}
            </span>
            <span
              v-if="state.loading"
              class="absolute inset-0 flex items-center justify-center"
            >
              <span
                class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"
              ></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfirmModal } from '@/composables/useConfirm'

const titleId = 'confirm-modal-title'
const messageId = 'confirm-modal-message'

const { state, onConfirm, onCancel } = useConfirmModal()

function handleBackdropClick() {
  if (state.mode === 'alert') {
    onConfirm()
    return
  }
  onCancel()
}

const confirmButtonClass = computed(() => {
  const base = 'btn relative flex items-center justify-center'
  if (state.variant === 'danger') {
    return `${base} bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 disabled:opacity-70 disabled:cursor-not-allowed`
  }
  return `${base} btn-primary disabled:opacity-70 disabled:cursor-not-allowed`
})
</script>
