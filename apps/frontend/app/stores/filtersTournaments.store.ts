import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTournamentsStore } from './tournaments.store'

export const useFiltersTournamentsStore = defineStore('filtersTournaments', () => {
    const tournamentsStore = useTournamentsStore()
    const activeFilter = ref('all')

    const filteredTournaments = computed(() => {
        const result = [...tournamentsStore.tournaments]

        if (activeFilter.value === 'all') {
            return result
        } else if (activeFilter.value === 'byDate') {
            return result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        } else if (activeFilter.value === 'byName') {
            return result.sort((a, b) => a.name.localeCompare(b.name))
        } else if (activeFilter.value === 'byMaxTeams') {
            return result.sort((a, b) => Number(b.maxTeams) - Number(a.maxTeams))
        } else if (activeFilter.value === 'byTeamSizeMin') {
            return result.sort((a, b) => Number(b.teamSizeMin) - Number(a.teamSizeMin))
        } else if (activeFilter.value === 'byTeamSizeMax') {
            return result.sort((a, b) => Number(b.teamSizeMax) - Number(a.teamSizeMax))
        } else if (activeFilter.value === 'byRounds') {
            return result.sort((a, b) => Number(b.rounds) - Number(a.rounds))
        } else if (activeFilter.value === 'byRegistrationStart') {
            return result.sort((a, b) => new Date(b.registrationStart).getTime() - new Date(a.registrationStart).getTime())
        } else if (activeFilter.value === 'byRegistrationEnd') {
            return result.sort((a, b) => new Date(b.registrationEnd).getTime() - new Date(a.registrationEnd).getTime())
        }

        return result
    })

    function sortByDate() { activeFilter.value = 'byDate' }
    function sortByName() { activeFilter.value = 'byName' }
    function sortByMaxTeams() { activeFilter.value = 'byMaxTeams' }
    function sortByTeamSizeMin() { activeFilter.value = 'byTeamSizeMin' }
    function sortByTeamSizeMax() { activeFilter.value = 'byTeamSizeMax' }
    function sortByRounds() { activeFilter.value = 'byRounds' }
    function sortByRegistrationStart() { activeFilter.value = 'byRegistrationStart' }
    function sortByRegistrationEnd() { activeFilter.value = 'byRegistrationEnd' }

    return {
        activeFilter,
        filteredTournaments,
        sortByDate,
        sortByName,
        sortByMaxTeams,
        sortByTeamSizeMin,
        sortByTeamSizeMax,
        sortByRounds,
        sortByRegistrationStart,
        sortByRegistrationEnd,
    }
})