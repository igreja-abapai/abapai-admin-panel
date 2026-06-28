import type { Member } from '@/services/members'

function isBlank(value?: string | null): boolean {
  return value == null || String(value).trim() === ''
}

export function getMemberMissingFieldLabels(member: Member): string[] {
  const missing: string[] = []

  if (isBlank(member.cpf)) missing.push('CPF')
  if (!member.birthdate) missing.push('Data de nascimento')
  if (isBlank(member.phone)) missing.push('Telefone')
  if (isBlank(member.address?.streetName)) missing.push('Rua')
  if (isBlank(member.yearOfConversion)) missing.push('Ano de conversão')
  if (isBlank(member.admissionDate)) missing.push('Data de admissão')
  if (member.isBaptized == null) missing.push('Batismo nas águas')
  if (member.isBaptized && isBlank(member.yearOfBaptism)) missing.push('Ano do batismo')

  return missing
}

export function formatMemberMissingFields(member: Member): string {
  return getMemberMissingFieldLabels(member).join(', ')
}

export function hasIncompleteMemberProfile(member: Member): boolean {
  return getMemberMissingFieldLabels(member).length > 0
}
