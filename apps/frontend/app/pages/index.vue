<template lang="pug">
.home-page
    TournamentsList
</template>

<script setup lang="ts">
// Головна сторінка відображає список турнірів
</script>

<style lang="scss" scoped>
.home-page {
    display: flex;
    flex-direction: column;
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 48px 60px 48px;

    @media (max-width: 768px) {
        padding: 0 24px 40px 24px;
    }
}
</style>
