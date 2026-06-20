<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import Spinner from '@/components/Spinner.vue'

const authStore = useAuthStore()
</script>

<template>
  <div id="app">
    <div v-if="authStore.authLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <Spinner size="xl" class="text-primary-600 mx-auto mb-4" />
        <p class="text-neutral-600">Carregando...</p>
      </div>
    </div>

    <router-view v-else />
  </div>
</template>
