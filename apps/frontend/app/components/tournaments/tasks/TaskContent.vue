<template lang="pug">
.task-content
  header.task-header
    span.task-label ЗАВДАННЯ {{ letter }}
    h1.task-title {{ task.name }}
    .task-divider

  section.task-body
    .task-section
      h3.section-title ОПИС ЗАВДАННЯ
      .markdown-content(v-html="task.description")

    .task-section
      h3.section-title КРИТЕРІЇ ТА ВИМОГИ
      .requirements-grid
        .requirement-card(v-for="criterion in task.criteria" :key="criterion.id")
          .requirement-card__label {{ criterion.label }}
          .requirement-card__points {{ criterion.maxPoints }} БАЛІВ
          .requirement-card__desc {{ criterion.description }}

  section.task-resources(v-if="task.resources?.length")
    h3.section-title ДОДАТКОВІ МАТЕРІАЛИ
    .resources-list
      a.resource-link(v-for="res in task.resources" :href="res.url" target="_blank")
        i.pi.pi-file-pdf
        span {{ res.name }}
</template>

<script setup lang="ts">
interface Criterion {
  id: string
  label: string
  maxPoints: number
  description?: string
}
import type { Task } from '~/types/tournament-tasks.types'

defineProps<{
  letter: string
  task: Task
}>()
</script>

<style lang="scss" scoped>
.task-content {
  flex: 1;
  padding: 64px;
  overflow-y: auto;
  max-width: 1000px;
  margin: 0 auto;

  .task-header {
    margin-bottom: 64px;

    .task-label {
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 700;
      color: var(--color-primary);
      letter-spacing: 2px;
      display: block;
      margin-bottom: 16px;
    }

    .task-title {
      font-family: var(--font-display);
      font-size: 64px;
      font-weight: 800;
      line-height: 1.1;
      color: var(--color-text);
      margin: 0 0 40px 0;
      letter-spacing: -2px;
    }

    .task-divider {
      width: 100%;
      height: 4px;
      background: var(--color-text);
    }
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 800;
    color: var(--color-text);
    margin-bottom: 32px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .task-section {
    margin-bottom: 80px;
  }

  .markdown-content {
    font-size: 18px;
    line-height: 1.8;
    color: var(--color-text);
    opacity: 0.9;

    :deep(p) { margin-bottom: 24px; }
    :deep(ul) {
      list-style: none;
      padding-left: 0;
      li {
        position: relative;
        padding-left: 24px;
        margin-bottom: 12px;
        &:before {
          content: "—";
          position: absolute;
          left: 0;
          color: var(--color-primary);
          font-weight: 900;
        }
      }
    }
  }

  .requirements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
  }

  .requirement-card {
    padding: 32px;
    border: 2px solid var(--color-text);
    background: var(--color-surface);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    &__label {
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 1px;
      margin-bottom: 8px;
      color: var(--color-text);
    }

    &__points {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 900;
      color: var(--color-primary);
      margin-bottom: 16px;
    }

    &__desc {
      font-size: 13px;
      line-height: 1.5;
      opacity: 0.6;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 8px 8px 0 rgba(0, 0, 0, 0.1);
    }
  }

  .resources-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .resource-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    background: var(--color-text);
    color: white;
    text-decoration: none;
    font-weight: 700;
    font-size: 13px;
    transition: all 0.3s;

    &:hover {
      background: var(--color-primary);
    }
  }
}
</style>
