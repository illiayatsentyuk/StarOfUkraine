<template lang="pug">
section.profile
  header.profile__intro
    h1.profile__title {{ $t('profile.title') }}
    p.profile__subtitle {{ $t('profile.subtitle') }}

  .profile__card(v-if="loginStore.user")
    .profile__card-inner
      ProfileHero(
        :user="loginStore.user"
        :uploadable="true"
        @upload="triggerAvatarUpload"
      )
      input.profile__file-input(
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="onFileChange"
      )

      .profile__details
        .profile__detail
          span.profile__detail-label
            i.pi.pi-user.profile__detail-icon(aria-hidden="true")
            | {{ $t('profile.name_label') }}
          .profile__detail-value-wrap(v-if="!editingName")
            span.profile__detail-value {{ loginStore.user.name || $t('profile.not_set') }}
            button.profile__edit-btn(
              type="button"
              :title="$t('profile.edit_name')"
              @click="startEditName"
            )
              i.pi.pi-pencil
          .profile__name-edit(v-else)
            input.profile__name-input(
              v-model="editNameValue"
              type="text"
              :placeholder="$t('profile.name_placeholder')"
              @keyup.enter="saveName"
              @keyup.escape="cancelEdit"
            )
            .profile__name-actions
              button.profile__save-btn(type="button" @click="saveName" :disabled="loginStore.loading")
                i.pi.pi-check
              button.profile__cancel-btn(type="button" @click="cancelEdit")
                i.pi.pi-times

        .profile__detail
          span.profile__detail-label
            i.pi.pi-envelope.profile__detail-icon(aria-hidden="true")
            | {{ $t('profile.email_label') }}
          span.profile__detail-value {{ loginStore.user.email }}

        .profile__detail(v-if="loginStore.userTeam")
          span.profile__detail-label
            i.pi.pi-users.profile__detail-icon(aria-hidden="true")
            | {{ $t('nav.team_label') || 'Team' }}
          .profile__detail-value-wrap
            span.profile__detail-value {{ loginStore.userTeam.name }}
            NuxtLink.profile__team-btn(
              :to="localePath('/teams/' + loginStore.userTeam.id)"
            )
              i.pi.pi-external-link

      .profile__actions
        button.profile__logout(
          type="button"
          @click="handleLogout"
        )
          i.pi.pi-sign-out(aria-hidden="true")
          span {{ $t('profile.logout') }}

  .profile__card.profile__card--loading(v-else-if="loginStore.loading")
    .profile__loading
      Loader

  ProfileEmpty(v-else)

  ProfileHistory(v-if="loginStore.user")
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const loginStore = useLoginStore()
const fileInput = ref<HTMLInputElement | null>(null)

const editingName = ref(false)
const editNameValue = ref('')

onMounted(() => {
  if (!loginStore.user && !loginStore.loading) {
    loginStore.fetchUser()
  }
})

const handleLogout = async () => {
  await loginStore.logout()
}

const triggerAvatarUpload = () => {
  fileInput.value?.click()
}

const onFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  await loginStore.uploadAvatar(file)
  if (fileInput.value) fileInput.value.value = ''
}

const startEditName = () => {
  editNameValue.value = loginStore.user?.name ?? ''
  editingName.value = true
}

const cancelEdit = () => {
  editingName.value = false
  editNameValue.value = ''
}

const saveName = async () => {
  const trimmed = editNameValue.value.trim()
  if (!trimmed) return
  await loginStore.updateName(trimmed)
  editingName.value = false
}
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-8);
  padding: var(--space-8) var(--space-4) var(--space-10);
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

.profile__file-input {
  display: none;
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

.profile__details {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.profile__detail {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child { border-bottom: none; }
}

.profile__detail-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 140px;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile__detail-icon {
  font-size: 0.875rem;
}

.profile__detail-value-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.profile__detail-value {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.profile__edit-btn,
.profile__team-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  padding: var(--space-1);
  transition: color 0.2s ease;

  &:hover { color: var(--color-primary); }

  i { font-size: 0.875rem; }
}

.profile__name-edit {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.profile__name-input {
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--color-text);
  width: 100%;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus { border-color: var(--color-primary); }
}

.profile__name-actions {
  display: flex;
  gap: var(--space-2);
}

.profile__save-btn,
.profile__cancel-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;

  i { font-size: 0.875rem; }
}

.profile__save-btn {
  color: var(--color-primary);
  border-color: var(--color-primary);

  &:hover:not(:disabled) { background: var(--color-primary); color: white; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.profile__cancel-btn {
  color: var(--color-text-muted);

  &:hover { background: var(--color-border); }
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

  i { font-size: 1rem; }

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
