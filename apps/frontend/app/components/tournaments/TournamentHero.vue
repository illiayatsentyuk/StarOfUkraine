<template lang="pug">
header.tournament-detail__hero
    .status-badge(v-if="status" :style="{ backgroundColor: status.color }") {{ status.label }}
    h1.title {{ name }}
    .tournament-detail__hero__actions
        NuxtLink(:to="`/tournaments/${tournamentId}/tasks`" style="text-decoration: none;")
            Button.task-btn(type="button" label="Завдання")
</template>

<script setup lang="ts">
import type { TournamentStatusInfo } from '~/utils/tournament-status-ui'

defineProps<{
    name: string
    tournamentId: string
    status: TournamentStatusInfo | null
}>()
</script>

<style scoped lang="scss">
.tournament-detail__hero {
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

        $hero-tab-ease: cubic-bezier(0.16, 1, 0.3, 1);

        :deep(.task-btn.p-button) {
            min-width: 200px;
            height: 52px;
            border-radius: 0;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 2px;
            text-transform: uppercase;
            transition:
                background 0.3s $hero-tab-ease,
                border-color 0.3s $hero-tab-ease,
                color 0.3s $hero-tab-ease,
                transform 0.3s $hero-tab-ease,
                box-shadow 0.3s $hero-tab-ease;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            background: var(--color-text) !important;
            border: 1px solid var(--color-text) !important;
            color: #fff !important;

            &:not(:disabled):hover {
                background: var(--color-primary) !important;
                border-color: var(--color-primary) !important;
                color: #fff !important;
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            }

            &:not(:disabled):active {
                transform: translateY(0);
            }

            &:not(:disabled):hover .p-button-icon,
            &:not(:disabled):hover .p-button-icon .pi {
                color: #fff !important;
            }
        }
    }
}
</style>
