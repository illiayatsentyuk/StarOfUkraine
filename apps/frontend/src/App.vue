<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "@/components/AppComponents/HeaderCompetition.vue";
</script>

<template lang="pug">
.app
  router-view
</template>

<style lang="scss" scoped>
.app {
  min-height: 100vh;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
}
</style>
