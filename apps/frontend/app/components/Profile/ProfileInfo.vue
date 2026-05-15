<template lang="pug">
.profile__details
  .profile__detail
    span.profile__detail-label
      i.pi.pi-user.profile__detail-icon(aria-hidden="true")
      | {{ $t('profile.name_label') }}
    span.profile__detail-value {{ user.name || $t('profile.not_set') }}

  .profile__detail
    span.profile__detail-label
      i.pi.pi-envelope.profile__detail-icon(aria-hidden="true")
      | {{ $t('profile.email_label') }}
    span.profile__detail-value {{ user.email }}
</template>

<script setup lang="ts">
defineProps<{
  user: any
}>()
</script>

<style scoped lang="scss">
.profile__details {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);

  @media (min-width: 768px) {
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
</style>
