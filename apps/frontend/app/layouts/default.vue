<template lang="pug">
  .layout
    header.layout__header
      NuxtLink.layout__brand(to="/") StarOfUkraine
      nav.layout__nav(aria-label="Main")
        NuxtLink.layout__link(to="/") Home
        NuxtLink.layout__link(to="/about") About
    main.layout__main
      slot
</template>

<style scoped lang="scss">
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}

.layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.layout__brand {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  text-decoration: none;

  &:hover {
    color: var(--color-primary);
  }
}

.layout__nav {
  display: flex;
  gap: var(--space-4);
}

.layout__link {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-decoration: none;

  &:hover,
  &.router-link-active {
    color: var(--color-primary);
  }
}

.layout__main {
  flex: 1;
  padding: var(--space-6);
}
</style>
