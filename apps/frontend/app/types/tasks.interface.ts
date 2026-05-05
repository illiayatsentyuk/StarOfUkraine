export interface GradingCriterion {
    name: string
    type: 'points' | 'stars'
    max: number
}

export interface TournamentTask {
    id: string
    tournamentId: string
    title: string
    description: string
    points: number
    status: 'pending' | 'completed' | 'failed'
    deadline: string
    criteria?: GradingCriterion[]
}

export interface TaskSubmission {
    id: string
    taskId: string
    teamName: string
    githubUrl: string
    youtubeUrl: string
    status: 'pending' | 'graded'
    score?: number
    grades?: Record<string, number> // criterionName -> score
}
