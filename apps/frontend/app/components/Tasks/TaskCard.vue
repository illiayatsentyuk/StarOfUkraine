<template lang="pug">
NuxtLink.task-card(:to="taskLink")
    .task-card__header
        .status-badge(:class="`status-${task.status}`") {{ $t(`task.status.${task.status.toLowerCase()}`) }}
        .points(v-if="maxPoints") {{ maxPoints }} {{ $t('task.points').toUpperCase() }}

    h3.task-title {{ task.name }}
    p.task-desc {{ task.description }}

    .task-card__footer
        .task-card__footer__info
            span.deadline(v-if="task.deadline") {{ $t('task.deadline') }}: {{ formatDate(task.deadline) }}
            span.deadline(v-else) {{ $t('task.no_deadline') }}
            NuxtLink.detail-btn(:to="taskLink")
                span {{ $t('common.details').toUpperCase() }}
                i.pi.pi-arrow-right
        
        .task-card__admin-actions(v-if="isAdmin")
            Button.admin-btn.activate(
                v-if="task.status === 'DRAFT'"
                :label="$t('task.admin.activate')"
                icon="pi pi-play"
                :loading="store.loading"
                @click.stop.prevent="handleActivate"
            )
            Button.admin-btn.close(
                v-if="task.status === 'ACTIVE'"
                :label="$t('task.admin.close')"
                icon="pi pi-lock"
                :loading="store.loading"
                @click.stop.prevent="handleClose"
            )
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TournamentTask } from '~/stores/tasks.store'

const props = defineProps<{
    task: TournamentTask
    tournamentId: string
    isAdmin?: boolean
}>()

const store = useTasksStore()
const teamsStore = useTeamsStore()
const localePath = useLocalePath()
const route = useRoute()

const tournamentId = computed(() => props.tournamentId || (route.params.id as string))

const formatDate = (date: string | null) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('uk-UA')
}

const taskLink = computed(() => ({
    path: localePath(`/tournaments/${tournamentId.value}/tasks/${props.task.id}`),
    query: teamsStore.activeTeamId ? { teamId: teamsStore.activeTeamId } : undefined,
}))


const maxPoints = computed(() =>
    props.task.criteria?.rubric?.reduce((sum, item) => sum + (item.maxPoints ?? 0), 0) ?? 0
)

async function handleActivate() {
    await store.activateTask(props.task.id)
}

async function handleClose() {
    await store.closeSubmissions(props.task.id)
}
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
        flex-direction: column;
        gap: 20px;
        border-top: 1px solid var(--color-border);
        padding-top: 16px;

        &__info {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

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

    &__admin-actions {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;

        .admin-btn {
            width: 100%;
            justify-content: center;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 1px;
            border-radius: 0;
            padding: 10px;
            height: 40px;
            transition: all 0.2s;

            &.activate {
                background: #10b981;
                border-color: #10b981;
                color: white;
                &:hover { background: #059669; border-color: #059669; }
            }

            &.close {
                background: #64748b;
                border-color: #64748b;
                color: white;
                &:hover { background: #475569; border-color: #475569; }
            }

            :deep(.p-button-icon) {
                font-size: 12px;
                margin-right: 12px;
            }
        }
    }
}
</style>
