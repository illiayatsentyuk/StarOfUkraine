<template lang="pug">
.registration-page
  .auth-card
    .header-section
      h1.main-title Tournament Hub
      p.subtitle {{ isLogin ? 'Увійдіть до свого профілю' : 'Створіть свій особистий профіль' }}

    .card-header
      h2 {{ isLogin ? 'Вхід' : 'Реєстрація' }}
      p {{ isLogin ? 'Швидкий вхід за допомогою соцмереж або пошти' : 'Швидкий вхід або заповнення даних' }}
    
    .social-grid
      button.social-btn(type="button" @click="loginStore.login()")
        i(class="pi pi-google")
        | Google
      
      button.social-btn(type="button")
        i(class="pi pi-github")
        | GitHub

    .divider
      span або пошта
    
    form.form-content(@submit.prevent="handleSubmit")
      AppInput(
        v-model="form.email"
        type="email"
        label="Електронна пошта *"
        placeholder="example@mail.com"
        required
      )
      
      template(v-if="!isLogin")
        .row
          AppInput(
            v-model="form.password"
            type="password"
            label="Пароль *"
            placeholder="........"
            is-password-field
            required
          )
          
          AppInput(
            v-model="form.confirmPassword"
            type="password"
            label="Повтор пароля *"
            placeholder="........"
            required
          )
      template(v-else)
        AppInput(
          v-model="form.password"
          type="password"
          label="Пароль *"
          placeholder="........"
          is-password-field
          required
        )
      
      // Секція особистих даних
      .personal-info-box(v-if="!isLogin")
        .box-title
          i.pi.pi-user.icon-user
          h3 Особисті дані
        
        AppInput(
          v-model="form.fullName"
          type="text"
          placeholder="Повне ім'я *"
          required
        )
        
        .row
          AppInput(
            v-model="form.birthDate"
            type="date"
            label="Дата народження"
            is-mini
          )
          
          AppInput(
            v-model="form.gender"
            type="select"
            label="Стать"
            is-mini
          )
            option(value="" disabled selected) Оберіть
            option(value="male") Чоловіча
            option(value="female") Жіноча
      
      .terms-check(v-if="!isLogin")
        input#terms(v-model="form.acceptTerms" type="checkbox" required)
        label(for="terms")
          | Я приймаю 
          a(href="#") Умови використання
          |  та надаю згоду на обробку даних.
      
      button.submit-btn(type="submit") {{ isLogin ? 'УВІЙТИ' : 'ЗАРЕЄСТРУВАТИСЯ' }}
    
    .card-footer
      template(v-if="isLogin")
        | Немає акаунта? 
        a(href="#" @click.prevent="isLogin = false") Зареєструватися
      template(v-else)
        | Вже є акаунт? 
        a(href="#" @click.prevent="isLogin = true") Увійти
</template>

<script setup lang="ts">
import {useLoginStore} from "~/stores/login.store"

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
    // app.vue вже викликає fetchUser, тому ми просто чекаємо результату через watch
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

const form = reactive<FormData>({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  birthDate: '',
  gender: '',
  acceptTerms: false
})

const isLogin = ref(false)

const handleSubmit = () => {
  if (isLogin.value) {
    console.log('Login Дані:', { email: form.email, password: form.password })
    // TODO: Add API call to login user
  } else {
    if (form.password !== form.confirmPassword) {
      alert('Паролі не збігаються!')
      return
    }
    console.log('Дані форми:', form)
    // TODO: Add API call to register user
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
  background: var(--color-surface);
}

.auth-card {
  width: min(100%, 520px);
  background: var(--color-bg);
  border: var(--pencil-border);
  border-radius: var(--pencil-radius);
  box-shadow: var(--pencil-shadow);
  overflow: hidden;

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
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    padding: 0 1.5rem 1rem;

    .social-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.7rem;
      border-radius: var(--pencil-radius);
      border: var(--pencil-border-light);
      background: var(--color-bg);
      font-weight: 500;
      color: var(--color-text);
      font-family: var(--font-sans);
      cursor: pointer;
      transition: var(--pencil-transition);

      i {
        font-size: 1rem;
      }

      &:hover {
        border: var(--pencil-border);
        background: var(--color-surface);
        box-shadow: none;
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
</style>
