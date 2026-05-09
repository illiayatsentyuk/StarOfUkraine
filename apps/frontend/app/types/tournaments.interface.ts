export type TournamentStatus = 'DRAFT' | 'REGISTRATION_OPEN' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export interface Tournament {
    id?: string
    name: string
    description: string
    startDate: string
    registrationStart: string
    registrationEnd: string
    rounds: number
    maxTeams: number
    teamSizeMin: number
    teamSizeMax: number
    status?: TournamentStatus
    hideTeamsUntilRegistrationEnds: boolean
    createdAt?: string
}

export interface LeaderboardRow {
    team: {
        id: string
        name: string
    }
    totalScore: number
    rank?: number
}