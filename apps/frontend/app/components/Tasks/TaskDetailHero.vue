<template lang="pug">
header.task-detail__hero
  .task-detail__hero__top
    .status-line
      .badge(:class="task.status.toLowerCase()")
          span.dot
          span {{ $t(`task.status.${task.status.toLowerCase()}`) }}
      .points {{ maxPoints }} {{ $t('task.points') }}
    
    .admin-actions(v-if="isAdmin")
      Button.admin-btn.activate(
        v-if="task.status === 'DRAFT'"
        :label="$t('task.admin.activate')"
        icon="pi pi-play"
        :loading="store.loading"
        @click="handleActivate"
      )
      Button.admin-btn.close(
        v-if="task.status === 'ACTIVE'"
        :label="$t('task.admin.close')"
        icon="pi pi-lock"
        :loading="store.loading"
        @click="handleClose"
      )
    
  h1.title {{ task.name }}
  
  .meta
    .meta-item
        i.pi.pi-calendar
        span {{ $t('task.round') }}: {{ task.order }}
    .meta-item(v-if="task.deadline")
        i.pi.pi-clock
        span {{ $t('task.deadline') }}: {{ formatDate(task.deadline) }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TournamentTask } from '~/stores/tasks.store'

const props = defineProps<{
  task: TournamentTask
  isAdmin?: boolean
}>()

const store = useTasksStore()

const STATUS_LABELS: Record<string, string> = {
    DRAFT: 'ЧЕРНЕТКА',
    ACTIVE: 'АКТИВНЕ',
    SUBMISSION_CLOSED: 'ЗДАЧУ ЗАКРИТО',
    EVALUATED: 'ОЦІНЕНО',
}

const statusLabel = computed(() => STATUS_LABELS[props.task.status] ?? props.task.status)

const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const maxPoints = computed(() =>
    (props.task.criteria?.rubric || []).reduce((sum, item) => sum + (item.maxPoints || 0), 0),
)

async function handleActivate() {
    await store.activateTask(props.task.id)
}

async function handleClose() {
    await store.closeSubmissions(props.task.id)
}
</script>

<style scoped lang="scss">
.task-detail__hero {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 20px;
  }

  .status-line {
    display: flex;
    align-items: center;
    gap: 20px;

    .badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        background: var(--color-bg-secondary);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;

        .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #666;
        }

        &.active { color: #10b981; .dot { background: #10b981; } }
        &.evaluated { color: var(--color-text); .dot { background: var(--color-text); } }
        &.draft { color: #f59e0b; .dot { background: #f59e0b; } }
        &.submission_closed { color: #64748b; .dot { background: #64748b; } }
    }

    .points {
        font-size: 20px;
        font-weight: 800;
        color: var(--color-primary);
        font-family: var(--font-display);
    }
  }

  .admin-actions {
    display: flex;
    gap: 12px;

    .admin-btn {
        height: 44px;
        padding: 0 24px;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 1px;
        border-radius: 0;
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

  .title {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 800;
    margin: 0 0 16px 0;
    color: var(--color-text);
    letter-spacing: -1px;

    @media (max-width: 768px) {
      font-size: 32px;
    }
  }

  .meta {
    display: flex;
    gap: 24px;

    .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--color-text-muted);
        font-weight: 500;

        i { font-size: 12px; }
    }
  }
}
</style>
