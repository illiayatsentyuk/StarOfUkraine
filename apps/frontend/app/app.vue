<template lang="pug">
  div
    NuxtRouteAnnouncer
    NuxtWelcome
</template>

<script setup lang="ts">
const counterStore = useCounterStore();

onMounted(() => {
  counterStore.increment();
  console.log(counterStore.count);
});
</script>