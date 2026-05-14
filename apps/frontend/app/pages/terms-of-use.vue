<template lang="pug">
.terms-page
  .terms-page__container
    header.terms-page__header
      h1.terms-page__title {{ $t('terms.title') }}
      p.terms-page__date {{ $t('terms.last_updated') }}: {{ lastUpdated }}

    article.terms-page__content
      section.terms-section
        h2.terms-section__title {{ $t('terms.acceptance_title') }}
        p {{ $t('terms.acceptance_body') }}

      section.terms-section
        h2.terms-section__title {{ $t('terms.use_title') }}
        p {{ $t('terms.use_body') }}
        ul
          li {{ $t('terms.use_item1') }}
          li {{ $t('terms.use_item2') }}
          li {{ $t('terms.use_item3') }}

      section.terms-section
        h2.terms-section__title {{ $t('terms.accounts_title') }}
        p {{ $t('terms.accounts_body') }}

      section.terms-section
        h2.terms-section__title {{ $t('terms.content_title') }}
        p {{ $t('terms.content_body') }}

      section.terms-section
        h2.terms-section__title {{ $t('terms.termination_title') }}
        p {{ $t('terms.termination_body') }}

      section.terms-section
        h2.terms-section__title {{ $t('terms.contact_title') }}
        p {{ $t('terms.contact_body') }}

    .terms-page__back
      NuxtLink.back-link(:to="localePath('/')")
        i.pi.pi-arrow-left
        span {{ $t('common.back_home') }}
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const lastUpdated = 'May 2026'
</script>

<style scoped lang="scss">
.terms-page {
  padding: var(--space-10) var(--space-4);

  @include media($md) {
    padding: var(--space-10) var(--space-8);
  }

  &__container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding-bottom: var(--space-6);
    border-bottom: 2px solid var(--color-text);
  }

  &__title {
    font-family: var(--font-display);
    font-size: clamp(28px, 5vw, 44px);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -1.5px;
    color: var(--color-text);
    margin: 0;
  }

  &__date {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  &__back {
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border);
  }
}

.terms-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  &__title {
    font-family: var(--font-display);
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  p {
    font-family: var(--font-sans);
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    line-height: 1.7;
    margin: 0;
  }

  ul {
    padding-left: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);

    li {
      font-family: var(--font-sans);
      font-size: var(--font-size-base);
      color: var(--color-text-muted);
      line-height: 1.6;
    }
  }
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover { color: var(--color-primary); }

  i { font-size: 0.875rem; }
}
</style>
