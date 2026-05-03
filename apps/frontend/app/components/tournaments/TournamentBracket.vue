<template lang="pug">
.content-section.bracket-section-outer(v-if="rounds && rounds.length > 0")
    h3.section-label {{ $t('tournaments.details.bracket.title') }}
    ClientOnly
        .bracket-wrapper(ref="wrapperRef" :class="{ 'is-admin': isAdmin }")
            VueTournamentBracket(
                :rounds="localRounds"
                textColor="#111827"
                titleColor="#6b7280"
                teamBackgroundColor="#f3f4f6"
                highlightTeamBackgroundColor="#e5e7eb"
                scoreBackgroundColor="#d1d5db"
                winnerScoreBackgroundColor="#ea580c"
                @onMatchClick="$emit('matchClick', $event)"
                @onParticipantClick="$emit('participantClick', $event)"
            )

    .side-config(v-if="isAdmin")
        h4.side-config__title {{ $t('tournaments.details.bracket.sides_title') }}
        .side-config__round(v-for="(round, ri) in localRounds" :key="`round-${ri}`")
            .side-config__round-title {{ $t('tournaments.details.bracket.round') }} {{ ri + 1 }}
            .side-config__match(v-for="(match, mi) in round.matchs" :key="match.id || `match-${ri}-${mi}`")
                .side-config__match-title {{ $t('tournaments.details.bracket.match') }} {{ match.title || `${ri + 1}-${mi + 1}` }}
                .side-config__row(v-if="match.team1?.name")
                    span.side-config__team {{ match.team1.name }}
                    select.side-config__select(
                        :value="match.team1?.side || ''"
                        @change="onSideChange(match.id, 'team1', $event)"
                    )
                        option(value="") {{ $t('tournaments.details.bracket.auto') }}
                        option(value="radiant") Radiant
                        option(value="dire") Dire
                .side-config__row(v-if="match.team2?.name")
                    span.side-config__team {{ match.team2.name }}
                    select.side-config__select(
                        :value="match.team2?.side || ''"
                        @change="onSideChange(match.id, 'team2', $event)"
                    )
                        option(value="") {{ $t('tournaments.details.bracket.auto') }}
                        option(value="radiant") Radiant
                        option(value="dire") Dire
                .side-config__row.side-config__row--id
                    label.side-config__label {{ $t('tournaments.details.bracket.match_id_placeholder') }}
                    .side-config__id-group
                        input.side-config__input(
                            :value="match.dotaMatchId || ''"
                            :placeholder="$t('tournaments.details.bracket.match_id_placeholder')"
                            @change="onMatchIdChange(match.id, $event)"
                        )
                        button.side-config__resolve-btn(
                            v-if="match.dotaMatchId"
                            @click="$emit('resolveMatch', match.id, match.dotaMatchId)"
                            :title="$t('tournaments.details.bracket.calculate_result')"
                        )
                            i.pi.pi-check-circle
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { TournamentBracket as VueTournamentBracket } from 'vue3-tournament'
import 'vue3-tournament/style.css'
import { useLoginStore } from '../../stores/auth.store'

const authStore = useLoginStore()
const isAdmin = computed(() => authStore.isAdmin)

const props = defineProps<{
    rounds: any[]
}>()

const emit = defineEmits<{
    (e: 'update:rounds', value: any[]): void
    (e: 'matchClick', match: any): void
    (e: 'participantClick', participant: any): void
}>()

const localRounds = ref<any[]>([])
const wrapperRef = ref<HTMLElement | null>(null)

interface TeamLocation {
    roundIdx: number
    matchIdx: number
    slot: 'team1' | 'team2'
    team: any
}

const dragSource = ref<TeamLocation | null>(null)

// Sync with props
watch(() => props.rounds, (newVal) => {
    // Deep clone to avoid mutation of parent state directly
    localRounds.value = JSON.parse(JSON.stringify(newVal))
}, { immediate: true, deep: true })

onMounted(async () => {
    await nextTick()
    if (isAdmin.value) {
        // Small timeout to ensure the library has finished rendering
        setTimeout(initDnD, 1000)
    }
})

function initDnD() {
    if (!isAdmin.value) return
    const wrapper = wrapperRef.value
    if (!wrapper) return

    // Add draggable to team elements (vt-team)
    const teams = wrapper.querySelectorAll('[class*="vt-team"]')
    teams.forEach(el => {
        (el as HTMLElement).setAttribute('draggable', 'true')
    })

    wrapper.addEventListener('dragstart', (e: DragEvent) => {
        const el = (e.target as HTMLElement).closest<HTMLElement>('[class*="vt-team"]')
        if (!el) return
        
        // Find team name from internal element (usually has .name class)
        const name = el.querySelector('.name')?.textContent?.trim() || el.textContent?.trim()
        if (!name) return

        const loc = findByName(name)
        if (loc) {
            dragSource.value = loc
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', name)
            }
            el.classList.add('is-dragging')
        }
    })

    wrapper.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
    })

    wrapper.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault()
        const el = (e.target as HTMLElement).closest<HTMLElement>('[class*="vt-team"]')
        if (!el || !dragSource.value) return

        const name = el.querySelector('.name')?.textContent?.trim() || el.textContent?.trim()
        if (!name) return

        const dropLoc = findByName(name)
        if (dropLoc && dropLoc.team.name !== dragSource.value.team.name) {
            swapTeams(dragSource.value, dropLoc)
        }

        dragSource.value = null
        wrapper.querySelectorAll('.is-dragging').forEach(el => el.classList.remove('is-dragging'))
    })

    wrapper.addEventListener('dragend', () => {
        dragSource.value = null
        wrapper.querySelectorAll('.is-dragging').forEach(el => el.classList.remove('is-dragging'))
    })
}

function findByName(name: string): TeamLocation | null {
    for (let ri = 0; ri < localRounds.value.length; ri++) {
        const matchups = localRounds.value[ri].matchs
        if (!matchups) continue
        for (let mi = 0; mi < matchups.length; mi++) {
            const m = matchups[mi]
            if (m.team1?.name === name) return { roundIdx: ri, matchIdx: mi, slot: 'team1', team: m.team1 }
            if (m.team2?.name === name) return { roundIdx: ri, matchIdx: mi, slot: 'team2', team: m.team2 }
        }
    }
    return null
}

function swapTeams(loc1: TeamLocation, loc2: TeamLocation) {
    const r1 = localRounds.value[loc1.roundIdx].matchs[loc1.matchIdx]
    const r2 = localRounds.value[loc2.roundIdx].matchs[loc2.matchIdx]
    
    const t1 = r1[loc1.slot]
    const t2 = r2[loc2.slot]

    // Swap
    r1[loc1.slot] = { ...t2 }
    r2[loc2.slot] = { ...t1 }

    emit('update:rounds', JSON.parse(JSON.stringify(localRounds.value)))
    
    // Re-bind DnD after Vue updates the DOM
    if (isAdmin.value) {
        nextTick(() => setTimeout(initDnD, 200))
    }
}

function setTeamSide(matchId: string, slot: 'team1' | 'team2', side: string) {
    for (const round of localRounds.value) {
        const match = round?.matchs?.find((m: any) => String(m.id) === String(matchId))
        if (!match || !match[slot]) continue
        match[slot].side = side || null
        emit('update:rounds', JSON.parse(JSON.stringify(localRounds.value)))
        return
    }
}

function onSideChange(matchId: string, slot: 'team1' | 'team2', event: Event) {
    const target = event.target as HTMLSelectElement | null
    setTeamSide(matchId, slot, target?.value || '')
}

function onMatchIdChange(matchId: string, event: Event) {
    const target = event.target as HTMLInputElement | null
    const val = target?.value || ''
    
    for (const round of localRounds.value) {
        const match = round?.matchs?.find((m: any) => String(m.id) === String(matchId))
        if (!match) continue
        match.dotaMatchId = val
        emit('update:rounds', JSON.parse(JSON.stringify(localRounds.value)))
        return
    }
}

</script>

<style lang="scss" scoped>
.section-label {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 2px;
    margin: 0;
}

.bracket-section-outer {
    margin-top: var(--space-10);

    .bracket-wrapper {
        margin-top: var(--space-6);
        padding: var(--space-6);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md, 8px);
        overflow-x: auto;
        position: relative;
        min-height: 12rem;

        &::-webkit-scrollbar {
            height: 10px;
        }
        &::-webkit-scrollbar-track {
            background: var(--color-bg);
            border-radius: 4px;
        }
        &::-webkit-scrollbar-thumb {
            background: var(--color-border);
            border-radius: 4px;
        }
        &::-webkit-scrollbar-thumb:hover {
            background: var(--color-primary);
        }

        :deep(.vt-wrapper) {
            font-family: var(--font-sans);
            min-width: max-content;
        }

        :deep(.vt-item-parent::after),
        :deep(.vt-item-child::before),
        :deep(.vt-item-child::after) {
            background-color: var(--color-border) !important;
        }

        // DnD Styles (Only for Admin)
        :deep(.vt-team) {
            transition: transform 0.2s, opacity 0.2s, background-color 0.2s;
            
            &.is-dragging {
                opacity: 0.4;
                cursor: grabbing;
                transform: scale(0.98);
            }
        }

        &.is-admin {
            :deep(.vt-team) {
                cursor: grab;

                &:hover {
                    filter: brightness(0.95);
                    background-color: var(--color-bg) !important;
                }
            }
        }
    }

    .side-config {
        margin-top: 20px;
        padding: 16px;
        border: 1px solid var(--color-border);
        background: var(--color-bg);

        &__title {
            margin: 0 0 12px 0;
            font-family: var(--font-display);
            font-size: 12px;
            letter-spacing: 1px;
        }

        &__round {
            margin-bottom: 14px;
        }

        &__round-title {
            font-size: 12px;
            color: var(--color-text-muted);
            margin-bottom: 8px;
        }

        &__match {
            border: 1px solid var(--color-border);
            background: var(--color-surface);
            padding: 10px;
            margin-bottom: 8px;
        }

        &__match-title {
            font-size: 11px;
            color: var(--color-text-muted);
            margin-bottom: 8px;
        }

        &__row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 6px;
        }

        &__team {
            font-size: 13px;
        }

        &__select {
            min-width: 110px;
            border: 1px solid var(--color-border);
            background: var(--color-bg);
            padding: 4px 8px;
            font-size: 11px;
        }

        &__label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--color-text-muted);
            margin-bottom: 4px;
        }

        &__input {
            width: 100%;
            border: 1px solid var(--color-border);
            background: var(--color-bg);
            padding: 6px 10px;
            font-size: 12px;
            font-family: var(--font-sans);

            &:focus {
                border-color: var(--color-primary);
                outline: none;
            }
        }

        &__id-group {
            display: flex;
            gap: 4px;
            margin-top: 4px;
        }

        &__resolve-btn {
            background: var(--color-primary);
            color: white;
            border: none;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
                background: var(--color-text);
                transform: scale(1.05);
            }

            i { font-size: 14px; }
        }
    }
}
</style>
