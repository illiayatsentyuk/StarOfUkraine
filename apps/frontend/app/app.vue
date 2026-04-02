<script setup lang="ts">
import { useLoginStore } from './stores/login.store'

const loginStore = useLoginStore()

onMounted(() => {
  loginStore.fetchUser()
})
</script>

<template lang="pug">
  div
    NuxtRouteAnnouncer
    NuxtLayout
      NuxtPage
</template>

<script setup lang="ts">
import 'primeicons/primeicons.css'
</script>
