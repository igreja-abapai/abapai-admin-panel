<script setup lang="ts">
import abapaiLogo from '@/assets/images/abapai_logo.png'
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-surface-page"
    role="status"
    aria-live="polite"
    aria-label="Carregando"
  >
    <div class="app-loading-enter">
      <img
        :src="abapaiLogo"
        alt="Igreja Aba Pai"
        class="h-24 w-24 object-contain rounded-lg app-loading-logo"
      />
    </div>
  </div>
</template>

<style scoped>
.app-loading-enter {
  animation: app-loading-fade-in 0.5s ease-out both;
}

.app-loading-logo {
  animation: app-loading-bounce 1.2s ease-in-out infinite;
}

@keyframes app-loading-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes app-loading-bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-14px);
  }
}
</style>
