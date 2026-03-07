<script lang="ts" setup>
import HeaderCompetition from "@/components/AppComponents/HeaderCompetition.vue"
import TournamentsList from "@/components/TournamentsList/TournamentsList.vue"
</script>

<template lang="pug">
.view-tournaments
    HeaderCompetition
    main.view-tournaments__content
        TournamentsList
</template>

<style lang="scss" scoped>
.view-tournaments {
}
</style>
