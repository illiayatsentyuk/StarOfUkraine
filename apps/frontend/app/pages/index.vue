<template lang="pug">
  .home
    h1.home__title Welcome
    p.home__lead File-based routing is active. Use the header links to navigate.
    p.home__counter
      | Counter: {{ counterStore.count }}
      |  (double: {{ counterStore.doubleCount }})
    Button.home__action(label="Increment" severity="primary" @click="counterStore.increment")
</template>

<script setup lang="ts">
const counterStore = useCounterStore()
</script>

<style scoped lang="scss">
.home {
  max-width: 42rem;
}

.home__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-4);
}

.home__lead {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-6);
  line-height: 1.5;
}

.home__counter {
  font-size: var(--font-size-base);
  margin: 0 0 var(--space-4);
}

.home__action {
  margin-top: var(--space-2);
}
</style>
