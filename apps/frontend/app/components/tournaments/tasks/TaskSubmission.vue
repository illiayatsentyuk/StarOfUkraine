<template lang="pug">
.task-submission
  .submission-card
    h3.card-title ЗДАТИ РОБОТУ
    p.card-desc Надішліть результати вашої роботи. Всі посилання будуть перевірені журі.

    .submission-form
      .form-group
        label.form-label GITHUB РЕПОЗИТОРІЙ
        .input-wrapper
          i.pi.pi-github
          InputText.brutal-input(
            v-model="links.github"
            placeholder="https://github.com/..."
            :disabled="loading"
          )
      
      .form-group
        label.form-label ДЕМО / ВІДЕО ПРЕЗЕНТАЦІЯ
        .input-wrapper
          i.pi.pi-video
          InputText.brutal-input(
            v-model="links.demo"
            placeholder="https://youtube.com/..."
            :disabled="loading"
          )

      .form-actions
        Button.submit-btn(
          label="ВІДПРАВИТИ НА ПЕРЕВІРКУ"
          icon="pi pi-check-circle"
          :loading="loading"
          @click="$emit('submit', links)"
        )
        p.status-hint(v-if="lastSubmittedAt") Остання спроба: {{ lastSubmittedAt }}
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { SubmissionLinks } from '~/types/tournament-tasks.types'

defineProps<{
  loading?: boolean
  lastSubmittedAt?: string
}>()

const emit = defineEmits<{
  (e: 'submit', data: SubmissionLinks): void
}>()

const links = reactive<SubmissionLinks>({
  github: '',
  demo: ''
})
</script>

<style lang="scss" scoped>
.task-submission {
  padding: 0 64px 64px;
  max-width: 1000px;
  margin: 0 auto;

  .submission-card {
    background: var(--color-surface);
    border: 3px solid var(--color-text);
    padding: 48px;

    .card-title {
      font-family: var(--font-display);
      font-size: 32px;
      font-weight: 800;
      color: var(--color-text);
      margin-bottom: 12px;
      letter-spacing: -1px;
    }

    .card-desc {
      font-size: 15px;
      color: var(--color-text);
      opacity: 0.6;
      margin-bottom: 40px;
    }
  }

  .submission-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .form-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      color: var(--color-text);
    }
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    i {
      position: absolute;
      left: 16px;
      color: var(--color-text);
      opacity: 0.5;
      font-size: 18px;
    }

    .brutal-input {
      width: 100%;
      height: 60px !important;
      padding-left: 48px !important;
      border: 3px solid var(--color-text) !important;
      border-radius: 0 !important;
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 16px;
      background: transparent;
      color: var(--color-text);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      &:focus {
        border-color: var(--color-primary) !important;
        box-shadow: 8px 8px 0 var(--color-primary) !important;
        transform: translate(-4px, -4px);
      }
    }
  }

  .form-actions {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .submit-btn {
      width: 100%;
      height: 64px;
      background: var(--color-primary) !important;
      border: 3px solid var(--color-text) !important;
      border-radius: 0 !important;
      color: var(--color-text) !important;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 18px;
      letter-spacing: 2px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;

      &:hover:not(:disabled) {
        background: var(--color-text) !important;
        color: var(--color-primary) !important;
        transform: translate(-4px, -4px);
        box-shadow: 8px 8px 0 var(--color-primary);
      }

      &:active:not(:disabled) {
        transform: translate(0, 0);
        box-shadow: none;
      }

      :deep(.p-button-icon) {
        font-size: 20px;
        margin-right: 12px;
      }
    }

    .status-hint {
      font-size: 12px;
      font-weight: 800;
      color: #10B981;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
}
</style>
