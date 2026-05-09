<template lang="pug">
section.tournament-detail
    .loading-overlay(v-if="pending")
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
                TournamentAbout(:description="tournament.description")

                .content-section
                    TournamentStats(
                        :rounds="tournament.rounds"
                        :teamSizeMin="tournament.teamSizeMin"
                        :teamSizeMax="tournament.teamSizeMax"
                        :maxTeams="tournament.maxTeams"
                    )

                .content-section.leaderboard-action(v-if="!shouldHideTeams")
                    h2 Рейтинг команд
                    p.desc Перегляньте поточний лідерборд турніру та результати оцінювання.
                    NuxtLink.leaderboard-btn(:to="`/tournaments/${tournamentId}/leaderboard`")
                        span Переглянути лідерборд
                        span.icon →

            TournamentSidebar(
                :tournament="tournament"
                :status="tournamentStatus"
                :isAdmin="authStore.isAdmin"
                :isJury="authStore.isJury"
                :isAuthenticated="authStore.isAuthenticated"
                :isRegistrationActive="isRegistrationActive"
                :isAlreadyJoined="isAlreadyJoined"
                :hasTeam="!!teamsStore.activeTeam"
                :joining="joining"
                :shouldHideTeams="shouldHideTeams"
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
import type { LeaderboardRow, Tournament, Team } from '~/types'
import { getTournamentStatusInfo } from '~/utils/tournament-status-ui'
import TournamentLeaderboardTable from '~/components/tournaments/TournamentLeaderboardTable.vue'

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
const leaderboardRows = ref<LeaderboardRow[]>([])
const loadingLeaderboard = ref(false)
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

const refreshTeams = async () => {
    if (shouldHideTeams.value) return
    loadingTeams.value = true
    loadingLeaderboard.value = true
    try {
        const rows = await tournamentStore.fetchLeaderboard(tournamentId.value)
        leaderboardRows.value = rows
        teams.value = rows.map((r) => ({
            id: r.team.id,
            name: r.team.name,
            points: r.totalScore,
        }))
    } catch (e) {
        console.error('Failed to refresh teams', e)
        leaderboardRows.value = []
    } finally {
        loadingTeams.value = false
        loadingLeaderboard.value = false
    }
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
        tournament.value = await tournamentStore.fetchTournamentById(route.params.id as string)
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
    }

    .leaderboard-action {
        background: var(--color-surface, #ffffff);
        padding: 32px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        h2 {
            margin: 0;
            font-size: 24px;
            color: var(--color-text-main);
        }

        .desc {
            margin: 0;
            color: var(--color-text-muted);
            font-size: 15px;
        }

        .leaderboard-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background-color: var(--color-primary, #007bff);
            color: white;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: background-color 0.2s, transform 0.2s;

            &:hover {
                background-color: var(--color-primary-dark, #0056b3);
                transform: translateY(-2px);
            }
        }
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
