<template lang="pug">
.stats-section
    .stat-box
        span.label {{ $t('modals.create.rounds_label') }}
        span.value {{ rounds || '—' }}
    .stat-box
        span.label {{ $t('modals.create.team_size') }}
        span.value {{ teamSizeMin }} — {{ teamSizeMax }}
    .stat-box
        span.label {{ $t('modals.create.max_teams_label') }}
        span.value {{ maxTeams }}
</template>

<script setup lang="ts">
defineProps<{
    rounds: number | null
    teamSizeMin: number
    teamSizeMax: number
    maxTeams: number
}>()
</script>

<style scoped lang="scss">
.stats-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    background: var(--color-border);
    border: 2px solid var(--color-border);

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }

    .stat-box {
        background: white;
        padding: 32px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        @media (max-width: 768px) {
            padding: 20px;
        }

        .label {
            font-size: 10px;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 2px;
        }

        .value {
            font-family: var(--font-display);
            font-size: clamp(18px, 4vw, 24px);
            font-weight: 700;
            color: var(--color-text);
        }
    }
}
</style>
