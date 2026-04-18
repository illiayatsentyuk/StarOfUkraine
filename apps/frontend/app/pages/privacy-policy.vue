<template lang="pug">
.privacy-page
  .privacy-page__header
    h1.privacy-page__title {{ $t('privacy.title') }}
    p.privacy-page__subtitle {{ $t('privacy.last_updated', { date: 'April 18, 2026' }) }}

  .privacy-page__content
    section.privacy-section
      h2.privacy-section__title {{ $t('privacy.sections.data_collection.title') }}
      p.privacy-section__text {{ $t('privacy.sections.data_collection.text') }}

    section.privacy-section
      h2.privacy-section__title {{ $t('privacy.sections.data_usage.title') }}
      p.privacy-section__text {{ $t('privacy.sections.data_usage.text') }}

    section.privacy-section
      h2.privacy-section__title {{ $t('privacy.sections.cookies.title') }}
      p.privacy-section__text {{ $t('privacy.sections.cookies.text') }}

    section.privacy-section
      h2.privacy-section__title {{ $t('privacy.sections.contact.title') }}
      p.privacy-section__text {{ $t('privacy.sections.contact.text') }}
</template>

<script setup lang="ts">
import { useI18n, useHead } from '#imports'

const { t } = useI18n()

useHead({
  title: t('privacy.title') + ' | Star of Ukraine',
  meta: [
    { name: 'description', content: t('privacy.meta_description') }
  ]
})
</script>

<style scoped lang="scss">
.privacy-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 0;
  animation: fadeIn 0.4s ease-out;

  &__header {
    margin-bottom: 48px;
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 32px;
  }

  &__title {
    font-family: var(--font-display, 'Space Grotesk', sans-serif);
    font-size: 48px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 16px 0;
    letter-spacing: -1px;
    text-transform: uppercase;
  }

  &__subtitle {
    font-family: var(--font-sans, 'Inter', sans-serif);
    font-size: 16px;
    color: var(--color-text-muted);
    font-weight: 500;
    margin: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
}

.privacy-section {
  &__title {
    font-family: var(--font-display, 'Space Grotesk', sans-serif);
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 16px 0;
    letter-spacing: 0.5px;
  }

  &__text {
    font-family: var(--font-sans, 'Inter', sans-serif);
    font-size: 16px;
    line-height: 1.8;
    color: var(--color-text-muted);
    margin: 0;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
