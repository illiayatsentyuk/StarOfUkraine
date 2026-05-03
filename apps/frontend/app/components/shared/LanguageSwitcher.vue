<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() => {
  return locales.value.map((l: any) => ({
    name: l.name,
    code: l.code
  }))
})

const currentLocale = computed({
  get: () => availableLocales.value.find(l => l.code === locale.value),
  set: (val) => {
    if (val) setLocale(val.code)
  }
})
</script>

<template lang="pug">
.language-switcher
  button.lang-btn(
    v-for="l in availableLocales" 
    :key="l.code"
    :class="{ active: currentLocale?.code === l.code }"
    @click="currentLocale = l"
  ) {{ l.code.toUpperCase() }}
</template>

<style scoped lang="scss">
.language-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--color-surface, #f5f5f5);
  border: 1px solid var(--color-border);
  padding: 4px;
  border-radius: var(--radius-sm, 6px);

  .lang-btn {
    background: transparent;
    border: none;
    padding: 4px 8px;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-muted);
    border-radius: var(--radius-sm, 4px);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--color-text);
    }

    &.active {
      background: var(--color-bg, #ffffff);
      color: var(--color-text);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
  }
}
</style>
