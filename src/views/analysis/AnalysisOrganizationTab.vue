<template>
  <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
    <p class="text-neutral-500">Carregando análises de departamentos e obreiros...</p>
  </div>

  <p v-else-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
    {{ error }}
  </p>

  <div v-else class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="Membros servindo"
        :value="`${stats.summary.withPrimaryPositionPercentage}%`"
        :subtitle="`${stats.summary.withPrimaryPositionCount} de ${totalMembersLabel} membros`"
        :icon="IdentificationIcon"
        icon-class="bg-blue-50 text-blue-600"
      />
      <StatCard
        label="Departamentos ativos"
        :value="String(stats.summary.activeDepartmentsCount)"
        :icon="BuildingOffice2Icon"
        icon-class="bg-violet-50 text-violet-600"
      />
      <StatCard
        label="Departamentos inativos"
        :value="String(stats.summary.inactiveDepartmentsCount)"
        :icon="BuildingOfficeIcon"
        icon-class="bg-neutral-100 text-neutral-600"
      />
      <StatCard
        label="Deptos. sem líder"
        :value="String(stats.summary.departmentsWithoutLeaderCount)"
        :icon="UserMinusIcon"
        icon-class="bg-red-50 text-red-600"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartCard title="Membros por Departamento">
        <div class="h-[280px] relative">
          <Bar v-if="topDepartmentsChartData.labels?.length" :data="topDepartmentsChartData" :options="horizontalBarOptions" />
          <p v-else class="text-sm text-neutral-400 text-center py-16">Nenhum departamento com membros vinculados</p>
        </div>
      </ChartCard>

      <ChartCard title="Função no Departamento">
        <div class="h-[280px] relative">
          <Doughnut :data="departmentRoleChartData" :options="bottomLegendDonutOptions" />
        </div>
      </ChartCard>
    </div>

    <ChartCard title="Cobertura por Função de Serviço" subtitle="Membros elegíveis por função">
      <div class="h-[320px] relative">
        <Bar v-if="stats.serviceRolesByCoverage.length" :data="serviceRolesChartData" :options="barChartOptions" />
        <p v-else class="text-sm text-neutral-400 text-center py-16">Nenhuma função de serviço cadastrada</p>
      </div>
    </ChartCard>

    <div v-if="stats.departmentsWithoutLeader.length" class="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-neutral-100">
        <h3 class="text-lg font-semibold text-neutral-900">Departamentos sem líder</h3>
        <p class="text-sm text-neutral-500 mt-1">Departamentos ativos sem membro com função Líder</p>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-neutral-100">
          <thead class="bg-neutral-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Departamento</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Membros</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="department in stats.departmentsWithoutLeader" :key="department.id">
              <td class="px-6 py-3 text-sm text-neutral-900">{{ department.name }}</td>
              <td class="px-6 py-3 text-sm text-neutral-600">{{ department.memberCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="stats.rolesWithoutCoverage.length" class="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h3 class="text-sm font-semibold text-amber-900 mb-2">Funções de serviço sem cobertura</h3>
      <p class="text-sm text-amber-800 mb-3">Nenhum membro elegível cadastrado para:</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="role in stats.rolesWithoutCoverage"
          :key="role.roleId"
          class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
        >
          {{ role.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  IdentificationIcon,
  BuildingOffice2Icon,
  BuildingOfficeIcon,
  UserMinusIcon,
} from '@heroicons/vue/24/outline'
import { Doughnut, Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { statsService, type OrganizationStats } from '@/services/stats'
import { barChartOptions, bottomLegendDonutOptions } from '@/composables/useAnalysisCharts'
import StatCard from '@/components/analysis/StatCard.vue'
import ChartCard from '@/components/analysis/ChartCard.vue'

const loading = ref(true)
const error = ref('')

const stats = reactive<OrganizationStats>({
  summary: {
    activeDepartmentsCount: 0,
    inactiveDepartmentsCount: 0,
    membersLinkedToDepartmentsCount: 0,
    departmentCoveragePercentage: '0',
    withPrimaryPositionCount: 0,
    withPrimaryPositionPercentage: '0',
    withoutPrimaryPositionCount: 0,
    ministerialCount: 0,
    operationalCount: 0,
    departmentsWithoutLeaderCount: 0,
    obreirosCount: 0,
    servingGroupsCount: 0,
    avgServingGroupSize: 0,
    rolesWithoutCoverageCount: 0,
    membersInMultipleDepartments: 0,
  },
  membersByDepartment: [],
  departmentTypeBreakdown: {},
  departmentRoleBreakdown: { leader: 0, member: 0, assistant: 0 },
  positionsByName: [],
  positionCategoryBreakdown: {},
  departmentsWithoutLeader: [],
  serviceRolesByCoverage: [],
  rolesWithoutCoverage: [],
})

const totalMembersLabel = computed(() => {
  return stats.summary.withPrimaryPositionCount + stats.summary.withoutPrimaryPositionCount
})

const topDepartments = computed(() => stats.membersByDepartment.slice(0, 10))

const topDepartmentsChartData = computed<ChartData<'bar'>>(() => ({
  labels: topDepartments.value.map((item) => item.name),
  datasets: [
    {
      label: 'Membros',
      data: topDepartments.value.map((item) => item.count),
      backgroundColor: '#8b5cf6',
      borderRadius: 6,
    },
  ],
}))

const departmentRoleChartData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['Líder', 'Membro', 'Auxiliar'],
  datasets: [
    {
      data: [
        stats.departmentRoleBreakdown.leader,
        stats.departmentRoleBreakdown.member,
        stats.departmentRoleBreakdown.assistant,
      ],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderWidth: 0,
      hoverOffset: 4,
    },
  ],
}))

const serviceRolesChartData = computed<ChartData<'bar'>>(() => ({
  labels: stats.serviceRolesByCoverage.slice(0, 12).map((item) => item.name),
  datasets: [
    {
      label: 'Elegíveis',
      data: stats.serviceRolesByCoverage.slice(0, 12).map((item) => item.eligibleCount),
      backgroundColor: '#10b981',
      borderRadius: 6,
      barThickness: 24,
    },
  ],
}))

const horizontalBarOptions: ChartOptions<'bar'> = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1f2937', padding: 10, cornerRadius: 8 },
    datalabels: { display: false },
  },
  scales: {
    x: { beginAtZero: true, grid: { display: false }, ticks: { stepSize: 1 } },
    y: { grid: { display: false } },
  },
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await statsService.getOrganizationStats()
    Object.assign(stats, response)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar análises de departamentos e obreiros'
  } finally {
    loading.value = false
  }
})
</script>
