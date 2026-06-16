<template>
  <div class="space-y-8 pb-12">
    <div>
      <h1 class="text-neutral-900 font-medium text-[28px]">Análises e Estatísticas</h1>
      <p class="text-neutral-500">Visão geral e análises detalhadas da igreja</p>
    </div>

    <div class="border-b border-neutral-200">
      <nav class="-mb-px flex gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :class="[
            'pb-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300',
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <AnalysisMembersTab v-if="activeTab === 'members'" />
    <AnalysisOrganizationTab v-else-if="activeTab === 'organization'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AnalysisMembersTab from '@/views/analysis/AnalysisMembersTab.vue'
import AnalysisOrganizationTab from '@/views/analysis/AnalysisOrganizationTab.vue'

type AnalysisTab = 'members' | 'organization'

const tabs: { key: AnalysisTab; label: string }[] = [
  { key: 'members', label: 'Membros' },
  { key: 'organization', label: 'Departamentos e Obreiros' },
]

const activeTab = ref<AnalysisTab>('members')
</script>

<style scoped>
.bg-neutral-50 {
  @apply bg-neutral-50/50;
}
</style>
