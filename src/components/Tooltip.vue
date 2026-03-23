<template>
  <div
    class="relative inline-flex items-center"
    ref="triggerRef"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <!-- Trigger -->
    <slot></slot>

    <!-- Tooltip Container (Teleported) -->
    <Teleport to="body">
      <Transition name="tooltip-fade">
        <div v-if="isVisible" class="fixed z-[9999] pointer-events-none" :style="tooltipStyle">
          <div
            class="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg py-2.5 px-3.5 shadow-2xl border border-white/10 whitespace-normal shadow-black/40 relative"
            :style="{ width: props.width }"
          >
            <slot name="content">
              {{ props.message }}
            </slot>

            <!-- Arrow -->
            <div
              class="absolute top-0 -translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-gray-900 dark:border-b-gray-800"
              :class="arrowClass"
            ></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

interface Props {
  message?: string;
  width?: string;
  position?: 'left' | 'center' | 'right';
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  width: '320px',
  position: 'left',
});

const triggerRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
const coords = ref({ top: 0, left: 0, width: 0, height: 0 });

const updateCoords = () => {
  if (triggerRef.value) {
    const rect = triggerRef.value.getBoundingClientRect();
    coords.value = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };
  }
};

const showTooltip = () => {
  updateCoords();
  isVisible.value = true;
  // Add scroll listener to update position while open
  window.addEventListener('scroll', updateCoords, true);
};

const hideTooltip = () => {
  isVisible.value = false;
  window.removeEventListener('scroll', updateCoords, true);
};

onUnmounted(() => {
  window.removeEventListener('scroll', updateCoords, true);
});

const tooltipStyle = computed(() => {
  const top = coords.value.top + coords.value.height + 8; // mt-2 (8px)
  let left = coords.value.left;

  if (props.position === 'center') {
    left = coords.value.left + coords.value.width / 2;
    return {
      top: `${top}px`,
      left: `${left}px`,
      transform: 'translateX(-50%)',
    };
  }

  if (props.position === 'right') {
    left = coords.value.left + coords.value.width;
    return {
      top: `${top}px`,
      left: `${left}px`,
      transform: 'translateX(-100%)',
    };
  }

  // Default: left
  left = coords.value.left - 14; // -left-3.5 (14px)
  return {
    top: `${top}px`,
    left: `${left}px`,
  };
});

const arrowClass = computed(() => {
  if (props.position === 'center') return 'left-1/2 -translate-x-1/2';
  if (props.position === 'right') return 'right-4';
  return 'left-3.5';
});
</script>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Re-apply transform if center or right to avoid conflict with fade animation */
.tooltip-fade-enter-from[style*='translateX(-50%)'],
.tooltip-fade-leave-to[style*='translateX(-50%)'] {
  transform: translate(-50%, -4px);
}

.tooltip-fade-enter-from[style*='translateX(-100%)'],
.tooltip-fade-leave-to[style*='translateX(-100%)'] {
  transform: translate(-100%, -4px);
}
</style>
