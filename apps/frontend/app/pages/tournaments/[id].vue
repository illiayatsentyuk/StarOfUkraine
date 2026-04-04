<template lang="pug">
section.tournament-detail
    // Loading State
    .loading-overlay(v-if="store.loading")
        ProgressSpinner(style="width: 50px; height: 50px" strokeWidth="4" fill="transparent" animationDuration=".5s" aria-label="Loading")
        span.loading-text ЗАВАНТАЖЕННЯ

    // Content State
    template(v-else-if="tournament")
        .tournament-detail__nav
            NuxtLink.back-link(to="/")
                span.icon ←
                span.text НАЗАД ДО СПИСКУ

        header.tournament-detail__hero
            .status-badge {{ (tournament.status || 'РЕЄСТРАЦІЯ ВІДКРИТА').toUpperCase() }}
            h1.title {{ tournament.name }}
        
        .tournament-detail__layout
            main.main-content
                .content-section
                    h3.section-label ПРО ТУРНІР
                    p.description {{ tournament.description }}
                
                .content-section.stats-section
                    .stat-box
                        span.label РАУНДІВ
                        span.value {{ tournament.rounds }}
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

                .content-section(v-if="authStore.isAdmin" class="admin-dota-section")
                    h3.section-label ПЕРЕВІРКА МАТЧУ (АДМІН)
                    .admin-dota-form
                        input.dota-input(
                            v-model="dotaMatchId" 
                            type="text" 
                            placeholder="Введіть Dota 2 Match ID (напр. 7600000000)"
                        )
                        button.dota-btn(@click="fetchDotaMatch" :disabled="!dotaMatchId || dotaMatchLoading") {{ dotaMatchLoading ? 'Шукаємо...' : 'Знайти' }}
                    
                    .dota-result(v-if="dotaMatchData")
                        .dota-score(:class="dotaMatchData.radiant_win ? 'radiant-win' : 'dire-win'")
                            span.team.radiant Radiant {{ dotaMatchData.radiant_score }}
                            span.vs -
                            span.team.dire {{ dotaMatchData.dire_score }} Dire
                        
                        .dota-info
                            span.info-item Переможець: {{ dotaMatchData.radiant_win ? 'Radiant' : 'Dire' }}
                            span.info-item Тривалість: {{ Math.floor(dotaMatchData.duration / 60) }}:{{ (dotaMatchData.duration % 60).toString().padStart(2, '0') }}
                    
                    .error-text(v-if="dotaMatchError") {{ dotaMatchError }}

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
                            span.value {{ (tournament.status || 'ВІДКРИТИЙ').toUpperCase() }}
                        Button.delete-btn(@click="handleDelete" type="button" label="Видалити турнір")
    
    .error-state(v-else)
        p Турнір не знайдено.
        NuxtLink(to="/") Повернутися до списку
    
    DeleteModal(
        v-if="tournament"
        :isOpen="isDeleteModalOpen" 
        :tournament="tournament" 
        @close="isDeleteModalOpen = false" 
        @delete="onTournamentDeleted"
    )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useTournamentsStore } from '../../stores/tournaments.store'
import { useLoginStore } from '../../stores/auth.store'
import DeleteModal from '../../components/tournaments/deleteModal.vue'

const route = useRoute()
const store = useTournamentsStore()
const authStore = useLoginStore()
const teamsStore = useTeamsStore()

const tournament = ref<any>(null)
const teams = ref<any[]>([])
const isDeleteModalOpen = ref(false)
const shouldHideTeams = computed(() => {
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

onMounted(async () => {
    try {
        tournament.value = await store.fetchTournamentById(route.params.id as string)
        if(!shouldHideTeams.value) {
            const teamsResponse = await teamsStore.loadFromDatabase(true)
            teams.value = teamsResponse?.data || []
        }
    } catch (e) {
        console.error("Failed to load tournament detail")
    }
})

const handleDelete = () => {
    isDeleteModalOpen.value = true
}

const onTournamentDeleted = async () => {
    await navigateTo('/')
}

const dotaMatchId = ref('')
const dotaMatchLoading = ref(false)
const dotaMatchData = ref<any>(null)
const dotaMatchError = ref('')

const fetchDotaMatch = async () => {
    if (!dotaMatchId.value) return
    dotaMatchLoading.value = true
    dotaMatchError.value = ''
    dotaMatchData.value = null
    try {
        const response = await fetch(`https://api.opendota.com/api/matches/${dotaMatchId.value}`)
        if (!response.ok) throw new Error('Матч не знайдено або помилка API')
        const data = await response.json()
        if (data.error) throw new Error(data.error)
        dotaMatchData.value = data
    } catch (e: any) {
        dotaMatchError.value = e.message || 'Помилка завантаження'
    } finally {
        dotaMatchLoading.value = false
    }
}
</script>

<style lang="scss" scoped>
.tournament-detail {
    padding-top: 60px;
    min-height: 80vh;
    animation: fadeIn 0.4s ease-out;

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

.admin-dota-section {
    background: var(--color-surface);
    border: 1px dashed var(--color-primary);
    padding: 24px;
    margin-top: 32px;

    .admin-dota-form {
        display: flex;
        gap: 16px;
        margin-top: 16px;

        .dota-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid var(--color-border);
            font-family: var(--font-sans);
            font-size: 14px;
            background: var(--color-bg);
            color: var(--color-text);

            &:focus {
                outline: none;
                border-color: var(--color-primary);
            }
        }

        .dota-btn {
            padding: 0 24px;
            background: var(--color-text);
            color: var(--color-bg);
            border: none;
            font-family: var(--font-display);
            font-weight: 600;
            text-transform: uppercase;
            cursor: pointer;
            transition: opacity 0.2s;

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }

    .dota-result {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--color-border);

        .dota-score {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            font-family: var(--font-display);
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 16px;

            .team {
                &.radiant { color: #10b981; } /* Emerald */
                &.dire { color: #ef4444; }    /* Red */
            }

            .vs {
                color: var(--color-text-muted);
            }
        }

        .dota-info {
            display: flex;
            justify-content: center;
            gap: 24px;
            font-size: 14px;
            color: var(--color-text-muted);
        }
    }

    .error-text {
        color: var(--color-error, #ef4444);
        margin-top: 16px;
        font-size: 14px;
    }
}
</style>
