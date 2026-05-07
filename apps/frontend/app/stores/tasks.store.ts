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

    const getCacheKey = (tournamentId: string) => `tournament:${tournamentId}:tasks`

    const readCachedTasks = (tournamentId: string): TournamentTask[] => {
        if (typeof window === 'undefined') return []
        try {
            const raw = window.localStorage.getItem(getCacheKey(tournamentId))
            if (!raw) return []
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }

    const writeCachedTasks = (tournamentId: string, next: TournamentTask[]) => {
        if (typeof window === 'undefined') return
        try {
            window.localStorage.setItem(getCacheKey(tournamentId), JSON.stringify(next))
        } catch {
            // ignore quota / privacy mode
        }
    }

    const fetchTasks = async (tournamentId: string) => {
        if (loading.value) return
        loading.value = true
        error.value = null

        try {
            const api = useApi()
            const response = await api.get(`/tournaments/${tournamentId}`)
            const tournament = response.data
            const rawTasks = Array.isArray(tournament?.tasks) ? tournament.tasks : []
            const serverTasks = rawTasks.sort(
                (a: TournamentTask, b: TournamentTask) => (a.order ?? 0) - (b.order ?? 0),
            )

            // Якщо бек не повертає tasks у `GET /tournaments/:id`, підхоплюємо кеш (щоб адмінські задачі не "зникали").
            const cached = readCachedTasks(tournamentId)
            tasks.value = serverTasks.length ? serverTasks : cached
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Помилка завантаження завдань'
            error.value = message
            toast.error(message)
            // fallback to cache on network errors
            tasks.value = readCachedTasks(tournamentId)
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
            writeCachedTasks(payload.tournamentId, tasks.value)
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

    const gradeSubmission = async (submissionId: string, scores: SubmissionScore[]) => {
        if (loading.value) return
        loading.value = true
        error.value = null
        try {
            const api = useApi()
            await api.post(`/submissions/${submissionId}/evaluate`, { scores })
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
        fetchTasks,
        createTask,
        submitTask,
        fetchSubmissions,
        gradeSubmission
    }
})
