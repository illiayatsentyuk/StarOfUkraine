<template lang="pug">
.registration-page
  .header-section
    h1.main-title Tournament Hub
    p.subtitle Створіть свій особистий профіль
  
  .auth-card
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
