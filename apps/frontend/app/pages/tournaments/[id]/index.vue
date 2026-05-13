<template lang="pug">
section.tournament-detail
    .loading-overlay(v-if="pending")
        Loader

    template(v-else-if="tournament")
        .tournament-detail__nav
            NuxtLink.back-link(to="/")
                i.pi.pi-arrow-left.icon
                span.text НАЗАД ДО СПИСКУ

        TournamentHero(
            :name="tournament.name"
            :tournamentId="route.params.id"
            :status="tournamentStatus"
            :canSeeTasks="canSeeTasks"
        )

        .tournament-detail__layout
            main.main-content
                TournamentAbout(:description="tournament.description")

                .content-section
                    TournamentStats(
                        :rounds="tournament.rounds"
                        :teamSizeMin="tournament.teamSizeMin"
                        :teamSizeMax="tournament.teamSizeMax"
                        :maxTeams="tournament.maxTeams"
                    )



            TournamentSidebar(
                :tournament="tournament"
                :tournamentId="tournamentId"
                :status="tournamentStatus"
                :isAdmin="authStore.isAdmin"
                :isJury="authStore.isJury"
                :isAuthenticated="authStore.isAuthenticated"
                :isRegistrationActive="isRegistrationActive"
                :isAlreadyJoined="isAlreadyJoined"
                :hasTeam="!!teamsStore.activeTeam"
                :activeTeam="teamsStore.activeTeam"
                :joining="joining"
                :shouldHideTeams="tournament.hideTeamsUntilRegistrationEnds"
                @edit="openEditModal"
                @delete="handleDelete"
                @joinTournament="handleJoinTournament"
            )

    .error-state(v-else)
        p {{ fetchError ? 'Помилка завантаження' : 'Турнір не знайдено.' }}
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
        v-if="tournament && authStore.isAuthenticated && !authStore.isAdmin && !authStore.isJury"
        :isTeamOpen="isTeamOpen"
        @close="isTeamOpen = false"
        @success="onTeamCreated"
    )
</template>

<script setup lang="ts">
const route = useRoute()
const tournamentStore = useTournamentsStore()
const authStore = useLoginStore()
const teamsStore = useTeamsStore()
const api = useApi()

const tournamentId = computed(() => route.params.id as string)

// SSR-safe tournament fetching
const { data: tournament, pending, error: fetchError } = await useAsyncData(
    `tournament-${tournamentId.value}`,
    () => tournamentStore.fetchTournamentById(tournamentId.value)
)

const teams = ref<(Partial<Team> & { points?: number })[]>([])
const loadingTeams = ref(false)
const isDeleteModalOpen = ref(false)
const isTeamOpen = ref(false)
const isEditModalOpen = ref(false)
const joining = ref(false)

const tournamentStatus = computed(() => {
    if (!tournament.value) return null
    return getTournamentStatusInfo(tournament.value?.status)
})

const isRegistrationActive = computed(() => {
    return tournament.value?.status === 'REGISTRATION_OPEN'
})

const shouldHideTeams = computed(() => {
    if (authStore.isAdmin || authStore.isJury) return false
    if (!tournament.value?.hideTeamsUntilRegistrationEnds) return false
    if (!tournament.value?.registrationEnd) return false
    return new Date(tournament.value.registrationEnd) > new Date()
})

// Перевірка чи команда юзера вже зареєстрована в цьому турнірі
const isAlreadyJoined = computed(() => {
    const activeTeamId = teamsStore.activeTeamId
    if (!activeTeamId) return false
    return teams.value.some((t) => t.id === activeTeamId)
})

const canSeeTasks = computed(() => {
    if (authStore.isAdmin || authStore.isJury) return true
    const hasStarted = tournament.value?.status === 'ONGOING' || tournament.value?.status === 'COMPLETED'
    return isAlreadyJoined.value && hasStarted
})

const refreshTeams = async () => {
    if (shouldHideTeams.value || !tournament.value?.teams) return
    teams.value = tournament.value.teams.map((t: any) => ({
        id: t.id,
        name: t.name,
    }))
}

// Головна дія: вступити в турнір
const handleJoinTournament = async () => {
    if (!authStore.isAuthenticated) return

    // Якщо немає команди — спочатку відкрити модалку створення
    if (!teamsStore.activeTeam) {
        isTeamOpen.value = true
        return
    }

    // Є команда — одразу join
    joining.value = true
    try {
        await tournamentStore.joinTournament(tournamentId.value, teamsStore.activeTeam.id)
        await refreshTeams()
    } catch {
        // помилка вже показана в store
    } finally {
        joining.value = false
    }
}

// Після створення команди — автоматично приєднуємо до турніру
const onTeamCreated = async ({ teamId }: { teamId: string }) => {
    await teamsStore.setActiveTeam(teamId)
    joining.value = true
    try {
        await tournamentStore.joinTournament(tournamentId.value, teamId)
        await refreshTeams()
    } catch {
        // помилка вже показана в store
    } finally {
        joining.value = false
    }
}

onMounted(async () => {
    try {
        await teamsStore.initActiveTeam()
        // No need to fetch tournament here, useAsyncData handles it
        await refreshTeams()
    } catch {
        console.error('Failed to initialize detail page')
    }
})

watch(tournament, () => {
    refreshTeams()
}, { immediate: true })

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

const shuffleTeams = () => {
    teams.value = [...teams.value].sort(() => Math.random() - 0.5)
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
        padding: 24px 16px 40px;
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

            .icon {
                font-size: 14px;
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
    }

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
