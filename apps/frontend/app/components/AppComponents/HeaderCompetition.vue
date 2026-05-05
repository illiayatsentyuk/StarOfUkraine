<script lang="ts" setup>
import { isRouteWithoutTournamentSearch } from '~/enums'
import { useTournamentsStore } from '../../stores/tournaments.store'

const route = useRoute()
const store = useTournamentsStore()
const loginStore = useLoginStore()

const showSearchBar = computed(
  () => !isRouteWithoutTournamentSearch(route.path),
)
const isOpen = ref(false)
const isTeamOpen = ref(false)

function openModal(){
    isOpen.value=true
}
function openTeamModal(){
    isTeamOpen.value=true
}
function closeModal(){
    isOpen.value=false
    isTeamOpen.value=false
}

</script>

<template lang="pug">
header.header-competition
    .header-competition__left
        .header-competition__logo
            NuxtLink(to="/") STAR OF UKRAINE
    
    .header-competition__center(v-if="showSearchBar")
        SearchBar(v-model="store.search" :loading="store.loading")

    .header-competition__nav
        template(v-if="loginStore.isAuthenticated")
            Button.create-btn(
                type="button"
                label="СТВОРИТИ ТУРНІР"
                @click="openModal"
            )
            Button.create-btn(
                type="button"
                label="СТВОРИТИ КОМАНДУ"
                @click="openTeamModal"
            )

        .auth-section
            template(v-if="loginStore.user")
                .user-info
                    NuxtLink.user-name-link(to="/profile")
                        span.user-name {{ loginStore.user.name || loginStore.user.email }}
                    Button.logout-btn(
                        type="button"
                        icon="pi pi-sign-out"
                        label="ВИЙТИ"
                        text
                        @click="loginStore.logout"
                    )
            template(v-else)
                NuxtLink.login-btn(to="/auth") УВІЙТИ

CreateTournamentModal(:isOpen="isOpen" @close="closeModal")
CreateTeamModal(:isTeamOpen="isTeamOpen" @close="closeModal")
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useTournamentsStore } from '../../stores/tournaments.store'

const store = useTournamentsStore()
const loginStore = useLoginStore()
const isOpen = ref(false)
const isTeamOpen = ref(false)

function openModal(){
    isOpen.value=true
}
function openTeamModal(){
    isTeamOpen.value=true
}
function closeModal(){
    isOpen.value=false
    isTeamOpen.value=false
}

</script>

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

        :deep(a) {
            text-decoration: none;
            color: inherit;
        }
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

    .user-name-link {
        text-decoration: none;
        color: inherit;
        max-width: 200px;
        border-radius: var(--radius-sm);
        transition: color 0.15s ease, opacity 0.15s ease;

        &:hover .user-name {
            color: var(--color-primary);
        }

        &:focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }
    }

    .login-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 44px;
        padding: 0 22px;
        border: 1px solid var(--color-text);
        border-radius: 0;
        background: transparent;
        color: var(--color-text);
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        text-decoration: none;
        transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;

        &:hover {
            background: var(--color-text);
            color: var(--color-bg);
            border-color: var(--color-text);
        }

        &:focus-visible {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }
    }

    :deep(.create-btn) {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        color: white;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 11px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        padding: 12px 20px;
        border-radius: 0;
        transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
            transform 0.2s ease;
        box-shadow: none;

        &:hover:not(:disabled) {
            background: var(--color-text);
            border-color: var(--color-text);
            color: white;
            transform: translateY(-2px);
        }

        &:active:not(:disabled) {
            transform: translateY(0);
        }
    }

    :deep(.logout-btn) {
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--color-text-muted);
        border-radius: 0;
        gap: 8px;

        &:hover:not(:disabled) {
            color: var(--color-primary);
            background: transparent;
        }
    }

    .user-name {
        font-family: var(--font-sans);
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text);
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 0.15s ease;
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

</style>
