<template lang="pug">
.content-section
  h3.section-label ПРО ТУРНІР
  p.description {{ description || 'Опис відсутній.' }}
</template>

<script setup lang="ts">
defineProps<{
  description?: string
}>()
</script>

<style scoped lang="scss">
.content-section {
  margin-bottom: 64px;

  .section-label {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 2px;
    margin: 0;
  }

  .description {
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
    margin: 24px 0 0 0;
    max-width: 800px;
    font-weight: 400;
  }
}
</style>
