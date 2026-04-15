<template lang="pug">
.task-row
  i.pi.pi-list.task-icon
  .task-info
    span.task-title {{ task.name }}
    .task-meta
      span.duration {{ task.duration || '0' }}m
      span.type-badge {{ task.type || 'Submission' }}
  
  .spacer
  
  .actions
    Button.action-btn(icon="pi pi-eye" text rounded @click="$emit('preview')")
    Button.action-btn(icon="pi pi-pencil" text rounded @click="$emit('edit-task')")
    Button.action-btn(icon="pi pi-trash" text rounded severity="danger" @click="$emit('delete-task')")
</template>

<script setup lang="ts">
defineProps<{
  task: {
    id: string
    name: string
    duration?: string
    type?: string
  }
}>()

defineEmits(['preview', 'edit-task', 'delete-task'])
</script>

<style lang="scss" scoped>
.task-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-text-muted);
  }

  .task-icon {
    font-size: 14px;
    color: var(--color-text-muted);
  }

  .task-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .task-title {
      font-size: 14px;
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 8px;

      .duration {
        font-size: 12px;
        color: #9CA3AF;
      }

      .type-badge {
        font-size: 11px;
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-muted);
        background: white;
        padding: 2px 6px;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        text-transform: uppercase;
      }
    }
  }

  .spacer {
    flex: 1;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;

    :deep(.p-button.action-btn) {
      width: 28px;
      height: 28px;
      color: var(--color-text-muted);
      
      &:hover {
        background: white;
        color: var(--color-text);
      }
    }
  }
}
</style>
