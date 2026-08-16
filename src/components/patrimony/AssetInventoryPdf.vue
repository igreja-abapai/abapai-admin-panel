<template>
  <div class="asset-inventory-pdf">
    <header class="pdf-header">
      <img :src="logoUrl" data-logo="true" alt="Logo Aba Pai" class="church-logo" />
      <p class="church-name">{{ churchName }}</p>
      <h1>Inventário de Patrimônio</h1>
      <p class="generated-at">Gerado em {{ generatedAt }}</p>
    </header>

    <section
      v-for="(pageAssets, pageIndex) in pagedAssets"
      :key="`page-${pageIndex}`"
      class="pdf-page-section"
      :class="{ 'pdf-page-break': pageIndex > 0 }"
    >
      <table class="items-table">
        <colgroup>
          <col class="col-code" />
          <col class="col-description" />
          <col class="col-category" />
          <col class="col-location" />
          <col class="col-qty" />
          <col class="col-value" />
          <col class="col-status" />
        </colgroup>
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
          <tr v-for="asset in pageAssets" :key="asset.id">
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
    </section>

    <table class="summary-table">
      <thead>
        <tr>
          <th>Total de itens</th>
          <th>Quantidade total</th>
          <th>Valor total de aquisição</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ assets.length }}</td>
          <td>{{ totalQuantity }}</td>
          <td>{{ formatCurrency(totalValue) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Asset } from '@/types/assets'
import { formatCurrency } from '@/constants/assets'
import { CHURCH_NAME } from '@/constants/church'
import abapaiLogo from '@/assets/images/abapai_logo.png'

/** First page has the document header; fill as much vertical space as possible. */
const FIRST_PAGE_ROWS = 18
/** Subsequent pages are full tables with only the column header. */
const NEXT_PAGE_ROWS = 24

const props = defineProps<{
  assets: Asset[]
  generatedAt: string
  churchName?: string
}>()

const logoUrl: string = abapaiLogo
const churchName = computed(() => props.churchName || CHURCH_NAME)

const pagedAssets = computed(() => {
  const pages: Asset[][] = []
  if (props.assets.length === 0) {
    return pages
  }

  pages.push(props.assets.slice(0, FIRST_PAGE_ROWS))

  let offset = FIRST_PAGE_ROWS
  while (offset < props.assets.length) {
    pages.push(props.assets.slice(offset, offset + NEXT_PAGE_ROWS))
    offset += NEXT_PAGE_ROWS
  }

  return pages
})

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
  padding: 18px 14px 10px;
  background: #fff;
}

.pdf-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 0;
}

.church-logo {
  width: 72px;
  height: auto;
  object-fit: contain;
  margin-bottom: 2px;
}

.pdf-header h1 {
  font-size: 18px;
  font-weight: 700;
  margin: 8px 0 4px;
  color: #171717;
}

.church-name {
  font-size: 15px;
  font-weight: 600;
  color: #404040;
  margin: 0;
  letter-spacing: 0.01em;
}

.pdf-header .generated-at {
  font-size: 11px;
  color: #737373;
  margin: 0;
}

.pdf-page-break {
  page-break-before: always;
  break-before: page;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.items-table {
  page-break-inside: avoid;
  table-layout: fixed;
}

.col-code {
  width: 14%;
}

.col-description {
  width: 28%;
}

.col-category {
  width: 16%;
}

.col-location {
  width: 14%;
}

.col-qty {
  width: 6%;
}

.col-value {
  width: 12%;
}

.col-status {
  width: 10%;
}

th,
td {
  border: 1px solid #d4d4d4;
  padding: 5px 8px;
  text-align: left;
  vertical-align: middle;
  overflow-wrap: break-word;
  word-break: break-word;
}

th {
  background: #f5f5f5;
  font-weight: 600;
}

.summary-table {
  margin-top: 14px;
  width: 100%;
  page-break-inside: avoid;
}

.summary-table th,
.summary-table td {
  text-align: center;
}
</style>
