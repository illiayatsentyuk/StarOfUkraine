<template lang="pug">
section.profile-history
  h2.profile-history__title {{ $t('profile.history_title') }}

  .profile-history__loading(v-if="loading")
    Loader

  .profile-history__empty(v-else-if="!history?.teams?.length && !history?.juryTournaments?.length")
    i.pi.pi-inbox
    p {{ $t('profile.history_empty') }}

  .profile-history__list(v-else)
    template(v-if="history?.teams?.length")
      .team-card(v-for="entry in history.teams" :key="entry.team.id")
        .team-card__header
          i.pi.pi-users
          h3.team-card__name {{ entry.team.name }}
          span.team-card__badge {{ entry.submissions.length }} {{ $t('profile.submissions') }}

        .team-card__tournaments(v-if="entry.tournaments.length")
          .tournament-row(v-for="t in entry.tournaments" :key="t.id")
            NuxtLink.tournament-row__link(:to="localePath(`/tournaments/${t.id}`)")
              span.tournament-row__name {{ t.name }}
            .tournament-row__status(:class="`status--${t.status.toLowerCase()}`")
              span {{ statusLabel(t.status) }}

        .team-card__empty-tournaments(v-else)
          span {{ $t('profile.no_tournaments') }}

    template(v-if="history?.juryTournaments?.length")
      h2.profile-history__title.profile-history__title--jury {{ $t('profile.jury_history_title') || 'Tournaments Judging' }}
      .team-card
        .team-card__header
          i.pi.pi-verified
          h3.team-card__name {{ $t('profile.jury_panel') || 'Jury Panel' }}
          span.team-card__badge {{ history.juryTournaments.length }} {{ $t('profile.tournaments') || 'tournaments' }}
        
        .team-card__tournaments
          .tournament-row(v-for="t in history.juryTournaments" :key="t.id")
            NuxtLink.tournament-row__link(:to="localePath(`/tournaments/${t.id}/judge`)")
              span.tournament-row__name {{ t.name }}
            .tournament-row__status(:class="`status--${t.status.toLowerCase()}`")
              span {{ statusLabel(t.status) }}
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const loading = ref(false)
const history = ref<any>({ teams: [], juryTournaments: [] })

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: t('tournament.status.draft'),
    REGISTRATION_OPEN: t('tournament.status.registration_open'),
    ONGOING: t('tournament.status.ongoing'),
    COMPLETED: t('tournament.status.completed'),
    CANCELLED: t('tournament.status.cancelled'),
  }
  return map[status] ?? status
}

onMounted(async () => {
  loading.value = true
  try {
    const response = await useApi().get('/users/me/history')
    history.value = response.data ?? { teams: [], juryTournaments: [] }
  } catch {
    // silently ignore — user will just see empty state
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.profile-history {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  width: 100%;

  &__title {
    font-family: var(--font-display);
    font-size: clamp(18px, 3vw, 24px);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    color: var(--color-text);
    margin: 0;

    &--jury {
      margin-top: var(--space-8);
    }
  }

  &__loading,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    min-height: 120px;
    border: 1px dashed var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);

    i { font-size: 1.5rem; }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
}

.team-card {
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg);

    i {
      color: var(--color-primary);
      font-size: 1rem;
    }
  }

  &__name {
    flex: 1;
    font-family: var(--font-display);
    font-size: var(--font-size-base);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-text);
    margin: 0;
  }

  &__badge {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  &__tournaments {
    padding: var(--space-3) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  &__empty-tournaments {
    padding: var(--space-3) var(--space-5);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }
}

.tournament-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px dashed var(--color-border);

  &:last-child { border-bottom: none; }

  &__link {
    font-size: var(--font-size-sm);
    color: var(--color-text);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover { color: var(--color-primary); }
  }

  &__name {
    font-size: var(--font-size-sm);
    color: var(--color-text);
  }

  &__status {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 8px;

    &.status--ongoing { background: #e8f5e9; color: #2e7d32; }
    &.status--registration_open { background: #e3f2fd; color: #1565c0; }
    &.status--completed { background: #f3e5f5; color: #6a1b9a; }
    &.status--draft { background: var(--color-border); color: var(--color-text-muted); }
    &.status--cancelled { background: #fce4ec; color: #b71c1c; }
  }
}
</style>
