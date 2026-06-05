<template>
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-neutral-900 font-medium text-[28px]">Análises e Estatísticas</h1>
        <p class="text-neutral-500">Visão geral e análises detalhadas da igreja</p>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      <p class="text-neutral-500">Carregando análises...</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Main Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Card 1: Membros cadastrados -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-neutral-500">Membros cadastrados</p>
              <h3 class="text-3xl font-bold text-neutral-900 mt-1">{{ stats.totalMembers }}</h3>
            </div>
            <div class="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <UserGroupIcon class="w-6 h-6" />
            </div>
          </div>
        </div>

        <!-- Card 2: Membros batizados -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-neutral-500">Membros batizados</p>
              <h3 class="text-3xl font-bold text-neutral-900 mt-1">
                {{ stats.baptizedPercentage }}%
              </h3>
              <p class="text-sm text-neutral-500 mt-2">
                {{ stats.baptizedCount }} membros batizados
              </p>
            </div>
            <div class="p-2 bg-green-50 text-green-600 rounded-lg">
              <SparklesIcon class="w-6 h-6" />
            </div>
          </div>
        </div>

        <!-- Card 3: Média de idade -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-neutral-500">Média de idade</p>
              <h3 class="text-3xl font-bold text-neutral-900 mt-1">{{ stats.averageAge }} anos</h3>
            </div>
            <div class="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <CalendarIcon class="w-6 h-6" />
            </div>
          </div>
        </div>

        <!-- Card 4: Novos convertidos -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm font-medium text-neutral-500">Novos convertidos</p>
              <h3 class="text-3xl font-bold text-neutral-900 mt-1">
                {{ stats.newConvertsPercentage }}%
              </h3>
              <p class="text-sm text-neutral-500 mt-2">convertidos a menos de um ano</p>
            </div>
            <div class="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <UserPlusIcon class="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <!-- Demographic Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Gender Distribution -->
        <div class="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
          <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-8">
            Distribuição por Gênero
          </h3>
          <div class="h-[220px] relative">
            <Doughnut :data="genderChartData" :options="donutChartOptions" />
          </div>
        </div>

        <!-- Age Distribution -->
        <div class="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
          <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-8">
            Faixa Etária
          </h3>
          <div class="h-[220px] relative">
            <Bar :data="ageChartData" :options="ageChartOptions" />
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Admission Types Donut Chart -->
        <div class="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
          <h3 class="text-lg font-semibold text-neutral-900 mb-8 flex items-center">
            <IdentificationIcon class="w-5 h-5 mr-2 text-primary-500" />
            Tipos de Admissão
          </h3>
          <div class="h-[300px] flex items-center justify-center relative">
            <Doughnut :data="admissionChartData" :options="chartOptions" />
            <div
              v-if="!stats.totalMembers"
              class="absolute inset-0 flex items-center justify-center bg-white/50"
            >
              <p class="text-neutral-400">Sem dados disponíveis</p>
            </div>
          </div>
        </div>

        <!-- Veteran Member & Highlights -->
        <div class="space-y-6">
          <div class="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
            <h3 class="text-lg font-semibold text-neutral-900 mb-8 flex items-center">
              <ClockIcon class="w-5 h-5 mr-2 text-primary-500" />
              Tempo de Igreja
            </h3>
            <div class="h-[300px] relative">
              <Bar :data="tenureChartData" :options="tenureChartOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Growth Chart (Admissions per Year) -->
      <div class="bg-white p-8 rounded-xl shadow-sm border border-neutral-100">
        <h3 class="text-lg font-semibold text-neutral-900 mb-8 flex items-center">
          <ArrowTrendingUpIcon class="w-5 h-5 mr-2 text-primary-500" />
          Novos Membros nos últimos 10 anos
        </h3>
        <div class="h-[300px] relative">
          <Line :data="growthChartData" :options="growthChartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import {
  UserGroupIcon,
  SparklesIcon,
  CalendarIcon,
  UserPlusIcon,
  IdentificationIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/vue/24/outline'
import { statsService } from '@/services/stats'
import { Doughnut, Bar, Line } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from 'chart.js'

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels,
)

const loading = ref(true)

const stats = reactive({
  totalMembers: 0,
  baptizedCount: 0,
  baptizedPercentage: '0',
  averageAge: 0,
  newConvertsPercentage: '0',
  admissionTypes: {} as Record<string, number>,
  tenureCounts: {
    over10: 0,
    between5And10: 0,
    between2And5: 0,
    under2: 0,
  },
  admissionsPerYear: {} as Record<number, number>,
  genderCounts: {} as Record<string, number>,
  ageCounts: {
    adolescents: 0, // 13-17
    youngAdults: 0, // 18-29
    adults: 0, // 30-59
    seniors: 0, // 60+
  },
})

const admissionChartData = computed<ChartData<'doughnut'>>(() => {
  const labels = Object.keys(stats.admissionTypes)
  const data = Object.values(stats.admissionTypes)

  return {
    labels: labels.length ? labels : ['Nenhum dado'],
    datasets: [
      {
        data: data.length ? data : [0],
        backgroundColor: [
          '#3b82f6', // blue
          '#8b5cf6', // purple
          '#ec4899', // pink
          '#f59e0b', // amber
          '#10b981', // emerald
        ],
        hoverOffset: 4,
        borderWidth: 0,
      },
    ],
  }
})

const chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          family: "'Inter Variable', sans-serif",
          size: 11,
        },
      },
    },
    tooltip: {
      backgroundColor: '#1f2937',
      padding: 12,
      cornerRadius: 8,
    },
    datalabels: {
      color: '#fff',
      formatter: (value, ctx) => {
        const datasets = ctx.chart.data.datasets
        if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
          const sum = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0)
          const percentage = ((value * 100) / sum).toFixed(0) + '%'
          return percentage
        }
        return ''
      },
      font: {
        weight: 'bold',
        size: 12,
      },
      display: (context) => {
        const dataset = context.dataset
        const count = dataset.data.length
        const value = dataset.data[context.dataIndex] as number
        return value > 0 // Only show if value > 0
      },
    },
  },
  cutout: '65%',
}

const donutChartOptions: ChartOptions<'doughnut'> = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    legend: {
      ...chartOptions.plugins?.legend,
      position: 'bottom',
    },
  },
}

const genderChartData = computed<ChartData<'doughnut'>>(() => {
  const labels = Object.keys(stats.genderCounts)
  const colors = labels.map((label) => {
    const l = label.toLowerCase()
    if (l === 'masculino') return '#3b82f6' // blue
    if (l === 'feminino') return '#ec4899' // pink
    return '#8b5cf6' // others
  })

  return {
    labels,
    datasets: [
      {
        data: Object.values(stats.genderCounts),
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
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

const ageChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1f2937',
      padding: 10,
    },
    datalabels: { display: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { display: false }, ticks: { stepSize: 1 } },
    x: { grid: { display: false } },
  },
}

const tenureChartData = computed<ChartData<'bar'>>(() => {
  return {
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
  }
})

const tenureChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#1f2937',
      padding: 12,
      cornerRadius: 8,
    },
    datalabels: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: false,
      },
      ticks: {
        stepSize: 1,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}

const growthChartData = computed<ChartData<'line'>>(() => {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 9 + i)

  return {
    labels: years.map(String),
    datasets: [
      {
        label: 'Novas Admissões',
        data: years.map((year) => stats.admissionsPerYear[year] || 0),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        fill: false,
      },
    ],
  }
})

const growthChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#1f2937',
      padding: 12,
      cornerRadius: 8,
    },
    datalabels: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6',
      },
      ticks: {
        stepSize: 1,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}

onMounted(async () => {
  try {
    const response = await statsService.getMemberStats()
    Object.assign(stats, response)
  } catch (err) {
    console.error('Erro ao carregar indicadores:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.bg-neutral-50 {
  @apply bg-neutral-50/50;
}
</style>
