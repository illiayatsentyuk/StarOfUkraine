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
import { ref, onMounted } from 'vue'
import { useRoute, navigateTo } from '#app'
import { useTournamentsStore } from '../../stores/tournaments.store'
import DeleteModal from '../../components/deleteModal.vue'

const route = useRoute()
const store = useTournamentsStore()
const tournament = ref<any>(null)
const isDeleteModalOpen = ref(false)

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
</script>

<style lang="scss" scoped>
.tournament-detail {
    max-width: 1440px;
    margin: 0 auto;
    padding: 60px 48px;
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
</style>
