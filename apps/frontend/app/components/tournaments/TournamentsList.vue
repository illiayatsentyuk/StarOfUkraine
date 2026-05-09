<template lang="pug">
section.tournaments-list
    .tournaments-list__header
        h2.tournaments-list__title АКТИВНІ ТУРНІРИ
        NuxtLink.archive-link(to="/tournaments/archive")
            i.pi.pi-box
            span АРХІВ ТУРНІРІВ

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

    .filter-bar
        button.filter-btn(
            v-for="s in statusFilters"
            :key="s.key"
            :class="{ 'filter-btn--active': store.statusFilter === s.key }"
            type="button"
            @click="store.statusFilter = s.key; store.loadFromDatabase(true)"
        )
            span {{ s.label }}

    .loading-overlay(v-if="store.loading && store.tournaments.length === 0")
        Loader

    .tournaments-list__grid(v-else-if="store.filteredTournaments.length > 0")
        TournamentCard(
            v-for="tournament in store.filteredTournaments"
            :key="tournament.id || tournament.name"
            :tournament="tournament"
        )

    .no-data(v-else-if="!store.loading")
        p Турнірів поки немає.

    .tournaments-list__footer(v-if="store.filteredTournaments.length > 0")
        button.load-more(
            @click="store.loadFromDatabase()"
            :disabled="!store.hasMore || store.loading"
            type="button"
        )
            .btn-content
                span {{ store.loading ? 'ЗАВАНТАЖЕННЯ...' : 'ЗАВАНТАЖИТИ ЩЕ' }}
</template>

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

const statusFilters = [
    { key: 'all', label: 'Всі статуси' },
    { key: 'DRAFT', label: 'Очікування' },
    { key: 'REGISTRATION_OPEN', label: 'Реєстрація відкрита' },
    { key: 'ONGOING', label: 'Триває' },
    { key: 'COMPLETED', label: 'Завершено' },
    { key: 'CANCELLED', label: 'Скасовано' },
] as const

onMounted(() => {
    store.loadFromDatabase(true)
})
</script>

<style lang="scss" scoped>
.tournaments-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    padding: var(--space-8) 0;
    min-height: 400px;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-bottom: var(--space-4);

        .archive-link {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            color: var(--color-text-muted);
            font-size: 13px;
            font-weight: 700;
            padding: 10px 20px;
            border: 1px solid var(--color-border);
            border-radius: 0;
            transition: all 0.2s;

            &:hover {
                color: var(--color-primary);
                border-color: var(--color-primary);
                transform: translateY(-2px);
            }

            i { font-size: 16px; }
        }
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
        margin-top: 64px;
    }
}

.load-more {
    padding: var(--space-4) var(--space-8);
    background-color: var(--color-text);
    color: var(--color-bg);
    border: none;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
    transition: opacity 0.2s ease;

    .btn-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    &:hover:not(:disabled) {
        opacity: 0.9;
    }

    &:disabled {
        background-color: var(--color-border);
        cursor: not-allowed;
    }
}

:deep(.p-progressspinner-circle) {
    stroke: var(--color-primary) !important;
}

.filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: var(--space-2);
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border-radius: 20px;
    border: 1px solid var(--color-border);
    background: transparent;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 400;
    color: var(--color-text);
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

    &:hover:not(.filter-btn--active) {
        border-color: var(--color-text);
    }

    &--active {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
        color: #fff;
        font-weight: 600;
    }

    .filter-icon {
        margin-left: 6px;
        font-size: 11px;
        color: #fff;
    }
}
</style>
