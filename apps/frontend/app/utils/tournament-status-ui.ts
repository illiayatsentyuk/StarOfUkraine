export type TournamentStatusCode =
    | 'DRAFT'
    | 'REGISTRATION_OPEN'
    | 'ONGOING'
    | 'COMPLETED'
    | 'CANCELLED'

export interface TournamentStatusInfo {
    code: TournamentStatusCode
    label: string
    color: string
}

export function getTournamentStatusInfo(status?: string | null): TournamentStatusInfo | null {
    if (!status) return null

    switch (status) {
        case 'REGISTRATION_OPEN':
            return { code: 'REGISTRATION_OPEN', label: 'tournament.status.registration_open', color: 'var(--color-primary)' }
        case 'ONGOING':
            return { code: 'ONGOING', label: 'tournament.status.ongoing', color: '#ff8800' }
        case 'COMPLETED':
            return { code: 'COMPLETED', label: 'tournament.status.completed', color: '#00cc00' }
        case 'CANCELLED':
            return { code: 'CANCELLED', label: 'tournament.status.cancelled', color: '#666666' }
        case 'DRAFT':
        default:
            return { code: 'DRAFT', label: 'tournament.status.draft', color: '#000000' }
    }
}

