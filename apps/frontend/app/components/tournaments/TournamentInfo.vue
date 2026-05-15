<template lang="pug">
section.tournament-info
    .loading-overlay(v-if="store.loading")
        Loader

    template(v-else)
        .tournament-info__header
            h1.tournament-info__title {{ $t('tournament.info.upcoming') }}
            .status-badge(v-if="store.tournaments.length") {{ $t('tournament.info.reg_open') }}
        
        .tournament-info__grid(v-if="store.tournaments.length")
            .tournament-card(v-for="tournament in store.tournaments" :key="tournament.id || tournament.name")
                .tournament-card__content
                    h2.tournament-card__name {{ tournament.name }}
                    
                    .tournament-card__details
                        .detail-item
                            span.label {{ $t('modals.create.start_date') }}
                            span.value {{ formatDate(tournament.startDate) }}
                        .detail-item
                            span.label {{ $t('modals.create.max_teams_label') }}
                            span.value {{ tournament.maxTeams }}
                        .detail-item
                            span.label {{ $t('modals.create.rounds_label') }}
                            span.value {{ tournament.rounds }}
                    
                    p.tournament-card__description {{ tournament.description }}
        
        .no-data(v-else)
            p {{ $t('tournament.info.no_tournaments') }}
</template>

<script lang="ts" setup>
const store = useTournamentsStore()

const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("uk-UA", {
        day: 'numeric',
        month: 'long',
    }).toUpperCase()
}

onMounted(() => {
    store.loadFromDatabase()
})
</script>

<style lang="scss" scoped>
.tournament-info {
    position: relative;
    padding: 60px 0;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    gap: 48px;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 2px solid var(--color-text);
        padding-bottom: 24px;
    }

    &__title {
        font-family: var(--font-display);
        font-size: 48px;
        font-weight: 700;
        line-height: 1;
        margin: 0;
        color: var(--color-text);
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 32px;
    }
}

.status-badge {
    background: var(--color-primary);
    color: white;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
}

.tournament-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-4px);
        border-color: var(--color-text);
    }

    &__content {
        padding: 32px;
    }

    &__name {
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 24px 0;
        color: var(--color-text);
    }

    &__details {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 24px;
        padding: 20px 0;
        border-top: 1px solid var(--color-border);
        border-bottom: 1px solid var(--color-border);
    }

    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
            font-size: 11px;
            color: var(--color-text-muted);
            font-weight: 500;
        }

        .value {
            font-size: 13px;
            font-weight: 600;
            color: var(--color-text);
        }
    }

    &__description {
        font-size: 14px;
        line-height: 1.6;
        color: var(--color-text-muted);
        margin: 0;
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

:deep(.p-progressspinner-circle) {
    stroke: var(--color-primary) !important;
}
</style>
