<template>
  <BaseModal
    v-model="isOpen"
    :title="state.title"
    :subtitle="state.message"
    :error="state.error"
    max-width="md"
    z-index="confirm"
    :show-close="false"
    no-body
  >
    <template #footer-actions>
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
        <span v-if="state.loading" class="absolute inset-0 flex items-center justify-center">
          <span
            class="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"
          ></span>
        </span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import { useConfirmModal } from '@/composables/useConfirm'

const { state, onConfirm, onCancel } = useConfirmModal()

const isOpen = computed({
  get: () => state.open,
  set: (open: boolean) => {
    if (!open) {
      if (state.mode === 'alert') {
        onConfirm()
        return
      }
      onCancel()
    }
  },
})

const confirmButtonClass = computed(() => {
  const base = 'btn relative flex items-center justify-center'
  if (state.variant === 'danger') {
    return `${base} bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 disabled:opacity-70 disabled:cursor-not-allowed`
  }
  return `${base} btn-primary disabled:opacity-70 disabled:cursor-not-allowed`
})
</script>
