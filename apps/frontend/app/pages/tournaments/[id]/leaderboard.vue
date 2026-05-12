<template lang="pug">
.leaderboard-page
    .leaderboard-container
        .header
            NuxtLink.back-link(:to="`/tournaments/${tournamentId}`")
                i.pi.pi-arrow-left.icon
                span.text НАЗАД ДО ТУРНІРУ
            h1.title Лідерборд

        .table-wrapper
            TournamentLeaderboardTable(
                v-if="!shouldHideTeams && !isNotAvailable"
                :rows="leaderboardRows"
                :loading="loadingLeaderboard"
            )
            .hidden-state(v-else-if="shouldHideTeams")
                p Лідерборд приховано до закінчення реєстрації.
            .hidden-state(v-else-if="isNotAvailable")
                p Лідерборд ще не сформовано. Оцінювання триває.
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

const route = useRoute()
const tournamentStore = useTournamentsStore()
const authStore = useLoginStore()

const tournamentId = computed(() => route.params.id as string)

const tournament = ref<any>(null)
const leaderboardRows = ref<any[]>([])
const loadingLeaderboard = ref(true)
const isNotAvailable = ref(false)

const shouldHideTeams = computed(() => {
    if (authStore.isAdmin || authStore.isJury) return false
    if (!tournament.value?.hideTeamsUntilRegistrationEnds) return false
    if (!tournament.value?.registrationEnd) return false
    return new Date(tournament.value.registrationEnd) > new Date()
})

const refreshTeams = async () => {
    if (shouldHideTeams.value) {
        loadingLeaderboard.value = false
        return
    }
    loadingLeaderboard.value = true
    isNotAvailable.value = false
    try {
        leaderboardRows.value = await tournamentStore.fetchLeaderboard(tournamentId.value)
    } catch (e: any) {
        if (e.response?.status === 400) {
            isNotAvailable.value = true
        } else {
            console.error('Failed to load leaderboard', e)
        }
        leaderboardRows.value = []
    } finally {
        loadingLeaderboard.value = false
    }
}

onMounted(async () => {
    try {
        tournament.value = await tournamentStore.fetchTournamentById(tournamentId.value)
        await refreshTeams()
    } catch (e) {
        console.error('Failed to load tournament', e)
        loadingLeaderboard.value = false
    }
})

</script>

<style lang="scss" scoped>
.leaderboard-page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 60px 48px;

    @media (max-width: 768px) {
        padding: 40px 24px;
    }
}

.leaderboard-container {
    width: 100%;
    max-width: 1200px;
    background: var(--color-surface, #ffffff);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    padding: 40px;
    animation: fadeIn 0.4s ease-out;

    @media (max-width: 768px) {
        padding: 24px;
    }
}

.header {
    margin-bottom: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: var(--color-text-muted, #666);
        font-weight: 600;
        font-size: 11px;
        letter-spacing: 1.5px;
        transition: all 0.2s ease;

        &:hover {
            color: var(--color-primary, #007bff);
            transform: translateX(-4px);
        }

        .icon {
            font-size: 14px;
        }
    }

    .title {
        font-size: 32px;
        font-weight: 700;
        color: var(--color-text-main, #111);
        margin: 0;
    }
}

.table-wrapper {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.hidden-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--color-text-muted, #666);
    font-size: 16px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>