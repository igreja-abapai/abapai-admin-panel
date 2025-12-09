<template>
  <div v-if="member" class="member-card" ref="memberCardRef">
    <!-- Header with Logo/Title -->
    <div class="card-header">
      <div class="header-content">
        <div class="header-text">
          <img :src="logoUrl" alt="Abapai Logo" class="church-logo" data-logo="true" />
          <div class="title-container">
            <h1 class="card-title">FICHA DE MEMBRO</h1>
            <p class="church-name">Igreja Apostólica Ministério Cristão Aba Pai</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Member Photo and Basic Info -->
    <div class="member-header">
      <div class="member-photo">
        <img
          v-if="member.photoUrl"
          :src="getImageUrl(member.photoUrl)"
          :alt="`Foto de ${member.name}`"
          class="photo-img"
        />
        <div v-else class="photo-placeholder">
          <UserIcon class="user-icon" />
        </div>
      </div>
      <div class="member-basic-info">
        <h2 class="member-name">{{ member.name }}</h2>
        <p class="member-occupation">{{ member.occupation }}</p>
      </div>
    </div>

    <!-- Personal Information -->
    <div class="card-section">
      <h3 class="section-title">Informações Pessoais</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Nome Completo:</span>
          <span class="info-value">{{ member.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Gênero:</span>
          <span class="info-value">{{ member.gender }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data de Nascimento:</span>
          <span class="info-value">{{ formatDate(member.birthdate) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Nacionalidade:</span>
          <span class="info-value">{{ member.nationality }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Naturalidade:</span>
          <span class="info-value">{{ member.placeOfBirth || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Quantidade de Filhos:</span>
          <span class="info-value">
            {{
              member.childrenCount !== null && member.childrenCount !== undefined
                ? member.childrenCount
                : 'Não informado'
            }}
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">Nome do Pai:</span>
          <span class="info-value">{{ member.fatherName || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Nome da Mãe:</span>
          <span class="info-value">{{ member.motherName || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Telefone:</span>
          <span class="info-value">{{ member.phone }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ member.email || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Estado Civil:</span>
          <span class="info-value">{{ member.maritalStatus }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Nome do Cônjuge:</span>
          <span class="info-value">{{ member.spouseName || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Escolaridade:</span>
          <span class="info-value">{{ member.educationLevel }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Profissão/Ocupação:</span>
          <span class="info-value">{{ member.occupation }}</span>
        </div>
      </div>
    </div>

    <!-- Address Information -->
    <div v-if="member.address" class="card-section">
      <h3 class="section-title">Endereço</h3>
      <div class="info-grid">
        <div class="info-item full-width">
          <span class="info-label">Rua:</span>
          <span class="info-value">
            {{ member.address.streetName }}, {{ member.address.streetNumber }}
            <span v-if="member.address.complement"> - {{ member.address.complement }}</span>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">Bairro:</span>
          <span class="info-value">{{ member.address.district }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Cidade:</span>
          <span class="info-value">{{ member.address.city }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Estado:</span>
          <span class="info-value">{{ member.address.state }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">CEP:</span>
          <span class="info-value">{{ member.address.postalCode || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">País:</span>
          <span class="info-value">{{ member.address.country }}</span>
        </div>
      </div>
    </div>

    <!-- Document Information -->
    <div class="card-section">
      <h3 class="section-title">Documentos</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">CPF:</span>
          <span class="info-value">{{ member.cpf }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">RG:</span>
          <span class="info-value">{{ member.rg }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Órgão Expedidor:</span>
          <span class="info-value">{{ member.issuingBody }}</span>
        </div>
      </div>
    </div>

    <!-- Spiritual Information -->
    <div class="card-section">
      <h3 class="section-title">Informações Espirituais e Eclesiásticas</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Ano de Conversão:</span>
          <span class="info-value">{{ member.yearOfConversion || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Última Igreja:</span>
          <span class="info-value">{{ member.lastChurch || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Data de Admissão:</span>
          <span class="info-value">{{ member.admissionDate || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Tipo de Admissão:</span>
          <span class="info-value">{{ member.admissionType || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Último Cargo Exercido:</span>
          <span class="info-value">{{ member.lastPositionHeld || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Período do Último Cargo:</span>
          <span class="info-value">{{ member.lastPositionPeriod || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Cargo Atual:</span>
          <span class="info-value">{{ member.currentPosition || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Área de Interesse:</span>
          <span class="info-value">{{ member.areaOfInterest || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Batizado nas Águas:</span>
          <span class="info-value">{{ member.isBaptized ? 'Sim' : 'Não' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Ano do Batismo:</span>
          <span class="info-value">{{ member.yearOfBaptism || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Local do Batismo:</span>
          <span class="info-value">{{ member.baptismPlace || 'Não informado' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Batizado no Espírito Santo:</span>
          <span class="info-value">
            {{
              member.isBaptizedInTheHolySpirit === true
                ? 'Sim'
                : member.isBaptizedInTheHolySpirit === false
                  ? 'Não'
                  : 'Não informado'
            }}
          </span>
        </div>
        <div v-if="member.observations" class="info-item full-width">
          <span class="info-label">Observações:</span>
          <span class="info-value">{{ member.observations }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <p class="footer-text">
        Documento gerado em {{ new Date().toLocaleDateString('pt-BR') }} às
        {{ new Date().toLocaleTimeString('pt-BR') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UserIcon } from '@heroicons/vue/24/outline'
import type { Member } from '@/services/members'
import { formatDate } from '@/utils/dateFormat'
import { getImageUrl } from '@/utils/imageUrl'
import abapaiLogo from '@/assets/images/abapai_logo.png'

// Explicitly type the logo for TypeScript
const logoUrl: string = abapaiLogo

interface Props {
  member: Member | null
}

const props = defineProps<Props>()
const memberCardRef = ref<HTMLElement>()

defineExpose({
  element: memberCardRef,
})
</script>

<style scoped>
.member-card {
  width: 210mm; /* A4 width */
  min-height: 297mm; /* A4 height */
  padding: 5mm 20mm 20mm 20mm;
  margin: 0 auto; /* Center the card */
  background: white;
  color: #111827;
  font-family: 'Arial', 'Helvetica', sans-serif;
  font-size: 11pt;
  line-height: 1.5;
  box-sizing: border-box;
}

.card-header {
  border-bottom: 3px solid #3b82f6;
  padding-bottom: 10px;
  margin-bottom: 25px;
}

.header-content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 5px;
}

.header-text {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 15px;
}

.church-logo {
  position: absolute;
  right: 100%;
  margin-right: 10px;
  width: 60px;
  object-fit: contain;
  background: transparent;
  mix-blend-mode: normal;
  margin-bottom: -5px;
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card-title {
  font-size: 24pt;
  font-weight: bold;
  color: #1e40af;
  margin: 0;
  margin-bottom: 5px;
}

.church-name {
  font-size: 12pt;
  color: #4b5563;
  margin: 0;
}

.member-header {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.member-photo {
  flex-shrink: 0;
}

.photo-img,
.photo-placeholder {
  width: 80px;
  height: 100px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
}

.photo-img {
  object-fit: cover;
}

.photo-placeholder {
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-icon {
  width: 48px;
  height: 48px;
}

.member-basic-info {
  flex: 1;
}

.member-name {
  font-size: 18pt;
  font-weight: bold;
  color: #111827;
  margin: 0 0 5px 0;
}

.member-occupation {
  font-size: 12pt;
  color: #6b7280;
  margin: 0 0 10px 0;
}

.member-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 9pt;
  font-weight: 600;
  border: 1px solid;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
  border-color: #065f46;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
  border-color: #991b1b;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
  border-color: #1e40af;
}

.card-section {
  margin-bottom: 25px;
  page-break-inside: avoid;
}

.section-title {
  font-size: 14pt;
  font-weight: bold;
  color: #1e40af;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #3b82f6;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-weight: 600;
  color: #4b5563;
  font-size: 10pt;
}

.info-value {
  color: #111827;
  font-size: 11pt;
}

.card-footer {
  margin-top: 30px;
  padding-top: 15px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.footer-text {
  font-size: 9pt;
  color: #6b7280;
  margin: 0;
}

/* Print optimizations */
@media print {
  .member-card {
    margin: 0;
    padding: 15mm;
    box-shadow: none;
  }

  .card-section {
    page-break-inside: avoid;
  }
}
</style>
