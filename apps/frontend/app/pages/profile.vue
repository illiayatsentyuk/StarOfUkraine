<template lang="pug">
.user-profile-scoped-wrapper
  ClientOnly
    .profile-page
      .profile-page__content(v-if="loginStore.user")
        //- Left column: Profile card
        .profile-sidebar
          .profile-sidebar__banner

          .profile-sidebar__body
            .avatar-section
              .avatar-container(@click="triggerFileInput")
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
                .avatar-overlay
                  i.pi.pi-camera
                  span {{ $t('profile.change_photo') }}

              input(
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="onFileChange"
              )

            h2.profile-sidebar__name {{ loginStore.user.name || $t('profile.not_specified') }}
            span.profile-sidebar__handle(v-if="loginStore.user.nameId") @{{ loginStore.user.nameId }}

            .role-badge
              span.role-badge__dot
              span.role-badge__text {{ roleDisplayName }}

          .profile-sidebar__divider

          .profile-sidebar__logout
            button.btn-logout(@click="handleLogout")
              i.pi.pi-sign-out
              span {{ $t('profile.logout') }}

        //- Right column: Details panel
        .profile-details
          .profile-details__header
            h2.profile-details__title {{ $t('profile.title') }}

          .profile-details__divider

          .profile-details__grid
            .info-row
              .info-field
                label.info-field__label {{ $t('profile.name') }}
                span.info-field__value {{ loginStore.user.name || $t('profile.not_specified') }}
              .info-field
                label.info-field__label {{ $t('profile.email') }}
                span.info-field__value {{ loginStore.user.email }}

            .info-row__divider

            .info-row
              .info-field
                label.info-field__label {{ $t('profile.role') }}
                span.info-field__value {{ roleDisplayName }}
              .info-field
                label.info-field__label {{ $t('profile.member_since') }}
                span.info-field__value {{ memberSince }}

            .info-row__divider

            .teams-section(v-if="loginStore.user")
              h3.teams-section__title {{ $t('profile.my_teams') }}
              p.teams-section__empty {{ $t('profile.no_teams') }}

      //- Empty state
      .profile-page__empty(v-else)
        .empty-card
          i.pi.pi-user.empty-card__icon
          p.empty-card__text {{ $t('profile.empty_text') }}
    template(#fallback)
      .profile-page
        .profile-page__empty
          .empty-card
            i.pi.pi-spin.pi-spinner.empty-card__icon
            p.empty-card__text {{ $t('profile.empty_text') }}
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

const { t } = useI18n()
const loginStore = useLoginStore()
const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    if (file.size > 5 * 1024 * 1024) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        loginStore.setLocalProfileImage(result)
      }
    }
    reader.readAsDataURL(file)
  }
}

onMounted(() => {
  // Placeholder for now
})

const roleDisplayName = computed(() => {
  if (!loginStore.user?.role) return t('profile.roles.user')
  const roles: Record<string, string> = {
    ADMIN: t('profile.roles.admin'),
    USER: t('profile.roles.user'),
    JURY: t('profile.roles.jury')
  }
  return roles[loginStore.user.role] || loginStore.user.role
})

const memberSince = computed(() => {
  if (!loginStore.user?.createdAt) return '—'
  const date = new Date(loginStore.user.createdAt)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const handleLogout = async () => {
  await loginStore.logout()
}
</script>

<style lang="scss">
.user-profile-scoped-wrapper {
.profile-page {
  padding: var(--space-4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 80px);
  background: var(--color-surface, #FAFAFA);

  @include media($md) {
    padding: 48px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    max-width: 960px;
    align-items: flex-start;

    @include media($md) {
      flex-direction: row;
      gap: 32px;
      align-items: flex-start;
    }
  }

  &__empty {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 400px;
  }
}

// ─── Left Column: Profile Sidebar ───
.profile-sidebar {
  width: 100%;
  background: var(--color-bg, #FFFFFF);
  border-radius: 8px;
  border: 1px solid var(--color-border, #E8E8E8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin: 0;
  align-self: flex-start;

  @include media($md) {
    width: 360px;
    flex-shrink: 0;
  }

  &__banner {
    width: 100%;
    height: 120px;
    background: linear-gradient(135deg, var(--color-primary, #E42313), #ff6b5e);
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 32px 24px;
    margin-top: -56px;
    gap: 8px;
  }

  &__name {
    font-family: var(--font-display, 'Space Grotesk', sans-serif);
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text, #0D0D0D);
    margin: 4px 0 0;
    text-align: center;
  }

  &__handle {
    font-family: var(--font-sans, 'Inter', sans-serif);
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-muted, #7A7A7A);
  }

  &__actions {
    padding: 0 24px 16px;
  }

  &__divider {
    height: 1px;
    background: var(--color-border, #E8E8E8);
    margin: 0 24px;
  }

  &__logout {
    padding: 16px 24px 24px;
  }
}

.avatar-section {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  .avatar-container {
    position: relative;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
    box-sizing: border-box;
    width: 104px;
    height: 104px;
    background-color: var(--color-bg, #FFFFFF);
    display: flex;
    align-items: center;
    justify-content: center;
    align-items: center;
    border: 4px solid var(--color-bg, #FFFFFF);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);

      .avatar-overlay {
        opacity: 1;
      }
      :deep(.p-avatar) {
        filter: brightness(0.7);
      }
    }
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease;
    font-size: 0.7rem;
    font-weight: 600;
    text-align: center;

    i {
      font-size: 1.25rem;
      margin-bottom: 2px;
    }
  }

  :deep(.p-avatar.p-avatar-xl) {
    width: 96px;
    height: 96px;
    font-size: 2.5rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 100px;
  background: #FEF2F2;
  margin-top: 4px;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-primary, #E42313);
  }

  &__text {
    font-family: var(--font-sans, 'Inter', sans-serif);
    font-size: 12px;
    font-weight: 600;
    color: var(--color-primary, #E42313);
  }
}

.btn-change-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 40px;
  border-radius: 6px;
  border: 1px solid var(--color-border, #E8E8E8);
  background: var(--color-bg, #FFFFFF);
  color: var(--color-text, #0D0D0D);
  font-family: var(--font-sans, 'Inter', sans-serif);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-surface, #FAFAFA);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  }
}

.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 40px;
  border-radius: 6px;
  border: none;
  background: #FEF2F2;
  color: var(--color-primary, #E42313);
  font-family: var(--font-sans, 'Inter', sans-serif);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #FDE8E8;
  }
}

// ─── Right Column: Profile Details ───
.profile-details {
  flex: 1;
  background: var(--color-bg, #FFFFFF);
  border-radius: 8px;
  border: 1px solid var(--color-border, #E8E8E8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin: 0;
  align-self: flex-start;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32px 32px 24px;
  }

  &__title {
    font-family: var(--font-display, 'Space Grotesk', sans-serif);
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text, #0D0D0D);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin: 0;
  }

  &__divider {
    height: 1px;
    background: var(--color-border, #E8E8E8);
  }

  &__grid {
    padding: 24px 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.info-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @include media($md) {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  &__divider {
    height: 1px;
    background: var(--color-border, #E8E8E8);
  }
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__label {
    font-family: var(--font-sans, 'Inter', sans-serif);
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted, #7A7A7A);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  &__value {
    font-family: var(--font-sans, 'Inter', sans-serif);
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text, #0D0D0D);
  }
}

.teams-section {
  &__title {
    font-family: var(--font-display, 'Space Grotesk', sans-serif);
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text, #0D0D0D);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  &__empty {
    font-family: var(--font-sans, 'Inter', sans-serif);
    font-size: 14px;
    color: var(--color-text-muted, #7A7A7A);
    padding: 16px;
    border-radius: 6px;
    background: var(--color-surface, #FAFAFA);
    border: 1px solid var(--color-border, #E8E8E8);
    text-align: center;
  }
}

// ─── Empty State ───
.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px;
  background: var(--color-bg, #FFFFFF);
  border-radius: 8px;
  border: 1px solid var(--color-border, #E8E8E8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  &__icon {
    font-size: 3rem;
    color: var(--color-text-muted, #7A7A7A);
  }

  &__text {
    font-family: var(--font-sans, 'Inter', sans-serif);
    font-size: 14px;
    color: var(--color-text-muted, #7A7A7A);
    text-align: center;
  }
}
} /* End .user-profile-scoped-wrapper */
</style>
