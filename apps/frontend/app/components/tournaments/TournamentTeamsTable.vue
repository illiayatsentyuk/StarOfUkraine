<template lang="pug">
.content-section.tournament-teams-panel(v-if="!shouldHideTeams && teams && teams.length")
    h3.section-label(v-if="isAdmin") ПОСІВ КОМАНД
    h3.section-label(v-else) СПИСОК КОМАНД
    
    p.tournament-teams-panel__hint(v-if="isAdmin") Перетягніть рядки, щоб змінити порядок.

    .tournament-teams-panel__card
        .tournament-teams-panel__actions(v-if="isAdmin")
            button.tournament-teams-panel__btn(
                type="button"
                @click="$emit('shuffle')"
            ) Перемішати випадково

        ClientOnly
            .tournament-teams-panel__table-wrap
                table.tournament-teams-panel__table
                    thead
                        tr
                            th.tournament-teams-panel__th.tournament-teams-panel__th--drag(v-if="isAdmin")
                            th.tournament-teams-panel__th #
                            th.tournament-teams-panel__th Команда
                            th.tournament-teams-panel__th Очки

                    VueDraggableNext(
                        v-model="internalTeams"
                        tag="tbody"
                        :handle="isAdmin ? '.drag-handle' : ''"
                        :animation="200"
                        :disabled="!isAdmin"
                    )
                        tr.tournament-teams-panel__row(
                            v-for="(element, index) in internalTeams"
                            :key="element.id || index"
                        )
                            td.drag-handle(v-if="isAdmin") ⋮⋮
                            td.tournament-teams-panel__num {{ index + 1 }}
                            td.tournament-teams-panel__team {{ element.name || element.teamName || 'Без назви' }}
                            td.tournament-teams-panel__pts {{ element.points != null ? element.points : '—' }}
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'

const props = defineProps<{
    teams: any[]
    isAdmin?: boolean
    shouldHideTeams?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:teams', value: any[]): void
    (e: 'shuffle'): void
}>()

const internalTeams = computed({
    get: () => props.teams,
    set: (val) => emit('update:teams', val)
})
</script>

<style lang="scss" scoped>
.section-label {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 2px;
    margin: 0;
}

.tournament-teams-panel {
    margin-top: var(--space-10);

    &__hint {
        margin: var(--space-3) 0 var(--space-6);
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        line-height: 1.5;
        max-width: 48rem;
    }

    &__card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        padding: var(--space-6);
    }

    &__actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-3);
        margin-bottom: var(--space-6);
    }

    &__btn {
        padding: var(--space-3) var(--space-5);
        border: 1px solid var(--color-border);
        background: var(--color-bg);
        color: var(--color-text);
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        cursor: pointer;
        transition: border-color 0.2s, color 0.2s, background 0.2s;

        &:hover {
            border-color: var(--color-text);
        }

        &--primary {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: #fff;

            &:hover {
                filter: brightness(1.05);
                border-color: var(--color-primary);
            }
        }
    }

    &__table-wrap {
        overflow-x: auto;
        border: 1px solid var(--color-border);
    }

    &__table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--font-size-sm);
    }

    &__th {
        padding: var(--space-4) var(--space-4);
        text-align: left;
        border-bottom: 2px solid var(--color-border);
        font-family: var(--font-display);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: var(--color-text-muted);
        background: var(--color-bg);

        &--drag {
            width: 3rem;
        }
    }

    &__row {
        transition: background 0.15s;

        &:nth-child(even) {
            background: rgba(0, 0, 0, 0.02);
        }

        &:hover {
            background: rgba(0, 0, 0, 0.04);
        }

        td {
            padding: var(--space-4);
            border-bottom: 1px solid var(--color-border);
            vertical-align: middle;
        }

        .drag-handle {
            cursor: grab;
            color: var(--color-text-muted);
            text-align: center;
            user-select: none;
            font-weight: 700;
            letter-spacing: -2px;

            &:active {
                cursor: grabbing;
            }
        }
    }

    &__num {
        font-family: var(--font-display);
        font-weight: 700;
        color: var(--color-text-muted);
        width: 3rem;
    }

    &__team {
        font-weight: 600;
        color: var(--color-text);
    }

    &__pts {
        font-variant-numeric: tabular-nums;
        color: var(--color-text-muted);
        width: 5rem;
    }
}
</style>
