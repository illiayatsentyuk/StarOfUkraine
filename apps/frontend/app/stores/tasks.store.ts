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

    // ── legacy stubs used by task-detail page (not yet migrated) ──────────
    const submissions = ref<any[]>([])

    const fetchSubmissions = async (_taskId: string) => {
        submissions.value = []
    }

    const submitTask = async (_taskId: string, _payload: any) => {
        toast.info('Відправка завдань буде реалізована незабаром')
    }

    const gradeSubmission = async (_submissionId: string, _score: number) => {
        toast.info('Оцінювання доступне на сторінці оцінювання')
    }

    return {
        loading,
        tasks,
        submissions,
        fetchTasks,
        createTask,
        fetchSubmissions,
        submitTask,
        gradeSubmission,
    }
})
