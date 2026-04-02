<script lang="ts" setup>
import { ref } from 'vue'
import { useTournamentsStore } from '../stores/tournaments.store'

const store = useTournamentsStore()
const loginStore = useLoginStore()
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
        .header-competition__logo
         NuxtLink(to="/" style="text-decoration: none; color: inherit;") STAR OF UKRAINE
    
    .header-competition__center
        SearchBar(v-model="store.search" :loading="store.loading")

    .header-competition__nav
        Button.create-btn(@click="openModal" type="button" label="Створити турнір")
        
        .auth-section
            template(v-if="loginStore.user")
                .user-info
                    span.user-name {{ loginStore.user.name || loginStore.user.email }}
                    Button.logout-btn(@click="loginStore.logout" type="button" icon="pi pi-sign-out" label="Вийти" text)
            template(v-else)
                Button.login-btn(@click="loginStore.login" type="button" icon="pi pi-google" label="Увійти" severity="secondary")

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

    .auth-section {
        display: flex;
        align-items: center;
        gap: 16px;
        padding-left: 16px;
        border-left: 1px solid var(--color-border);
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .user-name {
        font-family: var(--font-sans);
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text);
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