<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import AppLoadingScreen from '@/components/AppLoadingScreen.vue'

const authStore = useAuthStore()
</script>

<template>
  <div id="app">
    <AppLoadingScreen v-if="authStore.authLoading" />

    <router-view v-else />
  </div>
</template>
