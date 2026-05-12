<template lang="pug">
  div
    NuxtRouteAnnouncer
    NuxtLayout
      NuxtPage
</template>

<script setup lang="ts">
import 'primeicons/primeicons.css'
import { useLoginStore } from '~/stores/auth.store'

const loginStore = useLoginStore()
const route = useRoute()

onMounted(() => {
  if (route.query.oauth === 'success') {
    navigateTo({ path: route.path, query: {} }, { replace: true })
  }
})

await loginStore.init()
</script>
