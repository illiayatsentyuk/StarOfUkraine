import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
    const tournaments = ref<Tournament[]>([])
    const page = ref(1)
    const totalPages = ref(0)
    const loading = ref(false)

    const hasMore = computed(() => page.value <= totalPages.value)

    const loadFromDatabase = async () => {
        if (loading.value) return
        loading.value = true

        try {
            const response = await fetch(
                `https://starofukraine.onrender.com/tournaments?page=${page.value}&limit=${LIMIT}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
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
            const response = await fetch('https://starofukraine.onrender.com/tournaments', {
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

    return {
        tournaments,
        loading,
        hasMore,
        loadFromDatabase,
        addTournament
    }
})
