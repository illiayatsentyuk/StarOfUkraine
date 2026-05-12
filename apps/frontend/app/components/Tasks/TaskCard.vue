<template lang="pug">
.task-card
    .task-card__header
        .status-badge(:class="`status-${task.status}`") {{ statusLabel }}
        .points(v-if="maxPoints") {{ maxPoints }} БАЛІВ

    h3.task-title {{ task.name }}
    p.task-desc {{ task.description }}

    .task-card__footer
        span.deadline(v-if="task.deadline") Дедлайн: {{ formatDate(task.deadline) }}
        span.deadline(v-else) Без дедлайну
        NuxtLink.detail-btn(:to="`/tournaments/${tournamentId}/tasks/${task.id}`")
            span ДЕТАЛІ
            i.pi.pi-arrow-right
</template>

<script setup lang="ts">
import type { TournamentTask } from '~/stores/tasks.store'

const props = defineProps<{
    task: TournamentTask
    tournamentId: string
}>()

const STATUS_LABELS: Record<string, string> = {
    DRAFT: 'ЧЕРНЕТКА',
    ACTIVE: 'АКТИВНЕ',
    SUBMISSION_CLOSED: 'ЗДАЧУ ЗАКРИТО',
    EVALUATED: 'ОЦІНЕНО',
}

const statusLabel = computed(() => STATUS_LABELS[props.task.status] ?? props.task.status)

const maxPoints = computed(() =>
    props.task.criteria?.rubric?.reduce((sum, item) => sum + (item.maxPoints ?? 0), 0) ?? 0
)
</script>

<style scoped lang="scss">
.task-card {
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    padding: 32px;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.1);
        border-color: var(--color-primary);
    }

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;

        .status-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 4px 10px;
            letter-spacing: 1.5px;
            border: 1px solid var(--color-border);
            color: var(--color-text-muted);

            &.status-ACTIVE {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: white;
            }

            &.status-EVALUATED {
                background: var(--color-text);
                border-color: var(--color-text);
                color: white;
            }

            &.status-SUBMISSION_CLOSED {
                background: transparent;
                border-color: var(--color-text-muted);
                color: var(--color-text-muted);
            }
        }

        .points {
            font-weight: 700;
            font-size: 14px;
            color: var(--color-primary);
        }
    }

    .task-title {
        font-family: var(--font-display);
        font-size: 24px;
        margin: 0 0 16px 0;
        line-height: 1.2;
    }

    .task-desc {
        color: var(--color-text-muted);
        font-size: 15px;
        line-height: 1.6;
        margin: 0 0 32px 0;
        flex-grow: 1;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    &__footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid var(--color-border);
        padding-top: 24px;

        .deadline {
            font-size: 12px;
            font-weight: 600;
            color: var(--color-text-muted);
        }

        .detail-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--color-text);
            text-decoration: none;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 1px;
            transition: color 0.2s;

            &:hover {
                color: var(--color-primary);
            }
        }
    }
}
</style>
