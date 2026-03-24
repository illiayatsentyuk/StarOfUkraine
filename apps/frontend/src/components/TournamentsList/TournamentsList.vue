<script lang="ts" setup>
import { useTournamentsStore } from '@/stores/tournaments.store';

const store = useTournamentsStore()
</script>

<template lang="pug">
section.tournaments-list
    .tournaments-list__header
        h2.tournaments-list__title Турніри
        p.tournaments-list__subtitle Список турнірів
    .tournaments-list__grid
        .tournament-card(v-for="tournament in store.tournaments" :key="tournament.name")
            .card-section
                span.card-label Назва турніру
                h3.card-title {{ tournament.name }}
            .card-section
                span.card-label Опис та Правила
                p.card-desc {{ tournament.description }}
            .card-details
                .detail-item
                    span.card-label Дата старту
                    span.detail-val {{ tournament.startDate }}
                .detail-item
                    span.card-label Макс. команд
                    span.detail-val {{ tournament.maxTeams }}
    button.load-more(@click="store.loadFromDatabase" :disabled="!store.hasMore || store.loading")
        | {{ store.loading ? 'Завантаження...' : 'Завантажити ще' }}
</template>

<style lang="scss" scoped>
.tournaments-list {
    display: flex;
    flex-direction: column;
    gap: 32px;

    &__header {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    &__title {
        font-family: var(--font-display);
        font-size: 32px;
        font-weight: 600;
        color: var(--color-text);
        letter-spacing: -1px;
    }

    &__subtitle {
        font-family: var(--font-sans);
        font-size: 14px;
        color: var(--color-text-muted);
    }

    &__grid {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
}

.tournament-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    border: 1px solid var(--color-border);
    background: var(--color-bg);

    .card-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .card-label {
        font-family: var(--font-sans);
        font-size: 12px;
        color: var(--color-text-muted);
    }

    .card-title {
        font-family: var(--font-display);
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text);
    }

    .card-desc {
        font-family: var(--font-sans);
        font-size: 14px;
        color: var(--color-text);
        line-height: 1.5;
    }

    .card-details {
        display: flex;
        gap: 32px;
        margin-top: 8px;
    }

    .detail-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .detail-val {
        font-family: var(--font-sans);
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text);
    }
    .load-more {
        margin-top: 16px;
        padding: 10px 20px;
        background-color: var(--color-primary);
        border: none;
        color: var(--color-bg);
        font-family: var(--font-display);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border-radius: 0;

        &:hover {
            background-color: var(--color-primary-hover);
        }

        &:disabled {
            background-color: var(--color-border);
            cursor: not-allowed;
        }
    }
}
</style>