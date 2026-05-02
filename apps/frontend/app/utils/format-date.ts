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
