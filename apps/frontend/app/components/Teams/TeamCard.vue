<template lang="pug">
.team-card
    h4.team-card__name {{ team.name || team.teamName }}
    p.team-card__meta
        | Капітан:
        span  {{ team.captainName }}
    p.team-card__meta(v-if="team.city")
        | Місто:
        span  {{ team.city }}
    Button.team-card__delete(
        v-if="isAdmin"
        type="button"
        label="Видалити команду"
        icon="pi pi-trash"
        @click="$emit('delete', team.id)"
    )
</template>

<script setup lang="ts">
interface Team {
    id: string
    name?: string
    teamName?: string
    captainName: string
    city?: string
}

defineProps<{
    team: Team
    isAdmin: boolean
}>()

defineEmits<{
    delete: [id: string]
}>()
</script>

<style scoped lang="scss">
.team-card {
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: 16px;

    &__name {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-family: var(--font-display);
    }

    &__meta {
        margin: 0;
        color: var(--color-text-muted);
        font-size: 14px;

        span {
            color: var(--color-text);
            font-weight: 600;
            margin-left: 6px;
        }
    }

    :deep(.team-card__delete.p-button) {
        margin-top: var(--space-4);
        width: 100%;
        justify-content: center;
        gap: var(--space-2);
        background: transparent;
        border: 1px solid var(--color-error);
        color: var(--color-error);
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: 600;
        padding: 10px var(--space-3);
        border-radius: 0;
        letter-spacing: 0.04em;
        transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;

        &:not(:disabled):hover {
            background: var(--color-error) !important;
            border-color: var(--color-error) !important;
            color: #fff !important;
        }

        &:not(:disabled):hover .p-button-icon,
        &:not(:disabled):hover .p-button-icon .pi {
            color: #fff !important;
        }

        &:focus-visible {
            outline: 2px solid var(--color-error);
            outline-offset: 2px;
        }
    }
}
</style>
