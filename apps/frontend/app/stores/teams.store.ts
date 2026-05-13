import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Team, CreateTeamPayload, TeamSearchResult } from '~/types'
import { useApi } from '~/composables/useApi';

const LIMIT = 16

export const useTeamsStore = defineStore('teams', () => {
    const toast = useServerSafeToast()
    const teams = ref<Team[]>([])
    const page = ref(1)
    const totalPages = ref(0)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentTeam = ref<Team | null>(null) 
    const activeTeamId = ref<string | null>(null)
    const searchResults = ref<TeamSearchResult[]>([])
    const searchingMembers = ref(false)


    const hasMore = computed(() => page.value <= totalPages.value)
    const activeTeam = computed(() => {
        if (currentTeam.value?.id && currentTeam.value.id === activeTeamId.value) return currentTeam.value
        return teams.value.find(t => t.id === activeTeamId.value) || null
    })

    const initActiveTeam = async () => {
        if (typeof window === 'undefined') return
        const stored = window.localStorage.getItem('activeTeamId')
        
        let teamIdToUse = stored || null
        
        const authStore = useLoginStore()
        if (!authStore.user) {
            await authStore.fetchUser()
        }
        const user = authStore.user

        if (teamIdToUse && user) {
            const allTeams = [...(user.teamsAsCaptain || []), ...(user.teamsAsMember || [])]
            let isMember = allTeams.some((t) => t.id === teamIdToUse)
            if (!isMember) {
                await authStore.fetchUser()
                const after = authStore.user
                if (after) {
                    const refreshed = [...(after.teamsAsCaptain || []), ...(after.teamsAsMember || [])]
                    isMember = refreshed.some((t) => t.id === teamIdToUse)
                }
            }
            if (!isMember) {
                teamIdToUse = null
                window.localStorage.removeItem('activeTeamId')
            }
        }

        if (!teamIdToUse && user) {
            const firstTeam = user.teamsAsCaptain?.[0] || user.teamsAsMember?.[0]
            if (firstTeam) {
                teamIdToUse = firstTeam.id
                window.localStorage.setItem('activeTeamId', teamIdToUse)
            }
        }

        activeTeamId.value = teamIdToUse
        if (activeTeamId.value && !currentTeam.value) {
            try {
                await fetchTeamById(activeTeamId.value)
            } catch {
                // ignore
            }
        }
    }

    const setActiveTeam = async (teamId: string | null) => {
        activeTeamId.value = teamId
        if (typeof window !== 'undefined') {
            if (teamId) window.localStorage.setItem('activeTeamId', teamId)
            else window.localStorage.removeItem('activeTeamId')
        }
        if (teamId) {
            try {
                await fetchTeamById(teamId)
            } catch {
                // ignore
            }
        }
    }

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
        } catch (err: any) { 
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

            const created = response.data as Team
            teams.value.push(created)
            toast.success('Команду успішно створено')

            loading.value = false
            const loginStore = useLoginStore()
            await loginStore.fetchUser()
            await setActiveTeam(created.id)
            return created
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
            loading.value = false
            await useLoginStore().fetchUser()
            await setActiveTeam(teamId)
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
            toast.success('Команду видалено')
            if (activeTeamId.value === teamId) {
                await setActiveTeam(null)
            }
        }
        catch (err: any) {
            console.error('Помилка API при видаленні команди:', err)
            toast.error('Не вдалося видалити команду')
            error.value = err.message || 'Помилка видалення'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateTeam = async (teamId: string, payload: Partial<Team>) => {
        if (loading.value) return
        loading.value = true
        error.value = null
        try {
            const api = useApi()
            const res = await api.patch(`/teams/${teamId}`, payload)
            currentTeam.value = res.data as Team
            toast.success('Дані команди оновлено')
            return res.data as Team
        } catch (err: any) {
            toast.error('Не вдалося оновити команду')
            throw err
        } finally {
            loading.value = false
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
        activeTeamId,
        activeTeam,
        initActiveTeam,
        setActiveTeam,
        hasMore,
        searchResults,
        searchingMembers,
        reset,
        loadFromDatabase,
        createTeam,
        joinTeam,
        fetchTeamById,
        deleteTeam,
        updateTeam,
        clearSearchResults,
        searchMembers,
    }
})