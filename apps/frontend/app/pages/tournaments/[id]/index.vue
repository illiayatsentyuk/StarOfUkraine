<template lang="pug">
.tournament-detail
  // Loading State
  .loading-overlay(v-if="store.loading")
    Loader
    span.loading-text ЗАВАНТАЖЕННЯ ТУРНІРУ...

  // Content State
  template(v-else-if="tournament")
    .tournament-detail__nav
      NuxtLink.back-link(to="/")
        span.icon ←
        span.text НАЗАД ДО СПИСКУ

    TournamentHero(
      :tournament="tournament"
      :status="tournamentStatus"
      v-model:isOpenBracket="isOpenBracket"
      :isAdmin="authStore.isAdmin"
    )
    
    .tournament-detail__layout(v-if="!isOpenBracket")
      main.main-content
        .content-section
          h3.section-label ПРО ТУРНІР
          p.description {{ tournament.description }}
        
        TournamentDetailsStats(
          :rounds="roundsStatDisplay"
          :teamSizeMin="tournament.teamSizeMin"
          :teamSizeMax="tournament.teamSizeMax"
          :maxTeams="tournament.maxTeams"
        )

        TournamentTeamsList(
          :teams="teams"
          :loading="teamsStore.loading"
          :isAdmin="authStore.isAdmin"
          :shouldHideTeams="shouldHideTeams"
          @deleteTeam="teamsStore.deleteTeam"
        )

        TournamentTeamsTable(
          v-model:teams="teams"
          :isAdmin="authStore.isAdmin"
          :shouldHideTeams="shouldHideTeams"
          @shuffle="shuffleTeams"
          @generate="generateBracket(teams)"
        )

      TournamentSidebar(
        :tournament="tournament"
        :status="tournamentStatus"
        :isAdmin="authStore.isAdmin"
        :isAuthenticated="authStore.isAuthenticated"
        :isRegistrationActive="isRegistrationActive"
        @delete="handleDelete"
        @openTeamModal="isTeamOpen = true"
      )
    
    //- Bracket View
    .tournament-detail__bracket-view(v-else-if="isOpenBracket")
      TournamentBracket(
        v-model:rounds="bracketRounds"
        @matchClick="onMatchClick"
        @participantClick="onParticipantClick"
        @resolveMatch="applyDotaResultToMatch"
      )

  .error-state(v-else)
    p Турнір не знайдено.
    NuxtLink(to="/") Повернутися до списку

  DeleteModal(
    v-if="tournament && authStore.isAdmin"
    :isOpen="isDeleteModalOpen" 
    :tournament="tournament" 
    @close="isDeleteModalOpen = false" 
    @delete="onTournamentDeleted"
  )
  
  CreateTeamModal(
    v-if="tournament && authStore.isAuthenticated"
    :isTeamOpen="isTeamOpen"
    @close="isTeamOpen = false"
    @success="refreshTeams"
  )

  DotaMatchDialog(
    v-model="isMatchModalOpen"
    :isMatching="isMatching"
    @confirm="handleMatchConfirm"
  )
</template>

<script lang="ts" setup>



const route = useRoute()
const store = useTournamentsStore()
const authStore = useLoginStore()
const teamsStore = useTeamsStore()

const tournament = ref<any>(null)
const teams = ref<any[]>([])
const isDeleteModalOpen = ref(false)
const isOpenBracket = ref(false)
const isTeamOpen = ref(false)

// Dota Match Modal State
const isMatchModalOpen = ref(false)
const currentMatchId = ref<string | null>(null)
const isMatching = ref(false)

// Extracted Logic
const { 
  bracketRounds, 
  initRoundsFromTournament, 
  generateBracket, 
  applyDotaResultToMatch 
} = useTournamentBracketLogic(route.params.id as string)

const tournamentStatus = computed(() => {
  if (!tournament.value) return null
  return calculateTournamentStatus(tournament.value, bracketRounds.value)
})

const isRegistrationActive = computed(() => {
  return tournamentStatus.value?.code === 'registration'
})

const roundsStatDisplay = computed(() => {
  const r = tournament.value?.rounds
  if (typeof r === 'number' && !Number.isNaN(r)) return r
  if (Array.isArray(r)) return r.length
  return '—'
})

const shouldHideTeams = computed(() => {
  if (authStore.isAdmin) return false
  if (!tournament.value?.hideTeamsUntilRegistrationEnds) return false
  if (!tournament.value?.registrationEnd) return false
  return new Date(tournament.value.registrationEnd) > new Date()
})

const onMatchClick = (match: any) => {
  if (!authStore.isAdmin) return
  currentMatchId.value = String(match.id || match)
  isMatchModalOpen.value = true
}

async function handleMatchConfirm(dotaId: string) {
  if (!currentMatchId.value || !dotaId) return
  isMatching.value = true
  try {
    await applyDotaResultToMatch(currentMatchId.value, dotaId)
    isMatchModalOpen.value = false
  } catch (e) {
    // Error handled in applyDotaResultToMatch
  } finally {
    isMatching.value = false
  }
}

const onParticipantClick = (participant: any) => {
  console.log('Participant clicked:', participant)
}

async function refreshTeams() {
  if (shouldHideTeams.value) return
  try {
    const teamsResponse = await teamsStore.loadFromDatabase(true)
    teams.value = teamsResponse?.data || []
  } catch (e) {
    console.error('Failed to refresh teams')
  }
}

onMounted(async () => {
  try {
    tournament.value = await store.fetchTournamentById(route.params.id as string)
    initRoundsFromTournament(tournament.value)
    await refreshTeams()
  } catch (e) {
    console.error('Failed to load tournament detail')
  }
})

const handleDelete = () => {
  isDeleteModalOpen.value = true
}

const onTournamentDeleted = async () => {
  await navigateTo('/')
}

const shuffleTeams = () => {
  teams.value = [...teams.value].sort(() => Math.random() - 0.5)
}

watch(isOpenBracket, (newVal) => {
  if (newVal && bracketRounds.value.length === 0 && teams.value.length > 0) {
    generateBracket(teams.value)
  }
})
</script>

<style lang="scss" scoped>
.tournament-detail {
  padding-top: 60px;
  min-height: 80vh;
  animation: fadeIn 0.4s ease-out;

  &__nav {
    margin-bottom: 48px;
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--color-text-muted);
      font-weight: 600;
      font-size: 11px;
      letter-spacing: 1.5px;
      transition: all 0.2s ease;

      &:hover {
        color: var(--color-primary);
        transform: translateX(-4px);
      }
    }
  }

  &__layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 80px;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 48px;
    }
  }

  &__bracket-view {
    width: 100%;
    margin-top: 32px;
    animation: fadeIn 0.6s ease-out;
    overflow-x: auto;
    padding-bottom: 80px;
  }
}

.main-content {
  .content-section {
    margin-bottom: 64px;

    .section-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--color-text-muted);
      letter-spacing: 2px;
      margin-bottom: 24px;
      text-transform: uppercase;
    }

    .description {
      font-size: 22px;
      line-height: 1.5;
      color: var(--color-text);
      margin: 24px 0 0 0;
      max-width: 800px;
      font-weight: 400;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200px 0;
  gap: 24px;

  .loading-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-muted);
    letter-spacing: 3px;
  }
}

:deep(.p-progressspinner-circle) {
  stroke: var(--color-primary) !important;
}

.error-state {
  text-align: center;
  padding: 100px 0;
  
  p {
    font-size: 18px;
    color: var(--color-text-muted);
    margin-bottom: 24px;
  }

  a {
    color: var(--color-primary);
    font-weight: 700;
    text-decoration: none;
    letter-spacing: 1px;
    
    &:hover { text-decoration: underline; }
  }
}
</style>
