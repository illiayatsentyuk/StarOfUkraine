<template lang="pug">
section.tournament-archive
    .tournament-archive__header
        h2.title АРХІВ ТУРНІРІВ
        p.subtitle Тут зберігаються всі завершені турніри
    
    .tournament-archive__content
        // Loading State
        .loading-overlay(v-if="store.loading")
            Loader
        
        // Error State
        .error-state(v-else-if="store.error")
            p Помилка завантаження турнірів: {{ store.error }}
            Button(@click="store.fetchTournaments" label="Спробувати знову" type="button")
        
        // Empty State
        .empty-state(v-else-if="!tournaments.length")
            p В архіві ще немає турнірів
        
        // Content State
        template(v-else)
            .tournaments-grid
                .tournament-card(v-for="tournament in tournaments" :key="tournament.id")
                    .tournament-card__header
                        .tournament-card__status(:style="{ backgroundColor: getTournamentStatus(tournament).color }")
                            span {{ getTournamentStatus(tournament).label }}
                    
                    .tournament-card__body
                        h3.tournament-card__title {{ tournament.name }}
                        p.tournament-card__description {{ tournament.description }}
                        
                        .tournament-card__meta
                            .meta-item
                                span.meta-label Дата старту
                                span.meta-value {{ formatDate(tournament.startDate) }}
                            .meta-item
                                span.meta-label Раундів
                                span.meta-value {{ tournament.rounds }}
                            .meta-item
                                span.meta-label Команд
                                span.meta-value {{ tournament.teams.length }}
                    
                    .tournament-card__footer
                        Button.view-btn(@click="navigateToTournament(tournament.id)" label="Переглянути" type="button")
                        Button.delete-btn(v-if="authStore.isAdmin" @click="deleteTournament(tournament.id)" label="Видалити" type="button" icon="pi pi-trash")

    // Delete Confirmation Modal
    Dialog(
        v-model:visible="isDeleteModalOpen"
        modal
        :style="{ width: '450px' }"
        class="delete-modal"
    )
        template(#header)
            h3.delete-modal__title Видалити турнір?
        
        .delete-modal__content
            p Ви впевнені, що хочете видалити цей турнір? Ця дія не може бути скасована.
            
            .delete-modal__info
                .info-item
                    span.info-label Назва:
                    span.info-value {{ selectedTournament?.name }}
                .info-item
                    span.info-label Дата старту:
                    span.info-value {{ selectedTournament?.startDate ? formatDate(selectedTournament.startDate) : '-' }}
                .info-item
                    span.info-label Кількість команд:
                    span.info-value {{ selectedTournament?.teams?.length || 0 }}
        
        template(#footer)
            .delete-modal__footer
                Button.cancel-btn(@click="isDeleteModalOpen = false" label="Скасувати" type="button")
                Button.confirm-btn(@click="confirmDelete" label="Видалити турнір" type="button")

    .tournaments-list__footer(v-if="store.tournaments.length > 0")
        button.load-more(
            @click="store.loadFromDatabase()"
            :disabled="!store.hasMore || store.loading"
            type="button"
        )
            .btn-content
                span {{ store.loading ? 'ЗАВАНТАЖЕННЯ...' : 'ЗАВАНТАЖИТИ ЩЕ' }}
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTournamentsStore } from '~/stores/tournaments.store'
import { useLoginStore } from '~/stores/auth.store'
import { calculateTournamentStatus } from '~/utils/tournament-status'
import type { Tournament } from '~/types'

const store = useTournamentsStore()
const authStore = useLoginStore()
const isDeleteModalOpen = ref(false)
const selectedTournamentId = ref<string | null>(null)

const getTournamentStatus = (tournament: Tournament) => {
    return calculateTournamentStatus(tournament)
}

const tournaments = computed(() => {
    return store.tournaments.filter(t => getTournamentStatus(t).code === 'finished')
})

onMounted(() => {
    store.loadFromDatabase()
})

const formatDate = (dateString: string): string => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

const navigateToTournament = (id: string) => {
    navigateTo(`/tournaments/${id}`)
}

const deleteTournament = (id: string) => {
    selectedTournamentId.value = id
    isDeleteModalOpen.value = true
}

const confirmDelete = async () => {
    if (selectedTournamentId.value) {
        await store.deleteTournament(selectedTournamentId.value)
        isDeleteModalOpen.value = false
        selectedTournamentId.value = null
    }
}

const selectedTournament = computed<Tournament | null>(() => {
    if (!selectedTournamentId.value) return null
    return tournaments.value.find(t => t.id === selectedTournamentId.value) || null
})
</script>

<style lang="scss" scoped>
.tournament-archive {
  padding: var(--space-4);
  background-color: var(--color-bg);
  min-height: 100%;

  @include media($md) {
    padding: var(--space-8);
  }

  &__header {
    margin-bottom: var(--space-8);
    text-align: center;

    .title {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
      margin-bottom: var(--space-2);
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: var(--font-size-base);
      color: var(--color-text-muted);
    }
  }

  &__content {
    .loading-overlay, .error-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      gap: var(--space-4);
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      color: var(--color-text-muted);
    }

    .error-state {
      color: var(--color-primary);
    }

    .tournaments-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);

      @include media($md) {
        grid-template-columns: repeat(2, 1fr);
      }

      @include media($xlg) {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}

.tournament-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.15);
  }

  &__header {
    position: relative;
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-bg);
  }

  &__status {
    display: inline-flex;
    align-items: center;
    padding: var(--space-1) var(--space-3);
    border-radius: 9999px;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: white;
  }

  &__body {
    padding: var(--space-5);
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  &__title {
    font-family: var(--font-display);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin: 0;
    line-height: 1.3;
  }

  &__description {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: auto;
    padding-top: var(--space-4);
    border-top: 1px dashed var(--color-border);

    .meta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--font-size-sm);
    }

    .meta-label {
      color: var(--color-text-muted);
    }

    .meta-value {
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
    }
  }

  &__footer {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-4);
    background-color: var(--color-bg);
    border-top: 1px solid var(--color-border);

    :deep(.p-button) {
      width: 100%;
      justify-content: center;
    }

    .view-btn {
      flex: 1;
    }

    .delete-btn {
      flex: 0 0 auto;
    }
  }
}

.delete-modal {
  &__title {
    margin: 0;
    font-size: var(--font-size-xl);
    color: var(--color-text);
  }

  &__content {
    p {
      color: var(--color-text-muted);
      margin-bottom: var(--space-4);
    }
  }

  &__info {
    background-color: var(--color-surface);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-sm);
    }

    .info-label {
      color: var(--color-text-muted);
    }

    .info-value {
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }
}

.tournaments-list__footer {
    display: flex;
    justify-content: center;
    padding: var(--space-6) var(--space-4);
    background-color: var(--color-surface);
    border-top: 1px solid var(--color-border);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);

    .load-more {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-3) var(--space-6);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-primary);
        background-color: var(--color-primary);
        color: white;
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 44px;

        &:hover:not(:disabled) {
            background-color: var(--color-primary-hover);
            border-color: var(--color-primary-hover);
            transform: translateY(-2px);
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .btn-content {
            display: flex;
            align-items: center;
            gap: var(--space-2);
        }
    }
}
</style>