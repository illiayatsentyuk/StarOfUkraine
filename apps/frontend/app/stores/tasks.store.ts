import { defineStore } from 'pinia'
import { ref } from 'vue'

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

export const useTasksStore = defineStore('tasks', () => {
    const toast = useServerSafeToast()
    const loading = ref(false)
    const error = ref<string | null>(null)
    const tasks = ref<TournamentTask[]>([])
    const submissions = ref<TaskSubmission[]>([])

    const fetchTasks = async (tournamentId: string) => {
        loading.value = true
        error.value = null
        
        try {
            // Mocking API call for tasks
            await new Promise(resolve => setTimeout(resolve, 800))
            
            // Dummy data for IT / Hackathon Tasks
            tasks.value = [
                {
                    id: '1',
                    tournamentId,
                    title: 'Створити вебсайт команди',
                    description: 'Розробіть лендінг для вашого продукту. Він має бути адаптивним, мати форму зворотнього зв\'язку та секцію з перевагами.',
                    points: 100,
                    status: 'pending',
                    deadline: new Date(Date.now() + 86400000 * 3).toISOString()
                },
                {
                    id: '2',
                    tournamentId,
                    title: 'Реалізувати CI/CD pipeline',
                    description: 'Налаштуйте автоматичний деплой вашого проєкту (Vercel/Netlify/Heroku) та додайте посилання на GitHub репозиторій з Actions/Workflows.',
                    points: 50,
                    status: 'completed',
                    deadline: new Date(Date.now() + 86400000 * 5).toISOString()
                }
            ]
        } catch (err: any) {
            const message = err?.message || 'Помилка завантаження завдань'
            error.value = message
            toast.error(message)
        } finally {
            loading.value = false
        }
    }

    const createTask = async (payload: Omit<TournamentTask, 'id' | 'status'>) => {
        loading.value = true
        try {
            await new Promise(resolve => setTimeout(resolve, 800))
            const newTask: TournamentTask = {
                ...payload,
                id: Math.random().toString(36).substring(7),
                status: 'pending'
            }
            tasks.value.push(newTask)
            toast.success('Завдання успішно створено!')
        } catch (err: any) {
            toast.error('Помилка створення завдання')
        } finally {
            loading.value = false
        }
    }

    const submitTask = async (taskId: string, payload: any) => {
        loading.value = true
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            const task = tasks.value.find(t => t.id === taskId)
            if (task) {
                task.status = 'completed'
            }
            toast.success('Завдання успішно виконано!')
        } catch (err: any) {
            toast.error('Помилка відправки завдання')
        } finally {
            loading.value = false
        }
    }

    const fetchSubmissions = async (taskId: string) => {
        loading.value = true
        try {
            await new Promise(resolve => setTimeout(resolve, 500))
            // Mock dummy submissions
            submissions.value = [
                {
                    id: 'sub_1',
                    taskId,
                    teamName: 'Команда "КіберКозаки"',
                    githubUrl: 'https://github.com/cyber-cossacks',
                    youtubeUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
                    status: 'pending'
                },
                {
                    id: 'sub_2',
                    taskId,
                    teamName: 'Команда "CyberTractors"',
                    githubUrl: 'https://github.com/cybertractors',
                    youtubeUrl: '',
                    status: 'graded',
                    score: 85
                }
            ]
        } catch (err) {
            toast.error('Помилка завантаження робіт')
        } finally {
            loading.value = false
        }
    }

    const gradeSubmission = async (submissionId: string, grades: Record<string, number>) => {
        loading.value = true
        try {
            await new Promise(resolve => setTimeout(resolve, 600))
            const sub = submissions.value.find(s => s.id === submissionId)
            if (sub) {
                sub.status = 'graded'
                sub.grades = grades
                sub.score = Object.values(grades).reduce((a, b) => a + b, 0)
            }
            toast.success('Роботу оцінено!')
        } catch (err) {
            toast.error('Помилка при оцінюванні')
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
