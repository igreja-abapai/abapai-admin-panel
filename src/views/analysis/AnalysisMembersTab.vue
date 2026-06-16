<template>
  <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
    <p class="text-neutral-500">Carregando análises de membros...</p>
  </div>

  <p v-else-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
    {{ error }}
  </p>

  <div v-else class="space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Membros cadastrados" :value="String(stats.totalMembers)" :icon="UserGroupIcon" icon-class="bg-blue-50 text-blue-600" />
      <StatCard label="Membros batizados" :value="`${stats.baptizedPercentage}%`" :subtitle="`${stats.baptizedCount} membros batizados`" :icon="SparklesIcon" icon-class="bg-emerald-50 text-emerald-600" />
      <StatCard label="Média de idade" :value="`${stats.averageAge} anos`" :icon="CalendarIcon" icon-class="bg-amber-50 text-amber-600" />
      <StatCard label="Novos convertidos" :value="`${stats.newConvertsPercentage}%`" :subtitle="`${stats.newConvertsCount} a menos de um ano`" :icon="UserPlusIcon" icon-class="bg-purple-50 text-purple-600" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartCard title="Distribuição por Gênero">
        <div class="h-[220px] relative">
          <Doughnut :data="genderChartData" :options="bottomLegendDonutOptions" />
        </div>
      </ChartCard>

      <ChartCard title="Faixa Etária">
        <div class="h-[220px] relative">
          <Bar :data="ageChartData" :options="barChartOptions" />
        </div>
      </ChartCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ChartCard title="Tipos de Admissão" :icon="IdentificationIcon">
        <div class="h-[300px] flex items-center justify-center relative">
          <Doughnut :data="admissionChartData" :options="donutChartOptions" />
          <div v-if="!stats.totalMembers" class="absolute inset-0 flex items-center justify-center bg-white/50">
            <p class="text-neutral-400">Sem dados disponíveis</p>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Tempo de Igreja" :icon="ClockIcon">
        <div class="h-[300px] relative">
          <Bar :data="tenureChartData" :options="barChartOptions" />
        </div>
      </ChartCard>
    </div>

    <ChartCard title="Novos Membros nos últimos 10 anos" :icon="ArrowTrendingUpIcon">
      <div class="h-[300px] relative">
        <Line :data="admissionsChartData" :options="lineChartOptions" />
      </div>
    </ChartCard>

    <ChartCard title="Saídas da igreja por ano" :icon="ArrowTrendingDownIcon">
      <div class="h-[300px] relative">
        <Bar :data="departuresChartData" :options="departuresChartOptions" />
      </div>
    </ChartCard>

    <ChartCard title="Crescimento líquido por ano" :icon="ScaleIcon" subtitle="Admissões − saídas">
      <div class="h-[300px] relative">
        <Bar :data="netGrowthChartData" :options="netGrowthChartOptions" />
      </div>
    </ChartCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
  UserGroupIcon,
  SparklesIcon,
  CalendarIcon,
  UserPlusIcon,
  IdentificationIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
} from '@heroicons/vue/24/outline'
import { Doughnut, Bar, Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { statsService, type MemberStats } from '@/services/stats'
import {
  barChartOptions,
  bottomLegendDonutOptions,
  donutChartOptions,
  lastTenYears,
  lineChartOptions,
  yearRecordToSeries,
} from '@/composables/useAnalysisCharts'
import StatCard from '@/components/analysis/StatCard.vue'
import ChartCard from '@/components/analysis/ChartCard.vue'

const loading = ref(true)
const error = ref('')

const stats = reactive<MemberStats>({
  totalMembers: 0,
  activeMembers: 0,
  inactiveMembers: 0,
  withoutDepartmentCount: 0,
  withPositionCount: 0,
  withoutPositionCount: 0,
  withPositionPercentage: '0',
  baptizedCount: 0,
  baptizedPercentage: '0',
  averageAge: 0,
  newConvertsPercentage: '0',
  newConvertsCount: 0,
  admissionTypes: {},
  genderCounts: {},
  ageCounts: { adolescents: 0, youngAdults: 0, adults: 0, seniors: 0 },
  tenureCounts: { over10: 0, between5And10: 0, between2And5: 0, under2: 0 },
  admissionsPerYear: {},
  departuresPerYear: {},
  netGrowthPerYear: {},
})

const years = computed(() => lastTenYears())

const admissionChartData = computed<ChartData<'doughnut'>>(() => {
  const labels = Object.keys(stats.admissionTypes)
  const data = Object.values(stats.admissionTypes)
  return {
    labels: labels.length ? labels : ['Nenhum dado'],
    datasets: [
      {
        data: data.length ? data : [0],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
        hoverOffset: 4,
        borderWidth: 0,
      },
    ],
  }
})

const genderChartData = computed<ChartData<'doughnut'>>(() => {
  const labels = Object.keys(stats.genderCounts)
  const colors = labels.map((label) => {
    const l = label.toLowerCase()
    if (l === 'masculino') return '#3b82f6'
    if (l === 'feminino') return '#ec4899'
    return '#8b5cf6'
  })
  return {
    labels,
    datasets: [{ data: Object.values(stats.genderCounts), backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }],
  }
})

const ageChartData = computed<ChartData<'bar'>>(() => ({
  labels: ['Adolescentes (13-17)', 'Jovens (18-29)', 'Adultos (30-59)', 'Idosos (60+)'],
  datasets: [
    {
      label: 'Membros',
      data: [
        stats.ageCounts.adolescents,
        stats.ageCounts.youngAdults,
        stats.ageCounts.adults,
        stats.ageCounts.seniors,
      ],
      backgroundColor: '#3b82f6',
      borderRadius: 6,
      barThickness: 30,
    },
  ],
}))

const tenureChartData = computed<ChartData<'bar'>>(() => ({
  labels: ['+10 anos', '5 a 10 anos', '2 a 5 anos', 'Menos de 2 anos'],
  datasets: [
    {
      label: 'Quantidade de Membros',
      data: [
        stats.tenureCounts.over10,
        stats.tenureCounts.between5And10,
        stats.tenureCounts.between2And5,
        stats.tenureCounts.under2,
      ],
      backgroundColor: '#3b82f6',
      borderRadius: 8,
      barThickness: 40,
    },
  ],
}))

const admissionsChartData = computed<ChartData<'line'>>(() => ({
  labels: years.value.map(String),
  datasets: [
    {
      label: 'Novas Admissões',
      data: yearRecordToSeries(stats.admissionsPerYear),
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f6',
      tension: 0.3,
      pointRadius: 6,
      pointHoverRadius: 8,
      borderWidth: 3,
      fill: false,
    },
  ],
}))

const departuresChartData = computed<ChartData<'bar'>>(() => ({
  labels: years.value.map(String),
  datasets: [
    {
      label: 'Saídas',
      data: yearRecordToSeries(stats.departuresPerYear),
      backgroundColor: '#ef4444',
      borderRadius: 6,
      barThickness: 28,
    },
  ],
}))

const departuresChartOptions: ChartOptions<'bar'> = {
  ...barChartOptions,
  plugins: {
    ...barChartOptions.plugins,
    legend: { display: false },
  },
}

const netGrowthChartData = computed<ChartData<'bar'>>(() => ({
  labels: years.value.map(String),
  datasets: [
    {
      label: 'Crescimento líquido',
      data: yearRecordToSeries(stats.netGrowthPerYear),
      backgroundColor: years.value.map((year) =>
        (stats.netGrowthPerYear[year] || 0) >= 0 ? '#10b981' : '#ef4444',
      ),
      borderRadius: 6,
      barThickness: 28,
    },
  ],
}))

const netGrowthChartOptions: ChartOptions<'bar'> = {
  ...barChartOptions,
  plugins: {
    ...barChartOptions.plugins,
    legend: { display: false },
  },
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await statsService.getMemberStats()
    Object.assign(stats, response)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao carregar análises de membros'
  } finally {
    loading.value = false
  }
})
</script>
