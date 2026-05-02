<script setup lang="ts">
import 'primeicons/primeicons.css'

const loginStore = useLoginStore()
const route = useRoute()

onMounted(() => {
  if (route.query.oauth === 'success') {
    navigateTo({ path: route.path, query: {} }, { replace: true })
  }
})

await loginStore.init()
</script>

<template lang="pug">
  div
    NuxtRouteAnnouncer
    NuxtLayout
      NuxtPage
</template>

