<template lang="pug">
.content-section.stats-section
  .stat-box
    span.label РАУНДІВ
    span.value {{ rounds }}
  .stat-box
    span.label ГРАВЦІВ У КОМАНДІ
    span.value {{ teamSizeMin }} — {{ teamSizeMax }}
  .stat-box
    span.label МАКС. КОМАНД
    span.value {{ maxTeams }}
</template>

<script setup lang="ts">
defineProps<{
  rounds: string | number
  teamSizeMin: number | string
  teamSizeMax: number | string
  maxTeams: number | string
}>()
</script>

<style lang="scss" scoped>
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: var(--color-border);
  border: 2px solid var(--color-border);
  margin-bottom: 64px;

  .stat-box {
    background: white;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .label {
      font-size: 10px;
      font-weight: 700;
      color: var(--color-text-muted);
      letter-spacing: 2px;
    }
    .value {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text);
    }
  }
}
</style>
