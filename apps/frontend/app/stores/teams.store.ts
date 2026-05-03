import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Team } from '~/types/teams.interface'
import { useApi } from '~/composables/useApi';


const LIMIT = 16
type CreateTeamPayload = {
    name: string
    captainName: string
    city?: string
    organization?: string
    telegram?: string
    discord?: string
    members?: string[]
}

export const useTeamsStore = defineStore('teams', () => {
    const toast = useServerSafeToast()
    const teams = ref<Team[]>([])
    const page = ref(1)
    const totalPages = ref(0)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentTeam = ref<Team | null>(null) // ⚠️ було `id` — перейменовано щоб не конфліктувало
    const searchResults = ref<{ id: string; email: string; name?: string }[]>([])
    const searchingMembers = ref(false)


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

    const createTeam = async (team: CreateTeamPayload) => {
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

    const fetchTeamById = async (teamId: string) => {
        if (loading.value) return
        loading.value = true
        error.value = null

        try {
            const api = useApi()
            const response = await api.get(`/teams/${teamId}`)

            if (!response.data) throw new Error('Не вдалося завантажити команду')

            currentTeam.value = response.data as Team

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
    const deleteTeam = async (teamId: string) => {
        if (loading.value) return
        loading.value = true
        error.value = null
        try {
            const api = useApi()
            await api.delete(`/teams/${teamId}`)
        }
        catch (err: any) {
            console.error('Помилка API при видаленні команди:', err)
            toast.error('Не вдалося видалити команду')
            error.value = err.message || 'Помилка видалення'
            throw err
        } finally {
            loading.value = false
            if (typeof window !== 'undefined') {
                window.location.reload()
            }
        }
    }
    const clearSearchResults = () => {
        searchResults.value = []
    }

    const searchMembers = async (query: string) => {
        const trimmedQuery = query.trim()
        if (trimmedQuery.length < 2) {
            clearSearchResults()
            return []
        }

        searchingMembers.value = true
        error.value = null
        try {
            const api = useApi()
            const response = await api.get(`/users/search`, {
                params: { query: trimmedQuery },
            })

            const raw = response.data
            const users = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.data)
                    ? raw.data
                    : raw
                        ? [raw]
                        : []

            searchResults.value = users.filter((user: any) => Boolean(user?.email))
            return searchResults.value
        } catch (err: any) {
            console.error('Помилка пошуку:', err)
            error.value = err.message || 'Помилка пошуку'
            clearSearchResults()
            return []
        } finally {
            searchingMembers.value = false
        }
    }
    return {
        teams,
        page,
        totalPages,
        loading,
        error,
        currentTeam,
        hasMore,
        searchResults,
        searchingMembers,
        reset,
        loadFromDatabase,
        createTeam,
        joinTeam,
        fetchTeamById,
        deleteTeam,
        clearSearchResults,
        searchMembers,
    }
})