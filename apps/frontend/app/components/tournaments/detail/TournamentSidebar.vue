<template lang="pug">
aside.sidebar
  .sidebar__card
    h3.section-label КЛЮЧОВІ ДАТИ
    .date-list
      .date-entry
        span.label РЕЄСТРАЦІЯ ПОЧИНАЄТЬСЯ
        span.value {{ formatDate(tournament.registrationStart) }}
      .date-entry
        span.label РЕЄСТРАЦІЯ ЗАКІНЧУЄТЬСЯ
        span.value {{ formatDate(tournament.registrationEnd) }}
      .date-entry.highlight
        span.label ДАТА СТАРТУ
        span.value {{ formatDate(tournament.startDate) }}
    
    .divider
    
    .sidebar__footer
      .status-info
        span.label ПОТОЧНИЙ СТАТУС
        span.value(v-if="status" :style="{ color: status.color }") {{ status.label }}
      Button.delete-btn(v-if="isAdmin" @click="$emit('delete')" type="button" label="Видалити турнір")
      Button.create-btn(
        v-if="isAuthenticated" 
        @click="$emit('openTeamModal')" 
        type="button" 
        label="Створити команду" 
        icon="pi pi-plus"
        :disabled="!isRegistrationActive && !isAdmin"
      )
</template>

<script setup lang="ts">
defineProps<{
  tournament: any
  status: any
  isAdmin: boolean
  isAuthenticated: boolean
  isRegistrationActive: boolean
}>()

defineEmits(['delete', 'openTeamModal'])

const formatDate = (dateString: string) => {
  if (!dateString) return "ТВА"
  const date = new Date(dateString)
  return date.toLocaleDateString("uk-UA", {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).replace('р.', '').toUpperCase()
}
</script>

<style lang="scss" scoped>
.sidebar {
  &__card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 40px;
    position: sticky;
    top: 40px;

    .section-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--color-text-muted);
      letter-spacing: 2px;
      margin-bottom: 24px;
      text-transform: uppercase;
    }

    .date-list {
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .date-entry {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .label {
        font-size: 10px;
        font-weight: 700;
        color: var(--color-text-muted);
        letter-spacing: 1.5px;
      }
      .value {
        font-size: 15px;
        font-weight: 600;
        color: var(--color-text);
      }

      &.highlight .value {
        color: var(--color-primary);
        font-size: 18px;
        font-weight: 700;
      }
    }

    .divider {
      height: 1px;
      background: var(--color-border);
      margin: 40px 0;
    }

    .sidebar__footer {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .status-info {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .label {
          font-size: 10px;
          font-weight: 700;
          color: var(--color-text-muted);
          letter-spacing: 1.5px;
        }
        .value {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text);
        }
      }

      :deep(.delete-btn) {
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

      :deep(.create-btn) {
        width: 100%;
        background: var(--color-primary);
        color: white;
        border: 1px solid var(--color-primary);
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 1.5px;
        padding: 12px;
        border-radius: 0;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          background: var(--color-text);
          border-color: var(--color-text);
          transform: translateY(-2px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(1);
        }
      }
    }
  }
}
</style>
