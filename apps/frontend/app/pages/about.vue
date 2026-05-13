<template lang="pug">
.about
  h1.about__title {{ $t('about.title') }}
  p.about__subtitle {{ $t('about.subtitle') }}
  p.about__text {{ $t('about.body') }}
</template>

<style scoped lang="scss">
.about {
  max-width: 42rem;
  padding: var(--space-10) var(--space-4);

  @include media($md) {
    padding: var(--space-10) var(--space-8);
  }
}

.about__title {
  font-family: var(--font-display);
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -1.5px;
  color: var(--color-text);
  margin: 0 0 var(--space-3);
}

.about__subtitle {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-6);
}

.about__text {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.7;
}
</style>
