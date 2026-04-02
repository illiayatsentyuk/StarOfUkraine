<template lang="pug">
div
  NuxtRouteAnnouncer
  NuxtLayout
    NuxtPage
</template>

<script setup lang="ts">
const loginStore = useLoginStore()

onMounted(() => {
  loginStore.fetchUser()
})
</script>
