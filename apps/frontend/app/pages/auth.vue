<template lang="pug">
.registration-page
  .auth-card
    AuthHero(:isLogin="isLogin")

    AuthSocial(
      :isLogin="isLogin"
      @login-google="() => loginStore.loginByGoogle()"
    )
    
    AuthForm(
      :isLogin="isLogin"
      :loading="loginStore.loading"
      :initialValues="authInitialValues"
      @submit="handleRegister"
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

      .forgot-row(v-if="isLogin")
        NuxtLink.forgot-row__link(to="/forgot-password") Забули пароль?

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
      
      button.submit-btn(type="submit" :disabled="loginStore.loading") {{ isLogin ? 'УВІЙТИ' : 'ЗАРЕЄСТРУВАТИСЯ' }}
    
    .card-footer
      template(v-if="isLogin")
        | Немає акаунта? 
        a(href="#" @click.prevent="isLogin = false") Зареєструватися
      template(v-else)
        | Вже є акаунт? 
        a(href="#" @click.prevent="isLogin = true") Увійти
</template>

<script setup lang="ts">
const authInitialValues = {
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  birthDate: '',
  gender: '',
  acceptTerms: false,
}

const isLogin = ref(true)
const loginStore = useLoginStore()
const route = useRoute()

// Автоматичний редирект, як тільки користувач залогінився
watch(() => loginStore.user, (user) => {
  if (user) {
    navigateTo('/')
  }
}, { immediate: true })

onMounted(() => {
  // Якщо ми повернулися після Google Auth з успіхом
  if (route.query.oauth === 'success') {
    console.log('Google Auth success, waiting for user data...')
  }
})

interface FormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  birthDate: string
  gender: string
  acceptTerms: boolean
}

const handleRegister = async (values: FormData) => {
  if (isLogin.value) {
    await loginStore.loginByEmail({
      email: values.email,
      password: values.password
    })
  } else {
    await loginStore.signupByEmail(values)
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

  .social-grid {
    display: grid;
    gap: var(--space-3);
    padding: 0 var(--space-6) var(--space-4);

    .social-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: 14px var(--space-5);
      border-radius: 0;
      border: 1px solid var(--color-text);
      background: var(--color-bg);
      font-family: var(--font-display);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--color-text);
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease,
        transform 0.2s ease;
      width: 100%;

      i {
        font-size: 1rem;
      }

      &:hover {
        background: var(--color-text);
        color: var(--color-bg);
        transform: translateY(-2px);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

    .forgot-row {
      display: flex;
      justify-content: flex-end;
      margin-top: calc(-1 * var(--space-2));

      &__link {
        font-family: var(--font-sans);
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition:
          color 0.2s ease,
          border-color 0.2s ease;

        &:hover {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }
      }
    }

    .divider {
      text-align: center;
    color: var(--color-text-muted);
    font-size: 10px;
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin: var(--space-2) var(--space-6) var(--space-6);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--color-border);
      z-index: 1;
    }

    span {
      position: relative;
      background: var(--color-bg);
      padding: 0 var(--space-3);
      z-index: 2;
    }
  }

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

  .card-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-1);
    border-top: 1px solid var(--color-border);
    padding: var(--space-6);
    font-size: var(--font-size-sm);
    font-family: var(--font-sans);
    color: var(--color-text-muted);

    a {
      color: var(--color-text);
      font-weight: var(--font-weight-semibold);
      text-decoration: none;
      margin-left: var(--space-1);
      border-bottom: 1px solid var(--color-text);
      transition: color 0.2s ease, border-color 0.2s ease;

      &:hover {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }
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
