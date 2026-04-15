export interface TaskCriterion {
  id: string
  label: string
  maxPoints: number
  description?: string
}

export interface TaskResource {
  name: string
  url: string
}

export interface Task {
  id: string
  tournamentId: string
  letter: string
  name: string
  description: string
  order: number
  criteria: TaskCriterion[]
  resources?: TaskResource[]
  isLocked?: boolean
  isCompleted?: boolean
}

export interface TaskSubmission {
  id: string
  taskId: string
  teamId: string
  githubUrl: string
  videoUrl: string
  status: 'PENDING' | 'EVALUATED'
  createdAt: string
  teamName?: string // Helper field for UI
}

export interface TaskEvaluation {
  id: string
  submissionId: string
  juryId: string
  scores: Record<string, number>
  totalScore: number
  comment: string
}

export interface TeamTaskStanding {
  id: string
  name: string
  logo?: string
  taskScores: Record<string, number>
  totalScore: number
  progress: number
}
