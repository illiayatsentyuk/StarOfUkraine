<template lang="pug">
.about
  h1.about__title {{ $t('about_page.title') }}
  p.about__text {{ $t('about_page.description') }}
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
