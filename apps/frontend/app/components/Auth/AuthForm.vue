<template lang="pug">
VeeForm.form-content(
  :initial-values="initialValues"
  @submit="$emit('submit', $event)"
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
      label="Електронна пошта *"
      placeholder="example@mail.com"
      :error-message="fieldErrorText(errorMessage, errors)"
      @update:model-value="emitFieldValue(field, handleChange, $event)"
      @blur="emitFieldBlur(field, handleBlur, $event)"
    )

  VeeField(
    v-slot="{ field, errors, errorMessage, handleChange, handleBlur }"
    name="password"
    rules="required|min:8"
  )
    AppInput.auth-field-full(
      :model-value="field.value"
      :name="field.name"
      type="text"
      label="Пароль *"
      placeholder="........"
      is-password-field
      :error-message="fieldErrorText(errorMessage, errors)"
      @update:model-value="emitFieldValue(field, handleChange, $event)"
      @blur="emitFieldBlur(field, handleBlur, $event)"
    )

  .forgot-password-row(v-if="isLogin")
    NuxtLink.forgot-password-link(to="/forgot-password") Забули пароль?

  VeeField(
    v-if="!isLogin"
    v-slot="{ field, errors, errorMessage, handleChange, handleBlur }"
    name="confirmPassword"
    rules="required|confirmed:@password"
  )
    AppInput.auth-field-full(
      :model-value="field.value"
      :name="field.name"
      type="password"
      label="Повтор пароля *"
      placeholder="........"
      :error-message="fieldErrorText(errorMessage, errors)"
      @update:model-value="emitFieldValue(field, handleChange, $event)"
      @blur="emitFieldBlur(field, handleBlur, $event)"
    )

  // Секція особистих даних
  .personal-info-box(v-if="!isLogin")
    .box-title
      i.pi.pi-user.icon-user
      h3 Особисті дані

    VeeField(
      v-slot="{ field, errors, errorMessage, handleChange, handleBlur }"
      name="fullName"
      rules="required"
    )
      AppInput(
        :model-value="field.value"
        :name="field.name"
        type="text"
        label="Повне ім'я *"
        placeholder="Іван Іваненко"
        :error-message="fieldErrorText(errorMessage, errors)"
        @update:model-value="emitFieldValue(field, handleChange, $event)"
        @blur="emitFieldBlur(field, handleBlur, $event)"
      )

    .row
      VeeField(
        v-slot="{ field, errors, errorMessage, handleChange, handleBlur }"
        name="birthDate"
      )
        AppInput(
          :model-value="field.value"
          :name="field.name"
          type="date"
          label="Дата народження"
          is-mini
          :error-message="fieldErrorText(errorMessage, errors)"
          @update:model-value="emitFieldValue(field, handleChange, $event)"
          @blur="emitFieldBlur(field, handleBlur, $event)"
        )

      VeeField(
        v-slot="{ field, errors, errorMessage, handleChange, handleBlur }"
        name="gender"
      )
        AppInput(
          :model-value="field.value"
          :name="field.name"
          type="select"
          label="Стать"
          is-mini
          :error-message="fieldErrorText(errorMessage, errors)"
          @update:model-value="emitFieldValue(field, handleChange, $event)"
          @blur="emitFieldBlur(field, handleBlur, $event)"
        )
          option(value="" disabled selected) Оберіть
          option(value="male") Чоловіча
          option(value="female") Жіноча

  VeeField(
    v-if="!isLogin"
    v-slot="{ field, errors, errorMessage }"
    name="acceptTerms"
    rules="required"
    type="checkbox"
  )
    .terms-check(
      :class="{ 'terms-check--invalid': Boolean(fieldErrorText(errorMessage, errors)) }"
    )
      label.terms-check__field-label(for="terms") Згода з умовами *
      .error-message(v-if="fieldErrorText(errorMessage, errors)") {{ fieldErrorText(errorMessage, errors) }}
      .terms-check__row
        input#terms(type="checkbox" v-bind="field")
        label.terms-check__legal(for="terms")
          | Я приймаю 
          a(href="#" @click.prevent.stop) Умови використання
          |  та надаю згоду на обробку даних.
  
  button.submit-btn(type="submit" :disabled="loading") {{ isLogin ? 'УВІЙТИ' : 'ЗАРЕЄСТРУВАТИСЯ' }}
</template>

<script setup lang="ts">
const props = defineProps<{
  isLogin: boolean
  loading: boolean
  initialValues: any
}>()

defineEmits<{
  (e: 'submit', values: any): void
}>()

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
</script>

<style scoped lang="scss">
.form-content {
  display: grid;
  gap: var(--space-4);
  padding: 0 var(--space-6) var(--space-6);

  :deep(.input-group) {
    label {
      font-family: var(--font-sans);
      font-size: var(--font-size-sm);
      color: var(--color-text);
    }

    input,
    select {
      border-radius: 0;
      border: 1px solid var(--color-border);
      padding: var(--space-3) var(--space-4);
      font-family: var(--font-sans);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:focus {
        outline: none;
        border-color: var(--color-text);
        box-shadow: 0 0 0 1px var(--color-text);
      }
    }

    .pass-wrapper input {
      border-radius: 0;
    }
  }

  :deep(.input-group--invalid) {
    input,
    select {
      border-color: var(--color-error);

      &:focus {
        border-color: var(--color-error);
        box-shadow: 0 0 0 1px var(--color-error);
      }
    }
  }

  :deep(.auth-field-full) {
    width: 100%;

    input,
    select {
      width: 100%;
      min-height: 48px;
      box-sizing: border-box;
    }

    .pass-wrapper {
      width: 100%;

      input {
        width: 100%;
        min-height: 48px;
      }
    }
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);

    @media (max-width: 780px) {
      grid-template-columns: 1fr;
    }
  }

  .personal-info-box {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding: 0;
    margin-top: var(--space-2);

    .box-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
      border-bottom: 2px solid var(--color-text);
      padding-bottom: var(--space-3);

      i.icon-user {
        font-size: 1.125rem;
        color: var(--color-text);
      }

      h3 {
        margin: 0;
        font-size: 1rem;
        font-family: var(--font-display);
        font-weight: 700;
        text-transform: uppercase;
        color: var(--color-text);
        letter-spacing: 1px;
      }
    }
  }

  .terms-check {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-family: var(--font-sans);
    margin-top: var(--space-4);
    line-height: 1.5;

    &__field-label {
      display: block;
      font-weight: var(--font-weight-medium);
      color: var(--color-text);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-2);
      cursor: pointer;
    }

    &__legal {
      flex: 1;
      cursor: pointer;
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    &__row {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
    }

    &--invalid .terms-check__row {
      padding: var(--space-2);
      border: 1px solid var(--color-error);
    }

    input[type='checkbox'] {
      margin-top: 0.2rem;
      accent-color: var(--color-primary);
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    a {
      color: var(--color-primary);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s ease, color 0.2s ease;

      &:hover {
        border-bottom-color: var(--color-primary);
      }
    }
  }

  .forgot-password-row {
    display: flex;
    justify-content: flex-end;
    margin-top: calc(-1 * var(--space-2));
  }

  .forgot-password-link {
    font-size: var(--font-size-sm);
    font-family: var(--font-sans);
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-primary);
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
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

    &:hover:not(:disabled) {
      background: var(--color-text);
      border-color: var(--color-text);
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }
  }
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  font-family: var(--font-sans);
  margin-bottom: var(--space-2);
}
</style>
