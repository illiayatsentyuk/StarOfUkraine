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
  Select(
    v-model="currentLocale"
    :options="availableLocales"
    optionLabel="name"
    placeholder="Select Language"
    class="w-full md:w-40"
  )
    template(#value="slotProps")
      .flex.align-items-center(v-if="slotProps.value")
        i.pi.pi-language.mr-2
        span {{ slotProps.value.name }}
    template(#option="slotProps")
      .flex.align-items-center
        span {{ slotProps.option.name }}
</template>

<style scoped lang="scss">
.language-switcher {
  display: flex;
  align-items: center;

  :deep(.p-select) {
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    
    &:hover {
      border-color: var(--color-primary);
    }

    .p-select-label {
      font-size: 13px;
      font-family: var(--font-sans);
      padding: 8px 12px;
      color: var(--color-text);
    }
    
    .p-select-dropdown {
       width: 2rem;
    }
  }
}
</style>
