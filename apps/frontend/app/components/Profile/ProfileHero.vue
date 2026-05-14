<template lang="pug">
.profile__hero
  .profile__avatar-ring
    .profile__avatar-wrap(:class="{ 'profile__avatar-wrap--uploadable': uploadable }" @click="uploadable && $emit('upload')")
      Avatar(
        v-if="avatarSrc"
        :image="avatarSrc"
        size="xlarge"
        shape="circle"
      )
      Avatar(
        v-else
        icon="pi pi-user"
        size="xlarge"
        shape="circle"
      )
      .profile__avatar-overlay(v-if="uploadable")
        i.pi.pi-camera
  span.profile__role-pill {{ roleDisplayName }}
</template>

<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()

const props = defineProps<{
  user: any
  uploadable?: boolean
}>()

defineEmits<{ upload: [] }>()

const avatarSrc = computed(() => {
  const img = props.user?.image
  if (!img) return null
  if (img.startsWith('http://') || img.startsWith('https://')) return img
  return `${config.public.apiURL}${img}`
})

const roleDisplayName = computed(() => {
  if (!props.user?.role) return t('profile.role_user')
  const roles: Record<string, string> = {
    ADMIN: t('profile.role_admin'),
    USER: t('profile.role_user'),
    JURY: t('profile.role_jury'),
  }
  return roles[props.user.role] || props.user.role
})
</script>

<style scoped lang="scss">
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
  position: relative;

  :deep(.p-avatar.p-avatar-xl) {
    width: 120px;
    height: 120px;
    font-size: 3rem;
  }

  :deep(.p-avatar) {
    border: 1px solid var(--color-border);
  }

  &--uploadable {
    cursor: pointer;

    &:hover .profile__avatar-overlay {
      opacity: 1;
    }
  }
}

.profile__avatar-overlay {
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;

  i {
    color: white;
    font-size: 1.5rem;
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
</style>
