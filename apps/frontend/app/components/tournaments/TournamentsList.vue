<script lang="ts" setup>
const store = useTournamentsStore()
const filtersStore = useFiltersTournamentsStore()

const filters = [
    { key: 'all', label: 'Всі' },
    { key: 'byDate', label: 'За датою' },
    { key: 'byName', label: 'За назвою' },
    { key: 'byMaxTeams', label: 'К-ть команд' },
    { key: 'byTeamSizeMin', label: 'Мін. склад' },
    { key: 'byTeamSizeMax', label: 'Макс. склад' },
    { key: 'byRounds', label: 'Раунди' },
    { key: 'byRegistrationStart', label: 'Поч. реєстрації' },
    { key: 'byRegistrationEnd', label: 'Кін. реєстрації' },
]

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('uk-UA')
}

onMounted(() => {
    store.loadFromDatabase(true)
})
</script>

<template lang="pug">
section.tournaments-list
    .tournaments-list__header
        h2.tournaments-list__title НАЙБЛИЖЧІ ТУРНІРИ

    .filter-bar
        button.filter-btn(
            v-for="f in filters"
            :key="f.key"
            :class="{ 'filter-btn--active': filtersStore.activeFilter === f.key }"
            type="button"
            @click="filtersStore.setFilter(f.key)"
        )
            span {{ f.label }}
            .filter-icon(v-if="filtersStore.activeFilter === f.key && f.key !== 'all'")
                svg(
                    v-if="!filtersStore.isMinimum"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                )
                    polyline(points="6 9 12 15 18 9")
                svg(
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                )
                    polyline(points="18 15 12 9 6 15")

    .loading-overlay(v-if="store.loading && store.tournaments.length === 0")
        Loader

    .tournaments-list__grid(v-else-if="store.tournaments.length > 0")
        NuxtLink.tournament-card(
            v-for="tournament in filtersStore.filteredTournaments"
            :key="tournament.id || tournament.name"
            :to="`/tournaments/${tournament.id}`"
        )
            .tournament-card__status(v-if="tournament.status")
                span {{ tournament.status }}

            h3.tournament-card__title {{ tournament.name }}

            .tournament-card__details
                .detail-group
                    span.detail-label
                        i.pi.pi-calendar.mr-2
                        | ДАТА СТАРТУ
                    span.detail-value {{ formatDate(tournament.startDate) }}
                .detail-group
                    span.detail-label
                        i.pi.pi-users.mr-2
                        | МАКС. КОМАНД
                    span.detail-value {{ tournament.maxTeams }}

            p.tournament-card__description {{ tournament.description }}

    .no-data(v-else-if="!store.loading")
        p Турнірів поки немає.

    .tournaments-list__footer(v-if="store.tournaments.length > 0")
        button.load-more(
            @click="store.loadFromDatabase()"
            :disabled="!store.hasMore || store.loading"
            type="button"
        )
            .btn-content
                span {{ store.loading ? 'ЗАВАНТАЖЕННЯ...' : 'ЗАВАНТАЖИТИ ЩЕ' }}
</template>

<style lang="scss" scoped>
.tournaments-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    padding: var(--space-8) 0;
    min-height: 400px;

    &__header {
        margin-bottom: var(--space-4);
    }

    &__title {
        font-family: var(--font-display);
        font-size: 44px;
        font-weight: 700;
        color: var(--color-text);
        text-transform: uppercase;
        letter-spacing: -1.5px;
        line-height: 1;

        @media (max-width: 1024px) {
            font-size: 36px;
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 32px;

        @media (max-width: 1200px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
        }
    }

    &__footer {
        display: flex;
        justify-content: center;
        margin-top: var(--space-8);
    }
}

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: var(--color-text-muted);
    cursor: pointer;
    transition:
        color 0.2s,
        border-color 0.2s,
        background 0.2s;

    &:hover:not(.filter-btn--active) {
        border-color: var(--color-text);
        color: var(--color-text);
    }

    &--active {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: var(--color-surface);
    }

    .filter-icon {
        display: flex;
        color: var(--color-primary);
    }
}

.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    gap: 16px;
}

.tournament-card {
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: var(--space-6);
    text-decoration: none;
    color: inherit;
    transition:
        transform 0.2s ease,
        border-color 0.2s ease;

    &:hover {
        transform: translateY(-4px);
        border-color: var(--color-text);
    }

    &__status {
        margin-bottom: var(--space-3);

        span {
            display: inline-block;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 4px 8px;
            background: var(--color-primary);
            color: white;
        }
    }

    &__title {
        font-family: var(--font-display);
        font-size: clamp(1.25rem, 2vw, 1.5rem);
        font-weight: 700;
        margin: 0 0 var(--space-4) 0;
        color: var(--color-text);
    }

    &__details {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        margin-bottom: var(--space-4);
        padding: var(--space-4) 0;
        border-top: 1px solid var(--color-border);
        border-bottom: 1px solid var(--color-border);
    }

    .detail-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-4);
    }

    .detail-label {
        display: inline-flex;
        align-items: center;
        font-size: 11px;
        color: var(--color-text-muted);
        font-weight: 500;
    }

    .detail-value {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text);
    }

    &__description {
        font-size: 14px;
        line-height: 1.6;
        color: var(--color-text-muted);
        margin: 0;
        flex-grow: 1;
    }
}

.no-data {
    text-align: center;
    padding: var(--space-12) 0;
    color: var(--color-text-muted);
}

.load-more {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 220px;
    padding: 14px 28px;
    background: transparent;
    border: 2px solid var(--color-text);
    color: var(--color-text);
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    cursor: pointer;
    transition:
        background 0.2s,
        color 0.2s;

    &:hover:not(:disabled) {
        background: var(--color-text);
        color: var(--color-bg);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-content {
        display: flex;
        align-items: center;
        gap: var(--space-2);
    }
}
</style>
