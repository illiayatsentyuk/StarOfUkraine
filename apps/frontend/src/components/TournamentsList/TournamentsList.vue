<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const tournaments = ref([])

onMounted(() => {
    const data = localStorage.getItem("tournaments");
    if (data) {
        tournaments.value = JSON.parse(data);
    }
})
</script>

<template lang="pug">
    section.tournaments-list
        .tournaments-list__header
            h2.tournaments-list__header-title Турніри
            p.tournaments-list__header-text Список турнірів
        .tournaments-list__wr
            ul.tournaments-list__wr-list
                li.tournaments-list__wr-list-item(v-for="tournament in tournaments" :key="tournament.name")
                    .tournaments-list__wr-list-item-wr
                        p.tournaments-list__wr-list-item-wr-text Назва турніру
                        h1.tournaments-list__wr-list-item-wr-title {{ tournament.name }}
                        p.tournaments-list__wr-list-item-wr-text Опис та Правила
                        h1.tournaments-list__wr-list-item-wr-title {{ tournament.description }}
                        p.tournaments-list__wr-list-item-wr-text Дата старту турніру
                        h1.tournaments-list__wr-list-item-wr-title {{ tournament.date }}
                        p.tournaments-list__wr-list-item-wr-text Макс.команд (опційно)
                        h1.tournaments-list__wr-list-item-wr-title {{ tournament.maxTeams }}
                        
            
</template>

<style lang="scss" scoped>
</style>