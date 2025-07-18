<template>
  <div>
    <!-- Header -->
    <div class="w-full flex justify-between mb-8">
      <h1 class="text-neutral-900 font-medium text-[28px]">Detalhes do Membro</h1>
      <div class="flex gap-2">
        <button class="btn btn-secondary">
          <PencilIcon class="w-4 h-4 mr-2" />
          Editar
        </button>
        <button class="btn btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Novo Pedido
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-8">
        <UserIcon class="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-neutral-900 mb-2">Detalhes do Membro</h3>
        <p class="text-neutral-500">Página em desenvolvimento</p>
        <p class="text-sm text-neutral-400 mt-2">ID do membro: {{ $route.params.id }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PencilIcon, PlusIcon, UserIcon } from '@heroicons/vue/24/outline'
</script>
