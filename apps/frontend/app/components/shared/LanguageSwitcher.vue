<template lang="pug">
.language-switcher
  button.lang-btn(
    v-for="l in availableLocales"
    :key="l.code"
    :class="{ active: locale === l.code }"
    @click="setLocale(l.code)"
    :aria-label="`Switch to ${l.name}`"
    type="button"
  ) {{ l.code.toUpperCase() }}
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() =>
  (locales.value as any[]).map((l) => ({ code: l.code, name: l.name }))
)
</script>

<style scoped lang="scss">
.language-switcher {
  display: flex;
  align-items: center;
  gap: 2px;

  .lang-btn {
    background: transparent;
    border: 1px solid transparent;
    padding: 4px 8px;
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    line-height: 1;

    &:hover {
      color: var(--color-text);
      border-color: var(--color-border);
    }

    &.active {
      color: var(--color-text);
      border-color: var(--color-text);
    }
  }
}
</style>
