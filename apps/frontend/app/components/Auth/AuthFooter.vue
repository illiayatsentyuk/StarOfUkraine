<template lang="pug">
.card-footer
  template(v-if="isLogin")
    | {{ $t('auth.no_account') }}
    a(href="#" @click.prevent="$emit('toggleMode', false)") {{ $t('auth.register_link') }}
  template(v-else)
    | {{ $t('auth.has_account') }}
    a(href="#" @click.prevent="$emit('toggleMode', true)") {{ $t('auth.login_link') }}
</template>

<script setup lang="ts">
defineProps<{
  isLogin: boolean
}>()

defineEmits<{
  (e: 'toggleMode', value: boolean): void
}>()
</script>

<style scoped lang="scss">
.card-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
  border-top: 1px solid var(--color-border);
  padding: var(--space-6);
  font-size: var(--font-size-sm);
  font-family: var(--font-sans);
  color: var(--color-text-muted);

  a {
    color: var(--color-text);
    font-weight: var(--font-weight-semibold);
    text-decoration: none;
    margin-left: var(--space-1);
    border-bottom: 1px solid var(--color-text);
    transition: color 0.2s ease, border-color 0.2s ease;

    &:hover {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
    }
  }
}
</style>
