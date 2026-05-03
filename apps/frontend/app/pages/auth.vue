<template lang="pug">
.registration-page
  .auth-card
    AuthHero(:isLogin="isLogin")

    AuthSocial(
      :isLogin="isLogin"
      @loginGoogle="loginStore.loginByGoogle()"
    )
    
    AuthForm(
      :isLogin="isLogin"
      :loading="loginStore.loading"
      :initialValues="authInitialValues"
      @submit="handleRegister"
    )
    
    AuthFooter(
      :isLogin="isLogin"
      @toggleMode="isLogin = $event"
    )
</template>

<script setup lang="ts">
import { useLoginStore } from "~/stores/auth.store"
import { ref, watch, onMounted } from 'vue'

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
}
</style>
