import type { Team } from './teams.interface'

export type UserRole = 'USER' | 'ADMIN' | 'JURY'

export interface User {
    id: string
    email: string
    name?: string
    image?: string
    role: UserRole
    teamsAsCaptain?: Team[]
    teamsAsMember?: Team[]
    createdAt?: string
}
