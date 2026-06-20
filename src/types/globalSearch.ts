export type GlobalSearchResourceType = 'members' | 'departments'

export interface GlobalSearchResultItem {
  id: string | number
  type: GlobalSearchResourceType
  title: string
  subtitle?: string
  photoUrl?: string | null
  to: string
}

export interface GlobalSearchResultSection {
  type: GlobalSearchResourceType
  label: string
  items: GlobalSearchResultItem[]
}

export interface GlobalSearchProviderContext {
  query: string
  limit: number
}

export interface GlobalSearchProvider {
  type: GlobalSearchResourceType
  label: string
  permission: string
  search: (context: GlobalSearchProviderContext) => Promise<GlobalSearchResultItem[]>
}
