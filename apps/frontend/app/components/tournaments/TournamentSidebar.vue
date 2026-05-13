<template lang="pug">
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

        NuxtLink.sidebar__table-link(:to="`/tournaments/${tournamentId}/table`")
            span.icon ↗
            span ТАБЛИЦЯ РЕЗУЛЬТАТІВ

        .divider

        .sidebar__footer
            .status-info
                span.label ПОТОЧНИЙ СТАТУС
                span.value(v-if="status" :style="{ color: status.color }") {{ status.label }}

            Button.sidebar__edit(
                v-if="isAdmin"
                type="button"
                label="Редагувати турнір"
                icon="pi pi-pencil"
                @click="$emit('edit')"
                data-testid="edit-tournament-btn"
            )

            Button.sidebar__delete(
                v-if="isAdmin"
                type="button"
                label="Видалити турнір"
                @click="$emit('delete')"
            )

            NuxtLink.sidebar__judge-link(
                v-if="isAdmin && tournament.id"
                :to="`/tournaments/${tournament.id}/jury`"
            )
                Button.sidebar__judge(
                    type="button"
                    label="КЕРУВАННЯ ЖУРІ"
                    icon="pi pi-users"
                )

            NuxtLink.sidebar__judge-link(
                v-if="isJury && tournament.id"
                :to="`/tournaments/${tournament.id}/admin`"
            )
                Button.sidebar__judge(
                    type="button"
                    label="ПАНЕЛЬ СУДДІВСТВА"
                    icon="pi pi-users"
                )

            //- Joined state
            Button.sidebar__joined(
                v-if="isAuthenticated && !isAdmin && isAlreadyJoined"
                type="button"
                label="Ви вже в турнірі"
                icon="pi pi-check"
                :disabled="true"
            )

            //- Join / Create+Join button
            Button.sidebar__create(
                v-if="isAuthenticated && !isAdmin && !isJury && !isAlreadyJoined"
                type="button"
                :label="joinLabel"
                icon="pi pi-arrow-right"
                :loading="joining"
                :disabled="(!isRegistrationActive) || joining"
                @click="$emit('joinTournament')"
            )

            NuxtLink.sidebar__team-link(
                v-if="isAuthenticated && hasTeam && activeTeam"
                :to="`/teams/${activeTeam.id}`"
            )
                Button.sidebar__manage-team(
                    type="button"
                    label="КЕРУВАННЯ КОМАНДОЮ"
                    icon="pi pi-users"
                )
</template>

<script setup lang="ts">
import type { TournamentStatusInfo } from '~/utils/tournament-status-ui'
import type { Tournament } from '~/types'

const props = defineProps<{
    tournament: Tournament
    status: TournamentStatusInfo | null
    isAdmin: boolean
    isJury: boolean
    isAuthenticated: boolean
    isRegistrationActive: boolean
    isAlreadyJoined: boolean
    hasTeam: boolean
    activeTeam: any
    joining: boolean
    shouldHideTeams: boolean
}>()

defineEmits<{
    edit: []
    delete: []
    joinTournament: []
}>()

const tournamentId = computed(() => useRoute().params.id as string)

const joinLabel = computed(() =>
    props.hasTeam ? 'ВСТУПИТИ В ТУРНІР' : 'СТВОРИТИ КОМАНДУ І ВСТУПИТИ'
)
</script>

<style scoped lang="scss">
.sidebar {
    &__card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        padding: 40px;
        position: sticky;
        top: 40px;

        @media (max-width: 768px) {
            padding: 24px;
            top: 16px;
        }

        .section-label {
            font-family: var(--font-display);
            font-size: 12px;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 2px;
            margin: 0;
        }

        .sidebar__team-link {
            margin-top: 12px;
            text-decoration: none;
            width: 100%;
            display: block;
        }

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

        .sidebar__table-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--space-2);
            padding: 14px var(--space-4);
            border: 1px solid var(--color-border);
            text-decoration: none;
            color: var(--color-text);
            font-family: var(--font-display);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            transition: border-color 0.2s, color 0.2s, background 0.2s;

            .icon {
                font-size: 16px;
            }

            &:hover {
                border-color: var(--color-primary);
                color: var(--color-primary);
                background: rgba(228, 35, 19, 0.04);
            }
        }

        .sidebar__footer {
            display: flex;
            flex-direction: column;
            gap: var(--space-4);

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


            .sidebar__judge-link {
                text-decoration: none;
                display: block;
                width: 100%;
            }

            .sidebar__judge-link :deep(.p-button),
            .sidebar__team-link :deep(.p-button) {
                width: 100%;
            }

            :deep(.sidebar__judge.p-button),
            :deep(.sidebar__manage-team.p-button) {
                width: 100%;
                justify-content: center;
                gap: var(--space-2);
                background: var(--color-text);
                border: 1px solid var(--color-text);
                color: #fff;
                font-family: var(--font-display);
                font-size: 13px;
                font-weight: 600;
                padding: 12px var(--space-4);
                border-radius: 0;
                letter-spacing: 1px;
                transition: all 0.2s ease;

                &:hover {
                    background: var(--color-primary) !important;
                    border-color: var(--color-primary) !important;
                }
            }

            :deep(.sidebar__delete.p-button) {
                margin-top: 0;
                width: 100%;
                justify-content: center;
                gap: var(--space-2);
                background: transparent;
                border: 1px solid var(--color-error);
                color: var(--color-error);
                font-family: var(--font-display);
                font-size: 13px;
                font-weight: 600;
                padding: 12px var(--space-4);
                border-radius: 0;
                letter-spacing: 1px;
                transition:
                    background 0.2s ease,
                    border-color 0.2s ease,
                    color 0.2s ease;

                &:not(:disabled):hover {
                    background: var(--color-error) !important;
                    border-color: var(--color-error) !important;
                    color: #fff !important;
                }

                &:focus-visible {
                    outline: 2px solid var(--color-error);
                    outline-offset: 2px;
                }
            }

            :deep(.sidebar__edit.p-button) {
                margin-top: 0;
                width: 100%;
                justify-content: center;
                gap: var(--space-2);
                background: transparent;
                border: 1px solid var(--color-border);
                color: var(--color-text);
                font-family: var(--font-display);
                font-size: 13px;
                font-weight: 600;
                padding: 12px var(--space-4);
                border-radius: 0;
                letter-spacing: 1px;
                transition:
                    background 0.2s ease,
                    border-color 0.2s ease,
                    color 0.2s ease;

                &:not(:disabled):hover {
                    background: var(--color-surface) !important;
                    border-color: var(--color-text) !important;
                }

                &:focus-visible {
                    outline: 2px solid var(--color-text);
                    outline-offset: 2px;
                }
            }

            :deep(.sidebar__joined.p-button) {
                margin-top: 0;
                width: 100%;
                justify-content: center;
                background: transparent;
                border: 2px solid var(--color-success, #16a34a);
                color: var(--color-success, #16a34a);
                font-family: var(--font-display);
                font-size: 13px;
                font-weight: 800;
                padding: 18px var(--space-4);
                border-radius: 0;
                letter-spacing: 2px;
                text-transform: uppercase;
                cursor: default;
                opacity: 1;
            }

            :deep(.sidebar__create.p-button) {
                margin-top: 0;
                width: 100%;
                justify-content: center;
                gap: var(--space-2);
                background: var(--color-primary);
                border: 2px solid var(--color-primary);
                color: #fff;
                font-family: var(--font-display);
                font-size: 13px;
                font-weight: 800;
                padding: 18px var(--space-4);
                border-radius: 0;
                letter-spacing: 2px;
                text-transform: uppercase;
                cursor: pointer;
                transition:
                    background 0.2s ease,
                    border-color 0.2s ease,
                    color 0.2s ease,
                    box-shadow 0.2s ease;

                &:not(:disabled):hover {
                    background: #000 !important;
                    border-color: #000 !important;
                    color: #fff !important;
                    box-shadow: 0 8px 24px rgba(228, 35, 19, 0.2);
                }

                &:not(:disabled):hover .p-button-icon,
                &:not(:disabled):hover .p-button-icon .pi {
                    color: #fff !important;
                }

                &:not(:disabled):active {
                    background: #000 !important;
                    border-color: #000 !important;
                }

                &:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                &:focus-visible:not(:disabled) {
                    outline: 2px solid var(--color-text);
                    outline-offset: 2px;
                }
            }
        }
    }
}
</style>
