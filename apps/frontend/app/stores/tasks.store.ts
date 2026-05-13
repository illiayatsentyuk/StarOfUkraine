import { defineStore } from 'pinia'

export type TaskStatus = 'DRAFT' | 'ACTIVE' | 'SUBMISSION_CLOSED' | 'EVALUATED'

export interface RubricItem {
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
    status: TaskStatus
    startsAt: string | null
    deadline: string | null
    materialUrls: string[]
    criteria: { rubric: RubricItem[] }
}

export const useTasksStore = defineStore('tasks', () => {
    const toast = useServerSafeToast()
    const api = useApi()

    const loading = ref(false)
    const tasks = ref<TournamentTask[]>([])
    const submissions = ref<any[]>([])
    const mySubmissions = ref<Record<string, { status: string; githubUrl: string; videoUrl: string; liveUrl?: string; summary?: string }>>({})

    const fetchTasks = async (tournamentId: string) => {
        loading.value = true
        try {
            const res = await api.get(`/tournaments/${tournamentId}/tasks`)
            tasks.value = res.data ?? []
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Помилка завантаження завдань')
        } finally {
            loading.value = false
        }
    }

    const createTask = async (payload: {
        tournamentId: string
        name: string
        description: string
        maxPoints: number
        deadline: string
    }) => {
        loading.value = true
        try {
            const order = tasks.value.length + 1
            const res = await api.post(`/tournaments/${payload.tournamentId}/tasks`, {
                tasks: [{
                    name: payload.name,
                    description: payload.description,
                    order,
                    deadline: payload.deadline,
                    criteria: {
                        rubric: [{ id: 'score', label: 'Загальна оцінка', maxPoints: payload.maxPoints }],
                    },
                }],
            })
            const created: TournamentTask[] = res.data ?? []
            tasks.value.push(...created)
            toast.success('Завдання успішно створено!')
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Помилка створення завдання')
            throw err
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

    const submitTask = async (taskId: string, payload: { teamId: string; githubUrl: string; videoUrl: string; liveUrl?: string; summary?: string }) => {
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

    const gradeSubmission = async (submissionId: string, scores: { id: string; points: number }[], comment: string) => {
        loading.value = true
        try {
            await api.post(`/submissions/${submissionId}/evaluate`, { scores, comment })
            toast.success('Оцінку збережено')
        } catch (err: any) {
            toast.error('Помилка збереження оцінки')
        } finally {
            loading.value = false
        }
    }

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
        tasks,
        submissions,
        mySubmissions,
        fetchTasks,
        createTask,
        fetchSubmissions,
        submitTask,
        gradeSubmission,
        activateTask,
        closeSubmissions,
        assignJury,
        fetchMySubmission
    }
})
