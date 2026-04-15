import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTournamentsStore } from './tournaments.store'

export const useTournamentFiltersStore = defineStore('tournamentFilters', () => {
    const tournamentsStore = useTournamentsStore()
    const activeFilter = ref('all')
    const isMinimum = ref(false)

    const filterMap: Record<string, string> = {
        all: 'createdAt',
        byDate: 'startDate',
        byName: 'name',
        byMaxTeams: 'maxTeams',
        byTeamSizeMin: 'teamSizeMin',
        byTeamSizeMax: 'teamSizeMax',
        byRounds: 'rounds',
        byRegistrationStart: 'registrationStart',
        byRegistrationEnd: 'registrationEnd',
    }

    const setFilter = (key: string) => {
        if (activeFilter.value === key) {
            isMinimum.value = !isMinimum.value
        } else {
            activeFilter.value = key
            isMinimum.value = false
        }

        tournamentsStore.sortBy = filterMap[key] || 'createdAt'
        tournamentsStore.sortOrder = isMinimum.value ? 'ASC' : 'DESC'
        tournamentsStore.loadFromDatabase(true)
    }

    const sortEndedTournaments = () => {
        tournamentsStore.sortBy = 'startDate'
        tournamentsStore.sortOrder = 'DESC'
        tournamentsStore.loadFromDatabase(true)
    }

    return {
        activeFilter,
        isMinimum,
        setFilter,
        sortEndedTournaments,
    }
})
