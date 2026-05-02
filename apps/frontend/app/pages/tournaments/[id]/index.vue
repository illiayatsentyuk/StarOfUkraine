<template lang="pug">
section.tournament-detail
    // Loading State
    .loading-overlay(v-if="store.loading")
        Loader

    // Content State
    template(v-else-if="tournament")
        .tournament-detail__nav
            NuxtLink.back-link(to="/")
                span.icon ←
                span.text НАЗАД ДО СПИСКУ

        header.tournament-detail__hero
            .status-badge(v-if="tournamentStatus" :style="{ backgroundColor: tournamentStatus.color }") {{ tournamentStatus.label }}
            h1.title {{ tournament.name }}
            .tournament-detail__hero__actions
                Button.home-btn.active-tab( type="button" label="Опис турніру")
                NuxtLink(:to="`/tournaments/${route.params.id}/tasks`" style="text-decoration: none;")
                    Button.task-btn(type="button" label="Завдання")
        
        .tournament-detail__layout
            main.main-content
                .content-section
                    h3.section-label ПРО ТУРНІР
                    p.description {{ tournament.description }}
                
                .content-section.stats-section
                    .stat-box
                        span.label РАУНДІВ
                        span.value {{ roundsStatDisplay }}
                    .stat-box
                        span.label ГРАВЦІВ У КОМАНДІ
                        span.value {{ tournament.teamSizeMin }} — {{ tournament.teamSizeMax }}
                    .stat-box
                        span.label МАКС. КОМАНД
                        span.value {{ tournament.maxTeams }}

                .content-section
                    h3.section-label КОМАНДИ
                    p.description(v-if="shouldHideTeams") Список команд буде доступний після завершення реєстрації.
                    template(v-else)
                        p.description(v-if="teamsStore.loading") Завантаження команд...
                        p.description(v-else-if="!teams.length") Команди поки не додані.
                        .teams-grid(v-else)
                            .team-card(v-for="team in teams" :key="team.id")
                                h4.team-card__name {{ team.name || team.teamName }}
                                p.team-card__meta
                                    | Капітан:
                                    span  {{ team.captainName }}
                                p.team-card__meta(v-if="team.city")
                                    | Місто:
                                    span  {{ team.city }}
                                Button.delete-btn(v-if="authStore.isAdmin" @click="teamsStore.deleteTeam(team.id)" type="button" label="Видалити команду" icon="pi pi-trash")

                TournamentTeamsTable(
                    v-model:teams="teams"
                    :isAdmin="authStore.isAdmin"
                    :shouldHideTeams="shouldHideTeams"
                    @shuffle="shuffleTeams"
                )


            aside.sidebar
                .sidebar__card
                    h3.section-label КЛЮЧОВІ ДАТИ
                    .date-list
                        .date-entry
                            span.label РЕЄСТРАЦІЯ ПОЧИНАЄТЬСЯ
                            span.value {{ formatDate(tournament.registrationStart) }}
                        .date-entry
                            span.label РЕЄСТРАЦІЯ ЗАКІНЧУЄТЬСЯ
                            span.value {{ formatDate(tournament.registrationEnd) }}
                        .date-entry.highlight
                            span.label ДАТА СТАРТУ
                            span.value {{ formatDate(tournament.startDate) }}
                    
                    .divider
                    
                    .sidebar__footer
                        .status-info
                            span.label ПОТОЧНИЙ СТАТУС
                            span.value(v-if="tournamentStatus" :style="{ color: tournamentStatus.color }") {{ tournamentStatus.label }}
                        Button.delete-btn(v-if="authStore.isAdmin" @click="handleDelete" type="button" label="Видалити турнір")
                        Button.create-btn(
                            v-if="authStore.isAuthenticated" 
                            @click="openTeamModal" 
                            type="button" 
                            label="Створити команду" 
                            icon="pi pi-plus"
                            :disabled="!isRegistrationActive && !authStore.isAdmin"
                        )
        
        //- Removed Bracket View
    
    .error-state(v-else)
        p Турнір не знайдено.
        NuxtLink(to="/") Повернутися до списку
    DeleteModal(
        v-if="tournament && authStore.isAdmin"
        :isOpen="isDeleteModalOpen" 
        :tournament="tournament" 
        @close="isDeleteModalOpen = false" 
        @delete="onTournamentDeleted"
    )
    TeamsCreateTeamModal(
        v-if="tournament && authStore.isAuthenticated"
        :isTeamOpen="isTeamOpen"
        @close="isTeamOpen = false"
        @success="refreshTeams"
    )

    //- Removed Dota Match Dialog
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useTournamentsStore } from '../../../stores/tournaments.store'
import { useLoginStore } from '../../../stores/auth.store'
import { useTeamsStore } from '../../../stores/teams.store'
import TeamsCreateTeamModal from '../../../components/Teams/CreateTeamModal.vue'
import DeleteModal from '../../../components/tournaments/deleteModal.vue'

import { calculateTournamentStatus } from '../../../utils/tournament-status'

const route = useRoute()
const store = useTournamentsStore()
const authStore = useLoginStore()
const teamsStore = useTeamsStore()

const tournament = ref<any>(null)
const teams = ref<any[]>([])

const isDeleteModalOpen = ref(false)
const isTeamOpen = ref(false)

const tournamentStatus = computed(() => {
    if (!tournament.value) return null
    return calculateTournamentStatus(tournament.value)
})

const isRegistrationActive = computed(() => {
    return tournamentStatus.value?.code === 'registration'
})

function openTeamModal() {
    isTeamOpen.value = true
}

const roundsStatDisplay = computed(() => {
    return tournament.value?.rounds || '—'
})

const shouldHideTeams = computed(() => {
    if (authStore.isAdmin) return false
    if (!tournament.value?.hideTeamsUntilRegistrationEnds) return false
    if (!tournament.value?.registrationEnd) return false
    return new Date(tournament.value.registrationEnd) > new Date()
})


const formatDate = (dateString: string) => {
    if (!dateString) return "ТВА"
    const date = new Date(dateString)
    return date.toLocaleDateString("uk-UA", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).replace('р.', '').toUpperCase()
}

async function refreshTeams() {
    if (shouldHideTeams.value) return
    try {
        const teamsResponse = await teamsStore.loadFromDatabase(true)
        teams.value = teamsResponse?.data || []
    } catch (e) {
        console.error('Failed to refresh teams')
    }
}

onMounted(async () => {
    try {
        tournament.value = await store.fetchTournamentById(route.params.id as string)
        await refreshTeams()
    } catch (e) {
        console.error('Failed to load tournament detail')
    }
})

const handleDelete = () => {
    isDeleteModalOpen.value = true
}

const onTournamentDeleted = async () => {
    await navigateTo('/')
}

const shuffleTeams = () => {
    teams.value = [...teams.value].sort(() => Math.random() - 0.5)
}
</script>

<style lang="scss" scoped>
.tournament-detail {
    min-height: 80vh;
    animation: fadeIn 0.4s ease-out;
    max-width: 1440px;
    margin: 0 auto;
    padding: 60px 48px 60px 48px;

    @media (max-width: 768px) {
        padding: 0 24px 40px 24px;
    }

    &__nav {
        margin-bottom: 48px;
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: var(--color-text-muted);
            font-weight: 600;
            font-size: 11px;
            letter-spacing: 1.5px;
            transition: all 0.2s ease;

            &:hover {
                color: var(--color-primary);
                transform: translateX(-4px);
            }
        }
    }

    &__hero {
        margin-bottom: 64px;
        border-bottom: 2px solid var(--color-text);
        padding-bottom: 48px;

        .status-badge {
            display: inline-block;
            background: var(--color-primary);
            color: white;
            padding: 6px 14px;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 1.5px;
            margin-bottom: 24px;
        }

        .title {
            font-family: var(--font-display);
            font-size: 84px;
            font-weight: 700;
            line-height: 0.95;
            letter-spacing: -2px;
            margin: 0;
            color: var(--color-text);

            @media (max-width: 768px) {
                font-size: 48px;
            }
        }

        &__actions {
            display: flex;
            gap: 16px;
            margin-top: 40px;

            button {
                min-width: 200px;
                height: 52px;
                border-radius: 0;
                font-family: var(--font-display);
                font-weight: 700;
                font-size: 13px;
                letter-spacing: 2px;
                text-transform: uppercase;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                border: 1px solid var(--color-text);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;

                &.home-btn {
                    background: transparent;
                    color: var(--color-text);
                    opacity: 1;

                    &:hover {
                        background: var(--color-text);
                        color: white;
                    }
                    
                    &.active-tab {
                        background: var(--color-text);
                        color: white;
                        cursor: default;
                    }
                }


                &.task-btn {
                    background: var(--color-text);
                    border-color: var(--color-text);
                    color: white;

                    &:hover {
                        background: var(--color-primary);
                        border-color: var(--color-primary);
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    }

                    &:active {
                        transform: translateY(0);
                    }
                }
            }
        }
    }

    &__layout {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 80px;

        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
            gap: 48px;
        }
    }

    &__bracket-view {
        width: 100%;
        margin-top: 32px;
        animation: fadeIn 0.6s ease-out;
        overflow-x: auto;
        padding-bottom: 80px;
    }
}

.main-content {
    .content-section {
        margin-bottom: 64px;

        .description {
            font-size: 22px;
            line-height: 1.5;
            color: var(--color-text);
            margin: 24px 0 0 0;
            max-width: 800px;
            font-weight: 400;
        }
    }

    .stats-section {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2px;
        background: var(--color-border);
        border: 2px solid var(--color-border);

        .stat-box {
            background: white;
            padding: 32px;
            display: flex;
            flex-direction: column;
            gap: 8px;

            .label {
                font-size: 10px;
                font-weight: 700;
                color: var(--color-text-muted);
                letter-spacing: 2px;
            }
            .value {
                font-family: var(--font-display);
                font-size: 24px;
                font-weight: 700;
                color: var(--color-text);
            }
        }
    }
}

.teams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    margin-top: 24px;
}

.team-card {
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: 16px;

    &__name {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-family: var(--font-display);
    }

    &__meta {
        margin: 0;
        color: var(--color-text-muted);
        font-size: 14px;

        span {
            color: var(--color-text);
            font-weight: 600;
            margin-left: 6px;
        }
    }
}

.sidebar {
    &__card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        padding: 40px;
        position: sticky;
        top: 40px;

        .date-list {
            margin-top: 32px;
            display: flex;
            flex-direction: column;
            gap: 32px;
        }

        .date-entry {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .label {
                font-size: 10px;
                font-weight: 700;
                color: var(--color-text-muted);
                letter-spacing: 1.5px;
            }
            .value {
                font-size: 15px;
                font-weight: 600;
                color: var(--color-text);
            }

            &.highlight .value {
                color: var(--color-primary);
                font-size: 18px;
                font-weight: 700;
            }
        }

        .divider {
            height: 1px;
            background: var(--color-border);
            margin: 40px 0;
        }

        .sidebar__footer {
            display: flex;
            flex-direction: column;
            gap: 24px;

            .status-info {
                display: flex;
                flex-direction: column;
                gap: 6px;

                .label {
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--color-text-muted);
                    letter-spacing: 1.5px;
                }
                .value {
                    font-family: var(--font-display);
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--color-text);
                }
            }
        }
    }
}

:deep(.delete-btn) {
    margin-top: 16px;
    width: 100%;
    background: transparent;
    border: 1px solid var(--color-error, #ef4444);
    color: var(--color-error, #ef4444);
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 600;
    padding: 12px;
    border-radius: 0;
    letter-spacing: 1px;
    transition: all 0.2s ease;

    &:hover {
        background: var(--color-error, #ef4444);
        color: white;
    }
}

:deep(.create-btn) {
    margin-top: 16px;
    width: 100%;
    background: var(--color-primary);
    border: 2px solid var(--color-primary);
    color: white;
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 800;
    padding: 18px;
    border-radius: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: all 0.2s;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: #000000;
        border-color: #000000;
        box-shadow: 0 8px 24px rgba(228, 35, 19, 0.2);
    }

    &:active {
        background: #000000;
    }
}

.section-label {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 2px;
    margin: 0;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200px 0;
    gap: 24px;

    .loading-text {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-muted);
        letter-spacing: 3px;
    }
}

:deep(.p-progressspinner-circle) {
    stroke: var(--color-primary) !important;
}

</style>
