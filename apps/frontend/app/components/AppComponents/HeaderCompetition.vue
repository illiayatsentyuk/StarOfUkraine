<template lang="pug">
header.header-competition
    .header-competition__left
        .header-competition__logo
            NuxtLink(:to="localePath('/')") STAR OF UKRAINE
    
    .header-competition__center(v-if="showSearchBar")
        SearchBar(v-model="localSearch" :loading="store.loading")

    .header-competition__nav
        //- Desktop Nav
        .desktop-nav
            template(v-if="loginStore.isAdmin")
                Button.create-btn(
                    type="button"
                    :label="$t('nav.create_tournament').toUpperCase()"
                    @click="openModal"
                )
            
            template(v-if="loginStore.isAuthenticated")
                NuxtLink.jury-link(
                    v-if="loginStore.user.role === 'JURY' && route.params.id"
                    :to="`/tournaments/${route.params.id}/judge`"
                )
                    i.pi.pi-verified
                    span {{ $t('nav.jury_panel').toUpperCase() }}

                Button.create-btn(
                    v-if="!loginStore.hasTeam && loginStore.user.role === 'USER'"
                    type="button"
                    :label="$t('nav.create_team').toUpperCase()"
                    @click="openTeamModal"
                )
                NuxtLink.my-team-link(
                    v-else-if="loginStore.hasTeam"
                    :to="`/teams/${loginStore.userTeam.id}`"
                )
                    i.pi.pi-users
                    span {{ $t('nav.my_team').toUpperCase() }}

            LanguageSwitcher

            .auth-section
                template(v-if="loginStore.user")
                    .user-info
                        NuxtLink.user-name-link(:to="localePath('/profile')")
                            span.user-name(data-testid="user-email") {{ loginStore.user.name || loginStore.user.email }}
                        
                        .user-team(v-if="teamsStore.activeTeam")
                            span.team-label {{ $t('nav.team_label').toUpperCase() }}
                            span.team-name {{ teamsStore.activeTeam.name }}

                        Button.logout-btn(
                            type="button"
                            icon="pi pi-sign-out"
                            :label="$t('nav.logout').toUpperCase()"
                            text
                            @click="loginStore.logout"
                        )
                template(v-else)
                    button.login-btn(@click="goToLogin") {{ $t('nav.login').toUpperCase() }}
        
        //- Mobile Burger Trigger
        Button.burger-btn(
            type="button"
            icon="pi pi-bars"
            @click="isMenuOpen = true"
            text
            data-testid="burger-btn"
        )

    //- Mobile Sidebar Menu
    Sidebar(v-model:visible="isMenuOpen" position="right" class="mobile-menu" :modal="true")
        .mobile-menu__content
            .mobile-menu__actions
                template(v-if="loginStore.isAdmin")
                    Button.create-btn(
                        type="button"
                        :label="$t('nav.create_tournament').toUpperCase()"
                        @click="openModal(); isMenuOpen = false"
                    )
                
                template(v-if="loginStore.isAuthenticated")
                    NuxtLink.jury-link(
                        v-if="loginStore.user.role === 'JURY' && route.params.id"
                        :to="`/tournaments/${route.params.id}/judge`"
                        @click="isMenuOpen = false"
                    )
                        i.pi.pi-verified
                        span {{ $t('nav.jury_panel').toUpperCase() }}

                    Button.create-btn(
                        v-if="!loginStore.hasTeam && loginStore.user.role === 'USER'"
                        type="button"
                        :label="$t('nav.create_team').toUpperCase()"
                        @click="openTeamModal(); isMenuOpen = false"
                    )
                    NuxtLink.my-team-link(
                        v-else-if="loginStore.hasTeam"
                        :to="`/teams/${loginStore.userTeam.id}`"
                        @click="isMenuOpen = false"
                    )
                        i.pi.pi-users
                        span {{ $t('nav.my_team').toUpperCase() }}

            .mobile-menu__user(v-if="loginStore.user")
                NuxtLink.user-link(:to="localePath('/profile')" @click="isMenuOpen = false")
                    i.pi.pi-user
                    span {{ loginStore.user.name || loginStore.user.email }}
                
                .user-team(v-if="teamsStore.activeTeam")
                    span.team-label {{ $t('nav.team_label').toUpperCase() }}
                    span.team-name {{ teamsStore.activeTeam.name }}
                
                Button.logout-btn(
                    type="button"
                    icon="pi pi-sign-out"
                    :label="$t('nav.logout').toUpperCase()"
                    text
                    @click="loginStore.logout(); isMenuOpen = false"
                )
            template(v-else)
                button.login-btn(@click="goToLogin(); isMenuOpen = false") {{ $t('nav.login').toUpperCase() }}

            .mobile-menu__lang
                LanguageSwitcher

CreateTournamentModal(:isOpen="isOpen" @close="closeModal")
CreateTeamModal(:isTeamOpen="isTeamOpen" @close="closeModal")
</template>

<script lang="ts" setup>
import { isRouteWithoutTournamentSearch } from '~/enums'
import { useTournamentsStore } from '../../stores/tournaments.store'
import { useTeamsStore } from '~/stores/teams.store'
import { useLoginStore } from '~/stores/auth.store'

const localePath = useLocalePath()
const route = useRoute()
const store = useTournamentsStore()
const loginStore = useLoginStore()
const teamsStore = useTeamsStore()

const showSearchBar = computed(() => {
  const pathWithoutLocale = route.path.replace(/^\/(ua|en)(\/|$)/, '$2') || '/'
  return !isRouteWithoutTournamentSearch(pathWithoutLocale)
})

function goToLogin() {
  navigateTo(localePath('/auth'))
}
const isOpen = ref(false)
const isTeamOpen = ref(false)
const isMenuOpen = ref(false)

// Синхронізуємо локальний пошук з глобальним стором тільки при зміні користувачем
const localSearch = ref(store.search)
watch(() => store.search, (newVal) => {
    if (localSearch.value !== newVal) {
        localSearch.value = newVal
    }
})
watch(localSearch, (newVal) => {
    if (store.search !== newVal) {
        store.search = newVal
    }
})

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
    gap: 16px;
    padding: 24px 48px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg);

    @media (max-width: 1024px) {
        flex-wrap: nowrap;
        gap: 12px;
    }

    @media (max-width: 1024px) {
        padding: 20px 24px;
    }

    @media (max-width: 768px) {
        padding: 16px;
        align-items: flex-start;
    }

    &__logo {
        font-family: var(--font-display);
        font-size: 18px;
        font-weight: 600;
        color: var(--color-primary);
        letter-spacing: -1px;
        white-space: nowrap;

        @media (max-width: 480px) {
            font-size: 14px;
        }

        :deep(a) {
            text-decoration: none;
            color: inherit;
        }
    }

    &__center {
        flex: 1;
        max-width: 400px;
        margin: 0 40px;
        min-width: 0;
        order: 2;

        @media (max-width: 1024px) {
            margin: 0 16px;
            max-width: none;
        }
        
        @media (max-width: 480px) {
            margin: 0 8px;
        }
    }

    &__nav {
        order: 3;
        display: flex;
        align-items: center;
        gap: 24px;
        min-width: 0;
    }

    .desktop-nav {
        display: flex;
        align-items: center;
        gap: 24px;

        @media (max-width: 1024px) {
            display: none;
        }
    }

    .burger-btn {
        display: none;
        @media (max-width: 1024px) {
            display: inline-flex;
            color: var(--color-text) !important;
            background: var(--color-bg-secondary) !important;
            padding: 8px;
            border-radius: 0;
            border: none !important;
        }
    }

    .auth-section {
        display: flex;
        align-items: center;
        gap: 16px;
        padding-left: 16px;
        border-left: 1px solid var(--color-border);
        flex-wrap: wrap;
        min-width: 0;

        @media (max-width: 768px) {
            padding-left: 0;
            border-left: none;
            width: 100%;
        }
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        min-width: 0;
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

    .my-team-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        color: var(--color-text);
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        text-decoration: none;
        transition: all 0.2s ease;

        i {
            color: var(--color-primary);
            font-size: 14px;
        }

        &:hover {
            border-color: var(--color-primary);
            color: var(--color-primary);
            transform: translateY(-2px);
        }
    }

    .jury-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: var(--color-primary);
        color: white;
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        text-decoration: none;
        transition: all 0.2s ease;

        i { font-size: 14px; }
        &:hover { background: var(--color-text); transform: translateY(-2px); }
    }

    .user-team {
        display: none;
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
            cursor: pointer;
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
        white-space: nowrap;


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


.mobile-menu {
    &__content {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 40px 24px;
        background: var(--color-bg);
    }   

    &__lang {
        display: flex;
        padding-top: 8px;
        border-top: 1px solid var(--color-border);
    }

    &__actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        
        :deep(.create-btn) {
            background: var(--color-primary) !important;
            border: 1px solid var(--color-primary) !important;
            color: white !important;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 14px 24px;
            border-radius: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.2s ease;
            box-shadow: none;
            white-space: nowrap;

            &:hover {
                background: var(--color-text) !important;
                border-color: var(--color-text) !important;
            }
        }
    }

    &__user {
        margin-top: auto;
        padding-top: 32px;
        border-top: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 20px;

        .user-link {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            color: var(--color-text);
            font-family: var(--font-sans);
            font-weight: 600;
            font-size: 14px;
            
            i { 
                color: var(--color-primary); 
                font-size: 18px;
            }
        }

        .user-team {
            background: var(--color-bg-secondary);
            padding: 12px 16px;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .team-label {
                font-size: 9px;
                font-weight: 700;
                color: var(--color-text-muted);
                letter-spacing: 1px;
            }

            .team-name {
                font-size: 14px;
                font-weight: 600;
                color: var(--color-primary);
            }
        }

        :deep(.logout-btn) {
            width: fit-content;
            padding: 0;
            color: var(--color-error);
            font-weight: 700;
            font-size: 12px;
            margin-top: 8px;
            
            &:hover {
                background: transparent !important;
                opacity: 0.8;
            }
        }
    }

    .login-btn {
        width: 100%;
        margin-top: 16px;
        padding: 16px;
        text-align: center;
    }
}
</style>

<style lang="scss">
// Глобальні стилі для маски та панелі (PrimeVue 4 / Aura)
.p-sidebar-mask,
.p-drawer-mask,
.p-overlay-mask,
.p-component-overlay {
    background-color: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(8px) !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    z-index: 10000 !important;
}

.p-sidebar,
.p-drawer {
    font-family: var(--font-sans) !important;
    background: var(--color-bg) !important;
    border-left: 1px solid var(--color-border) !important;
    box-shadow: -10px 0 30px rgba(0,0,0,0.1) !important;
    z-index: 10001 !important;

    .p-sidebar-header,
    .p-drawer-header {
        padding: 24px 24px 0;
        background: var(--color-bg);
    }
    
    .p-sidebar-content,
    .p-drawer-content {
        padding: 0;
        background: var(--color-bg);
        height: 100%;
    }
}
</style>
