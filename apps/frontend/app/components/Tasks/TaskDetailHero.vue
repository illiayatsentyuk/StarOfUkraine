<template lang="pug">
header.task-detail__hero
  .status-line
    .badge(:class="task.status")
        span.dot
        span {{ getStatusLabel(task.status) }}
    .points {{ task.points }} pts
    
  h1.title {{ task.title }}
  
  .meta
    .meta-item
        i.pi.pi-calendar
        span Дедлайн: {{ formatDate(task.deadline) }}
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format-date'

const props = defineProps<{
  task: any
}>()

function getStatusLabel(status: string) {
    switch (status) {
        case 'completed': return 'ВИКОНАНО'
        case 'failed': return 'НЕ ВИКОНАНО'
        default: return 'В ПРОЦЕСІ'
    }
}
</script>

<style scoped lang="scss">
.task-detail__hero {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);

  .status-line {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 16px;

    .badge {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        background: var(--color-bg-secondary);
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.5px;

        .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #666;
        }

        &.completed { color: #10b981; .dot { background: #10b981; } }
        &.failed { color: #ef4444; .dot { background: #ef4444; } }
        &.pending { color: #f59e0b; .dot { background: #f59e0b; } }
    }

    .points {
        font-size: 18px;
        font-weight: 800;
        color: var(--color-primary);
        font-family: var(--font-display);
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
