<script lang="ts" setup>
const store = useTournamentsStore()
const filtersStore = useFiltersTournamentsStore()

const filters = [
    { key: 'all',               label: 'Всі' },
    { key: 'byDate',            label: 'За датою' },
    { key: 'byName',            label: 'За назвою' },
    { key: 'byMaxTeams',        label: 'К-ть команд' },
    { key: 'byTeamSizeMin',     label: 'Мін. склад' },
    { key: 'byTeamSizeMax',     label: 'Макс. склад' },
    { key: 'byRounds',          label: 'Раунди' },
    { key: 'byRegistrationStart', label: 'Поч. реєстрації' },
    { key: 'byRegistrationEnd', label: 'Кін. реєстрації' },
]

const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("uk-UA")
}
onMounted(() => {
    store.loadFromDatabase()
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
            @click="filtersStore.activeFilter = f.key"
        ) {{ f.label }}
    
    .loading-overlay(v-if="store.loading && store.tournaments.length === 0")
        Loader

    .tournaments-list__grid(v-else-if="store.tournaments.length > 0")
        NuxtLink.tournament-card(v-for="tournament in filtersStore.filteredTournaments" :key="tournament.id || tournament.name" :to="`/tournaments/${tournament.id}`")
            .tournament-card__status(v-if="tournament.status")
                span {{ tournament.status }}
            
            h3.tournament-card__title {{ tournament.name }}
            
            .tournament-card__details
                .detail-group
                    span.detail-label ДАТА СТАРТУ
                    span.detail-value {{ formatDate(tournament.startDate) }}
                .detail-group
                    span.detail-label МАКС. КОМАНД
                    span.detail-value {{ tournament.maxTeams }}
            
            p.tournament-card__description {{ tournament.description }}

    .no-data(v-else-if="!store.loading")
        p Турнірів поки немає.

    .tournaments-list__footer(v-if="store.tournaments.length > 0")
        button.load-more(@click="store.loadFromDatabase" :disabled="!store.hasMore || store.loading" type="button")
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
        font-size: 48px;
        font-weight: 700;
        color: var(--color-text);
        text-transform: uppercase;
        letter-spacing: -1px;

        @media (max-width: 1024px) {
            font-size: 36px;
        }

        @media (max-width: 768px) {
            font-size: 28px;
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-6);

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
        margin-top: var(--space-4);
    }
}

.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    gap: 16px;

    .loading-text {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-muted);
        letter-spacing: 2px;
    }
}

.tournament-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    transition: transform 0.2s ease, border-color 0.2s ease;
    text-decoration: none;

    &:hover {
        border-color: var(--color-text);
        transform: translateY(-2px);
    }

    &__status {
        width: fit-content;
        padding: 4px 12px;
        background-color: var(--color-primary);
        border-radius: 2px;
        
        span {
            font-family: var(--font-display);
            font-size: 10px;
            font-weight: 700;
            color: white;
            text-transform: uppercase;
        }
    }

    &__title {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
        color: var(--color-text);
        line-height: 1.2;
    }

    &__details {
        display: flex;
        gap: var(--space-8);
        border-bottom: 1px solid var(--color-border);
        padding-bottom: var(--space-4);
        margin-bottom: var(--space-2);
    }

    .detail-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .detail-label {
        font-family: var(--font-sans);
        font-size: 10px;
        font-weight: 500;
        color: var(--color-text-muted);
        text-transform: uppercase;
    }

    .detail-value {
        font-family: var(--font-sans);
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
    }

    &__description {
        font-family: var(--font-sans);
        font-size: 14px;
        color: var(--color-text-muted);
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
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
}
</style>