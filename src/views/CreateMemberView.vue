<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Cadastrar Novo Membro</h1>
      <button class="btn btn-secondary">
        <ArrowLeftIcon class="w-4 h-4 mr-2" />
        Voltar
      </button>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <UserPlusIcon class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-neutral-900 mb-2">Cadastrar Novo Membro</h3>
        <p class="text-neutral-500">Página em desenvolvimento</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/vue/24/outline'
</script>
