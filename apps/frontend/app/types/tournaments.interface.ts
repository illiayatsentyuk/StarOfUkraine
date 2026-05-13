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


export interface BracketMatch {
    id: string | number
    team1?: {
        name: string
        side?: 'radiant' | 'dire' | string
    }
    team2?: {
        name: string
        side?: 'radiant' | 'dire' | string
    }
    title?: string
    dotaMatchId?: string
    winner?: number
}

export interface BracketRound {
    matchs: BracketMatch[]
}