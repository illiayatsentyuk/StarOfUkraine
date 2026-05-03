<template lang="pug">
header.task-detail__hero
  .status-wrapper
    .status-badge(:class="`status-${task.status}`")
      template(v-if="task.status === 'completed'") ВИКОНАНО
      template(v-else-if="task.status === 'pending'") В ОЧІКУВАННІ
      template(v-else) НЕ ВИКОНАНО
    .points {{ task.points }} БАЛІВ

  h1.title {{ task.title }}
  .meta-info
    span.deadline ДЕДЛАЙН: {{ formatDate(task.deadline) }}
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format-date'

defineProps<{
  task: any
}>()
</script>

<style scoped lang="scss">
.task-detail__hero {
  margin-bottom: 64px;
  border-bottom: 2px solid var(--color-text);
  padding-bottom: 48px;

  .status-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;

    .status-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 6px 14px;
      letter-spacing: 1.5px;

      &.status-completed {
        background: var(--color-primary);
        color: white;
      }

      &.status-pending {
        background: var(--color-text);
        color: white;
      }

      &.status-failed {
        background: var(--color-error, #ef4444);
        color: white;
      }
    }

    .points {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 20px;
      color: var(--color-primary);
    }
  }

  .title {
    font-family: var(--font-display);
    font-size: 64px;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -2px;
    margin: 0 0 24px 0;
    color: var(--color-text);

    @media (max-width: 768px) {
      font-size: 48px;
    }
  }

  .meta-info {
    .deadline {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-muted);
      letter-spacing: 1px;
    }
  }
}
</style>
