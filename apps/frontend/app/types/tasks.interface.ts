export interface GradingCriterion {
    id: string
    label: string
    maxPoints: number
}

export interface TournamentTask {
    id: string
    tournamentId: string
    name: string
    description: string
    order: number
    criteria?: {
        rubric?: GradingCriterion[]
    }
}

export interface CreateTournamentTaskPayload {
    tournamentId: string
    name: string
    description: string
    order: number
    maxPoints?: number
    criteria?: GradingCriterion[]
}

export interface TaskSubmission {
    id: string
    taskId: string
    teamId: string
    team?: {
        id: string
        name: string
        captainName?: string
        captainEmail?: string
    }
    githubUrl: string
    videoUrl: string
    status: 'PENDING' | 'EVALUATED'
}
