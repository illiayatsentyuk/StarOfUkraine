<template lang="pug">
.header-section
  h1.main-title Tournament Hub
  p.subtitle {{ isLogin ? 'Увійдіть до свого профілю' : 'Створіть свій особистий профіль' }}
</template>

<script setup lang="ts">
defineProps<{
  isLogin: boolean
}>()
</script>

<style scoped lang="scss">
.header-section {
  text-align: center;
  margin: 0;
  padding: var(--space-8) var(--space-6) var(--space-6);
  background: var(--color-bg);
  border-bottom: 2px solid var(--color-text);

  .main-title {
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    color: var(--color-text);
    font-weight: 700;
    letter-spacing: -0.5px;
    text-transform: uppercase;
    margin-bottom: var(--space-2);
    line-height: 1.05;
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-family: var(--font-sans);
    font-weight: var(--font-weight-medium);
    line-height: 1.45;
  }
}
</style>
