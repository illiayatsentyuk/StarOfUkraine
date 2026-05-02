<template lang="pug">
section.profile
  header.profile__intro
    h1.profile__title Мій профіль
    p.profile__subtitle Керуйте обліковим записом та переглядайте основні дані.

  .profile__card(v-if="loginStore.user")
    .profile__card-inner
      .profile__hero
        .profile__avatar-ring
          .profile__avatar-wrap
            Avatar(
              v-if="loginStore.user.image"
              :image="loginStore.user.image"
              size="xlarge"
              shape="circle"
            )
            Avatar(
              v-else
              icon="pi pi-user"
              size="xlarge"
              shape="circle"
            )
        span.profile__role-pill {{ roleDisplayName }}

      .profile__details
        .profile__detail
          span.profile__detail-label
            i.pi.pi-user.profile__detail-icon(aria-hidden="true")
            | Ім'я
          span.profile__detail-value {{ loginStore.user.name || 'Не вказано' }}

        .profile__detail
          span.profile__detail-label
            i.pi.pi-envelope.profile__detail-icon(aria-hidden="true")
            | Електронна пошта
          span.profile__detail-value {{ loginStore.user.email }}

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

  .profile__card.profile__card--empty(v-else)
    .profile__empty
      .profile__empty-icon(aria-hidden="true")
        i.pi.pi-user
      p.profile__empty-title Немає активної сесії
      p.profile__empty-text Увійдіть, щоб переглянути профіль і керувати обліковим записом.
      NuxtLink.profile__empty-cta(to="/auth") Увійти
</template>

<script setup lang="ts">
const loginStore = useLoginStore()

onMounted(() => {
  if (!loginStore.user && !loginStore.loading) {
    loginStore.fetchUser()
  }
})

const roleDisplayName = computed(() => {
  if (!loginStore.user?.role) return 'Користувач'
  const roles: Record<string, string> = {
    ADMIN: 'Адміністратор',
    USER: 'Користувач',
    JURY: 'Журі'
  }
  return roles[loginStore.user.role] || loginStore.user.role
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

  @include media($md) {
    padding: var(--space-10) var(--space-8);
  }

  &--loading,
  &--empty {
    &:hover {
      transform: none;
      box-shadow: none;
      border-color: var(--color-border);
    }

    &::before {
      opacity: 0.85;
    }
  }

  &--loading {
    min-height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.profile__card-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.profile__hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  text-align: center;
}

.profile__avatar-ring {
  padding: 3px;
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    var(--color-primary) 0%,
    color-mix(in srgb, var(--color-primary) 65%, var(--color-text)) 100%
  );
  box-shadow:
    0 12px 40px color-mix(in srgb, var(--color-primary) 22%, transparent),
    0 2px 8px rgba(13, 13, 13, 0.06);
}

.profile__avatar-wrap {
  padding: 3px;
  border-radius: 50%;
  background: var(--color-bg);

  :deep(.p-avatar.p-avatar-xl) {
    width: 120px;
    height: 120px;
    font-size: 3rem;
  }

  :deep(.p-avatar) {
    border: 1px solid var(--color-border);
  }
}

.profile__role-pill {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  background: var(--color-primary);
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 800;
  color: var(--color-bg);
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.profile__details {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);

  @include media($md) {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8) var(--space-10);
    padding: var(--space-8);
  }
}

.profile__detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
}

.profile__detail-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.profile__detail-icon {
  font-size: 12px;
  color: var(--color-primary);
}

.profile__detail-value {
  font-family: var(--font-display);
  font-size: clamp(1.0625rem, 2vw, 1.25rem);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.35;
  word-break: break-word;
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

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }
}

.profile__loading {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.loading-text) {
    color: var(--color-text-muted);
    font-family: var(--font-display);
    font-size: var(--font-size-sm);
    letter-spacing: 0.08em;
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
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: var(--color-bg);
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }
}
</style>
