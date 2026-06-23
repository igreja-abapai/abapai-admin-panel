<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Configurações</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Opções usadas no cadastro de bens patrimoniais.
        </p>
      </div>
      <button
        v-if="canManage"
        type="button"
        class="btn btn-primary w-full sm:w-auto shrink-0"
        @click="openCreate"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        {{ createButtonLabel }}
      </button>
    </div>

    <PageTabs :tabs="tabs" :active-tab="activeTab" />

    <AssetCategoriesView
      v-if="activeTab === 'categorias'"
      ref="activePanelRef"
      embedded
    />
    <AssetLocationsView
      v-else-if="activeTab === 'locais'"
      ref="activePanelRef"
      embedded
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'
import PageTabs, { type PageTab } from '@/components/PageTabs.vue'
import AssetCategoriesView from '@/views/patrimony/AssetCategoriesView.vue'
import AssetLocationsView from '@/views/patrimony/AssetLocationsView.vue'
import { useAuthStore } from '@/stores/auth'

interface SettingsPanelExpose {
  openCreate: () => void
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const activePanelRef = ref<SettingsPanelExpose | null>(null)

const tabs: PageTab[] = [
  { key: 'categorias', label: 'Categorias', to: '/patrimonio/configuracoes/categorias' },
  { key: 'locais', label: 'Locais', to: '/patrimonio/configuracoes/locais' },
]

const validTabs = new Set(tabs.map((tab) => tab.key))

const activeTab = computed(() => String(route.params.tab || ''))

const createButtonLabel = computed(() => {
  if (activeTab.value === 'locais') return 'Novo Local'
  return 'Nova Categoria'
})

const canManage = computed(() => authStore.hasPermission('gerenciar_patrimonio'))

function openCreate() {
  activePanelRef.value?.openCreate()
}

watch(
  activeTab,
  (tab) => {
    if (!validTabs.has(tab)) {
      router.replace('/patrimonio/configuracoes/categorias')
    }
  },
  { immediate: true },
)
</script>
