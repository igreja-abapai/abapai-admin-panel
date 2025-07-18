import { httpService } from './http'

export interface Address {
  id: string
  city: string
  country: string
  district: string
  postalCode?: string
  streetName: string
  streetNumber: string
  state: string
  createdAt?: string
  updatedAt?: string
}

export interface Member {
  id: string
  name: string
  gender: string
  birthdate: string
  nationality: string
  phone: string
  email?: string
  maritalStatus: string
  spouseName?: string
  educationLevel: string
  yearOfConversion?: string
  occupation: string
  rg: string
  issuingBody: string
  cpf: string
  lastChurch?: string
  lastPositionHeld?: string
  isBaptized: boolean
  isBaptizedInTheHolySpirit?: boolean
  currentPosition?: string
  wantsToBeAVolunteer?: boolean
  areaOfInterest?: string
  address?: Address
  createdAt?: string
  updatedAt?: string
}

export interface CreateMemberRequest {
  name: string
  gender: string
  birthdate: string
  nationality: string
  phone: string
  email?: string
  maritalStatus: string
  spouseName?: string
  educationLevel: string
  yearOfConversion?: string
  occupation: string
  rg: string
  issuingBody: string
  cpf: string
  lastChurch?: string
  lastPositionHeld?: string
  isBaptized: boolean
  isBaptizedInTheHolySpirit?: boolean
  currentPosition?: string
  wantsToBeAVolunteer?: boolean
  areaOfInterest?: string
}

export interface UpdateMemberRequest {
  name?: string
  gender?: string
  birthdate?: string
  nationality?: string
  phone?: string
  email?: string
  maritalStatus?: string
  spouseName?: string
  educationLevel?: string
  yearOfConversion?: string
  occupation?: string
  rg?: string
  issuingBody?: string
  cpf?: string
  lastChurch?: string
  lastPositionHeld?: string
  isBaptized?: boolean
  isBaptizedInTheHolySpirit?: boolean
  currentPosition?: string
  wantsToBeAVolunteer?: boolean
  areaOfInterest?: string
}

export class MembersService {
  async getMembers(): Promise<Member[]> {
    return await httpService.get<Member[]>('/member')
  }

  async getMember(id: string): Promise<Member> {
    return await httpService.get<Member>(`/member/${id}`)
  }

  async createMember(data: CreateMemberRequest): Promise<Member> {
    return await httpService.post<Member>('/member', data)
  }

  async updateMember(id: string, data: UpdateMemberRequest): Promise<Member> {
    return await httpService.patch<Member>(`/member/${id}`, data)
  }

  async deleteMember(id: string): Promise<void> {
    return await httpService.delete<void>(`/member/${id}`)
  }
}

export const membersService = new MembersService()
