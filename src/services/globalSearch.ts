import { membersService } from '@/services/members'
import { organizationService, type Department } from '@/services/organization'
import { matchesWordStart } from '@/utils/wordSearch'
import type {
  GlobalSearchProvider,
  GlobalSearchResultItem,
  GlobalSearchResultSection,
} from '@/types/globalSearch'

export const GLOBAL_SEARCH_MIN_QUERY_LENGTH = 1
export const GLOBAL_SEARCH_RESULT_LIMIT = 5

let departmentsCache: Department[] | null = null
let departmentsCachePromise: Promise<Department[]> | null = null

async function getDepartmentsCached(): Promise<Department[]> {
  if (departmentsCache) return departmentsCache

  if (!departmentsCachePromise) {
    departmentsCachePromise = organizationService.getDepartments().then((departments) => {
      departmentsCache = departments
      return departments
    })
  }

  return departmentsCachePromise
}

export const globalSearchProviders: GlobalSearchProvider[] = [
  {
    type: 'members',
    label: 'Membros',
    permission: 'visualizar_membros',
    search: async ({ query, limit }) => {
      const response = await membersService.getMembers({
        search: query,
        limit,
        page: 1,
        isActive: true,
      })

      return response.data.map<GlobalSearchResultItem>((member) => ({
        id: member.id,
        type: 'members',
        title: member.name,
        subtitle: member.primaryPosition?.name || member.occupation,
        photoUrl: member.photoUrl,
        to: `/membros/detalhes/${member.id}`,
      }))
    },
  },
  {
    type: 'departments',
    label: 'Departamentos',
    permission: 'visualizar_organizacao',
    search: async ({ query, limit }) => {
      const departments = await getDepartmentsCached()

      return departments
        .filter(
          (department) =>
            department.isActive && matchesWordStart(department.name, query),
        )
        .slice(0, limit)
        .map<GlobalSearchResultItem>((department) => ({
          id: department.id,
          type: 'departments',
          title: department.name,
          subtitle: department.type,
          to: `/organizacao/departamentos/${department.id}`,
        }))
    },
  },
]

export async function runGlobalSearch(
  query: string,
  hasPermission: (permission: string) => boolean,
): Promise<GlobalSearchResultSection[]> {
  const trimmedQuery = query.trim()
  if (trimmedQuery.length < GLOBAL_SEARCH_MIN_QUERY_LENGTH) return []

  const context = {
    query: trimmedQuery,
    limit: GLOBAL_SEARCH_RESULT_LIMIT,
  }

  const sections = await Promise.all(
    globalSearchProviders
      .filter((provider) => hasPermission(provider.permission))
      .map(async (provider) => ({
        type: provider.type,
        label: provider.label,
        items: await provider.search(context),
      })),
  )

  return sections.filter((section) => section.items.length > 0)
}
