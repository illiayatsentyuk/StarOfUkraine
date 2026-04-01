import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import axios from 'axios'
import { useToast } from "vue-toastification";

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
const toast = useToast();

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
            const response = await axios.post(
                `${config.public.apiURL}/tournaments/list`,
                { 
                    page: page.value, 
                    limit: LIMIT,
                    name: search.value.trim() || undefined
                }
            )

            if (!response.data) throw new Error('Не вдалося завантажити турніри')

            const data = response.data

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
            const response = await axios.post(`${config.public.apiURL}/tournaments`, tournament)

            if (!response.data) throw new Error('Не вдалося створити турнір')

            const createdTournament = response.data
            tournaments.value.unshift(createdTournament) 
            toast.success("Турнір успішно створено");
            return createdTournament
        } catch (error) {
            console.error('Помилка API при додаванні турніру:', error)
            toast.error("Помилка API при додаванні турніру");
            throw error
        }
    }

    const fetchTournamentById = async (id: string) => {
        loading.value = true
        try {
            const response = await axios.get(`${config.public.apiURL}/tournaments/${id}`)
            if (!response.data) throw new Error('Не вдалося завантажити дані турніру')
            return response.data
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

    const deleteTournament = async (id: string) => {
        try {
            await axios.delete(`${config.public.apiURL}/tournaments/${id}`)
            tournaments.value = tournaments.value.filter(t => t.id !== id)
            toast.success("Турнір успішно видалено");
        } catch (error) {
            console.error('Помилка API при видаленні турніру:', error)
            toast.error("Помилка API при видаленні турніру");
            throw error
        }
    }

    return {
        tournaments,
        loading,
        error,
        hasMore,
        search,      
        reset,
        loadFromDatabase,
        fetchTournamentById,
        addTournament,
        deleteTournament
    }
})
