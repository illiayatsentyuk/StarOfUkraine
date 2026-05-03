<template lang="pug">
section.tournament-detail
    // Loading State
    .loading-overlay(v-if="store.loading")
        Loader

    // Content State
    template(v-else-if="tournament")
        .tournament-detail__nav
            NuxtLink.back-link(to="/")
                span.icon ←
                span.text {{ $t('navigation.back_to_list') }}

        header.tournament-detail__hero
            .status-badge(v-if="tournamentStatus" :style="{ backgroundColor: tournamentStatus.color }") {{ $t('tournaments.status.' + tournamentStatus.code) }}
            h1.title {{ tournament.name }}
            .tournament-detail__hero__actions
                Button.home-btn( @click="isOpenBracket = false" type="button" :label="$t('tournaments.details.actions.description')")
                Button.bracket-btn( @click="isOpenBracket = !isOpenBracket" type="button" :label="isOpenBracket ? $t('tournaments.details.actions.hide_bracket') : $t('tournaments.details.actions.show_bracket')")
        
        .tournament-detail__layout(v-if="!isOpenBracket")
            main.main-content
                .content-section
                    h3.section-label {{ $t('tournaments.details.about') }}
                    p.description {{ tournament.description }}
                
                .content-section.stats-section
                    .stat-box
                        span.label {{ $t('tournaments.details.stats.rounds') }}
                        span.value {{ roundsStatDisplay }}
                    .stat-box
                        span.label {{ $t('tournaments.details.stats.team_size') }}
                        span.value {{ tournament.teamSizeMin }} — {{ tournament.teamSizeMax }}
                    .stat-box
                        span.label {{ $t('tournaments.details.stats.max_teams') }}
                        span.value {{ tournament.maxTeams }}

                .content-section
                    h3.section-label {{ $t('tournaments.details.teams_title') }}
                    p.description(v-if="shouldHideTeams") {{ $t('tournaments.details.teams_hidden') }}
                    template(v-else)
                        p.description(v-if="teamsStore.loading") {{ $t('tournaments.details.teams_loading') }}
                        p.description(v-else-if="!teams.length") {{ $t('tournaments.details.teams_empty') }}
                        .teams-grid(v-else)
                            .team-card(v-for="team in teams" :key="team.id")
                                h4.team-card__name {{ team.name || team.teamName }}
                                p.team-card__meta
                                    | {{ $t('tournaments.details.captain') }}
                                    span  {{ team.captainName }}
                                p.team-card__meta(v-if="team.city")
                                    | {{ $t('tournaments.details.city') }}
                                    span  {{ team.city }}
                                Button.delete-btn(v-if="authStore.isAdmin" @click="teamsStore.deleteTeam(team.id)" type="button" :label="$t('tournaments.details.delete_team')" icon="pi pi-trash")

                TournamentTeamsTable(
                    v-model:teams="teams"
                    :isAdmin="authStore.isAdmin"
                    :shouldHideTeams="shouldHideTeams"
                    @shuffle="shuffleTeams"
                    @generate="generateBracket"
                )

                


            aside.sidebar
                .sidebar__card
                    h3.section-label {{ $t('tournaments.details.dates.title') }}
                    .date-list
                        .date-entry
                            span.label {{ $t('tournaments.details.dates.reg_start') }}
                            span.value {{ formatDate(tournament.registrationStart) }}
                        .date-entry
                            span.label {{ $t('tournaments.details.dates.reg_end') }}
                            span.value {{ formatDate(tournament.registrationEnd) }}
                        .date-entry.highlight
                            span.label {{ $t('tournaments.details.dates.start_date') }}
                            span.value {{ formatDate(tournament.startDate) }}
                    
                    .divider
                    
                    .sidebar__footer
                        .status-info
                            span.label {{ $t('tournaments.details.dates.current_status') }}
                            span.value(v-if="tournamentStatus" :style="{ color: tournamentStatus.color }") {{ $t('tournaments.status.' + tournamentStatus.code) }}
                        Button.delete-btn(v-if="authStore.isAdmin" @click="handleDelete" type="button" :label="$t('tournaments.details.delete_tournament')")
                        Button.create-btn(
                            v-if="authStore.isAuthenticated" 
                            @click="openTeamModal" 
                            type="button" 
                            :label="$t('tournaments.details.create_team')" 
                            icon="pi pi-plus"
                            :disabled="!isRegistrationActive && !authStore.isAdmin"
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
    TeamsCreateTeamModal(
        v-if="tournament && authStore.isAuthenticated"
        :isTeamOpen="isTeamOpen"
        @close="isTeamOpen = false"
        @success="refreshTeams"
    )

    //- Dota Match Dialog
    Dialog(
        v-model:visible="isMatchModalOpen"
        modal
        class="dota-match-modal"
        :style="{ width: '450px' }"
        :pt="{ mask: { style: 'backdrop-filter: blur(8px); background: rgba(0,0,0,0.4)' } }"
    )
        .dota-modal-content
            p.info {{ $t('tournaments.admin.info') }}
            
            .field-group
                label.field-label MATCH ID
                InputText#dotaMatchId(
                    v-model="matchIdInput"
                    :placeholder="$t('tournaments.admin.dota_placeholder')"
                    class="dota-input"
                    :disabled="isMatching"
                    @keyup.enter="handleMatchConfirm"
                )
            
            .preview-area
                transition(name="fade" mode="out-in")
                    .dota-loading(v-if="bracketStore.loading")
                        i.pi.pi-spin.pi-spinner
                        span {{ $t('tournaments.admin.loading_data') }}
                    
                    .dota-preview(v-else-if="bracketStore.matchData")
                        .preview-score
                            .score-item.radiant(:class="{ 'is-winner': bracketStore.matchData.radiant_win }")
                                span.team-name RADIANT
                                span.score-val {{ bracketStore.matchData.radiant_score }}
                            
                            .score-vs :
                            
                            .score-item.dire(:class="{ 'is-winner': !bracketStore.matchData.radiant_win }")
                                span.score-val {{ bracketStore.matchData.dire_score }}
                                span.team-name DIRE
                        
                        .preview-meta
                            span.meta-item {{ $t('tournaments.admin.duration') }}: {{ Math.floor(bracketStore.matchData.duration / 60) }}:{{ (bracketStore.matchData.duration % 60).toString().padStart(2, '0') }}
                            span.meta-item.winner {{ $t('tournaments.admin.winner') }}: {{ bracketStore.matchData.radiant_win ? 'RADIANT' : 'DIRE' }}
                    
                    .dota-empty(v-else)
                        span {{ $t('tournaments.admin.enter_match_id') }}
            
            .footer-actions
                Button.cancel-btn(:label="$t('tournaments.admin.cancel')" @click="isMatchModalOpen = false" :disabled="isMatching")
                Button.confirm-btn(
                    :label="$t('tournaments.admin.confirm')" 
                    @click="handleMatchConfirm" 
                    :loading="isMatching"
                    :disabled="!matchIdInput || !bracketStore.matchData"
                )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useTournamentsStore } from '../../stores/tournaments.store'
import { useLoginStore } from '../../stores/auth.store'
import { useTeamsStore } from '../../stores/teams.store'
import TournamentBracket from '../../components/tournaments/TournamentBracket.vue'
import TournamentTeamsTable from '../../components/tournaments/TournamentTeamsTable.vue'
import TeamsCreateTeamModal from '../../components/Teams/CreateTeamModal.vue'
import DeleteModal from '../../components/tournaments/deleteModal.vue'
import { useTournamentBracket } from '../../stores/tournamentBrackets.store'
const { locale } = useI18n()

import { calculateTournamentStatus } from '../../utils/tournament-status'

const route = useRoute()
const store = useTournamentsStore()
const authStore = useLoginStore()
const teamsStore = useTeamsStore()
const bracketStore = useTournamentBracket()


const tournament = ref<any>(null)
const teams = ref<any[]>([])
/** Кількість раундів з API (число), не плутати з даними сітки */
const configuredRoundsCount = ref<number | null>(null)
/** Дані для vue3-tournament; окремо від tournament.rounds, щоб не підміняти число JSON-ом */
const bracketRounds = ref<any[]>([])
const isDeleteModalOpen = ref(false)
const isOpenBracket = ref(false)

const isTeamOpen = ref(false)

const tournamentStatus = computed(() => {
    if (!tournament.value) return null
    return calculateTournamentStatus(tournament.value, bracketRounds.value)
})

const isRegistrationActive = computed(() => {
    return tournamentStatus.value?.code === 'registration'
})

// State for Dota Match Modal
const isMatchModalOpen = ref(false)
const currentMatchId = ref<string | null>(null)
const matchIdInput = ref('')
const isMatching = ref(false)

// Persistence
watch(bracketRounds, (newVal) => {
    if (newVal && newVal.length > 0) {
        localStorage.setItem(`bracket_${route.params.id}`, JSON.stringify(newVal))
    }
}, { deep: true })

function openTeamModal() {
    isTeamOpen.value = true
}



watch(isOpenBracket, (newVal) => {
    if (newVal && bracketRounds.value.length === 0 && teams.value.length > 0) {
        generateBracket()
    }
})

const roundsStatDisplay = computed(() => {
    if (configuredRoundsCount.value != null) return configuredRoundsCount.value
    const r = tournament.value?.rounds
    if (typeof r === 'number' && !Number.isNaN(r)) return r
    if (Array.isArray(r)) return r.length
    return '—'
})

function initRoundsFromTournament() {
    if (!tournament.value) return
    
    // Пріоритет - збережена в локалстореджі сітка для цього турніру
    const saved = localStorage.getItem(`bracket_${route.params.id}`)
    if (saved) {
        try {
            bracketRounds.value = JSON.parse(saved)
            configuredRoundsCount.value = bracketRounds.value.length
            return
        } catch (e) {
            console.error('Failed to parse saved bracket')
        }
    }

    const r = tournament.value.rounds
    if (typeof r === 'number') {
        configuredRoundsCount.value = r
        return
    }
    if (Array.isArray(r) && r.length > 0) {
        bracketRounds.value = r
        configuredRoundsCount.value = r.length
    }
}
const shouldHideTeams = computed(() => {
    if (authStore.isAdmin) return false
    if (!tournament.value?.hideTeamsUntilRegistrationEnds) return false
    if (!tournament.value?.registrationEnd) return false
    return new Date(tournament.value.registrationEnd) > new Date()
})


const onMatchClick = (match: any) => {
    if (!authStore.isAdmin) return
    currentMatchId.value = String(match.id || match)
    matchIdInput.value = ''
    bracketStore.reset()
    isMatchModalOpen.value = true
}

watch(matchIdInput, async (newId) => {
    if (newId.length > 8) {
        await bracketStore.fetchMatchData(newId)
    } else {
        bracketStore.reset()
    }
})

async function handleMatchConfirm() {
    if (!currentMatchId.value || !matchIdInput.value) return
    isMatching.value = true
    try {
        await applyDotaResultToMatch(currentMatchId.value, matchIdInput.value)
        isMatchModalOpen.value = false
    } catch (e) {
        // Error already handled in applyDotaResultToMatch
    } finally {
        isMatching.value = false
    }
}

const onParticipantClick = (participant: any) => {
    console.log('Participant clicked:', participant)
}

const formatDate = (dateString: string) => {
    if (!dateString) return "ТВА"
    const date = new Date(dateString)
    return date.toLocaleDateString(locale.value === 'uk' ? 'uk-UA' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).replace('р.', '').toUpperCase()
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
        initRoundsFromTournament()
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

const generateBracket = () => {
    if (!teams.value || teams.value.length === 0) {
        alert('Немає команд для генерації сітки')
        return
    }

    // Шукаємо найближчу ступінь двійки (2, 4, 8, 16...)
    let numTeams = teams.value.length
    let bracketSize = 1
    while (bracketSize < numTeams) bracketSize *= 2

    const generatedRounds = []
    
    // Раунд 1
    const firstRoundMatches = []
    for (let i = 0; i < bracketSize / 2; i++) {
        const t1 = teams.value[i * 2]
        const t2 = teams.value[i * 2 + 1]

        firstRoundMatches.push({
            id: `round1_match${i + 1}`,
            title: String(i + 1),
            winner: null,
            team1: t1
                ? {
                      id: t1.id,
                      name: t1.name || t1.teamName || 'Без назви',
                      score: null,
                  }
                : { id: null, name: 'BYE', score: null },
            team2: t2
                ? {
                      id: t2.id,
                      name: t2.name || t2.teamName || 'Без назви',
                      score: null,
                  }
                : { id: null, name: 'BYE', score: null },
        })
    }
    generatedRounds.push({ matchs: firstRoundMatches })

    // Наступні раунди (Півфінал, Фінал і тд)
    let currentMatchesCount = bracketSize / 2
    let roundNum = 2
    while (currentMatchesCount > 1) {
        currentMatchesCount /= 2
        const matches = []
        for (let i = 0; i < currentMatchesCount; i++) {
            matches.push({
                id: `round${roundNum}_match${i + 1}`,
                title: `${roundNum}-${i + 1}`,
                winner: null,
                team1: { id: null, name: "TBD", score: null },
                team2: { id: null, name: "TBD", score: null },
            })
        }
        generatedRounds.push({ matchs: matches })
        roundNum++
    }

    bracketRounds.value = generatedRounds
}

function getMatchRef(matchId: string) {
    for (let ri = 0; ri < bracketRounds.value.length; ri++) {
        const round = bracketRounds.value[ri]
        for (let mi = 0; mi < (round?.matchs?.length || 0); mi++) {
            const match = round.matchs[mi]
            if (String(match.id) === String(matchId)) {
                return { match, roundIdx: ri, matchIdx: mi }
            }
        }
    }
    return null
}

function propagateWinner(roundIdx: number, matchIdx: number, winnerTeam: any) {
    const nextRound = bracketRounds.value[roundIdx + 1]
    if (!nextRound?.matchs?.length || !winnerTeam) return

    const nextMatchIdx = Math.floor(matchIdx / 2)
    const slot = matchIdx % 2 === 0 ? 'team1' : 'team2'
    const nextMatch = nextRound.matchs[nextMatchIdx]
    if (!nextMatch) return

    nextMatch[slot] = {
        id: winnerTeam.id,
        name: winnerTeam.name,
        score: null,
        side: null,
    }
}

function resolveScoreBySide(team: any, fallback: number, radiantScore: number, direScore: number) {
    if (team?.side === 'radiant') return radiantScore
    if (team?.side === 'dire') return direScore
    return fallback
}

async function applyDotaResultToMatch(matchId: string, dotaId: string) {
    const found = getMatchRef(matchId)
    if (!found) return

    try {
        const data = await bracketStore.fetchMatchData(dotaId)
        if (!data) return

        const { match, roundIdx, matchIdx } = found

        const radiantScore = Number(data.radiant_score) || 0
        const direScore = Number(data.dire_score) || 0

        // Визначаємо рахунок для кожної команди на основі їх сторін (якщо задано)
        // Якщо сторони не задані, t1 = radiant, t2 = dire за замовчуванням
        const t1Score = resolveScoreBySide(match.team1, radiantScore, radiantScore, direScore)
        const t2Score = resolveScoreBySide(match.team2, direScore, radiantScore, direScore)

        match.team1 = { ...match.team1, score: t1Score }
        match.team2 = { ...match.team2, score: t2Score }

        // Переможець
        let winnerTeam = null
        if (t1Score > t2Score) {
            winnerTeam = match.team1
        } else if (t2Score > t1Score) {
            winnerTeam = match.team2
        } else {
            // Якщо нічия в Dota (буває в теорії або помилка), дивимось radiant_win
            if (match.team1?.side === 'radiant' && data.radiant_win) winnerTeam = match.team1
            else if (match.team2?.side === 'radiant' && data.radiant_win) winnerTeam = match.team2
            else if (match.team1?.side === 'dire' && !data.radiant_win) winnerTeam = match.team1
            else if (match.team2?.side === 'dire' && !data.radiant_win) winnerTeam = match.team2
            else winnerTeam = data.radiant_win ? match.team1 : match.team2 // Fallback
        }

        match.winner = winnerTeam?.id ?? null
        match.dotaMatchId = dotaId

        propagateWinner(roundIdx, matchIdx, winnerTeam)
        
        // Deep clone to trigger reactivity
        bracketRounds.value = JSON.parse(JSON.stringify(bracketRounds.value))
    } catch (e: any) {
        // Error already toast-messaged in store
        throw e
    }
}
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

    &__hero {
        margin-bottom: 64px;
        border-bottom: 2px solid var(--color-text);
        padding-bottom: 48px;

        .status-badge {
            display: inline-block;
            background: var(--color-primary);
            color: white;
            padding: 6px 14px;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 1.5px;
            margin-bottom: 24px;
        }

        .title {
            font-family: var(--font-display);
            font-size: 84px;
            font-weight: 700;
            line-height: 0.95;
            letter-spacing: -2px;
            margin: 0;
            color: var(--color-text);

            @media (max-width: 768px) {
                font-size: 48px;
            }
        }

        &__actions {
            display: flex;
            gap: 16px;
            margin-top: 40px;

            button {
                min-width: 200px;
                height: 52px;
                border-radius: 0;
                font-family: var(--font-display);
                font-weight: 700;
                font-size: 13px;
                letter-spacing: 2px;
                text-transform: uppercase;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                border: 1px solid var(--color-text);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;

                &.home-btn {
                    background: transparent;
                    color: var(--color-text);
                    opacity: 1;

                    &:hover {
                        background: var(--color-text);
                        color: white;
                    }
                }

                &.bracket-btn {
                    background: var(--color-primary);
                    border-color: var(--color-primary);
                    color: white;

                    &:hover {
                        background: var(--color-text);
                        border-color: var(--color-text);
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    }

                    &:active {
                        transform: translateY(0);
                    }
                }
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

        .description {
            font-size: 22px;
            line-height: 1.5;
            color: var(--color-text);
            margin: 24px 0 0 0;
            max-width: 800px;
            font-weight: 400;
        }
    }

    .stats-section {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2px;
        background: var(--color-border);
        border: 2px solid var(--color-border);

        .stat-box {
            background: white;
            padding: 32px;
            display: flex;
            flex-direction: column;
            gap: 8px;

            .label {
                font-size: 10px;
                font-weight: 700;
                color: var(--color-text-muted);
                letter-spacing: 2px;
            }
            .value {
                font-family: var(--font-display);
                font-size: 24px;
                font-weight: 700;
                color: var(--color-text);
            }
        }
    }
}

.teams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    margin-top: 24px;
}

.team-card {
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: 16px;

    &__name {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-family: var(--font-display);
    }

    &__meta {
        margin: 0;
        color: var(--color-text-muted);
        font-size: 14px;

        span {
            color: var(--color-text);
            font-weight: 600;
            margin-left: 6px;
        }
    }
}

.sidebar {
    &__card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        padding: 40px;
        position: sticky;
        top: 40px;

        .date-list {
            margin-top: 32px;
            display: flex;
            flex-direction: column;
            gap: 32px;
        }

        .date-entry {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .label {
                font-size: 10px;
                font-weight: 700;
                color: var(--color-text-muted);
                letter-spacing: 1.5px;
            }
            .value {
                font-size: 15px;
                font-weight: 600;
                color: var(--color-text);
            }

            &.highlight .value {
                color: var(--color-primary);
                font-size: 18px;
                font-weight: 700;
            }
        }

        .divider {
            height: 1px;
            background: var(--color-border);
            margin: 40px 0;
        }

        .sidebar__footer {
            display: flex;
            flex-direction: column;
            gap: 24px;

            .status-info {
                display: flex;
                flex-direction: column;
                gap: 6px;

                .label {
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--color-text-muted);
                    letter-spacing: 1.5px;
                }
                .value {
                    font-family: var(--font-display);
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--color-text);
                }
            }
        }
    }
}

:deep(.delete-btn) {
    margin-top: 16px;
    width: 100%;
    background: transparent;
    border: 1px solid var(--color-error, #ef4444);
    color: var(--color-error, #ef4444);
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 600;
    padding: 12px;
    border-radius: 0;
    letter-spacing: 1px;
    transition: all 0.2s ease;

    &:hover {
        background: var(--color-error, #ef4444);
        color: white;
    }
}

:deep(.create-btn) {
    margin-top: 16px;
    width: 100%;
    background: var(--color-primary);
    border: 2px solid var(--color-primary);
    color: white;
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 800;
    padding: 18px;
    border-radius: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: all 0.2s;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: #000000;
        border-color: #000000;
        box-shadow: 0 8px 24px rgba(228, 35, 19, 0.2);
    }

    &:active {
        background: #000000;
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

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.dota-match-modal {
    border-radius: 0;
    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    border: none;
    
    :deep(.p-dialog-header) {
        background: #ffffff !important;
        border-bottom: 2px solid var(--color-text);
        padding: 24px;
        border-radius: 0;
        
        .p-dialog-title {
            font-family: var(--font-display);
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 1px;
        }
    }

    :deep(.p-dialog-content) {
        background: #ffffff !important;
        padding: 24px;
        border-radius: 0;
        overflow-y: visible;
    }

    :deep(.p-dialog-footer) {
        display: none;
    }
}

.dota-modal-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    background: #ffffff;

    .info {
        font-size: 14px;
        line-height: 1.5;
        color: var(--color-text-muted);
    }

    .field-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .field-label {
            font-family: var(--font-display);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 2px;
            color: var(--color-text-muted);
        }

        .dota-input {
            width: 100%;
            border: 1px solid var(--color-border);
            border-radius: 0;
            padding: 12px 16px;
            font-size: 16px;
            background: #f9fafb;
            
            &:focus {
                border-color: var(--color-primary);
                background: white;
                outline: none;
            }
        }
    }

    .preview-area {
        min-height: 140px;
        background: #fdfdfd;
        border: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 24px;
    }

    .dota-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        color: var(--color-text-muted);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
        
        i { font-size: 20px; color: var(--color-primary); }
    }

    .dota-empty {
        text-align: center;
        font-size: 10px;
        font-weight: 700;
        color: var(--color-border);
        letter-spacing: 1px;
    }

    .dota-preview {
        .preview-score {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 24px;
            margin-bottom: 20px;

            .score-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;

                .team-name {
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--color-text-muted);
                    letter-spacing: 1px;
                }
                .score-val {
                    font-family: var(--font-display);
                    font-size: 32px;
                    font-weight: 700;
                }

                &.radiant.is-winner .score-val { color: #22c55e; }
                &.dire.is-winner .score-val { color: #ef4444; }
                &.is-winner .team-name { color: var(--color-text); }
            }

            .score-vs {
                font-family: var(--font-display);
                font-size: 18px;
                font-weight: 900;
                opacity: 0.2;
            }
        }

        .preview-meta {
            display: flex;
            justify-content: space-between;
            border-top: 1px solid var(--color-border);
            padding-top: 12px;
            font-size: 10px;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 1px;

            .winner {
                color: var(--color-primary);
            }
        }
    }
}

.footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.cancel-btn {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 0;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 12px;
    padding: 12px 24px;
    letter-spacing: 1px;
    transition: all 0.2s;

    &:hover {
        background: #f3f4f6;
        border-color: var(--color-text);
    }
}

.confirm-btn {
    background: var(--color-primary);
    border: 1px solid var(--color-primary);
    color: white;
    border-radius: 0;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 12px;
    padding: 12px 24px;
    letter-spacing: 1px;
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(228, 35, 19, 0.2);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
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



</style>
