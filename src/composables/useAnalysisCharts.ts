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
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

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

export const donutChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        padding: 15,
        usePointStyle: true,
        font: { family: "'Inter Variable', sans-serif", size: 11 },
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
          if (sum === 0) return ''
          return `${Math.round((value * 100) / sum)}%`
        }
        return ''
      },
      font: { weight: 'bold', size: 12 },
      display: (context) => {
        const value = context.dataset.data[context.dataIndex] as number
        return value > 0
      },
    },
  },
  cutout: '65%',
}

export const bottomLegendDonutOptions: ChartOptions<'doughnut'> = {
  ...donutChartOptions,
  plugins: {
    ...donutChartOptions.plugins,
    legend: {
      ...donutChartOptions.plugins?.legend,
      position: 'bottom',
    },
  },
}

export const barChartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1f2937', padding: 10, cornerRadius: 8 },
    datalabels: { display: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { display: false }, ticks: { stepSize: 1 } },
    x: { grid: { display: false } },
  },
}

export const lineChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1f2937', padding: 12, cornerRadius: 8 },
    datalabels: { display: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { stepSize: 1 } },
    x: { grid: { display: false } },
  },
}

export const groupedBarChartOptions: ChartOptions<'bar'> = {
  ...barChartOptions,
  plugins: {
    ...barChartOptions.plugins,
    legend: {
      display: true,
      position: 'bottom',
      labels: { usePointStyle: true, padding: 12 },
    },
  },
}

export function lastTenYears(): number[] {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 10 }, (_, i) => currentYear - 9 + i)
}

export function yearRecordToSeries(record: Record<number, number>): number[] {
  return lastTenYears().map((year) => record[year] || 0)
}
