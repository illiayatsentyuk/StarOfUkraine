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
    
    .card-footer
      template(v-if="isLogin")
        | {{ $t('auth.no_account') }} 
        a(href="#" @click.prevent="isLogin = false") {{ $t('auth.register_link') }}
      template(v-else)
        | {{ $t('auth.has_account') }} 
        a(href="#" @click.prevent="isLogin = true") {{ $t('auth.login_link') }}
</template>

<script setup lang="ts">
import { useLoginStore } from '~/stores/auth.store'

const localePath = useLocalePath()
const loginStore = useLoginStore()
const route = useRoute()

interface FormData {
  email: string
  password: string
  confirmPassword?: string
  fullName?: string
  birthDate?: string
  gender?: string
  acceptTerms?: boolean
}

const authInitialValues: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  birthDate: '',
  gender: '',
  acceptTerms: false,
}

const isLogin = ref(true)

// Автоматичний редирект, як тільки користувач залогінився
watch(() => loginStore.user, (user) => {
  if (user) {
    navigateTo(localePath('/'))
  }
}, { immediate: true })

const handleRegister = async (values: FormData) => {
  const toast = useServerSafeToast()
  try {
    if (isLogin.value) {
      await loginStore.loginByEmail({
        email: values.email,
        password: values.password
      })
    } else {
      await loginStore.signupByEmail(values)
    }
  } catch (e: any) {
    const msg = e.response?.data?.message || 'Помилка авторизації'
    toast.error(msg)
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
  padding: 40px 16px;
  background: var(--color-bg-secondary);
}

.auth-card {
  width: min(100%, 520px);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 0;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--color-border);
  padding: 24px;
  font-size: 14px;
  color: var(--color-text-muted);

  a {
    color: var(--color-text);
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid var(--color-text);
    transition: all 0.2s ease;

    &:hover {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
    }
  }
}
</style>
