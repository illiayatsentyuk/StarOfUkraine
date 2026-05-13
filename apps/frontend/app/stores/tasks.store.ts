import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CreateTournamentTaskPayload, TaskSubmission, TournamentTask, SubmissionScore } from '~/types'

export const useTasksStore = defineStore('tasks', () => {
    const toast = useServerSafeToast()
    const api = useApi()

    const loading = ref(false)
    const error = ref<string | null>(null)
    const tasks = ref<TournamentTask[]>([])
    const submissions = ref<TaskSubmission[]>([])
    const mySubmissions = ref<Record<string, { status: 'PENDING' | 'EVALUATED'; githubUrl: string; videoUrl: string; liveUrl?: string; summary?: string }>>({})

    const fetchTasks = async (tournamentId: string) => {
        loading.value = true
        error.value = null

        try {
            const api = useApi()
            const response = await api.get(`/tournaments/${tournamentId}/tasks`)
            tasks.value = response.data
        } catch (err: any) {
            toast.error('Помилка завантаження завдань')
            error.value = err.message || 'Помилка завантаження завдань'
        } finally {
            loading.value = false
        }
    }

    const createTask = async (payload: CreateTournamentTaskPayload) => {
        loading.value = true
        error.value = null

        try {
            const api = useApi()
            const response = await api.post(`/tournaments/${payload.tournamentId}/tasks`, {
                tasks: [
                    {
                        name: payload.name,
                        description: payload.description,
                        order: payload.order,
                        criteria: {
                            rubric: payload.criteria?.length
                                ? payload.criteria
                                : [
                                    {
                                        id: 'total',
                                        label: 'Загальна оцінка',
                                        maxPoints: payload.maxPoints ?? 100,
                                    },
                                ],
                        },
                    },
                ],
            })

            const createdTasks = Array.isArray(response.data) ? response.data : []
            if (!createdTasks.length) throw new Error('Не вдалося створити завдання')

            tasks.value = [...tasks.value, ...createdTasks].sort((a, b) => a.order - b.order)
            toast.success('Завдання успішно створено')
            return createdTasks[0] as TournamentTask
        } catch (err: any) {
            toast.error('Не вдалося створити завдання')
            error.value = err?.message || 'Помилка створення'
            throw err
        } finally {
            loading.value = false
        }
    }

    const submitTask = async (
        taskId: string,
        payload: { teamId: string; githubUrl: string; videoUrl: string; liveUrl?: string; summary?: string },
    ) => {
        loading.value = true
        error.value = null
        try {
            const api = useApi()
            await api.post(`/tasks/${taskId}/submit`, payload)
            mySubmissions.value[taskId] = {
                status: 'PENDING',
                githubUrl: payload.githubUrl,
                videoUrl: payload.videoUrl,
                liveUrl: payload.liveUrl,
                summary: payload.summary,
            }
            toast.success('Завдання успішно відправлено')
        } catch (err: any) {
            toast.error('Помилка відправки завдання')
            error.value = err?.message || 'Помилка відправки'
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchSubmissions = async (taskId: string) => {
        loading.value = true
        error.value = null
        try {
            const api = useApi()
            const response = await api.get(`/tasks/${taskId}/submissions`)
            submissions.value = Array.isArray(response.data) ? response.data : []
        } catch (err: any) {
            toast.error('Помилка завантаження робіт')
            error.value = err?.message || 'Помилка завантаження робіт'
        } finally {
            loading.value = false
        }
    }

    const gradeSubmission = async (submissionId: string, scores: SubmissionScore[], comment: string) => {
        loading.value = true
        error.value = null
        try {
            const api = useApi()
            await api.post(`/submissions/${submissionId}/evaluate`, { scores, comment })
            const idx = submissions.value.findIndex(s => s.id === submissionId)
            if (idx !== -1) {
                const current = submissions.value[idx]
                if (!current) return
                submissions.value[idx] = {
                    ...current,
                    status: 'EVALUATED',
                }
            }
            toast.success('Роботу оцінено')
        } catch (err: any) {
            toast.error('Помилка при оцінюванні')
            error.value = err?.message || 'Помилка оцінювання'
        } finally {
            loading.value = false
        }
    }

    /** ADMIN: DRAFT → ACTIVE */
    const activateTask = async (taskId: string) => {
        loading.value = true
        error.value = null
        try {
            const api = useApi()
            await api.post(`/tasks/${taskId}/activate`)
            const idx = tasks.value.findIndex(t => t.id === taskId)
            if (idx !== -1 && tasks.value[idx]) {
                tasks.value[idx].status = 'ACTIVE' as any
            }
            toast.success('Завдання активовано — прийом робіт відкрито')
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Помилка активації')
            error.value = err?.message || 'Помилка активації'
            throw err
        } finally {
            loading.value = false
        }
    }

    /** ADMIN: ACTIVE → SUBMISSION_CLOSED */
    const closeSubmissions = async (taskId: string) => {
        loading.value = true
        error.value = null
        try {
            const api = useApi()
            await api.post(`/tasks/${taskId}/close-submissions`)
            const idx = tasks.value.findIndex(t => t.id === taskId)
            if (idx !== -1 && tasks.value[idx]) {
                tasks.value[idx].status = 'SUBMISSION_CLOSED' as any
            }
            toast.success('Прийом робіт закрито')
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Помилка закриття')
            error.value = err?.message || 'Помилка закриття'
            throw err
        } finally {
            loading.value = false
        }
    }

    /** ADMIN: assign submissions to jury via /jury/tournaments/:id/assign */
    const assignJury = async (tournamentId: string, submissionsPerJury: number = 5) => {
        loading.value = true
        error.value = null
        try {
            const api = useApi()
            const res = await api.post(`/jury/tournaments/${tournamentId}/assign`, { submissionsPerJury })
            toast.success(`Розподіл завершено: ${res.data.assignmentsCreated} призначень`)
            return res.data
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Помилка розподілу')
            error.value = err?.message || 'Помилка розподілу'
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchMySubmission = async (taskId: string, teamId?: string) => {
        if (!teamId) return
        try {
            const api = useApi()
            // New API returns all submissions for task — find ours by teamId
            const response = await api.get(`/tasks/${taskId}/submissions`)
            const all = Array.isArray(response.data) ? response.data : []
            const mine = all.find((s: any) => s.teamId === teamId || s.team?.id === teamId)
            if (mine) {
                mySubmissions.value[taskId] = {
                    status: mine.status,
                    githubUrl: mine.githubUrl,
                    videoUrl: mine.videoUrl,
                    liveUrl: mine.liveUrl,
                    summary: mine.summary,
                }
            }
        } catch (err) {
            // Submission might not exist yet — not an error
            console.debug('No submission for task', taskId)
        }
    }

    // Legacy: kept for backwards compat
    const updateTaskStatus = async (taskId: string, status: string) => {
        if (status === 'ACTIVE') return activateTask(taskId)
        if (status === 'SUBMISSION_CLOSED') return closeSubmissions(taskId)
        if (status === 'EVALUATED') {
            // No direct endpoint — just update local state
            const idx = tasks.value.findIndex(t => t.id === taskId)
            if (idx !== -1 && tasks.value[idx]) {
                tasks.value[idx].status = status as any
            }
        }
    }

    // Legacy alias
    const distributeSubmissions = async (taskId: string, _config: any) => {
        // Find tournamentId from the task
        const task = tasks.value.find(t => t.id === taskId)
        if (!task?.tournamentId) {
            toast.error('Не вдалося знайти турнір для розподілу')
            return
        }
        return assignJury(task.tournamentId, _config?.maxSubmissionsPerJury ?? 5)
    }

    return {
        loading,
        error,
        tasks,
        submissions,
        mySubmissions,
        fetchTasks,
        createTask,
        fetchSubmissions,
        fetchMySubmission,
        gradeSubmission,
        activateTask,
        closeSubmissions,
        assignJury,
        updateTaskStatus,
        distributeSubmissions,
    }
})
