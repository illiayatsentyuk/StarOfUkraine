<template lang="pug">
.social-auth
  .card-header
    h2 {{ isLogin ? 'Вхід' : 'Реєстрація' }}
    p {{ isLogin ? 'Швидкий вхід за допомогою соцмереж або пошти' : 'Швидкий вхід або заповнення даних' }}
  
  .social-grid
    button.social-btn(type="button" @click="$emit('login-google')")
      i(class="pi pi-google")
      | Google

  .divider
    span або пошта
</template>

<script setup lang="ts">
defineProps<{
  isLogin: boolean
}>()

defineEmits<{
  (e: 'login-google'): void
}>()
</script>

<style scoped lang="scss">
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
</style>
