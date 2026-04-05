<template lang="pug">
.profile-page
  Card.profile-card
    template(#title)
      h1.profile-card__title Мій профіль

    template(#content)
      .profile-content(v-if="loginStore.user")
        .profile-content__avatar-wrapper
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
        
        .profile-content__info-grid
          .info-group
            span.info-label Ім'я
            span.info-value {{ loginStore.user.name || 'Не вказано' }}
          
          .info-group
            span.info-label Електронна пошта
            span.info-value {{ loginStore.user.email }}
          
          .info-group
            span.info-label Роль
            span.info-value {{ roleDisplayName }}

      .profile-content--empty(v-else)
        p.empty-text Інформація про користувача недоступна. Будь ласка, увійдіть в систему.

    template(#footer)
      .profile-card__footer(v-if="loginStore.user")
        Button(
          label="Вийти"
          icon="pi pi-sign-out"
          severity="danger"
          @click="handleLogout"
        )
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const loginStore = useLoginStore()

onMounted(() => {
  // If user is not yet fetched, fetch it.
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
.profile-page {
  padding: var(--space-4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 200px); // Approximate height, assuming header/footer
  
  @include media($md) {
    padding: var(--space-8);
  }
}

.profile-card {
  width: 100%;
  max-width: 600px;
  background: var(--color-bg);
  border: 1px solid var(--color-border, #e2e8f0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  &__title {
    font-size: var(--font-size-xl, 1.5rem);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text, #1f2937);
    margin: 0;
    text-align: center;
  }
  
  &__footer {
    display: flex;
    justify-content: center;
    padding-top: var(--space-4);
  }
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6, 1.5rem);

  &__avatar-wrapper {
    margin-bottom: var(--space-2);
    // Enlarging the PrimeVue xl avatar slightly
    :deep(.p-avatar.p-avatar-xl) {
      width: 120px;
      height: 120px;
      font-size: 3rem;
    }
  }

  &__info-grid {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    background: #f8fafc;
    padding: var(--space-4);
    border-radius: var(--radius-md, 8px);
    border: 1px solid #e5e7eb;
  }

  &--empty {
    text-align: center;
    color: var(--color-text-muted, #6b7280);
    padding: var(--space-6) 0;
  }
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.75rem;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .info-label {
    font-size: var(--font-size-sm, 0.875rem);
    color: var(--color-text-muted, #64748b);
    font-weight: 500;
  }

  .info-value {
    font-size: var(--font-size-base, 1rem);
    color: var(--color-text, #0f172a);
    font-weight: 600;
  }
}
</style>
