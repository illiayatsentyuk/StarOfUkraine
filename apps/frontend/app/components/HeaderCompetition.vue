<script lang="ts" setup>
import { ref } from 'vue'
import { useTournamentsStore } from '../stores/tournaments.store'

const store = useTournamentsStore()
const isOpen = ref(false)

function openModal(){
    isOpen.value=true
}
function closeModal(){
    isOpen.value=false
}
</script>

<template lang="pug">
header.header-competition
    .header-competition__left
        .header-competition__logo STAR OF UKRAINE
    
    .header-competition__center
        SearchBar(v-model="store.search" :loading="store.loading")

    .header-competition__nav
        Button.create-btn(@click="openModal" type="button" label="Створити турнір")
CreateTournamentModal(:isOpen="isOpen" @close="closeModal")
</template>

<style lang="scss" scoped>
.header-competition {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 48px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg);

    &__logo {
        font-family: var(--font-display);
        font-size: 18px;
        font-weight: 600;
        color: var(--color-primary);
        letter-spacing: -1px;
    }

    &__center {
        flex: 1;
        max-width: 400px;
        margin: 0 40px;
    }

    &__nav {
        display: flex;
        align-items: center;
        gap: 24px;
    }
}


.nav-item {
    font-family: var(--font-sans);
    font-size: 14px;
    .nav-label {
        color: var(--color-text-muted);
    }
    .nav-value {
        color: var(--color-text);
        font-weight: 500;
        margin-left: 4px;
    }
}

:deep(.create-btn) {
    background-color: var(--color-primary);
    border: none;
    padding: 10px 20px;
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 500;
    color: var(--color-bg);
    border-radius: 0;

    &:hover {
        background-color: var(--color-primary-hover);
    }
}
</style>