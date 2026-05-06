<template lang="pug">
header.task-detail__hero
  .status-line
    .badge.pending
        span.dot
        span ВІДКРИТО
    .points {{ maxPoints }} pts
    
  h1.title {{ task.name }}
  
  .meta
    .meta-item
        i.pi.pi-calendar
        span Раунд: {{ task.order }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TournamentTask } from '~/types'

const props = defineProps<{
  task: TournamentTask
}>()

const maxPoints = computed(() =>
    (props.task.criteria?.rubric || []).reduce((sum, item) => sum + (item.maxPoints || 0), 0),
)
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
