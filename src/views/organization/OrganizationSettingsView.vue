<template>
  <div class="w-full">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-neutral-900 font-semibold text-[28px] leading-tight">Configurações</h1>
        <p class="text-sm text-neutral-500 mt-1">
          Opções usadas em formulários e escalas da igreja.
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

    <OrganizationChurchPositionsView
      v-if="activeTab === 'cargos'"
      ref="activePanelRef"
      embedded
    />
    <OrganizationServiceRolesView
      v-else-if="activeTab === 'funcoes'"
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
import OrganizationChurchPositionsView from '@/views/organization/OrganizationChurchPositionsView.vue'
import OrganizationServiceRolesView from '@/views/organization/OrganizationServiceRolesView.vue'
import { useAuthStore } from '@/stores/auth'

interface SettingsPanelExpose {
  openCreate: () => void
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const activePanelRef = ref<SettingsPanelExpose | null>(null)

const tabs: PageTab[] = [
  { key: 'cargos', label: 'Cargos', to: '/organizacao/configuracoes/cargos' },
  {
    key: 'funcoes',
    label: 'Funções de serviço',
    to: '/organizacao/configuracoes/funcoes',
  },
]

const validTabs = new Set(tabs.map((tab) => tab.key))

const activeTab = computed(() => String(route.params.tab || ''))

const createButtonLabel = computed(() => {
  if (activeTab.value === 'funcoes') return 'Nova Função'
  return 'Novo Cargo'
})

const canManage = computed(() => {
  if (activeTab.value === 'funcoes') {
    return authStore.hasPermission('gerenciar_funcoes_servico')
  }
  return authStore.hasPermission('gerenciar_cargos_igreja')
})

function openCreate() {
  activePanelRef.value?.openCreate()
}

watch(
  activeTab,
  (tab) => {
    if (!validTabs.has(tab)) {
      router.replace('/organizacao/configuracoes/cargos')
    }
  },
  { immediate: true },
)
</script>
