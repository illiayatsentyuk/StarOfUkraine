<template lang="pug">
.profile__card.profile__card--empty
  .profile__empty
    .profile__empty-icon(aria-hidden="true")
      i.pi.pi-user
    p.profile__empty-title Немає активної сесії
    p.profile__empty-text Увійдіть, щоб переглянути профіль і керувати обліковим записом.
    NuxtLink.profile__empty-cta(:to="localePath('/auth')") Увійти
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>

<style scoped lang="scss">
.profile__card {
  position: relative;
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  padding: var(--space-8) var(--space-6);
  overflow: hidden;

  &--empty {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: var(--color-primary);
      opacity: 0.85;
    }
  }
}

.profile__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-4);
  max-width: 26rem;
  margin: 0 auto;
}

.profile__empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);

  i {
    font-size: 1.75rem;
  }
}

.profile__empty-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.profile__empty-text {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.6;
}

.profile__empty-cta {
  margin-top: var(--space-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4) var(--space-8);
  background: var(--color-primary);
  color: var(--color-bg);
  border: 1px solid var(--color-primary);
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--color-bg);
    color: var(--color-primary);
  }
}
</style>
