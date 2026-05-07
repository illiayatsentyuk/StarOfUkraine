<template lang="pug">
NuxtLink.task-card(:to="taskLink")
    .task-card__header
        .status-badge.pending
            span.dot
            span ВІДКРИТО
        .points {{ maxPoints }} pts

    h3.task-title {{ task.name }}
    p.task-desc {{ task.description }}

    .task-card__footer
        .deadline
            i.pi.pi-calendar
            span Раунд {{ task.order }}
        .detail-btn
            span ДЕТАЛІ
            i.pi.pi-arrow-right
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TournamentTask } from '~/types'

const props = defineProps<{
    task: TournamentTask
    tournamentId?: string
}>()

const route = useRoute()
const tournamentId = computed(() => props.tournamentId || (route.params.id as string))
const teamsStore = useTeamsStore()

const taskLink = computed(() => ({
    path: `/tournaments/${tournamentId.value}/tasks/${props.task.id}`,
    query: teamsStore.activeTeamId ? { teamId: teamsStore.activeTeamId } : undefined,
}))

const maxPoints = computed(() =>
    (props.task.criteria?.rubric || []).reduce((sum, item) => sum + (item.maxPoints || 0), 0),
)
</script>

<style scoped lang="scss">
.task-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 24px;
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease;
    text-decoration: none;
    color: inherit;

    &:hover {
        border-color: var(--color-primary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
    }

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .status-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 10px;
            font-weight: 700;
            padding: 4px 10px;
            background: var(--color-bg-secondary);
            border-radius: 0;

            .dot {
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background: #666;
            }

            &.completed { color: #10b981; .dot { background: #10b981; } }
            &.failed { color: #ef4444; .dot { background: #ef4444; } }
            &.pending { color: #f59e0b; .dot { background: #f59e0b; } }
        }

        .points {
            font-weight: 800;
            font-size: 13px;
            color: var(--color-primary);
        }
    }

    .task-title {
        font-family: var(--font-display);
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 12px 0;
        line-height: 1.3;
        color: var(--color-text);
    }

    .task-desc {
        color: var(--color-text-muted);
        font-size: 14px;
        line-height: 1.6;
        margin: 0 0 24px 0;
        flex-grow: 1;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--color-border);
        padding-top: 16px;

        .deadline {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            color: var(--color-text-muted);
            i { font-size: 10px; }
        }

        .detail-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 700;
            font-size: 11px;
            color: var(--color-primary);
        }
    }
}
</style>
