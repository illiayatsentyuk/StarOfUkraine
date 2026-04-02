import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTournamentsStore } from './tournaments.store'

export const useFiltersTournamentsStore = defineStore('filtersTournaments', () => {
    const tournamentsStore = useTournamentsStore()
    const activeFilter = ref('all')
    const isMinimum = ref(false)

    const getSortValue = (t: any, key: string) => {
        switch (key) {
            case 'byDate': return new Date(t.startDate).getTime()
            case 'byName': return t.name.toLowerCase()
            case 'byMaxTeams': return Number(t.maxTeams)
            case 'byTeamSizeMin': return Number(t.teamSizeMin)
            case 'byTeamSizeMax': return Number(t.teamSizeMax)
            case 'byRounds': return Number(t.rounds)
            case 'byRegistrationStart': return new Date(t.registrationStart).getTime()
            case 'byRegistrationEnd': return new Date(t.registrationEnd).getTime()
            default: return 0
        }
    }

    const filteredTournaments = computed(() => {
        const result = [...tournamentsStore.tournaments]
        if (activeFilter.value === 'all') return result

        return result.sort((a, b) => {
            const valA = getSortValue(a, activeFilter.value)
            const valB = getSortValue(b, activeFilter.value)

            if (valA < valB) return isMinimum.value ? -1 : 1
            if (valA > valB) return isMinimum.value ? 1 : -1
            return 0
        })
    })

    const setFilter = (key: string) => {
        if (activeFilter.value === key) {
            isMinimum.value = !isMinimum.value
        } else {
            activeFilter.value = key
            isMinimum.value = false
        }
    }

    return {
        activeFilter,
        isMinimum,
        filteredTournaments,
        setFilter
    }
})