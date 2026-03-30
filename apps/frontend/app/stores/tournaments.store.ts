import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

export interface Tournament {
    id?: string
    name: string
    description: string
    startDate: string
    registrationStart: string
    registrationEnd: string
    rounds: string | number
    maxTeams: string | number
    teamSizeMin: string | number
    teamSizeMax: string | number
    status?: string
    hideTeamsUntilRegistrationEnds: boolean
    createdAt?: string
}

const LIMIT = 5

export const useTournamentsStore = defineStore('tournaments', () => {
    const config = useRuntimeConfig()
    const tournaments = ref<Tournament[]>([])
    const page = ref(1)
    const totalPages = ref(0)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const search = ref('')

    const hasMore = computed(() => page.value <= totalPages.value)

    const reset = () => {
        page.value = 1
        tournaments.value = []
        totalPages.value = 0
        error.value = null
    }

    const loadFromDatabase = async (reset = false) => {
        if (loading.value) return
        // if (reset) {
        //     page.value = 1
        //     tournaments.value = []
        // }
        
        // loading.value = true
        loading.value = true
        error.value = null

        try {
            const response = await fetch(
                `${config.public.apiURL}/tournaments/list`,
                {   
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        page: page.value, 
                        limit: LIMIT,
                        name: search.value.trim() || undefined
                    })
                }
            )

            if (!response.ok) throw new Error('Не вдалося завантажити турніри')

            const data = await response.json()

            if (data.data && Array.isArray(data.data)) {
                tournaments.value.push(...data.data)
                totalPages.value = data.totalPages
                page.value++
            }

            return data
        } catch (error) {
            console.error('Помилка API при завантаженні турнірів:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    const addTournament = async (tournament: Tournament) => {
        try {
            const response = await fetch(`${config.public.apiURL}/tournaments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tournament)
            })

            if (!response.ok) throw new Error('Не вдалося створити турнір')

            const createdTournament = await response.json()
            tournaments.value.unshift(createdTournament) 
            return createdTournament
        } catch (error) {
            console.error('Помилка API при додаванні турніру:', error)
            throw error
        }
    }

    // Removed automatic load on initialization to prevent double calls with components
    // loadFromDatabase()

    const fetchTournamentById = async (id: string) => {
        loading.value = true
        try {
            const response = await fetch(`${config.public.apiURL}/tournaments/${id}`)
            if (!response.ok) throw new Error('Не вдалося завантажити дані турніру')
            return await response.json()
        } catch (error) {
            console.error('Помилка API при завантаженні турніру:', error)
            throw error
        } finally {
            loading.value = false
        }
    }
    const debouncedSearch = useDebounceFn(() => {
        reset()
        loadFromDatabase()
    }, 300)

    watch(search, () => debouncedSearch())

    return {
        tournaments,
        loading,
        error,
        hasMore,
        search,      
        reset,
        loadFromDatabase,
        fetchTournamentById,
        addTournament
    }
})
