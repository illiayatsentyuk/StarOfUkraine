<script setup lang="ts">
import 'primeicons/primeicons.css'

import { useLoginStore } from './stores/login.store'
import 'primeicons/primeicons.css'

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

