<template lang="pug">
.edit-summary
  h3.summary-title Tournament Summary
  
  .stats-list
    .stat-item
      span.label Total Rounds
      span.value {{ stats.totalRounds }}
    .stat-item
      span.label Total Tasks
      span.value {{ stats.totalTasks }}
    .stat-item
      span.label Status
      span.value.status-draft Draft
  
  .divider
  
  .actions
    Button.btn-discard(
      label="Discard Changes" 
      severity="secondary" 
      text 
      @click="$emit('discard')"
    )
</template>

<script setup lang="ts">
defineProps<{
  stats: {
    totalRounds: number
    totalTasks: number
  }
}>()

defineEmits(['discard'])
</script>

<style lang="scss" scoped>
.edit-summary {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  .summary-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  .stats-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .label {
        font-size: 14px;
        color: var(--color-text-muted);
      }

      .value {
        font-size: 15px;
        font-weight: 600;
        color: var(--color-text);

        &.status-draft {
          color: #6B7280;
        }
      }
    }
  }

  .divider {
    height: 1px;
    background: var(--color-border);
  }

  .actions {
    .btn-discard {
      width: 100%;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-muted);

      &:hover {
        color: var(--color-primary);
        background: transparent;
      }
    }
  }
}
</style>
