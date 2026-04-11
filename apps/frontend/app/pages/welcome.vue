<template lang="pug">
.welcome-page
  .welcome-page__hero
    h1.welcome-page__title {{ $t('welcome.title') }}
    p.welcome-page__subtitle {{ $t('welcome.subtitle') }}
    .welcome-page__actions
      Button(:label="$t('welcome.actions.view_tournaments')" severity="danger" size="large" @click="goToHome")

  .welcome-page__features
    .welcome-page__feature
      .welcome-page__feature-icon 🔍
      h3.welcome-page__feature-title {{ $t('welcome.features.discover.title') }}
      p.welcome-page__feature-text {{ $t('welcome.features.discover.text') }}
    
    .welcome-page__feature
      .welcome-page__feature-icon 🛠️
      h3.welcome-page__feature-title {{ $t('welcome.features.host.title') }}
      p.welcome-page__feature-text {{ $t('welcome.features.host.text') }}

    .welcome-page__feature
      .welcome-page__feature-icon 👥
      h3.welcome-page__feature-title {{ $t('welcome.features.form_teams.title') }}
      p.welcome-page__feature-text {{ $t('welcome.features.form_teams.text') }}
</template>

<script setup lang="ts">
async function goToHome() {
  await navigateTo('/')
}
</script>

<style scoped lang="scss">
.welcome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-surface) 0%, rgba(228, 35, 19, 0.03) 100%);
  color: var(--color-text);
  padding: var(--space-4);
  font-family: var(--font-sans);
  overflow-x: hidden;

  @include media($md) {
    padding: var(--space-8) var(--space-10);
  }

  &__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 900px;
    margin-top: var(--space-4);
    margin-bottom: var(--space-10);
    padding: var(--space-8);
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: var(--radius-lg);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
    animation: fadeInDown 0.8s ease-out;

    @include media($md) {
      padding: 6rem var(--space-10);
      margin-top: 4rem;
      margin-bottom: 6rem;
    }
  }

  &__title {
    font-size: 2.5rem;
    font-weight: var(--font-weight-semibold);
    background: linear-gradient(90deg, var(--color-primary), #ff4757);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: var(--space-4);
    font-family: var(--font-display);
    line-height: 1.2;

    @include media($md) {
      font-size: 4.5rem;
    }
  }

  &__subtitle {
    font-size: var(--font-size-lg);
    color: var(--color-text-muted);
    margin-bottom: var(--space-8);
    line-height: 1.6;
    max-width: 650px;

    @include media($md) {
      font-size: var(--font-size-xl);
    }
  }

  &__actions {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
    justify-content: center;
  }

  &__features {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6);
    max-width: 1100px;
    width: 100%;
    margin-bottom: var(--space-10);
    padding-top: var(--space-4);

    @include media($md) {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-8);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &__feature {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: var(--space-8) var(--space-6);
    border-radius: var(--radius-lg);
    text-align: center;
    border: 1px solid var(--color-border);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    opacity: 0;
    animation: fadeInUp 0.8s ease-out forwards;

    &:nth-child(1) { animation-delay: 0.2s; }
    &:nth-child(2) { animation-delay: 0.4s; }
    &:nth-child(3) { animation-delay: 0.6s; }

    &:hover {
      transform: translateY(-12px) scale(1.02);
      box-shadow: 0 20px 40px rgba(228, 35, 19, 0.08);
      border-color: rgba(228, 35, 19, 0.2);
    }
  }

  &__feature-icon {
    font-size: 3.5rem;
    margin-bottom: var(--space-5);
    display: inline-block;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    .welcome-page__feature:hover & {
      transform: scale(1.15) rotate(8deg);
    }
  }

  &__feature-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-3);
    color: var(--color-text);
  }

  &__feature-text {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    line-height: 1.6;
  }
}
</style>
