import { httpService } from './http'

export interface MemberStats {
  totalMembers: number
  baptizedCount: number
  baptizedPercentage: string
  averageAge: number
  newConvertsPercentage: string
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
}

export class StatsService {
  async getMemberStats(): Promise<MemberStats> {
    return await httpService.get<MemberStats>('/stats/members')
  }
}

export const statsService = new StatsService()
