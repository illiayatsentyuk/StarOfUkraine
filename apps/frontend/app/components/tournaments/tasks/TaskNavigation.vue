<template lang="pug">
aside.task-navigation
  .navigation-header
    h4.label ЗАВДАННЯ
    .progress-summary 2 / 5 ВИКОНАНО

  .tasks-list
    button.task-item(
      v-for="task in tasks"
      :key="task.id"
      :class="{ 'is-active': activeTaskId === task.id, 'is-locked': task.isLocked, 'is-completed': task.isCompleted }"
      @click="!task.isLocked && $emit('select', task.id)"
    )
      .task-item__id {{ task.letter }}
      .task-item__info
        span.name {{ task.name }}
        span.status(v-if="task.isLocked") ЗАБЛОКОВАНО
        span.status(v-else-if="task.isCompleted") ВИКОНАНО
        span.status(v-else) В ПРОЦЕСІ
      .task-item__indicator(v-if="activeTaskId === task.id")
</template>

<script setup lang="ts">
import type { Task } from '~/types/tournament-tasks.types'

defineProps<{
  tasks: Task[]
  activeTaskId: string
}>()

defineEmits(['select'])
</script>

<style lang="scss" scoped>
.task-navigation {
  width: 320px;
  background: var(--color-surface);
  border-right: 2px solid var(--color-text);
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 40px 0;

  .navigation-header {
    padding: 0 24px;
    margin-bottom: 32px;

    .label {
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 900;
      color: var(--color-primary);
      letter-spacing: 2px;
      margin: 0 0 8px 0;
    }

    .progress-summary {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text);
      opacity: 0.6;
      letter-spacing: 1px;
    }
  }

  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 16px;
  }

  .task-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    text-align: left;

    &__id {
      width: 32px;
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 800;
      color: var(--color-text);
      opacity: 0.3;
    }

    &__info {
      display: flex;
      flex-direction: column;

      .name {
        font-weight: 700;
        font-size: 14px;
        color: var(--color-text);
      }

      .status {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
        opacity: 0.5;
        margin-top: 4px;
      }
    }

    &__indicator {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--color-primary);
    }

    &:hover:not(.is-locked) {
      background: rgba(var(--color-text-rgb), 0.05);
      border-color: var(--color-text);
    }

    &.is-active {
      background: var(--color-text);
      border-color: var(--color-text);

      .task-item__id {
        color: var(--color-primary);
        opacity: 1;
      }

      .name {
        color: white;
      }

      .status {
        color: var(--color-primary);
        opacity: 1;
      }
    }

    &.is-completed {
      .task-item__id {
        color: #10B981;
        opacity: 1;
      }
    }

    &.is-locked {
      opacity: 0.4;
      cursor: not-allowed;
      filter: grayscale(1);
    }
  }
}
</style>
