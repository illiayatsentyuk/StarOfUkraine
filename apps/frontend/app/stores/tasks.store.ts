import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CreateTournamentTaskPayload, TaskSubmission, TournamentTask } from '~/types'

type SubmissionScore = {
    id: string
    points: number
}

export const useTasksStore = defineStore('tasks', () => {
    const toast = useServerSafeToast()
    const loading = ref(false)
    const error = ref<string | null>(null)
    const tasks = ref<TournamentTask[]>([])
    const submissions = ref<TaskSubmission[]>([])
    // taskId → { status, githubUrl, videoUrl } — власні подачі поточного юзера
    const mySubmissions = ref<Record<string, { status: 'PENDING' | 'EVALUATED'; githubUrl: string; videoUrl: string }>>({})

    const loadMySubmissions = () => {
        if (typeof window === 'undefined') return
        try {
            const raw = window.localStorage.getItem('mySubmissions')
            if (raw) mySubmissions.value = JSON.parse(raw)
        } catch { /* ignore */ }
    }

    const saveMySubmissions = () => {
        if (typeof window === 'undefined') return
        try {
            window.localStorage.setItem('mySubmissions', JSON.stringify(mySubmissions.value))
        } catch { /* ignore */ }
    }

    // Ініціалізація при старті
    loadMySubmissions()



    const fetchTasks = async (tournamentId: string) => {
        if (loading.value) return
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
        if (loading.value) return
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
        payload: { teamId: string; githubUrl: string; videoUrl: string },
    ) => {
        if (loading.value) return
        loading.value = true
        error.value = null
        try {
            const api = useApi()
            await api.post(`/tasks/${taskId}/submit`, payload)
            // Зберігаємо статус власної подачі
            mySubmissions.value[taskId] = {
                status: 'PENDING',
                githubUrl: payload.githubUrl,
                videoUrl: payload.videoUrl,
            }
            saveMySubmissions()
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
        if (loading.value) return
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
        if (loading.value) return
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
        gradeSubmission
    }
})
