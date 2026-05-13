<template lang="pug">
footer.app-footer
  .app-footer__container
    .app-footer__top
      .app-footer__brand
        h2.brand-name STAR OF UKRAINE
        p.brand-desc {{ $t('footer.description') }}

      .app-footer__links
        .link-group
          h3.group-title {{ $t('footer.platform') }}
          ul.link-list
            li
              NuxtLink.link(to="/") {{ $t('footer.tournaments') }}
            li
              NuxtLink.link(to="/about") {{ $t('footer.about_us') }}

        .link-group
          h3.group-title {{ $t('footer.legal') }}
          ul.link-list
            li
              NuxtLink.link(to="/privacy-policy") {{ $t('footer.privacy_policy') }}
            li
              NuxtLink.link(to="/terms-of-use") {{ $t('footer.terms_of_use') }}

    .app-footer__divider

    .app-footer__bottom
      p.copyright {{ $t('footer.rights_reserved', { year: currentYear }) }}
      .social-icons
        a.social-link(href="#" aria-label="Telegram" target="_blank" rel="noopener")
          i.pi.pi-telegram
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style lang="scss" scoped>
.app-footer {
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding: 64px 48px 48px;
  margin-top: auto;

  @media (max-width: 768px) {
    padding: 40px 24px 32px;
  }

  &__container {
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 48px;

    @media (max-width: 768px) { gap: 32px; }
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 48px;
  }

  &__brand {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 320px;

    .brand-name {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 900;
      color: var(--color-primary);
      letter-spacing: -1px;
      margin: 0;
      text-transform: uppercase;
    }

    .brand-desc {
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--color-text-muted);
      line-height: 1.5;
      margin: 0;
    }
  }

  &__links {
    display: flex;
    gap: 80px;
    flex-wrap: wrap;

    @media (max-width: 576px) { gap: 40px; }

    .link-group {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .group-title {
        font-family: var(--font-sans);
        font-size: 14px;
        font-weight: 700;
        color: var(--color-text);
        letter-spacing: 1px;
        text-transform: uppercase;
        margin: 0;
      }

      .link-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .link {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--color-text-muted);
          text-decoration: none;
          transition: color 0.2s ease;

          &:hover { color: var(--color-primary); }
        }
      }
    }
  }

  &__divider {
    height: 1px;
    background-color: var(--color-border);
    width: 100%;
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;

    .copyright {
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--color-text-muted);
      margin: 0;
    }

    .social-icons {
      display: flex;
      align-items: center;
      gap: 16px;

      .social-link {
        color: var(--color-text-muted);
        transition: color 0.2s ease, transform 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        i { font-size: 20px; }

        &:hover {
          color: var(--color-primary);
          transform: translateY(-2px);
        }
      }
    }
  }
}
</style>
