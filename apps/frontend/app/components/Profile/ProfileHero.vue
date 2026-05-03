<template lang="pug">
.profile__hero
  .profile__avatar-ring
    .profile__avatar-wrap
      Avatar(
        v-if="user.image"
        :image="user.image"
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
</template>

<script setup lang="ts">
const props = defineProps<{
  user: any
}>()

const roleDisplayName = computed(() => {
  if (!props.user?.role) return 'Користувач'
  const roles: Record<string, string> = {
    ADMIN: 'Адміністратор',
    USER: 'Користувач',
    JURY: 'Журі'
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
</style>
