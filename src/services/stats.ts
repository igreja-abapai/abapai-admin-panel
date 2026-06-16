import { httpService } from './http'

export interface MemberStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  withoutDepartmentCount: number
  withPositionCount: number
  withoutPositionCount: number
  withPositionPercentage: string
  baptizedCount: number
  baptizedPercentage: string
  averageAge: number
  newConvertsPercentage: string
  newConvertsCount: number
  admissionTypes: Record<string, number>
  genderCounts: Record<string, number>
  ageCounts: {
    adolescents: number
    youngAdults: number
    adults: number
    seniors: number
  }
  tenureCounts: {
    over10: number
    between5And10: number
    between2And5: number
    under2: number
  }
  admissionsPerYear: Record<number, number>
  departuresPerYear: Record<number, number>
  netGrowthPerYear: Record<number, number>
}

export interface OrganizationStatsSummary {
  activeDepartmentsCount: number
  inactiveDepartmentsCount: number
  membersLinkedToDepartmentsCount: number
  departmentCoveragePercentage: string
  withPrimaryPositionCount: number
  withPrimaryPositionPercentage: string
  withoutPrimaryPositionCount: number
  ministerialCount: number
  operationalCount: number
  departmentsWithoutLeaderCount: number
  obreirosCount: number
  servingGroupsCount: number
  avgServingGroupSize: number
  rolesWithoutCoverageCount: number
  membersInMultipleDepartments: number
}

export interface OrganizationStats {
  summary: OrganizationStatsSummary
  membersByDepartment: { departmentId: number; name: string; count: number }[]
  departmentTypeBreakdown: Record<string, number>
  departmentRoleBreakdown: { leader: number; member: number; assistant: number }
  positionsByName: { positionId: number; name: string; category: string; count: number }[]
  positionCategoryBreakdown: Record<string, number>
  departmentsWithoutLeader: { id: number; name: string; memberCount: number }[]
  serviceRolesByCoverage: {
    roleId: number
    name: string
    eligibleCount: number
    manualCount: number
    departmentCount: number
  }[]
  rolesWithoutCoverage: { roleId: number; name: string }[]
}

export class StatsService {
  async getMemberStats(): Promise<MemberStats> {
    return await httpService.get<MemberStats>('/stats/members')
  }

  async getOrganizationStats(): Promise<OrganizationStats> {
    return await httpService.get<OrganizationStats>('/stats/organization')
  }
}

export const statsService = new StatsService()
