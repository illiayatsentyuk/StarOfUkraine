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
    // taskId → { status, githubUrl, videoUrl } — власні подачі поточного юзера
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
        try {
            await api.post(`/tasks/${taskId}/submit`, payload)
            mySubmissions.value[taskId] = {
                status: 'PENDING',
                githubUrl: payload.githubUrl,
                videoUrl: payload.videoUrl,
                liveUrl: payload.liveUrl,
                summary: payload.summary,
            }
            toast.success('Роботу успішно відправлено!')
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Помилка відправки')
            throw err
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
        try {
            await api.post(`/tasks/${taskId}/activate`)
            const idx = tasks.value.findIndex(t => t.id === taskId)
            if (idx !== -1) tasks.value[idx].status = 'ACTIVE'
            toast.success('Завдання активовано')
        } catch (err: any) {
            toast.error('Помилка активації')
        } finally {
            loading.value = false
        }
    }

    const fetchSubmissions = async (taskId: string) => {
        loading.value = true
        try {
            const res = await api.get(`/tasks/${taskId}/submissions`)
            submissions.value = res.data ?? []
        } catch (err: any) {
            toast.error('Помилка завантаження робіт')
        } finally {
            loading.value = false
        }
    }

    const closeSubmissions = async (taskId: string) => {
        loading.value = true
        try {
            await api.post(`/tasks/${taskId}/close-submissions`)
            const idx = tasks.value.findIndex(t => t.id === taskId)
            if (idx !== -1) tasks.value[idx].status = 'SUBMISSION_CLOSED'
            toast.success('Прийом робіт закрито')
        } catch (err: any) {
            toast.error('Помилка закриття')
        } finally {
            loading.value = false
        }
    }

    const assignJury = async (tournamentId: string, submissionsPerJury: number = 5) => {
        loading.value = true
        try {
            const res = await api.post(`/jury/tournaments/${tournamentId}/assign`, { submissionsPerJury })
            toast.success(`Розподіл завершено: ${res.data.assignmentsCreated} призначень`)
        } catch (err: any) {
            toast.error('Помилка розподілу')
        } finally {
            loading.value = false
        }
    }

    const fetchMySubmission = async (taskId: string, teamId?: string) => {
        if (!teamId) return
        try {
            const res = await api.get(`/tasks/${taskId}/submissions`)
            const mine = res.data?.find((s: any) => s.teamId === teamId)
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
            console.debug('No submission for task', taskId)
        }
    }

    return {
        loading,
        error,
        tasks,
        submissions,
        mySubmissions,
        fetchTasks,
        createTask,
        submitTask,
        fetchSubmissions,
        fetchMySubmission,
        gradeSubmission,
        activateTask,
        closeSubmissions,
        assignJury,
    }
})
