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
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: var(--color-bg);

    &__content {
        padding: 48px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 32px;
        max-width: 1440px;
        margin: 0 auto;
        width: 100%;
    }
}
</style>
