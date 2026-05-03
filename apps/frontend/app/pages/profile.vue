<template lang="pug">
section.profile
  header.profile__intro
    h1.profile__title Мій профіль
    p.profile__subtitle Керуйте обліковим записом та переглядайте основні дані.

  .profile__card(v-if="loginStore.user")
    .profile__card-inner
      ProfileHero(:user="loginStore.user")
      ProfileInfo(:user="loginStore.user")

      .profile__actions
        button.profile__logout(
          type="button"
          @click="handleLogout"
        )
          i.pi.pi-sign-out(aria-hidden="true")
          span Вийти

  .profile__card.profile__card--loading(v-else-if="loginStore.loading")
    .profile__loading
      Loader

  ProfileEmpty(v-else)
</template>

<script setup lang="ts">
const loginStore = useLoginStore()

onMounted(() => {
  if (!loginStore.user && !loginStore.loading) {
    loginStore.fetchUser()
  }
})

const handleLogout = async () => {
  await loginStore.logout()
}
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-8);
  padding: var(--space-8) 0 var(--space-10);
  width: 100%;
  max-width: 720px;
  margin-inline: auto;
}

.profile__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.profile__title {
  font-family: var(--font-display);
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 700;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: -1.5px;
  line-height: 1;
  margin: 0;
}

.profile__subtitle {
  margin: 0;
  max-width: 36rem;
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-muted);
  line-height: 1.55;
}

.profile__card {
  position: relative;
  width: 100%;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  padding: var(--space-8) var(--space-6);
  overflow: hidden;
  transition:
    border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: var(--color-primary);
    transform: translateY(0);
    transition: transform 0.35s ease;
  }

  &:hover {
    border-color: var(--color-text);
    box-shadow: 0 20px 48px rgba(13, 13, 13, 0.06);
    transform: translateY(-2px);
  }

  @media (min-width: 768px) {
    padding: var(--space-10) var(--space-8);
  }

  &--loading {
    min-height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      transform: none;
      box-shadow: none;
      border-color: var(--color-border);
    }
  }
}

.profile__card-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.profile__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
  padding-top: var(--space-2);
}

.profile__logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 48px;
  padding: var(--space-4) var(--space-10);
  background: var(--color-text);
  color: var(--color-bg);
  border: 1px solid var(--color-text);
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;

  i {
    font-size: 1rem;
  }

  &:hover {
    opacity: 0.92;
    background: var(--color-bg);
    color: var(--color-text);
  }
}

.profile__loading {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
