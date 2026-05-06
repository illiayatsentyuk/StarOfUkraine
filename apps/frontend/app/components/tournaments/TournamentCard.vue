<template lang="pug">
NuxtLink.tournament-card(:to="`/tournaments/${tournament.id}`")
    .tournament-card__status(
        v-if="statusInfo"
        :style="{ backgroundColor: statusInfo.color }"
    )
        span {{ statusInfo.label }}

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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getTournamentStatusInfo } from '~/utils/tournament-status-ui'
import type { Tournament } from '~/types'

const props = defineProps<{
    tournament: Tournament
}>()

const statusInfo = computed(() => getTournamentStatusInfo(props.tournament.status))

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('uk-UA')
}
</script>

<style lang="scss" scoped>
.tournament-card {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 40px;
    background: white;
    border: 1px solid var(--color-border);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: var(--color-primary);
        transform: translateY(-100%);
        transition: transform 0.3s ease;
    }

    &:hover {
        border-color: var(--color-text);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
        transform: translateY(-4px);

        &::before {
            transform: translateY(0);
        }
    }

    &__status {
        width: fit-content;
        padding: 6px 12px;
        background-color: var(--color-primary);
        
        span {
            font-family: var(--font-display);
            font-size: 10px;
            font-weight: 800;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    }

    &__title {
        font-family: var(--font-display);
        font-size: 32px;
        font-weight: 700;
        color: var(--color-text);
        line-height: 1.1;
        letter-spacing: -0.5px;
        margin: 0;
    }

    &__details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        padding: 24px 0;
        border-top: 1px solid var(--color-border);
        border-bottom: 1px solid var(--color-border);
    }

    .detail-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .detail-label {
        font-family: var(--font-sans);
        font-size: 10px;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        display: flex;
        align-items: center;

        i {
            font-size: 12px;
            margin-right: 8px;
            color: var(--color-primary);
        }
    }

    .detail-value {
        font-family: var(--font-display);
        font-size: 18px;
        font-weight: 700;
        color: var(--color-text);
    }

    &__description {
        font-family: var(--font-sans);
        font-size: 15px;
        color: var(--color-text-muted);
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
    }
}
</style>
