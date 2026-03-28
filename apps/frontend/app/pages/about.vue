<template lang="pug">
  .about
    h1.about__title About
    p.about__text
      | This route is defined by
      code.about__code app/pages/about.vue
      | . Add more files under
      code.about__code app/pages/
      |  to create new URLs.
</template>

<style scoped lang="scss">
.about {
  max-width: 42rem;
}

.about__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-4);
}

.about__text {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.6;
}

.about__code {
  font-family: ui-monospace, monospace;
  font-size: var(--font-size-sm);
  background: var(--color-border);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  margin: 0 var(--space-1);
}
</style>
