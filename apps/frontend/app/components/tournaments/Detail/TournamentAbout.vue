<template lang="pug">
.content-section
  h3.section-label {{ $t('tournament.info.about_title') }}
  p.description {{ description || $t('tournament.info.no_description') }}
</template>

<script setup lang="ts">
defineProps<{
  description?: string
}>()
</script>

<style scoped lang="scss">
.content-section {
  margin-bottom: 64px;

  @media (max-width: 768px) {
    margin-bottom: 40px;
  }

  .section-label {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 2px;
    margin: 0;
  }

  .description {
    font-size: clamp(16px, 2.8vw, 22px);
    line-height: 1.5;
    color: var(--color-text);
    margin: 24px 0 0 0;
    max-width: 800px;
    font-weight: 400;
  }
}
</style>
