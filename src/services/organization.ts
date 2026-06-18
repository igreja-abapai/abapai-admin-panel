import { httpService } from './http'
import type { Member } from './members'

export interface Department {
  id: number
  name: string
  type: string
  description?: string
  parentId?: number
  parent?: Department
  children?: Department[]
  isActive: boolean
  memberDepartments?: MemberDepartment[]
  roleEligibilities?: DepartmentRoleEligibility[]
  positionEligibilities?: DepartmentPositionEligibility[]
  createdAt?: string
  updatedAt?: string
}

export interface MemberDepartment {
  id: number
  memberId: number
  departmentId: number
  role: string
  startedAt?: string
  endedAt?: string
  isActive: boolean
  member?: Member
  department?: Department
}

export interface ServiceRole {
  id: number
  name: string
  category: string
  description?: string
  isActive: boolean
  allowsGuestAssignment?: boolean
}

export interface MemberServiceCapability {
  id: number
  memberId: number
  serviceRoleId: number
  source: string
  isActive: boolean
  notes?: string
  validFrom?: string
  validTo?: string
  member?: Member
  serviceRole?: ServiceRole
}

export interface DepartmentRoleEligibility {
  id: number
  departmentId: number
  serviceRoleId: number
  isDefault: boolean
  department?: Department
  serviceRole?: ServiceRole
}

export interface ChurchPosition {
  id: number
  name: string
  category: string
  description?: string
  isActive: boolean
  sortOrder?: number
}

export interface DepartmentPositionEligibility {
  id: number
  departmentId: number
  churchPositionId: number
  department?: Department
  churchPosition?: ChurchPosition
}

export interface ServingGroupMember {
  id: number
  servingGroupId: number
  memberId: number
  member?: Member
}

export interface ServingGroup {
  id: number
  name: string
  notes?: string
  isActive: boolean
  serviceRoleId?: number
  serviceRole?: ServiceRole
  members?: ServingGroupMember[]
}

export interface WorshipServiceType {
  id: number
  name: string
  description?: string
  defaultWeekday?: string
  defaultTime?: string
  isActive: boolean
  typeRoles?: WorshipServiceTypeRole[]
  requiredRoles?: WorshipServiceTypeRole[]
}

export interface WorshipServiceTypeRole {
  id: number
  worshipServiceTypeId: number
  serviceRoleId: number
  quantity: number
  isRequired: boolean
  sortOrder: number
  serviceRole?: ServiceRole
}

export interface ServiceAssignment {
  id: number
  worshipServiceId: number
  serviceRoleId: number
  slotNumber: number
  memberId?: number
  servingGroupId?: number
  status: string
  assignedBy?: number
  assignedAt?: string
  notes?: string
  guestName?: string | null
  serviceRole?: ServiceRole
  member?: Member
  servingGroup?: ServingGroup
}

export interface WorshipService {
  id: number
  worshipServiceTypeId?: number
  scheduledAt: string
  name?: string
  status: string
  notes?: string
  publishedBy?: number
  publishedAt?: string
  worshipServiceType?: WorshipServiceType
  assignments?: ServiceAssignment[]
}

export interface AutoAssignWarningItem {
  serviceName: string
  scheduledAt: string
  serviceRoleId: number
  serviceRoleName: string
  missingCount: number
}

export interface AutoAssignIncompleteService {
  serviceName: string
  scheduledAt: string
  serviceRoleName: string
  missingCount: number
}

export interface GenerateMonthAutoAssignResult {
  selectedRoleIds: number[]
  totalSlots: number
  assignedSlots: number
  unassignedSlots: number
  warningItems: AutoAssignWarningItem[]
  incompleteServices: AutoAssignIncompleteService[]
}

export interface GenerateWorshipServicesMonthResult {
  createdServices: WorshipService[]
  requiresConfirmation: boolean
  warningMessage?: string
  autoAssign?: GenerateMonthAutoAssignResult
}

class OrganizationService {
  // Departments
  getDepartments() {
    return httpService.get<Department[]>('/organization/departments')
  }

  getDepartment(id: number) {
    return httpService.get<Department>(`/organization/departments/${id}`)
  }

  createDepartment(data: Partial<Department>) {
    return httpService.post<Department>('/organization/departments', data)
  }

  updateDepartment(id: number, data: Partial<Department>) {
    return httpService.patch<Department>(`/organization/departments/${id}`, data)
  }

  deleteDepartment(id: number) {
    return httpService.delete<void>(`/organization/departments/${id}`)
  }

  getMemberDepartments() {
    return httpService.get<MemberDepartment[]>('/organization/departments/member-departments/all')
  }

  createMemberDepartment(data: {
    memberId: number
    departmentId: number
    role?: string
    startedAt?: string
    endedAt?: string
    isActive?: boolean
  }) {
    return httpService.post<MemberDepartment>(
      '/organization/departments/member-departments',
      data,
    )
  }

  updateMemberDepartment(
    id: number,
    data: Partial<{
      memberId: number
      departmentId: number
      role: string
      startedAt: string
      endedAt: string
      isActive: boolean
    }>,
  ) {
    return httpService.patch<MemberDepartment>(
      `/organization/departments/member-departments/${id}`,
      data,
    )
  }

  deleteMemberDepartment(id: number) {
    return httpService.delete<void>(`/organization/departments/member-departments/${id}`)
  }

  // Service roles
  getServiceRoles() {
    return httpService.get<ServiceRole[]>('/organization/service-roles')
  }

  createServiceRole(data: Partial<ServiceRole>) {
    return httpService.post<ServiceRole>('/organization/service-roles', data)
  }

  updateServiceRole(id: number, data: Partial<ServiceRole>) {
    return httpService.patch<ServiceRole>(`/organization/service-roles/${id}`, data)
  }

  deleteServiceRole(id: number) {
    return httpService.delete<void>(`/organization/service-roles/${id}`)
  }

  getEligibleMembersForRole(roleId: number) {
    return httpService.get<Member[]>(`/organization/service-roles/${roleId}/eligible-members`)
  }

  getMemberCapabilities() {
    return httpService.get<MemberServiceCapability[]>(
      '/organization/service-roles/member-capabilities/all',
    )
  }

  createMemberCapability(data: {
    memberId: number
    serviceRoleId: number
    source?: string
    isActive?: boolean
    notes?: string
    validFrom?: string
    validTo?: string
  }) {
    return httpService.post<MemberServiceCapability>(
      '/organization/service-roles/member-capabilities',
      data,
    )
  }

  deleteMemberCapability(id: number) {
    return httpService.delete<void>(`/organization/service-roles/member-capabilities/${id}`)
  }

  getDepartmentRoleEligibilities() {
    return httpService.get<DepartmentRoleEligibility[]>(
      '/organization/service-roles/department-role-eligibilities/all',
    )
  }

  createDepartmentRoleEligibility(data: {
    departmentId: number
    serviceRoleId: number
    isDefault?: boolean
  }) {
    return httpService.post<DepartmentRoleEligibility>(
      '/organization/service-roles/department-role-eligibilities',
      data,
    )
  }

  updateDepartmentRoleEligibility(
    id: number,
    data: {
      departmentId?: number
      serviceRoleId?: number
      isDefault?: boolean
    },
  ) {
    return httpService.patch<DepartmentRoleEligibility>(
      `/organization/service-roles/department-role-eligibilities/${id}`,
      data,
    )
  }

  deleteDepartmentRoleEligibility(id: number) {
    return httpService.delete<void>(
      `/organization/service-roles/department-role-eligibilities/${id}`,
    )
  }

  // Church positions
  getChurchPositions() {
    return httpService.get<ChurchPosition[]>('/organization/church-positions')
  }

  createChurchPosition(data: Partial<ChurchPosition>) {
    return httpService.post<ChurchPosition>('/organization/church-positions', data)
  }

  updateChurchPosition(id: number, data: Partial<ChurchPosition>) {
    return httpService.patch<ChurchPosition>(`/organization/church-positions/${id}`, data)
  }

  deleteChurchPosition(id: number) {
    return httpService.delete<void>(`/organization/church-positions/${id}`)
  }

  getDepartmentPositionEligibilities() {
    return httpService.get<DepartmentPositionEligibility[]>(
      '/organization/church-positions/department-position-eligibilities/all',
    )
  }

  createDepartmentPositionEligibility(data: {
    departmentId: number
    churchPositionId: number
  }) {
    return httpService.post<DepartmentPositionEligibility>(
      '/organization/church-positions/department-position-eligibilities',
      data,
    )
  }

  deleteDepartmentPositionEligibility(id: number) {
    return httpService.delete<void>(
      `/organization/church-positions/department-position-eligibilities/${id}`,
    )
  }

  // Worship templates & schedules
  getWorshipServiceTypes() {
    return httpService.get<WorshipServiceType[]>('/organization/worship-schedules/service-types')
  }

  createWorshipServiceType(data: Partial<WorshipServiceType>) {
    return httpService.post<WorshipServiceType>(
      '/organization/worship-schedules/service-types',
      data,
    )
  }

  updateWorshipServiceType(id: number, data: Partial<WorshipServiceType>) {
    return httpService.patch<WorshipServiceType>(
      `/organization/worship-schedules/service-types/${id}`,
      data,
    )
  }

  deleteWorshipServiceType(id: number) {
    return httpService.delete<void>(`/organization/worship-schedules/service-types/${id}`)
  }

  getWorshipServiceTypeRoles() {
    return httpService.get<WorshipServiceTypeRole[]>(
      '/organization/worship-schedules/service-type-roles',
    )
  }

  createWorshipServiceTypeRole(data: {
    worshipServiceTypeId: number
    serviceRoleId: number
    quantity?: number
    isRequired?: boolean
    sortOrder?: number
  }) {
    return httpService.post<WorshipServiceTypeRole>(
      '/organization/worship-schedules/service-type-roles',
      data,
    )
  }

  updateWorshipServiceTypeRole(
    id: number,
    data: {
      serviceRoleId?: number
      quantity?: number
      isRequired?: boolean
      sortOrder?: number
    },
  ) {
    return httpService.patch<WorshipServiceTypeRole>(
      `/organization/worship-schedules/service-type-roles/${id}`,
      data,
    )
  }

  deleteWorshipServiceTypeRole(id: number) {
    return httpService.delete<void>(`/organization/worship-schedules/service-type-roles/${id}`)
  }

  getServingGroups() {
    return httpService.get<ServingGroup[]>('/organization/worship-schedules/serving-groups')
  }

  createServingGroup(data: {
    name: string
    serviceRoleId: number
    memberIds: number[]
    notes?: string
    isActive?: boolean
  }) {
    return httpService.post<ServingGroup>('/organization/worship-schedules/serving-groups', data)
  }

  updateServingGroup(
    id: number,
    data: {
      name?: string
      serviceRoleId?: number
      memberIds?: number[]
      notes?: string
      isActive?: boolean
    },
  ) {
    return httpService.patch<ServingGroup>(
      `/organization/worship-schedules/serving-groups/${id}`,
      data,
    )
  }

  deleteServingGroup(id: number) {
    return httpService.delete<void>(`/organization/worship-schedules/serving-groups/${id}`)
  }

  createServingGroupMember(data: { servingGroupId: number; memberId: number }) {
    return httpService.post<ServingGroupMember>(
      '/organization/worship-schedules/serving-group-members',
      data,
    )
  }

  deleteServingGroupMember(id: number) {
    return httpService.delete<void>(
      `/organization/worship-schedules/serving-group-members/${id}`,
    )
  }

  getWorshipServices(month?: number, year?: number) {
    const params = new URLSearchParams()
    if (month) params.append('month', month.toString())
    if (year) params.append('year', year.toString())
    const query = params.toString()
    return httpService.get<WorshipService[]>(
      query ? `/organization/worship-schedules/services?${query}` : '/organization/worship-schedules/services',
    )
  }

  getWorshipService(id: number) {
    return httpService.get<WorshipService>(`/organization/worship-schedules/services/${id}`)
  }

  createWorshipServiceFromTemplate(data: {
    worshipServiceTypeId: number
    scheduledAt: string
    name?: string
    notes?: string
    asDraft?: boolean
  }) {
    return httpService.post<WorshipService>(
      '/organization/worship-schedules/services/from-template',
      data,
    )
  }

  createWorshipServicesFromTemplateByWeekday(data: {
    worshipServiceTypeId: number
    count: number
    weekday?: string
    startFrom?: string
    name?: string
    notes?: string
    asDraft?: boolean
  }) {
    return httpService.post<WorshipService[]>(
      '/organization/worship-schedules/services/from-template/by-weekday',
      data,
    )
  }

  updateWorshipService(
    id: number,
    data: {
      worshipServiceTypeId?: number
      scheduledAt?: string
      name?: string
      notes?: string
    },
  ) {
    return httpService.patch<WorshipService>(
      `/organization/worship-schedules/services/${id}`,
      data,
    )
  }

  deleteWorshipService(id: number) {
    return httpService.delete<void>(`/organization/worship-schedules/services/${id}`)
  }

  deleteWorshipServicesForMonth(month: number, year: number) {
    return httpService.delete<{ deletedCount: number }>(
      '/organization/worship-schedules/services/month',
      { params: { month, year } },
    )
  }

  clearWorshipServiceAssignmentsForMonth(month: number, year: number) {
    return httpService.delete<{ clearedCount: number }>(
      '/organization/worship-schedules/services/month/assignments',
      { params: { month, year } },
    )
  }

  generateWorshipServicesForMonth(data: {
    month: number
    year: number
    autoAssignRoleIds?: number[]
    excludedMemberIds?: number[]
    proceedWithWarnings?: boolean
  }) {
    return httpService.post<GenerateWorshipServicesMonthResult>(
      '/organization/worship-schedules/services/generate-month',
      data,
    )
  }

  generateWorshipAssignmentsForMonth(data: {
    month: number
    year: number
    autoAssignRoleIds: number[]
    excludedMemberIds?: number[]
    proceedWithWarnings?: boolean
  }) {
    return httpService.post<GenerateWorshipServicesMonthResult>(
      '/organization/worship-schedules/services/generate-assignments-month',
      data,
    )
  }

  assignServiceAssignment(
    worshipServiceId: number,
    data: {
      assignmentId: number
      memberId?: number
      servingGroupId?: number
      guestName?: string | null
      notes?: string | null
    },
  ) {
    return httpService.patch<ServiceAssignment>(
      `/organization/worship-schedules/services/${worshipServiceId}/assign`,
      data,
    )
  }

  publishWorshipService(id: number) {
    return httpService.patch<WorshipService>(
      `/organization/worship-schedules/services/${id}/publish`,
      {},
    )
  }

  completeWorshipService(id: number) {
    return httpService.patch<WorshipService>(
      `/organization/worship-schedules/services/${id}/complete`,
      {},
    )
  }

  copyWorshipServiceAssignments(targetId: number, sourceWorshipServiceId: number) {
    return httpService.patch<WorshipService>(
      `/organization/worship-schedules/services/${targetId}/copy-assignments`,
      { sourceWorshipServiceId },
    )
  }

  getEligibleMembersForAssignment(assignmentId: number) {
    return httpService.get<Member[]>(
      `/organization/worship-schedules/assignments/${assignmentId}/eligible-members`,
    )
  }
}

export const organizationService = new OrganizationService()
