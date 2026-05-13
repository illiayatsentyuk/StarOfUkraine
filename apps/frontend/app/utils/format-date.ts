/**
 * Parses API date strings as a local calendar date.
 * ISO midnight UTC (e.g. 2026-03-15T00:00:00.000Z) would otherwise shift to the previous day in UA timezones.
 */
export function parseIsoDateToLocalDate(value?: string | null): Date | null {
    if (!value) return null
    const head = value.slice(0, 10)
    const m = head.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) {
        const y = Number(m[1])
        const mo = Number(m[2]) - 1
        const d = Number(m[3])
        if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null
        return new Date(y, mo, d)
    }
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDate(dateString: string): string {
    if (!dateString) return 'ТВА'
    const date = new Date(dateString)
    return date
        .toLocaleDateString('uk-UA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        .replace('р.', '')
        .toUpperCase()
}
