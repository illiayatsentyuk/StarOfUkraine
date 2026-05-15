<template lang="pug">
.registration-page
  .auth-card
    .header-section
      h1.main-title {{ $t('auth.reset.forgot_title') }}
      p.subtitle {{ $t('auth.reset.forgot_subtitle') }}

    .card-header
      h2 {{ $t('auth.reset.forgot_heading') }}
      p {{ $t('auth.reset.forgot_desc') }}

    VeeForm.form-content(
      v-if="!emailSent"
      :initial-values="{ email: '' }"
      @submit="handleSubmit"
    )
      VeeField(
        v-slot="{ field, errors, errorMessage, handleChange, handleBlur }"
        name="email"
        rules="required|email"
      )
        AppInput.auth-field-full(
          :model-value="field.value"
          :name="field.name"
          type="email"
          :label="`${$t('auth.email_label')} *`"
          :placeholder="$t('auth.email_placeholder')"
          :error-message="fieldErrorText(errorMessage, errors)"
          @update:model-value="emitFieldValue(field, handleChange, $event)"
          @blur="emitFieldBlur(field, handleBlur, $event)"
        )

      button.submit-btn(type="submit" :disabled="loading") {{ $t('auth.reset.submit_btn').toUpperCase() }}

    .success-panel(v-else)
      p.success-panel__text {{ $t('auth.reset.success_text') }}
      p.success-panel__hint {{ $t('auth.reset.success_hint') }}

    .card-footer
      NuxtLink.footer-link.footer-link--row(:to="localePath('/auth')")
        i.pi.pi-arrow-left
        span {{ $t('auth.reset.back_to_login') }}
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const toast = useServerSafeToast()
const loading = ref(false)
const emailSent = ref(false)

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

interface ForgotForm {
  email: string
}

const handleSubmit = async (values: ForgotForm) => {
  loading.value = true
  try {
    await useApi().post('/auth/forgot-password', {
      email: values.email.trim().toLowerCase(),
    })
    emailSent.value = true
    toast.success(t('auth.reset.toast_success'))
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } }).response?.status
    if (status === 404) {
      toast.error(t('auth.reset.toast_user_not_found'))
    } else {
      toast.error(t('auth.reset.toast_send_failed'))
    }
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
    padding: 0 var(--space-6) var(--space-6);

    &__text {
      margin: 0 0 var(--space-3);
      color: var(--color-text);
      font-family: var(--font-sans);
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }

    &__hint {
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      line-height: 1.45;
    }
  }

  .card-footer {
    display: flex;
    justify-content: center;
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

      &:hover {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }

      &--row {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-bottom: none;

        &:hover {
          border-bottom: none;
        }

        .pi {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
