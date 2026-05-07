<template lang="pug">
aside.task-sidebar
    .sidebar-header
        h3.sidebar-title ПЕРЕЛІК ЗАВДАНЬ
        span.task-count {{ tasks.length }} ЗАВДАНЬ

    .task-list
        NuxtLink.task-item(
            v-for="(task, index) in tasks"
            :key="task.id"
            :to="makeTaskLink(task.id)"
            :class="{ 'is-active': currentTaskId === task.id }"
        )
            .task-item__index {{ String.fromCharCode(65 + index) }}
            .task-item__content
                span.task-item__title {{ task.name }}
                .task-item__status
                    span.status-dot.pending
                    span.status-text ВІДКРИТО
            .task-item__points {{ task.order }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TournamentTask } from '~/types'

interface Props {
    tasks: TournamentTask[]
    currentTaskId: string
}

defineProps<Props>()

const route = useRoute()
const tournamentId = computed(() => route.params.id as string)
const teamsStore = useTeamsStore()

const makeTaskLink = (id: string) => ({
    path: `/tournaments/${tournamentId.value}/tasks/${id}`,
    query: teamsStore.activeTeamId ? { teamId: teamsStore.activeTeamId } : undefined,
})
</script>

<style lang="scss" scoped>
.task-sidebar {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0;
    padding: 24px;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);

    .sidebar-title {
        font-size: 11px;
        font-weight: 700;
        margin: 0;
        letter-spacing: 1.5px;
        color: var(--color-text-muted);
    }

    .task-count {
        font-size: 10px;
        font-weight: 600;
        color: var(--color-primary);
    }
}

.task-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.task-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 0;
    text-decoration: none;
    color: var(--color-text);
    transition: all 0.2s ease;

    &:hover {
        background: rgba(var(--color-primary-rgb), 0.05);
    }

    &.is-active {
        background: var(--color-primary);
        color: white;

        .task-item__index {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .task-item__status {
            .status-text { color: rgba(255, 255, 255, 0.7); }
            .status-dot { background: white; }
        }

        .task-item__points {
            color: white;
            background: rgba(0, 0, 0, 0.1);
        }
    }

    &__index {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-bg-secondary);
        border-radius: 0;
        color: var(--color-text);
        font-weight: 700;
        font-size: 12px;
        flex-shrink: 0;
    }

    &__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__title {
        font-size: 13px;
        font-weight: 600;
        line-height: 1.2;
    }

    &__status {
        display: flex;
        align-items: center;
        gap: 6px;

        .status-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #666;

            &.completed { background: #10b981; }
            &.failed { background: #ef4444; }
            &.pending { background: #f59e0b; }
        }

        .status-text {
            font-size: 9px;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 0.5px;
        }
    }

    &__points {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 6px;
        background: var(--color-bg-secondary);
        border-radius: 0;
        color: var(--color-text-muted);
    }
}
</style>
