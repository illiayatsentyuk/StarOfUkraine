<template lang="pug">
.privacy-page
  .privacy-page__container
    header.privacy-page__header
      h1.privacy-page__title {{ $t('privacy.title') }}
      p.privacy-page__date {{ $t('privacy.last_updated') }}: {{ lastUpdated }}

    article.privacy-page__content
      section.privacy-section
        h2.privacy-section__title {{ $t('privacy.intro_title') }}
        p {{ $t('privacy.intro_body') }}

      section.privacy-section
        h2.privacy-section__title {{ $t('privacy.collect_title') }}
        p {{ $t('privacy.collect_body') }}
        ul
          li {{ $t('privacy.collect_item1') }}
          li {{ $t('privacy.collect_item2') }}
          li {{ $t('privacy.collect_item3') }}
          li {{ $t('privacy.collect_item4') }}

      section.privacy-section
        h2.privacy-section__title {{ $t('privacy.use_title') }}
        p {{ $t('privacy.use_body') }}
        ul
          li {{ $t('privacy.use_item1') }}
          li {{ $t('privacy.use_item2') }}
          li {{ $t('privacy.use_item3') }}
          li {{ $t('privacy.use_item4') }}

      section.privacy-section
        h2.privacy-section__title {{ $t('privacy.cookies_title') }}
        p {{ $t('privacy.cookies_body') }}

      section.privacy-section
        h2.privacy-section__title {{ $t('privacy.storage_title') }}
        p {{ $t('privacy.storage_body') }}

      section.privacy-section
        h2.privacy-section__title {{ $t('privacy.rights_title') }}
        p {{ $t('privacy.rights_body') }}
        ul
          li {{ $t('privacy.rights_item1') }}
          li {{ $t('privacy.rights_item2') }}
          li {{ $t('privacy.rights_item3') }}

      section.privacy-section
        h2.privacy-section__title {{ $t('privacy.contact_title') }}
        p {{ $t('privacy.contact_body') }}

    .privacy-page__back
      NuxtLink.back-link(:to="localePath('/')")
        i.pi.pi-arrow-left
        span {{ $t('common.back_home') }}
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const lastUpdated = 'May 2026'
</script>

<style scoped lang="scss">
.privacy-page {
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

.privacy-section {
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
