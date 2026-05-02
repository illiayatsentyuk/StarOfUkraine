<template lang="pug">
.layout
  HeaderCompetition
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

.layout__main {
  flex: 1;
  width: 100%;
}

.layout__content {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 48px 60px 48px;

  @media (max-width: 768px) {
    padding: 0 24px 40px 24px;
  }
}
</style>
