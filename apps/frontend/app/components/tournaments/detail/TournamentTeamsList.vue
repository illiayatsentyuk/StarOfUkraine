<template lang="pug">
.content-section
  h3.section-label КОМАНДИ
  p.description(v-if="shouldHideTeams") Список команд буде доступний після завершення реєстрації.
  template(v-else)
    p.description(v-if="loading") Завантаження команд...
    p.description(v-else-if="!teams.length") Команди поки не додані.
    .teams-grid(v-else)
      .team-card(v-for="team in teams" :key="team.id")
        h4.team-card__name {{ team.name || team.teamName }}
        p.team-card__meta
          | Капітан:
          span  {{ team.captainName }}
        p.team-card__meta(v-if="team.city")
          | Місто:
          span  {{ team.city }}
        Button.delete-btn(v-if="isAdmin" @click="$emit('deleteTeam', team.id)" type="button" label="Видалити команду" icon="pi pi-trash")
</template>

<script setup lang="ts">
defineProps<{
  teams: any[]
  loading: boolean
  isAdmin: boolean
  shouldHideTeams: boolean
}>()

defineEmits(['deleteTeam'])
</script>

<style lang="scss" scoped>
.content-section {
  margin-bottom: 64px;

  .section-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 2px;
    margin-bottom: 24px;
    text-transform: uppercase;
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

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.team-card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 16px;

  &__name {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-family: var(--font-display);
  }

  &__meta {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 14px;

    span {
      color: var(--color-text);
      font-weight: 600;
      margin-left: 6px;
    }
  }

  :deep(.delete-btn) {
    margin-top: 16px;
    width: 100%;
    background: transparent;
    border: 1px solid var(--color-error, #ef4444);
    color: var(--color-error, #ef4444);
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 600;
    padding: 12px;
    border-radius: 0;
    letter-spacing: 1px;
    transition: all 0.2s ease;

    &:hover {
      background: var(--color-error, #ef4444);
      color: white;
    }
  }
}
</style>
