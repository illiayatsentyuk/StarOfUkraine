<template lang="pug">
.registration-page
  .auth-card
    .header-section
      h1.main-title {{ $t('auth.title') }}
      p.subtitle {{ isLogin ? $t('auth.login_subtitle') : $t('auth.signup_subtitle') }}

    .card-header
      h2 {{ isLogin ? $t('auth.login') : $t('auth.signup') }}
      p {{ isLogin ? $t('auth.login_description') : $t('auth.signup_description') }}
    
    .social-grid
      button.social-btn(type="button" @click="loginStore.loginByGoogle()")
        i(class="pi pi-google")
        | Google

    .divider
      span {{ $t('auth.or_email') }}
    
    VeeForm.form-content(@submit="handleRegister")
      VeeField(
        v-slot="{ value, errorMessage, handleChange }"
        name="email"
        rules="required|email"
      )
        AppInput(
          :model-value="value"
          @update:model-value="handleChange"
          type="email"
          :label="$t('auth.email')"
          placeholder="example@mail.com"
        )
        .error-message(v-if="errorMessage") {{ errorMessage }}
      
      .row
        VeeField(
          v-slot="{ value, errorMessage, handleChange }"
          name="password"
          rules="required|min:8"
        )
          AppInput(
            :model-value="value"
            @update:model-value="handleChange"
            type="text"
            :label="$t('auth.password')"
            placeholder="........"
            is-password-field
          )
          .error-message(v-if="errorMessage") {{ errorMessage }}
        
        VeeField(
          v-slot="{ value, errorMessage, handleChange }"
          name="confirmPassword"
          rules="required|confirmed:@password"
        )
          AppInput(
            :model-value="value"
            @update:model-value="handleChange"
            type="password"
            :label="$t('auth.confirm_password')"
            placeholder="........"
          )
          .error-message(v-if="errorMessage") {{ errorMessage }}
      
      // Секція особистих даних
      .personal-info-box(v-if="!isLogin")
        .box-title
          i.pi.pi-user.icon-user
          h3 {{ $t('auth.personal_data') }}
        
        VeeField(
          v-slot="{ value, errorMessage, handleChange }"
          name="fullName"
          rules="required"
        )
          AppInput(
            :model-value="value"
            @update:model-value="handleChange"
            type="text"
            :placeholder="$t('auth.full_name')"
          )
          .error-message(v-if="errorMessage") {{ errorMessage }}
        
        .row
          VeeField(
            v-slot="{ value, errorMessage, handleChange }"
            name="birthDate"
          )
            AppInput(
              :model-value="value"
              @update:model-value="handleChange"
              type="date"
              :label="$t('auth.birth_date')"
              is-mini
            )
            .error-message(v-if="errorMessage") {{ errorMessage }}
          
          VeeField(
            v-slot="{ value, errorMessage, handleChange }"
            name="gender"
          )
            AppInput(
              :model-value="value"
              @update:model-value="handleChange"
              type="select"
              :label="$t('auth.gender')"
              is-mini
            )
              option(value="" disabled selected) {{ $t('auth.gender_select') }}
              option(value="male") {{ $t('auth.gender_male') }}
              option(value="female") {{ $t('auth.gender_female') }}
            .error-message(v-if="errorMessage") {{ errorMessage }}
      
      .terms-check
        VeeField(
          v-slot="{ value, errorMessage, handleChange }"
          name="acceptTerms"
          rules="required"
          type="checkbox"
        )
          input#terms(
            :checked="value"
            @change="handleChange($event.target.checked)"
            type="checkbox"
          )
          label(for="terms")
            | {{ $t('auth.terms_accept') }} 
            a(href="#") {{ $t('auth.terms_link') }}
            |  {{ $t('auth.terms_consent') }}
          .error-message(v-if="errorMessage") {{ errorMessage }}
      
      button.submit-btn(type="submit" :disabled="loginStore.loading") {{ isLogin ? $t('auth.login_btn') : $t('auth.signup_btn') }}
    
    .card-footer
      template(v-if="isLogin")
        | {{ $t('auth.no_account') }} 
        a(href="#" @click.prevent="isLogin = false") {{ $t('auth.switch_to_signup') }}
      template(v-else)
        | {{ $t('auth.have_account') }} 
        a(href="#" @click.prevent="isLogin = true") {{ $t('auth.switch_to_login') }}
</template>

<script setup lang="ts">
import {useLoginStore} from "~/stores/auth.store"
import { ref } from 'vue'

const isLogin = ref(true)
const loginStore = useLoginStore()
const route = useRoute()

// Автоматичний редирект, як тільки користувач залогінився
watch(() => loginStore.user, (user) => {
  if (user) {
    navigateTo('/profile')
  }
}, { immediate: true })

onMounted(() => {
  // Якщо ми повернулися після Google Auth з успіхом
  if (route.query.oauth === 'success') {
    // app.vue вже викликає fetchUser, тому ми просто чекаємо результату через watch
    console.log('Google Auth success, waiting for user data...')
  }
})

import type { AuthFormData } from '~/types'

const handleRegister = async (values: AuthFormData) => {
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
  padding: 2rem 1rem;
}

.auth-card {
  width: min(100%, 520px);
  background: var(--color-bg);
  border: var(--pencil-border);
  border-radius: var(--pencil-radius);
  box-shadow: var(--pencil-shadow);
  overflow: hidden;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);


  .header-section {
    position: static;
    text-align: center;
    margin: 0;
    padding: 2rem 1.5rem 1.5rem;
    background: var(--color-bg);
    border-bottom: var(--pencil-border);
    border-radius: 0;

    .main-title {
      font-family: var(--font-display);
      font-size: clamp(1.8rem, 4vw, 2.4rem);
      color: var(--color-text);
      font-weight: 700;
      letter-spacing: -1px;
      text-transform: uppercase;
      margin-bottom: 0.2rem;
    }

    .subtitle {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      font-family: var(--font-sans);
    }
  }

  .card-header {
    padding: 1.5rem 1.5rem 0;
    margin-bottom: 1rem;

    h2 {
      margin-bottom: 0.25rem;
      font-size: 1.4rem;
      font-family: var(--font-display);
      font-weight: 600;
      color: var(--color-text);
      text-transform: uppercase;
    }
    p {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
  }

  .social-grid {
    display: grid;
    gap: 0.75rem;
    padding: 0 1.5rem 1rem;

    .social-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.7rem;
      border-radius: var(--pencil-radius);
      border: 1px solid black;
      border-radius: 10px;
      background: var(--color-bg);
      font-weight: 500;
      color: var(--color-text);
      font-family: var(--font-sans);
      cursor: pointer;
      transition: var(--pencil-transition);
      width: 100%;

      i {
        font-size: 1rem;
      }

      &:hover {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .divider {
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    margin: 0.5rem 1.5rem 1.5rem;
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
      padding: 0 0.75rem;
      z-index: 2;
      border-radius: 0;
      border: none;
    }
  }

  .form-content {
    display: grid;
    gap: 1rem;
    padding: 0 1.5rem 1.5rem;

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 780px) {
        grid-template-columns: 1fr;
      }
    }

    .personal-info-box {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      background: transparent;
      border: none;
      padding: 0;
      margin-top: 0.5rem;

      .box-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
        border-bottom: 2px solid var(--color-text);
        padding-bottom: 0.5rem;

        i.icon-user {
          font-size: 1.2rem;
          color: var(--color-text);
        }

        h3 {
          margin: 0;
          font-size: 1.1rem;
          font-family: var(--font-display);
          font-weight: 700;
          text-transform: uppercase;
          color: var(--color-text);
          letter-spacing: -0.5px;
        }
      }
    }

    .terms-check {
      display: flex;
      align-items: flex-start;
      gap: 0.55rem;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
      margin-top: 1rem;

      input[type="checkbox"] {
        margin-top: 0.2rem;
        accent-color: var(--color-primary);
        border: var(--pencil-border);
        border-radius: 0;
      }

      a {
        color: var(--color-primary);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: var(--pencil-transition);

        &:hover {
          border-bottom-color: var(--color-primary);
        }
      }
    }

    .submit-btn {
      width: 100%;
      margin-top: 1rem;
      padding: 1rem;
      border-radius: var(--pencil-radius);
      border: 1px solid var(--color-text);
      background: var(--color-text);
      color: var(--color-bg);
      font-weight: 600;
      font-size: 1rem;
      font-family: var(--font-display);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: var(--pencil-transition);

      &:hover {
        background: var(--color-bg);
        color: var(--color-text);
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: var(--pencil-border-light);
    padding: 1.5rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin-top: 0;

    a {
      color: var(--color-text);
      font-weight: 600;
      text-decoration: none;
      margin-left: 0.5rem;
      border-bottom: 1px solid var(--color-text);
      transition: var(--pencil-transition);

      &:hover {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }
    }
  }
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
