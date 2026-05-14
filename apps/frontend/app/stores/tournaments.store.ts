import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useApi } from '~/composables/useApi'
import type { Tournament, TournamentStatus } from '~/types'

type TournamentStatusFilter = 'all' | TournamentStatus
const LIMIT = 6

export const useTournamentsStore = defineStore('tournaments', () => {
    const toast = useServerSafeToast()
    const tournaments = ref<Tournament[]>([])
    const page = ref(1)
    const totalPages = ref(0)
    const loading = ref(true)
    const error = ref<string | null>(null)
    const search = ref('')
    const sortBy = ref('createdAt')
    const sortOrder = ref('DESC')
    const statusFilter = ref<TournamentStatusFilter>('all')
    
    //think about delete
    const hasMore = computed(() => page.value <= totalPages.value)
    const filteredTournaments = computed(() => {
        if (statusFilter.value === 'all') return tournaments.value
        return tournaments.value.filter((t) => t.status === statusFilter.value)
    })

    const reset = () => {
        page.value = 1
        tournaments.value = []
        totalPages.value = 0
        error.value = null
    }

    const loadFromDatabase = async (resetData = false) => {
        if (loading.value) return

        loading.value = true
        error.value = null

        if (resetData) {
            reset()
        }

        try {
            const api = useApi()
            const response = await api.get(`/tournaments/list`, {
                //think about query or params
                params: {
                    page: page.value,
                    limit: LIMIT,
                    ...(search.value.trim() ? { name: search.value.trim() } : {}),
                    sortBy: sortBy.value,
                    sortOrder: sortOrder.value,
                    ...(statusFilter.value !== 'all'
                        ? { status: statusFilter.value }
                        : {}),
                },
            })

            if (!response.data) throw new Error('Не вдалося завантажити турніри')

            const data = response.data

            if (data.data && Array.isArray(data.data)) {
                if (resetData) {
                    tournaments.value = data.data
                } else {
                    tournaments.value.push(...data.data)
                }
                totalPages.value = data.totalPages
                page.value++
            }

            return data
        } catch (err: unknown) {
            console.error('Помилка API при завантаженні турнірів:', err)
            const message =
                err instanceof Error ? err.message : 'Помилка завантаження'
            error.value = message
            throw err
        } finally {
            loading.value = false
        }
    }

    const addTournament = async (tournament: Tournament) => {
        try {
            const api = useApi()
            const response = await api.post(`/tournaments`, tournament)

            if (!response.data) throw new Error('Не вдалося створити турнір')

            const createdTournament = response.data
            tournaments.value.unshift(createdTournament)
            toast.success('Турнір успішно створено')
            return createdTournament
        } catch (error: unknown) {
            console.error('Помилка API при додаванні турніру:', error)
            toast.error('Помилка API при додаванні турніру')
            throw error
        }
    }

    const fetchTournamentById = async (id: string) => {
        loading.value = true
        try {
            const api = useApi()
            const response = await api.get(`/tournaments/${id}`)
            if (!response.data) throw new Error('Не вдалося завантажити дані турніру')
            return response.data
        } catch (error) {
            console.error('Помилка API при завантаженні турніру:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    const deleteTournament = async (id: string) => {
        try {
            const api = useApi()
            await api.delete(`/tournaments/${id}`)
            tournaments.value = tournaments.value.filter((t) => t.id !== id)
            toast.success('Турнір успішно видалено')
        } catch (error) {
            console.error('Помилка API при видаленні турніру:', error)
            toast.error('Помилка API при видаленні турніру')
            throw error
        }
    }

    const updateTournament = async (id: string, tournament: Partial<Tournament>) => {
        try {
            const api = useApi()
            const response = await api.patch(`/tournaments/${id}`, tournament)
            if (!response.data) throw new Error('Не вдалося оновити турнір')

            const updatedTournament = response.data
            tournaments.value = tournaments.value.map((t) => (t.id === id ? updatedTournament : t))
            toast.success('Турнір успішно оновлено')
            return updatedTournament
        } catch (error: unknown) {
            console.error('Помилка API при оновленні турніру:', error)
            toast.error('Помилка API при оновленні турніру')
            throw error
        }
    }

    const joinTournament = async (tournamentId: string, teamId: string) => {
        try {
            const api = useApi()
            const response = await api.patch(`/tournaments/join/${tournamentId}`, { teamId })
            if (!response.data) throw new Error('Не вдалося зареєструвати команду в турнір')
            toast.success('Команду зареєстровано в турнірі')
            return response.data
        } catch (err: any) {
            console.error('Помилка API при реєстрації команди в турнірі:', err)
            const message = err?.response?.data?.message || 'Не вдалося зареєструвати команду в турнірі'
            toast.error(message)
            throw err
        }
    }


    const debouncedSearch = useDebounceFn(() => {
        loadFromDatabase(true)
    }, 300)

    watch(search, () => debouncedSearch())

    return {
        tournaments,
        filteredTournaments,
        loading,
        error,
        hasMore,
        search,
        sortBy,
        sortOrder,
        statusFilter,
        reset,
        loadFromDatabase,
        fetchTournamentById,
        addTournament,
        joinTournament,
        updateTournament,
        deleteTournament,
    }
})
