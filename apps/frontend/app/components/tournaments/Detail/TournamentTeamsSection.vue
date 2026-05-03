<template lang="pug">
.content-section
  h3.section-label КОМАНДИ
  p.description(v-if="shouldHideTeams") Список команд буде доступний після завершення реєстрації.
  template(v-else)
    p.description(v-if="loadingTeams") Завантаження команд...
    p.description(v-else-if="!teams || !teams.length") Команди поки не додані.
    TournamentTeamsTable(
      v-if="teams && teams.length"
      :teams="teams"
      :isAdmin="isAdmin"
      :shouldHideTeams="shouldHideTeams"
      @shuffle="$emit('shuffle')"
    )
</template>

<script setup lang="ts">
defineProps<{
  teams: any[]
  loadingTeams: boolean
  shouldHideTeams: boolean
  isAdmin: boolean
}>()

defineEmits<{
  (e: 'shuffle'): void
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
