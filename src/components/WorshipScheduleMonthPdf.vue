<template>
  <div class="worship-schedule-month-pdf">
    <div class="watermark">
      <img :src="logoUrl" data-logo="true" alt="" class="watermark-logo" />
    </div>

    <header class="pdf-header">
      <h1 class="title">Escala de cultos</h1>
      <p class="month-label">{{ monthLabel }}</p>
      <p v-if="selectedRolesLabel" class="roles-label">Funções: {{ selectedRolesLabel }}</p>
    </header>

    <section v-for="service in services" :key="service.key" class="service-block">
      <div class="service-heading">
        <h2 class="service-name">{{ service.title }}</h2>
        <p class="service-datetime">{{ service.subtitle }}</p>
      </div>

      <ul class="assignment-list">
        <li v-for="(row, index) in service.rows" :key="`${service.key}-${index}`">
          <span class="role-name">{{ row.roleName }}</span>
          <span class="member-name">{{ row.memberName }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import logoWhiteBackground from '@/assets/images/logo_white_background2.png'
import type { WorshipSchedulePdfService } from '@/utils/worshipSchedulePdf'

defineProps<{
  monthLabel: string
  selectedRolesLabel?: string
  services: WorshipSchedulePdfService[]
}>()

const logoUrl: string = logoWhiteBackground
</script>

<style scoped>
@import url('https://fonts.bunny.net/css?family=varela-round:400');

.worship-schedule-month-pdf {
  position: relative;
  width: 210mm;
  padding: 14mm 16mm 16mm;
  background: #ffffff;
  box-sizing: border-box;
  color: #111111;
}

.watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}

.watermark-logo {
  width: 420px;
  max-width: 72%;
  opacity: 0.08;
  object-fit: contain;
}

.pdf-header,
.service-block {
  position: relative;
  z-index: 2;
}

.pdf-header {
  text-align: center;
  margin-bottom: 7mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid #e5e5e5;
}

.title {
  margin: 0;
  font-family: 'Varela Round', 'Inter Variable', sans-serif;
  font-size: 22pt;
  font-weight: 400;
  color: #111111;
}

.month-label {
  margin: 3mm 0 0;
  font-family: 'Inter Variable', sans-serif;
  font-size: 12pt;
  color: #404040;
}

.roles-label {
  margin: 2mm 0 0;
  font-family: 'Inter Variable', sans-serif;
  font-size: 10pt;
  color: #737373;
}

.service-block {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 2.8mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid #f0f0f0;
}

.service-block:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.service-heading {
  margin-bottom: 1.2mm;
}

.service-name {
  margin: 0;
  font-family: 'Inter Variable', sans-serif;
  font-size: 12.5pt;
  font-weight: 700;
  color: #171717;
}

.service-datetime {
  margin: 0.5mm 0 0;
  font-family: 'Inter Variable', sans-serif;
  font-size: 9.5pt;
  color: #525252;
}

.assignment-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.assignment-list li {
  display: flex;
  align-items: baseline;
  gap: 3mm;
  padding: 0.7mm 0;
  font-family: 'Inter Variable', sans-serif;
  font-size: 10.6pt;
  line-height: 1.24;
}

.role-name {
  min-width: 38mm;
  font-weight: 600;
  color: #262626;
}

.member-name {
  flex: 1;
  color: #1f1f1f;
}
</style>
