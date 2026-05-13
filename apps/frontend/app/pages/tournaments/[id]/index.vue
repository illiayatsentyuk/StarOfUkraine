<template lang="pug">
section.tournament-detail
    .loading-overlay(v-if="store.loading")
        Loader

    template(v-else-if="tournament")
        .tournament-detail__nav
            NuxtLink.back-link(to="/")
                span.icon ←
                span.text НАЗАД ДО СПИСКУ

        TournamentHero(
            :name="tournament.name"
            :tournamentId="route.params.id"
            :status="tournamentStatus"
        )

        .tournament-detail__layout
            main.main-content
                .content-section
                    h3.section-label ПРО ТУРНІР
                    p.description {{ tournament.description }}

                .content-section
                    TournamentStats(
                        :rounds="tournament.rounds"
                        :teamSizeMin="tournament.teamSizeMin"
                        :teamSizeMax="tournament.teamSizeMax"
                        :maxTeams="tournament.maxTeams"
                    )

                .content-section
                    h3.section-label КОМАНДИ
                    p.description(v-if="shouldHideTeams") Список команд буде доступний після завершення реєстрації.
                    template(v-else)
                        p.description(v-if="teamsStore.loading") Завантаження команд...
                        p.description(v-else-if="!teams.length") Команди поки не додані.
                        .teams-grid(v-else)
                            TeamCard(
                                v-for="team in teams"
                                :key="team.id"
                                :team="team"
                                :isAdmin="authStore.isAdmin"
                                @delete="teamsStore.deleteTeam($event)"
                            )

            TournamentSidebar(
                :tournament="tournament"
                :tournamentId="tournamentId"
                :status="tournamentStatus"
                :isAdmin="authStore.isAdmin"
                :isAuthenticated="authStore.isAuthenticated"
                :isRegistrationActive="isRegistrationActive"
                @edit="openEditModal"
                @delete="handleDelete"
                @createTeam="openTeamModal"
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
    EditTournamentModal(
        v-if="tournament && authStore.isAdmin"
        :isOpen="isEditModalOpen"
        :tournament="tournament"
        @close="isEditModalOpen = false"
        @updated="onTournamentUpdated"
    )
    CreateTeamModal(
        v-if="tournament && authStore.isAuthenticated"
        :isTeamOpen="isTeamOpen"
        @close="isTeamOpen = false"
        @success="refreshTeams"
    )
</template>

<script setup lang="ts">
import { getTournamentStatusInfo } from '~/utils/tournament-status-ui'

const route = useRoute()
const store = useTournamentsStore()
const authStore = useLoginStore()
const teamsStore = useTeamsStore()

console.log(route.params.id)

const tournament = ref<any>(null)
const teams = ref<any[]>([])
const isDeleteModalOpen = ref(false)
const isTeamOpen = ref(false)
const isEditModalOpen = ref(false)

const tournamentId = computed(() => route.params.id as string)

const tournamentStatus = computed(() => {
    if (!tournament.value) return null
    return getTournamentStatusInfo(tournament.value?.status)
})

const isRegistrationActive = computed(() => {
    return tournament.value?.status === 'REGISTRATION_OPEN'
})

const shouldHideTeams = computed(() => {
    if (authStore.isAdmin) return false
    if (!tournament.value?.hideTeamsUntilRegistrationEnds) return false
    if (!tournament.value?.registrationEnd) return false
    return new Date(tournament.value.registrationEnd) > new Date()
})

function openTeamModal() {
    isTeamOpen.value = true
}

async function refreshTeams() {
    if (shouldHideTeams.value) return
    try {
        const teamsResponse = await teamsStore.loadFromDatabase(true)
        teams.value = teamsResponse?.data || []
    } catch {
        console.error('Failed to refresh teams')
    }
}

onMounted(async () => {
    try {
        tournament.value = await store.fetchTournamentById(route.params.id as string)
        await refreshTeams()
    } catch {
        console.error('Failed to load tournament detail')
    }
})

function handleDelete() {
    isDeleteModalOpen.value = true
}

function openEditModal() {
    isEditModalOpen.value = true
}

async function onTournamentUpdated(updatedTournament: any) {
    tournament.value = updatedTournament
}

async function onTournamentDeleted() {
    await navigateTo('/')
}

</script>

<style lang="scss" scoped>
.tournament-detail {
    min-height: 80vh;
    animation: fadeIn 0.4s ease-out;
    max-width: 1440px;
    margin: 0 auto;
    padding: 60px 48px;

    @media (max-width: 768px) {
        padding: 0 24px 40px;
    }

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
}

.main-content {
    .content-section {
        margin-bottom: 64px;

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

.section-label {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 2px;
    margin: 0;
}

.teams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    margin-top: 24px;
}

.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200px 0;
    gap: 24px;
}

.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    gap: 16px;
    color: var(--color-text-muted);
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

:deep(.p-progressspinner-circle) {
    stroke: var(--color-primary) !important;
}
</style>
