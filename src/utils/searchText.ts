const SEARCH_ACCENT_FROM = 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ'
const SEARCH_ACCENT_TO = 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'

export function normalizeSearchText(value: string): string {
  const lower = value.trim().toLowerCase()
  let result = ''

  for (const char of lower) {
    const index = SEARCH_ACCENT_FROM.indexOf(char)
    result += index >= 0 ? SEARCH_ACCENT_TO[index] : char
  }

  return result
}

export function includesSearch(
  text: string | null | undefined,
  query: string | null | undefined,
): boolean {
  if (!text?.trim() || !query?.trim()) return false

  return normalizeSearchText(text).includes(normalizeSearchText(query))
}

export function includesSearchAny(
  query: string | null | undefined,
  ...texts: Array<string | null | undefined>
): boolean {
  if (!query?.trim()) return false

  return texts.some((text) => includesSearch(text, query))
}
