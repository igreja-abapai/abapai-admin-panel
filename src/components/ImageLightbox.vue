<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      :aria-label="alt"
      @click.self="close"
    >
      <button
        type="button"
        class="absolute right-4 top-4 rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Fechar"
        @click="close"
      >
        <XMarkIcon class="h-6 w-6" />
      </button>

      <div class="flex max-h-full max-w-full flex-col items-center gap-3">
        <img
          :src="src"
          :alt="alt"
          class="max-h-[85vh] max-w-full object-contain"
          decoding="async"
        />
        <p v-if="caption" class="max-w-2xl text-center text-sm text-white/80">
          {{ caption }}
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  src: string
  alt: string
  caption?: string
}>()

const modelValue = defineModel<boolean>({ required: true })

function close() {
  modelValue.value = false
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && modelValue.value) {
    close()
  }
}

watch(modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>
