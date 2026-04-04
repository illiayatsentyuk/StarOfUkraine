import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useToast } from 'vue-toastification'
import { useApi } from '~/composables/useApi'
import type { Tournament } from '~/types'

const LIMIT = 5

export const useTournamentsStore = defineStore('tournaments', () => {
    const toast = useToast()
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

    const loadFromDatabase = async (resetData = false) => {
        if (loading.value) return

        loading.value = true
        error.value = null

        if (resetData) {
            reset()
        }

        try {
            const api = useApi()
            const response = await api.post(`/tournaments/list`, {
                page: page.value,
                limit: LIMIT,
                name: search.value.trim() || undefined,
                // У бекенді FindQueryDto.sortBy зараз лише createdAt | updatedAt.
                // Коли додасте поля турніру — розкоментуйте й передавайте:
                // sortBy: 'startDate' | 'name' | …
                // sortOrder: 'ASC' | 'DESC'
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

    const debouncedSearch = useDebounceFn(() => {
        loadFromDatabase(true)
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
        addTournament,
        deleteTournament,
    }
})
