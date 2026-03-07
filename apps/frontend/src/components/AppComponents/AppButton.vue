<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit'
  disabled?: boolean
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template lang="pug">
button.app-button(
  :type="type ?? 'button'"
  :disabled="disabled"
  @click="$emit('click', $event)"
)
  slot
</template>

<style lang="scss" scoped>
.app-button {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: white;
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--color-primary-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @include media($md) {
    padding: var(--space-3) var(--space-5);
  }
}
</style>
