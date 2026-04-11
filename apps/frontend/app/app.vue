<script setup lang="ts">
import 'primeicons/primeicons.css'
import { useLoginStore } from './stores/auth.store'

const auth = useLoginStore()
const loginStore = useLoginStore()

onMounted(() => {
  loginStore.fetchUser()
})
await auth.init()
</script>

<template lang="pug">
  div
    NuxtRouteAnnouncer
    NuxtLayout
      NuxtPage
</template>

