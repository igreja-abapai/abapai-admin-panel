<template>
  <div class="asset-inventory-pdf">
    <header class="pdf-header">
      <p class="church-name">{{ churchName }}</p>
      <h1>Inventário de Patrimônio</h1>
      <p class="generated-at">{{ generatedAt }}</p>
    </header>

    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Descrição</th>
          <th>Categoria</th>
          <th>Local</th>
          <th>Qtd</th>
          <th>Valor unit.</th>
          <th>Situação</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="asset in assets" :key="asset.id">
          <td>{{ asset.code }}</td>
          <td>{{ asset.description }}</td>
          <td>{{ asset.category?.name ?? '—' }}</td>
          <td>{{ asset.location?.name ?? '—' }}</td>
          <td>{{ asset.quantity }}</td>
          <td>{{ formatCurrency(asset.acquisitionValue) }}</td>
          <td>{{ asset.status }}</td>
        </tr>
      </tbody>
    </table>

    <footer class="pdf-footer">
      <p>Total de itens: {{ assets.length }}</p>
      <p>Quantidade total: {{ totalQuantity }}</p>
      <p>Valor total de aquisição: {{ formatCurrency(totalValue) }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Asset } from '@/types/assets'
import { formatCurrency } from '@/constants/assets'
import { CHURCH_NAME } from '@/constants/church'

const props = defineProps<{
  assets: Asset[]
  generatedAt: string
  churchName?: string
}>()

const churchName = computed(() => props.churchName || CHURCH_NAME)

const totalQuantity = computed(() => props.assets.reduce((sum, asset) => sum + asset.quantity, 0))

const totalValue = computed(() =>
  props.assets.reduce((sum, asset) => {
    const unit = asset.acquisitionValue ? Number(asset.acquisitionValue) : 0
    return sum + unit * asset.quantity
  }, 0),
)
</script>

<style scoped>
.asset-inventory-pdf {
  font-family: Arial, Helvetica, sans-serif;
  color: #171717;
  padding: 16px;
  background: #fff;
}

.pdf-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #e5e5e5;
  padding-bottom: 12px;
}

.pdf-header h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px;
}

.church-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px;
}

.pdf-header .generated-at {
  font-size: 12px;
  color: #737373;
  margin: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

th,
td {
  border: 1px solid #d4d4d4;
  padding: 6px 8px;
  text-align: left;
}

th {
  background: #f5f5f5;
  font-weight: 600;
}

.pdf-footer {
  margin-top: 16px;
  font-size: 12px;
  color: #404040;
}

.pdf-footer p {
  margin: 4px 0;
}
</style>
