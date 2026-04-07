import type { Team } from '~/types/teams.interface'
import { useToast } from "vue-toastification";
import { useApi } from '~/composables/useApi';

const LIMIT = 16

export const useTeamsStore = defineStore('teams', () => {
    const toast = useToast();
    const teams = ref<Team[]>([])
    const page = ref(1)
    const totalPages = ref(0)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentTeam = ref<Team | null>(null) // ⚠️ було `id` — перейменовано щоб не конфліктувало

    const hasMore = computed(() => page.value <= totalPages.value)

    const reset = () => {
        page.value = 1
        teams.value = []
        totalPages.value = 0
        error.value = null
    }

    const loadFromDatabase = async (resetData = false) => {
        if (loading.value) return
        loading.value = true
        error.value = null

        if (resetData) reset()

        try {
            const api = useApi()
            const response = await api.post(`/teams/list`, {
                page: page.value,
                limit: LIMIT,
            })

            if (!response.data) throw new Error('Не вдалося завантажити команди')

            const data = response.data

            if (data.data && Array.isArray(data.data)) {
                teams.value = resetData ? data.data : [...teams.value, ...data.data]
                totalPages.value = data.totalPages
                page.value++
            }

            return data
        } catch (err: any) { // ⚠️ перейменовано з `error` — уникаємо shadowing ref
            console.error('Помилка API при завантаженні команд:', err)
            toast.error('Не вдалося завантажити команди')
            error.value = err.message || 'Помилка завантаження'
            throw err
        } finally {
            loading.value = false
        }
    }

    const createTeam = async (team: Omit<Team, 'id' | 'createdAt'>) => {
        if (loading.value) return
        loading.value = true
        error.value = null

        try {
            const api = useApi()
            const response = await api.post(`/teams`, team)

            if (!response.data) throw new Error('Не вдалося створити команду')

            teams.value.push(response.data)
            toast.success('Команду успішно створено')

            return response.data as Team
        } catch (err: any) {
            console.error('Помилка API при створенні команди:', err)
            toast.error('Не вдалося створити команду')
            error.value = err.message || 'Помилка створення'
            throw err
        } finally {
            loading.value = false
        }
    }

    const joinTeam = async (teamId: string) => {
        if (loading.value) return
        loading.value = true
        error.value = null

        try {
            const api = useApi()
            const response = await api.post(`/teams/${teamId}/join`)

            if (!response.data) throw new Error('Не вдалося приєднатися до команди')

            toast.success('Ви успішно приєдналися до команди')
            return response.data as Team
        } catch (err: any) {
            console.error('Помилка API при приєднанні до команди:', err)
            toast.error('Не вдалося приєднатися до команди')
            error.value = err.message || 'Помилка приєднання'
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchTeamById = async (teamId: string) => { // ⚠️ перейменовано параметр з `id` на `teamId`
        if (loading.value) return
        loading.value = true
        error.value = null

        try {
            const api = useApi()
            const response = await api.get(`/teams/${teamId}`)

            if (!response.data) throw new Error('Не вдалося завантажити команду')

            currentTeam.value = response.data as Team // ⚠️ зберігаємо весь об'єкт, не тільки id

            return currentTeam.value
        } catch (err: any) {
            console.error('Помилка API при завантаженні команди:', err)
            toast.error('Не вдалося завантажити команду')
            error.value = err.message || 'Помилка завантаження'
            throw err
        } finally {
            loading.value = false
        }
    }
    const searchMember = 

    return {
        teams,
        page,
        totalPages,
        loading,
        error,
        currentTeam,
        hasMore,
        reset,
        loadFromDatabase,
        createTeam,
        joinTeam,
        fetchTeamById,
    }
})