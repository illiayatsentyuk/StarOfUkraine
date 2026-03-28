---
name: nuxt-expert
description: >-
  Nuxt 4 frontend expert for the StarOfUkraine monorepo. Knows project
  conventions: srcDir app/, Pug templates, scoped SCSS with CSS vars and
  breakpoints, Pinia setup stores, PrimeVue, vee-validate, @nuxt/image,
  @nuxt/fonts. Use when creating pages, components, stores, composables,
  layouts, or any frontend feature in apps/frontend.
---

# Nuxt 4 Expert — StarOfUkraine Frontend

## Project location
`apps/frontend/` — Nuxt 4 app. `srcDir` is `app/`, so all source lives under `app/`.

## Installed modules
- `@pinia/nuxt` — state management
- `@primevue/nuxt-module` + `primevue` — UI component library
- `@vee-validate/nuxt` — form validation
- `@nuxt/image` — optimized images
- `@nuxt/fonts` — font optimization
- Dev server: **port 4040**

## Directory conventions

| Concern | Path |
|---|---|
| Pages | `app/pages/` |
| Layouts | `app/layouts/` |
| Components | `app/components/` |
| Stores | `app/stores/` |
| Composables | `app/composables/` |
| Assets | `app/assets/` |
| Global styles | `app/assets/styles/` |

## Auto-imports
Everything in `app/stores/`, `app/composables/`, `app/utils/`, all Vue primitives (`ref`, `computed`, `watch`, etc.), and all Nuxt composables (`useRoute`, `useRouter`, `useFetch`, `useState`, etc.) are **auto-imported**.

❌ Never add manual imports for these:
```ts
import { ref } from 'vue'
import { useCounterStore } from '~/stores/counter'
```
✅ Just use them directly:
```ts
const count = ref(0)
const store = useCounterStore()
```

---

## Vue Component Pattern

Every component uses this exact block order and syntax:

```vue
<template lang="pug">
.my-component
  h1.my-component__title {{ title }}
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style scoped lang="scss">
.my-component {
  color: var(--color-text);
  padding: var(--space-4);

  @include media($md) {
    padding: var(--space-6);
  }

  &__title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
  }
}
</style>
```

Rules:
- Template: always `lang="pug"`, no HTML
- Script: always `<script setup lang="ts">`, never Options API
- Style: always `<style scoped lang="scss">`
- Naming: BEM (`.block__element--modifier`)

---

## SCSS Design Tokens

CSS variables are globally available (injected via Vite `additionalData`). Always use tokens, never hardcode values.

**Colors:** `--color-primary` `--color-primary-hover` `--color-text` `--color-text-muted` `--color-bg` `--color-border`

**Spacing:** `--space-1` through `--space-10` (`0.25rem` → `2.5rem`)

**Typography:** `--font-sans` · `--font-size-sm/base/lg/xl` · `--font-weight-normal/medium/semibold`

**Radius:** `--radius-sm` `--radius-md` `--radius-lg`

### Breakpoints (SCSS variables, mobile-first)

```scss
// Width
$xs: 360px  $s: 576px  $ss: 640px  $md: 768px  $mmd: 992px
$lg: 1024px  $xlg: 1140px  $xl: 1280px  $xxl: 1440px

// Height
$xs-height: 650px  $s-height: 800px  $md: 768px ...

// Usage — always use the mixin:
@include media($md) { ... }
@include media-height($s-height) { ... }
```

---

## Pinia Stores

Always use **Setup Store** syntax. Store file must be in `app/stores/`.

```ts
// app/stores/user.ts
export const useUserStore = defineStore('user', () => {
  const name = ref('')
  const isLoggedIn = computed(() => name.value.length > 0)

  function login(username: string) {
    name.value = username
  }

  return { name, isLoggedIn, login }
})
```

Naming: file `kebab-case.ts` → export `useXxxStore` → store ID `'xxx'`

---

## PrimeVue

Components are auto-imported. Use directly in Pug templates:

```pug
Button(label="Submit" severity="primary" @click="submit")
InputText(v-model="email" placeholder="Email")
DataTable(:value="rows")
  Column(field="name" header="Name")
```

---

## vee-validate

Forms use `useForm` / `useField` composables (auto-imported via `@vee-validate/nuxt`):

```ts
const { handleSubmit, errors } = useForm()
const { value: email } = useField<string>('email')
const onSubmit = handleSubmit((values) => { /* ... */ })
```

---

## @nuxt/image

Use `<NuxtImg>` instead of `<img>` for all images:

```pug
NuxtImg(src="/hero.jpg" width="800" height="400" alt="Hero")
```

---

## Aliases

- `~` and `@` → `app/`
- `~~` and `@@` → project root (`apps/frontend/`)

---
