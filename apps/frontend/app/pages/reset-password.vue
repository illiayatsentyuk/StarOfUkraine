<template lang="pug">
.registration-page
  .auth-card
    .header-section
      h1.main-title Новий пароль
      p.subtitle Встановіть новий пароль для вашого облікового запису

    template(v-if="!tokenFromQuery")
      .card-header
        h2 Недійсне посилання
        p У посиланні немає токена. Спробуйте запросити лист ще раз зі сторінки відновлення пароля.
      .card-footer
        NuxtLink.footer-link(to="/forgot-password") Забули пароль?
        NuxtLink.footer-link.footer-link--secondary(to="/auth") Увійти

    template(v-else-if="!passwordChanged")
      .card-header
        h2 Зміна пароля
        p Мінімум 8 символів.

      VeeForm.form-content(
        :initial-values="{ password: '', confirmPassword: '' }"
        @submit="handleSubmit"
      )
        VeeField(
          v-slot="{ field, errors, errorMessage, handleChange, handleBlur }"
          name="password"
          rules="required|min:8"
        )
          AppInput.auth-field-full(
            :model-value="field.value"
            :name="field.name"
            type="password"
            label="Новий пароль *"
            placeholder="········"
            is-password-field
            :error-message="fieldErrorText(errorMessage, errors)"
            @update:model-value="emitFieldValue(field, handleChange, $event)"
            @blur="emitFieldBlur(field, handleBlur, $event)"
          )

        VeeField(
          v-slot="{ field, errors, errorMessage, handleChange, handleBlur }"
          name="confirmPassword"
          rules="required|confirmed:@password"
        )
          AppInput.auth-field-full(
            :model-value="field.value"
            :name="field.name"
            type="password"
            label="Підтвердження пароля *"
            placeholder="········"
            is-password-field
            :error-message="fieldErrorText(errorMessage, errors)"
            @update:model-value="emitFieldValue(field, handleChange, $event)"
            @blur="emitFieldBlur(field, handleBlur, $event)"
          )

        button.submit-btn(type="submit" :disabled="loading") ЗБЕРЕГТИ ПАРОЛЬ

    .success-panel(v-else)
      p.success-panel__text Пароль успішно змінено. Тепер ви можете увійти.
      NuxtLink.footer-link.footer-link--cta(to="/auth") На сторінку входу
</template>

<script setup lang="ts">
const route = useRoute()
const toast = useServerSafeToast()
const loading = ref(false)
const passwordChanged = ref(false)

const tokenFromQuery = computed(() => {
  const t = route.query.token
  return typeof t === 'string' && t.length > 0 ? t : ''
})

function fieldErrorText(
  errorMessage: string | undefined | null,
  errors: string[] | undefined | null,
) {
  const trimmed = errorMessage && String(errorMessage).trim()
  if (trimmed) return trimmed
  const first = errors?.find((e) => Boolean(e && String(e).trim()))
  return first ? String(first) : ''
}

function emitFieldValue(
  field: { onChange?: (v: unknown) => void },
  handleChange: ((v: unknown) => void) | undefined,
  value: unknown,
) {
  const fn = handleChange ?? field.onChange
  if (typeof fn === 'function') fn(value)
}

function emitFieldBlur(
  field: { onBlur?: (e: unknown) => void },
  handleBlur: ((e: unknown) => void) | undefined,
  event: FocusEvent,
) {
  const fn = handleBlur ?? field.onBlur
  if (typeof fn === 'function') fn(event)
}

interface ResetForm {
  password: string
  confirmPassword: string
}

const handleSubmit = async (values: ResetForm) => {
  if (!tokenFromQuery.value) return
  loading.value = true
  try {
    await useApi().post('/auth/reset-password', {
      token: tokenFromQuery.value,
      password: values.password,
    })
    passwordChanged.value = true
    toast.success('Пароль оновлено')
  } catch {
    toast.error('Не вдалося змінити пароль. Посилання могло прострочитися.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.registration-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-4);
  background: var(--color-surface);
}

.auth-card {
  width: min(100%, 520px);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 0;
  box-shadow: 0 16px 48px rgba(13, 13, 13, 0.08);
  overflow: hidden;

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

  .card-header {
    padding: var(--space-6) var(--space-6) 0;
    margin-bottom: var(--space-4);

    h2 {
      margin-bottom: var(--space-2);
      font-size: 1.125rem;
      font-family: var(--font-display);
      font-weight: 700;
      color: var(--color-text);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    p {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      font-family: var(--font-sans);
      line-height: 1.45;
    }
  }

  .form-content {
    display: grid;
    gap: var(--space-4);
    padding: 0 var(--space-6) var(--space-6);

    :deep(.auth-field-full) {
      width: 100%;

      input {
        width: 100%;
        min-height: 48px;
        box-sizing: border-box;
      }

      .pass-wrapper {
        width: 100%;
      }
    }

    .submit-btn {
      width: 100%;
      margin-top: var(--space-4);
      padding: 16px var(--space-6);
      border-radius: 0;
      border: 1px solid var(--color-primary);
      background: var(--color-primary);
      color: white;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      cursor: pointer;
      transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--color-text);
        border-color: var(--color-text);
        transform: translateY(-2px);
      }

      &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
    }
  }

  .success-panel {
    padding: var(--space-6);
    text-align: center;

    &__text {
      margin: 0 0 var(--space-5);
      color: var(--color-text);
      font-family: var(--font-sans);
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }
  }

  .card-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-4);
    border-top: 1px solid var(--color-border);
    padding: var(--space-6);

    .footer-link {
      color: var(--color-text);
      font-size: var(--font-size-sm);
      font-family: var(--font-sans);
      font-weight: var(--font-weight-semibold);
      text-decoration: none;
      border-bottom: 1px solid var(--color-text);
      transition:
        color 0.2s ease,
        border-color 0.2s ease;

      &--secondary {
        border-bottom-color: var(--color-border);
        color: var(--color-text-muted);
      }

      &--cta {
        display: inline-block;
        margin-top: var(--space-2);
        padding: 14px var(--space-6);
        border: 1px solid var(--color-primary);
        background: var(--color-primary);
        color: white;
        text-transform: uppercase;
        font-family: var(--font-display);
        font-size: 11px;
        letter-spacing: 1.5px;

        &:hover {
          background: var(--color-text);
          border-color: var(--color-text);
          color: white;
        }
      }

      &:hover {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }
    }
  }
}
</style>
