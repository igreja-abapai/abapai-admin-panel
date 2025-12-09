import { httpService } from './http'
import type { Address } from './address'

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
  yearOfBaptism?: string
  placeOfBirth?: string
  occupation: string
  rg: string
  issuingBody: string
  cpf: string
  lastChurch?: string
  lastPositionHeld?: string
  isBaptized: boolean
  isBaptizedInTheHolySpirit?: boolean | null
  currentPosition?: string
  wantsToBeAVolunteer?: boolean
  areaOfInterest?: string
  photoUrl?: string
  childrenCount?: number
  fatherName?: string
  motherName?: string
  lastPositionPeriod?: string
  baptismPlace?: string
  observations?: string
  admissionDate?: string
  admissionType?: string
  isActive: boolean
  address?: Address
  createdAt?: string
  updatedAt?: string
  createdBy?: number
  updatedBy?: number
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
  yearOfBaptism?: string
  placeOfBirth?: string
  occupation: string
  rg: string
  issuingBody: string
  cpf: string
  lastChurch?: string
  lastPositionHeld?: string
  isBaptized: boolean
  isBaptizedInTheHolySpirit?: boolean | null
  currentPosition?: string
  wantsToBeAVolunteer?: boolean
  areaOfInterest?: string
  photoUrl?: string
  childrenCount?: number
  fatherName?: string
  motherName?: string
  lastPositionPeriod?: string
  baptismPlace?: string
  observations?: string
  admissionDate?: string
  admissionType?: string
  addressId: number
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
  yearOfBaptism?: string
  placeOfBirth?: string
  occupation?: string
  rg?: string
  issuingBody?: string
  cpf?: string
  lastChurch?: string
  lastPositionHeld?: string
  isBaptized?: boolean
  isBaptizedInTheHolySpirit?: boolean | null
  currentPosition?: string
  wantsToBeAVolunteer?: boolean
  areaOfInterest?: string
  photoUrl?: string
  childrenCount?: number
  fatherName?: string
  motherName?: string
  lastPositionPeriod?: string
  baptismPlace?: string
  observations?: string
  admissionDate?: string
  admissionType?: string
}

export interface PaginatedMembersResponse {
  data: Member[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface GetMembersParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  search?: string
  isBaptized?: boolean
}

export class MembersService {
  async getMembers(params?: GetMembersParams): Promise<PaginatedMembersResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.isBaptized !== undefined)
      queryParams.append('isBaptized', params.isBaptized.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `/member?${queryString}` : '/member'
    return await httpService.get<PaginatedMembersResponse>(url)
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
