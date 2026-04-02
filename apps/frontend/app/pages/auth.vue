<template lang="pug">
.registration-page
  .auth-card
    .header-section
      h1.main-title Tournament Hub
      p.subtitle Створіть свій особистий профіль

    .card-header
      h2 Реєстрація
      p Швидкий вхід або заповнення даних
    
    .social-grid
      button.social-btn(type="button")
        i(class="pi pi-google")
        | Google
      
      button.social-btn(type="button")
        i(class="pi pi-github")
        | GitHub

    .divider
      span або пошта
    
    form.form-content(@submit.prevent="handleRegister")
      AppInput(
        v-model="form.email"
        type="email"
        label="Електронна пошта *"
        placeholder="example@mail.com"
        required
      )
      
      .row
        AppInput(
          v-model="form.password"
          type="text"
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
      
      // Секція особистих даних
      .personal-info-box
        .box-title
          span.icon-user 👤
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
      
      .terms-check
        input#terms(v-model="form.acceptTerms" type="checkbox" required)
        label(for="terms")
          | Я приймаю 
          a(href="#") Умови використання
          |  та надаю згоду на обробку даних.
      
      button.submit-btn(type="submit") Зареєструватися
    
    .card-footer
      | Вже є акаунт? 
      a(href="#") Увійти
</template>

<script setup lang="ts">
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

const handleRegister = () => {
  if (form.password !== form.confirmPassword) {
    alert('Паролі не збігаються!')
    return
  }
  console.log('Дані форми:', form)
  // TODO: Add API call to register user
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
  background: #f0f2f6;
}

.header-section {
  position: static;
  top: unset;
  left: unset;
  transform: none;
  text-align: center;
  margin: 0;
  padding: 1rem 1rem 0.75rem;
  background: #ffffff;
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid #e6eaf0;

  .main-title {
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    color: #0f172a;
    font-weight: 800;
    margin-bottom: 0.2rem;
  }

  .subtitle {
    color: #555;
    font-size: 0.95rem;
  }
}

.auth-card {
  width: min(100%, 520px);
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(12, 24, 67, 0.12);
  border: 1px solid #e2e8f0;
  padding: 15px;
  overflow: hidden;

  .card-header {
    margin-bottom: 1rem;

    h2 {
      margin-bottom: 0.25rem;
      font-size: 1.4rem;
      color: #991b1b;
    }
    p {
      color: #6b7280;
      font-size: 0.95rem;
    }
  }

  .social-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;

    .social-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.7rem;
      border-radius: 10px;
      border: 1px solid #d1d5db;
      background: #fff;
      font-weight: 600;
      color: #1f2937;
      cursor: pointer;
      transition: all 0.2s ease;

      i {
        font-size: 1rem;
      }

      &:hover {
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
      }
    }
  }

  .divider {
    text-align: center;
    color: #6b7280;
    font-size: 0.9rem;
    margin: 1.1rem 0;

    span {
      display: inline-block;
      background: #f8fafc;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      border: 1px solid #e5e7eb;
    }
  }

  .form-content {
    display: grid;
    gap: 0.8rem;

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;

      @media (max-width: 780px) {
        grid-template-columns: 1fr;
      }
    }

    .personal-info-box {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 0.9rem;

      .box-title {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        margin-bottom: 0.7rem;

        span.icon-user {
          font-size: 1.05rem;
        }

        h3 {
          margin: 0;
          font-size: 1rem;
          color: #334155;
        }
      }

      AppInput {
        margin-bottom: 0.8rem;
      }
    }

    .terms-check {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      color: #475569;
      font-size: 0.9rem;

      a {
        color: #dc2626;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .submit-btn {
      width: 100%;
      margin-top: 0.4rem;
      padding: 0.8rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(90deg, #ef4444, #dc2626);
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: linear-gradient(90deg, #dc2626, #b91c1c);
      }
    }
  }

  .card-footer {
    margin-top: 1.1rem;
    font-size: 0.93rem;
    color: #475569;

    a {
      color: #dc2626;
      font-weight: 700;
      text-decoration: none;
      margin-left: 0.2rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
