import { httpService } from './http'
import type { Address } from './address'
import type { ChurchPosition } from './organization'

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
  primaryPositionId?: number | null
  secondaryPositionId?: number | null
  primaryPosition?: ChurchPosition
  secondaryPosition?: ChurchPosition
  wantsToBeAVolunteer?: boolean | null
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
  absenceReason?: string
  deletedAt?: string | null
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
  primaryPositionId?: number | null
  secondaryPositionId?: number | null
  wantsToBeAVolunteer?: boolean | null
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
  primaryPositionId?: number | null
  secondaryPositionId?: number | null
  wantsToBeAVolunteer?: boolean | null
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
  isActive?: boolean
  absenceReason?: string | null
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
  isActive?: boolean
  deletedOnly?: boolean
  isPaginated?: boolean
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
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
    if (params?.deletedOnly !== undefined)
      queryParams.append('deletedOnly', params.deletedOnly.toString())
    if (params?.isPaginated !== undefined)
      queryParams.append('isPaginated', params.isPaginated.toString())

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

  async restoreMember(id: string): Promise<Member> {
    return await httpService.patch<Member>(`/member/${id}/restore`, {})
  }
}

export const membersService = new MembersService()
