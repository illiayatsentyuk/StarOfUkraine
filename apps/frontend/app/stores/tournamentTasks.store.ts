import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { 
  Task, 
  TaskSubmission as Submission, 
  TaskEvaluation as Evaluation,
  TeamTaskStanding
} from '~/types/tournament-tasks.types'

export const useTournamentTasksStore = defineStore('tournamentTasks', () => {
  // Persistence using useLocalStorage
  const tasks = useLocalStorage<Task[]>('sou_tasks', [])
  const submissions = useLocalStorage<Submission[]>('sou_submissions', [])
  const evaluations = useLocalStorage<Evaluation[]>('sou_evaluations', [])

  // -- Actions --

  /**
   * Add a new task to a tournament
   */
  const addTask = (tournamentId: string, taskData: Omit<Task, 'id' | 'tournamentId'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substring(2, 11),
      tournamentId
    }
    tasks.value.push(newTask)
    return newTask
  }

  /**
   * Delete a task by ID
   */
  const deleteTask = (taskId: string) => {
    tasks.value = tasks.value.filter(t => t.id !== taskId)
  }

  /**
   * Submit team work for a specific task
   */
  const submitWork = (taskId: string, teamId: string, links: { github: string, demo: string }) => {
    const newSubmission: Submission = {
      id: Math.random().toString(36).substring(2, 11),
      taskId,
      teamId,
      githubUrl: links.github,
      videoUrl: links.demo,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
    submissions.value.push(newSubmission)
    return newSubmission
  }

  /**
   * Evaluate a team's submission
   */
  const evaluateSubmission = (submissionId: string, juryId: string, data: { scores: any, comment: string, totalScore: number }) => {
    const newEvaluation: Evaluation = {
      id: Math.random().toString(36).substring(2, 11),
      submissionId,
      juryId,
      scores: data.scores,
      totalScore: data.totalScore,
      comment: data.comment
    }
    evaluations.value.push(newEvaluation)

    // Update submission status
    const sub = submissions.value.find(s => s.id === submissionId)
    if (sub) {
      sub.status = 'EVALUATED'
    }

    return newEvaluation
  }

  // -- Getters/Computed --

  /**
   * Get all tasks for a specific tournament, ordered
   */
  const getTournamentTasks = (tournamentId: string) => {
    return computed(() => tasks.value
      .filter(t => t.tournamentId === tournamentId)
      .sort((a, b) => a.order - b.order)
    )
  }

  /**
   * Get all submissions for a team
   */
  const getTeamSubmissions = (teamId: string) => {
    return computed(() => submissions.value.filter(s => s.teamId === teamId))
  }

  /**
   * Calculate leaderboard for the tournament
   */
  const getLeaderboard = (tournamentId: string, tournamentTeams: any[]) => {
    return computed((): TeamTaskStanding[] => {
      const tournamentTasksList = tasks.value.filter(t => t.tournamentId === tournamentId)
      
      return tournamentTeams.map(team => {
        const teamSubs = submissions.value.filter(s => s.teamId === team.id && s.status === 'EVALUATED')
        const taskScores: Record<string, number> = {}
        let totalScore = 0

        teamSubs.forEach(sub => {
          const evalItem = evaluations.value.find(e => e.submissionId === sub.id)
          if (evalItem) {
            taskScores[sub.taskId] = evalItem.totalScore
            totalScore += evalItem.totalScore
          }
        })

        const progress = tournamentTasksList.length > 0 
          ? Math.round((teamSubs.length / tournamentTasksList.length) * 100) 
          : 0

        return {
          id: team.id,
          name: team.name,
          logo: team.logo,
          taskScores,
          totalScore,
          progress
        }
      }).sort((a, b) => b.totalScore - a.totalScore)
    })
  }

  return {
    tasks,
    submissions,
    evaluations,
    addTask,
    deleteTask,
    submitWork,
    evaluateSubmission,
    getTournamentTasks,
    getTeamSubmissions,
    getLeaderboard
  }
})
