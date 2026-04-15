<template lang="pug">
.round-card(:class="{ 'is-collapsed': isCollapsed }")
  .round-card__header
    .drag-handle
      i.pi.pi-bars
    .title-group
      h3.title {{ round.name }}
      span.task-count {{ round.tasks?.length || 0 }} Tasks
    
    .spacer
    
    .actions
      Button.action-btn(icon="pi pi-pencil" text rounded @click="$emit('edit')")
      Button.action-btn(icon="pi pi-trash" text rounded severity="danger" @click="$emit('delete')")
      Button.expand-btn(
        :icon="isCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-down'" 
        text 
        rounded 
        @click="isCollapsed = !isCollapsed"
      )
  
  transition(name="expand")
    .round-card__content(v-if="!isCollapsed")
      .divider
      
      .task-list(v-if="round.tasks?.length")
        TaskRow(
          v-for="task in round.tasks" 
          :key="task.id" 
          :task="task"
          @edit-task="$emit('edit-task', task)"
          @delete-task="$emit('delete-task', task.id)"
        )
      
      .empty-state(v-else)
        p No tasks added yet
        span Add tasks to prepare this round for participants
        Button.btn-add-first(
          label="Add First Task" 
          icon="pi pi-plus" 
          outlined 
          @click="$emit('add-task')"
        )

      .footer(v-if="round.tasks?.length")
        Button.btn-add-inline(
          label="Add Task" 
          icon="pi pi-plus" 
          plain 
          text 
          @click="$emit('add-task')"
        )
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TaskRow from './TaskRow.vue'

const props = defineProps<{
  round: {
    id: string
    name: string
    tasks: any[]
  }
}>()

const emit = defineEmits(['edit', 'delete', 'add-task', 'edit-task', 'delete-task'])

const isCollapsed = ref(false)
</script>

<style lang="scss" scoped>
.round-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s ease;

  &__header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    gap: 16px;

    .drag-handle {
      color: var(--color-border);
      cursor: grab;
      font-size: 14px;
    }

    .title-group {
      display: flex;
      align-items: center;
      gap: 12px;

      .title {
        font-size: 16px;
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin: 0;
      }

      .task-count {
        font-size: 13px;
        color: var(--color-text-muted);
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
        width: 32px;
        height: 32px;
        color: var(--color-text-muted);
        
        &:hover {
          background: var(--color-surface);
          color: var(--color-text);
        }
      }

      :deep(.p-button.expand-btn) {
        margin-left: 8px;
        color: var(--color-text-muted);
      }
    }
  }

  &__content {
    padding: 0 20px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;

    .divider {
      height: 1px;
      background: var(--color-border);
      margin: 0;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .empty-state {
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-align: center;

      p {
        font-size: 14px;
        font-weight: var(--font-weight-medium);
        color: var(--color-text-muted);
        margin: 0;
      }

      span {
        font-size: 12px;
        color: #9CA3AF;
      }

      .btn-add-first {
        margin-top: 8px;
        border-color: var(--color-border);
        color: var(--color-text);
        border-radius: var(--radius-md);
        font-size: 13px;
        font-weight: var(--font-weight-semibold);
      }
    }

    .footer {
      .btn-add-inline {
        width: 100%;
        height: 44px;
        border: 1px dashed var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        font-size: 13px;
        font-weight: var(--font-weight-medium);

        &:hover {
          border-color: var(--color-text-muted);
          background: var(--color-surface);
        }
      }
    }
  }
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-bottom: 0;
}
</style>
