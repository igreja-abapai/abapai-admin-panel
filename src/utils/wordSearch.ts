export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildWordStartPattern(search: string, delimiters = '[[:space:]]'): string {
    const trimmed = search.trim();
    if (!trimmed) return '';

    return `(^|${delimiters})${escapeRegExp(trimmed)}`;
}

export function matchesWordStart(text: string | null | undefined, query: string): boolean {
    if (!text?.trim() || !query.trim()) return false;

    const normalizedQuery = query.trim().toLowerCase();

    return text
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .some((word) => word.startsWith(normalizedQuery));
}

export function matchesEmailWordStart(email: string | null | undefined, query: string): boolean {
    if (!email?.trim() || !query.trim()) return false;

    const normalized = email.trim().toLowerCase().replace(/[@._-]+/g, ' ');

    return matchesWordStart(normalized, query);
}

export function matchesPhoneWordStart(phone: string | null | undefined, query: string): boolean {
    if (!phone?.trim() || !query.trim()) return false;

    const digitsQuery = query.replace(/\D/g, '');
    if (!digitsQuery) return matchesWordStart(phone, query);

    return phone.replace(/\D/g, '').startsWith(digitsQuery);
}
