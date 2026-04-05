import type { Team } from '~/types/teams.interface' 
import { useToast } from "vue-toastification";
import { useApi } from '~/composables/useApi';

const LIMIT = 16

export const useTeamsStore = defineStore('teams', ()=> {
    const toast = useToast();
    const teams = ref<Team[]>([])
    const page = ref(1)
    const totalPages = ref(0)
    const loading = ref(false)
    const error = ref<string | null>(null)

    

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

        if (resetData) {
            reset()
        }

        try {
            const api = useApi()
            const response = await api.post(
                `/teams/list`,
                { 
                    page: page.value, 
                    limit: LIMIT,
                },
            )

            if (!response.data)
                throw new Error('Не вдалося завантажити команди')
                toast.error('Не вдалося завантажити команди')

            const data = response.data

            if (data.data && Array.isArray(data.data)) {
                if (resetData) {
                    teams.value = data.data
                } else {
                    teams.value.push(...data.data)
                }
                totalPages.value = data.totalPages
                page.value++
            }

            return data
        } catch (error: any) {
            console.error('Помилка API при завантаженні команд:', error)
            toast.error('Не вдалося завантажити команди')
            error.value = error.message || 'Помилка завантаження'
            throw error
        } finally {
            loading.value = false
        }
    }

    return {
        teams,
        page,
        totalPages,
        loading,
        error,
        hasMore,
        reset,
        loadFromDatabase
    }
})
    