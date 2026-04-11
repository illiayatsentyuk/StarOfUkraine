import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

export const useTournamentBracket = defineStore('tournamentBrackets', () => {
    const toast = useToast()
    const loading = ref(false)
    const error = ref<string | null>(null)
    const matchData = ref<any>(null)

    /**
     * Завантажує дані матчу з OpenDota API за його ID.
     */
    const fetchMatchData = async (matchId: string) => {
        if (!matchId || matchId.length < 5) return null

        loading.value = true
        error.value = null
        
        try {
            const response = await fetch(`https://api.opendota.com/api/matches/${matchId}`)
            if (!response.ok) throw new Error('Матч не знайдено або помилка API')
            
            const data = await response.json()
            if (data?.error || data?.status === 'error') {
                throw new Error(data.error || 'Помилка API')
            }
            
            matchData.value = data
            return data
        } catch (err: any) {
            const message = err?.message || 'Помилка завантаження даних матчу'
            error.value = message
            toast.error(message)
            matchData.value = null
            return null
        } finally {
            loading.value = false
        }
    }

    const reset = () => {
        matchData.value = null
        error.value = null
        loading.value = false
    }

    return {
        loading,
        error,
        matchData,
        fetchMatchData,
        reset
    }
})




