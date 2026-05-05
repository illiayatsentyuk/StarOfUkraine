export interface Tournament {
    id?: string
    name: string
    description: string
    startDate: string
    registrationStart: string
    registrationEnd: string
    rounds: string | number
    maxTeams: string | number
    teamSizeMin: string | number
    teamSizeMax: string | number
    status?: string
    hideTeamsUntilRegistrationEnds: boolean
    createdAt?: string
}