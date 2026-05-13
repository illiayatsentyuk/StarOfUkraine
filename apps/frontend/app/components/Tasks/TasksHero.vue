<template lang="pug">
header.tasks-page__hero
  .hero-content
    h1.title ЗАВДАННЯ ТУРНІРУ
    p.subtitle(v-if="!loading") Доступно завдань: {{ taskCount }}
  Button.create-btn(
    v-if="isAdmin"
    type="button"
    label=" СТВОРИТИ ЗАВДАННЯ"
    icon="pi pi-plus"
    @click="$emit('create')"
  )
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
  taskCount: number
  isAdmin: boolean
}>()

defineEmits<{
  (e: 'create'): void
}>()
</script>

<style scoped lang="scss">
.tasks-page__hero {
  margin-bottom: 48px;
  border-bottom: 2px solid var(--color-text);
  padding-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding-bottom: 24px;
    margin-bottom: 32px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 64px;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -2px;
    margin: 0 0 16px 0;
    color: var(--color-text);
    text-transform: uppercase;

    @media (max-width: 768px) {
      font-size: 32px;
      margin-bottom: 8px;
    }
    @media (max-width: 480px) {
      font-size: 24px;
      word-break: break-word;
    }
  }

  .subtitle {
    font-size: 18px;
    color: var(--color-text-muted);
    margin: 0;
    font-weight: 500;
  }

  :deep(.create-btn) {
    display: inline-flex;
    gap: 12px;
    background: var(--color-primary);
    border: 1px solid var(--color-primary);
    color: white;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 12px;
    padding: 16px 32px;
    border-radius: 0;
    letter-spacing: 1.5px;
    transition: all 0.2s;

    &:hover {
      background: var(--color-text);
      border-color: var(--color-text);
      transform: translateY(-2px);
    }
  }
}
</style>
