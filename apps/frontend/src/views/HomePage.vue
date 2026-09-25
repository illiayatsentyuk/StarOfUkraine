<script setup lang="ts">
import AppButton from '@/components/AppComponents/AppButton.vue'
</script>

<template lang="pug">
.home
  h1.home__title You did it!
  p.home__text
    | Visit
    a.home__link(
      href="https://vuejs.org/"
      target="_blank"
      rel="noopener"
    ) vuejs.org
    | to read the documentation
  AppButton(@click="() => {}") Get started
</template>

<style lang="scss" scoped>
.home {
  padding: var(--space-8) var(--space-4);
  max-width: 40rem;
  margin: 0 auto;

  @include media($md) {
    padding: var(--space-10) var(--space-6);
  }
}

.home__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-4);
  color: var(--color-text);

  @include media($md) {
    font-size: 1.5rem;
  }
}

.home__text {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-6);
  line-height: 1.6;
}

.home__link {
  color: var(--color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
