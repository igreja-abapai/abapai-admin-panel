<template>
  <div class="birthday-list-pdf">
    <img :src="flourishUrl" alt="" class="corner-flourish corner-flourish-tl" />
    <img :src="flourishUrl" alt="" class="corner-flourish corner-flourish-br" />

    <div class="watermark">
      <img :src="logoUrl" data-logo="true" alt="" class="watermark-logo" />
    </div>

    <h1 class="title">Aniversariantes do mês de {{ monthName }}</h1>

    <div class="birthday-list-wrapper">
      <ul class="birthday-list">
        <li v-for="entry in entries" :key="`${entry.name}-${entry.day}`">
          {{ entry.name }} - dia {{ entry.day }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import flourishDetail from '@/assets/images/flourish_detail_2.png'
import logoWhiteBackground from '@/assets/images/logo_white_background2.png'

export interface BirthdayPdfEntry {
  name: string
  day: number
}

defineProps<{
  monthName: string
  entries: BirthdayPdfEntry[]
}>()

const flourishUrl: string = flourishDetail
const logoUrl: string = logoWhiteBackground
</script>

<style scoped>
@import url('https://fonts.bunny.net/css?family=varela-round:400');

.birthday-list-pdf {
  position: relative;
  width: 297mm;
  height: 210mm;
  background: #ffffff;
  overflow: hidden;
  box-sizing: border-box;
}

.corner-flourish {
  position: absolute;
  width: 230px;
  height: auto;
  pointer-events: none;
  z-index: 4;
}

.corner-flourish-tl {
  top: 0;
  left: 0;
  transform: rotate(180deg);
}

.corner-flourish-br {
  right: 0;
  bottom: 0;
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
  width: 520px;
  max-width: 78%;
  opacity: 0.1;
  object-fit: contain;
}

.title {
  position: absolute;
  top: 14mm;
  left: 20mm;
  right: 20mm;
  margin: 0;
  z-index: 3;
  font-family: 'Varela Round', 'Inter Variable', sans-serif;
  font-size: 30pt;
  font-weight: 400;
  color: #111111;
  text-align: center;
}

.birthday-list-wrapper {
  position: absolute;
  top: 0;
  right: 20mm;
  bottom: 12mm;
  left: 20mm;
  height: fit-content;
  margin: auto;
  z-index: 3;
  text-align: center;
}

.birthday-list {
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: center;
}

.birthday-list li {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 24pt;
  line-height: 1.6;
  color: #111111;
}
</style>
