<template lang="pug">
section.table-page
    .table-page__nav
        NuxtLink.back-link(:to="`/tournaments/${route.params.id}`")
            span.icon ←
            span.text НАЗАД ДО ТУРНІРУ

    header.table-page__hero
        .hero-content
            h1.title ТАБЛИЦЯ РЕЗУЛЬТАТІВ
            p.subtitle(v-if="!loading") Команд: {{ sortedTeams.length }}
        .live-badge(:class="{ 'live-badge--active': connected }")
            span.live-badge__dot
            span.live-badge__label {{ connected ? 'LIVE' : 'ОФЛАЙН' }}

    .loading-state(v-if="loading")
        i.pi.pi-spin.pi-spinner
        span Завантаження...

    .empty-state(v-else-if="!sortedTeams.length")
        i.pi.pi-inbox.empty-icon
        h2 Команд поки немає
        p Слідкуйте за оновленнями турніру.

    .table-wrap(v-else)
        table.standings
            thead
                tr
                    th.standings__th.standings__th--rank #
                    th.standings__th Команда
                    th.standings__th.standings__th--pts Очки

            tbody
                tr.standings__row(
                    v-for="(team, index) in sortedTeams"
                    :key="team.id || index"
                    :class="{ 'standings__row--top': index < 3 }"
                )
                    td.standings__rank
                        span.medal(v-if="index === 0") 🥇
                        span.medal(v-else-if="index === 1") 🥈
                        span.medal(v-else-if="index === 2") 🥉
                        span(v-else) {{ index + 1 }}
                    td.standings__team {{ team.name || team.teamName || 'Без назви' }}
                    td.standings__pts {{ team.points != null ? team.points : '—' }}
</template>

<script setup lang="ts">
const route = useRoute()
const teamsStore = useTeamsStore()

const loading = ref(true)
const teams = ref<any[]>([])

const tournamentId = computed(() => route.params.id as string)

const sortedTeams = computed(() =>
    [...teams.value].sort((a, b) => (b.points ?? -1) - (a.points ?? -1))
)

async function refreshTeams() {
    try {
        const response = await teamsStore.loadFromDatabase(true)
        teams.value = response?.data || []
    } catch {
        // ignore — store shows its own toast
    }
}

const { connected } = useTournamentSocket(tournamentId, {
    onSubmissionEvaluated: async (payload) => {
        if (payload.finalised) {
            await refreshTeams()
        }
    },
})

onMounted(async () => {
    await refreshTeams()
    loading.value = false
})
</script>

<style scoped lang="scss">
.table-page {
    max-width: 1440px;
    margin: 0 auto;
    padding: 60px 48px 80px;
    animation: fadeIn 0.4s ease-out;

    @include media($md) {
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

    &__hero {
        margin-bottom: 48px;
        border-bottom: 2px solid var(--color-text);
        padding-bottom: 32px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .title {
            font-family: var(--font-display);
            font-size: 64px;
            font-weight: 700;
            line-height: 0.95;
            letter-spacing: -2px;
            margin: 0 0 16px 0;
            color: var(--color-text);
            text-transform: uppercase;
        }

        .subtitle {
            font-size: 18px;
            color: var(--color-text-muted);
            margin: 0;
            font-weight: 500;
        }
    }
}

.live-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 1px solid var(--color-border);
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--color-text-muted);

    &__dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--color-border);
        transition: background 0.3s;
    }

    &--active {
        border-color: #22c55e;
        color: #22c55e;

        .live-badge__dot {
            background: #22c55e;
            box-shadow: 0 0 6px #22c55e;
            animation: pulse 1.5s infinite;
        }
    }
}

.table-wrap {
    border: 1px solid var(--color-border);
    overflow-x: auto;
}

.standings {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-base);

    &__th {
        padding: var(--space-4);
        text-align: left;
        border-bottom: 2px solid var(--color-border);
        font-family: var(--font-display);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: var(--color-text-muted);
        background: var(--color-bg);

        &--rank {
            width: 4rem;
            text-align: center;
        }

        &--pts {
            width: 6rem;
            text-align: right;
        }
    }

    &__row {
        transition: background 0.15s;

        &:nth-child(even) {
            background: rgba(0, 0, 0, 0.02);
        }

        &:hover {
            background: rgba(0, 0, 0, 0.04);
        }

        &--top {
            background: rgba(228, 35, 19, 0.03);
        }

        td {
            padding: var(--space-4);
            border-bottom: 1px solid var(--color-border);
            vertical-align: middle;
        }
    }

    &__rank {
        text-align: center;
        font-family: var(--font-display);
        font-weight: 700;
        color: var(--color-text-muted);
        width: 4rem;

        .medal {
            font-size: 20px;
        }
    }

    &__team {
        font-weight: 600;
        color: var(--color-text);
        font-size: var(--font-size-lg);
    }

    &__pts {
        text-align: right;
        font-family: var(--font-display);
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--color-primary);
        font-variant-numeric: tabular-nums;
        width: 6rem;
    }
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    gap: 16px;
    color: var(--color-text-muted);
    font-weight: 500;
    font-size: 18px;

    i {
        font-size: 32px;
    }

    .empty-icon {
        font-size: 48px;
        color: var(--color-border);
        margin-bottom: 16px;
    }

    h2 {
        font-family: var(--font-display);
        color: var(--color-text);
        margin: 0;
    }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}
</style>
