<template lang="pug">
header.tournament-detail__hero
    .status-badge(v-if="status" :style="{ backgroundColor: status.color }") {{ status.label }}
    h1.title {{ name }}
    .tournament-detail__hero__actions(v-if="canSeeTasks")
        NuxtLink.task-btn(
            :to="tasksLink"
            @click="handleTasksClick"
        )
            i.pi.pi-list
            span ПЕРЕГЛЯНУТИ ЗАВДАННЯ
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTeamsStore } from '~/stores/teams.store'
import type { TournamentStatusInfo } from '~/utils/tournament-status-ui'

const props = defineProps<{
    name: string
    status: TournamentStatusInfo | null
    canSeeTasks: boolean
    joinedTeamId?: string | null
}>()

const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const teamsStore = useTeamsStore()
const tournamentId = computed(() => route.params.id as string)

const tasksLink = computed(() => ({
    path: localePath(`/tournaments/${tournamentId.value}/tasks`),
    query: teamsStore.activeTeamId ? { teamId: teamsStore.activeTeamId } : undefined,
}))

function handleTasksClick(e: MouseEvent) {
    if (tournamentId.value) {
        router.push(tasksLink.value)
    }
}
</script>

<style scoped lang="scss">
.tournament-detail__hero {
    margin-bottom: 48px;
    padding-bottom: 40px;
    border-bottom: 1px solid var(--color-border);

    .status-badge {
        display: inline-block;
        background: var(--color-primary);
        color: white;
        padding: 4px 12px;
        font-weight: 700;
        font-size: 10px;
        letter-spacing: 1px;
        margin-bottom: 20px;
        border-radius: 0;
    }

    .title {
        font-family: var(--font-display);
        font-size: 64px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -1.5px;
        margin: 0;
        color: var(--color-text);

        @media (max-width: 768px) {
            font-size: 40px;
        }
    }

    &__actions {
        display: flex;
        gap: 16px;
        margin-top: 32px;
        flex-wrap: wrap;

        .task-btn {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 14px 28px;
            background: var(--color-primary);
            color: white;
            text-decoration: none;
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.5px;
            border-radius: 0;
            transition: all 0.2s;

            @media (max-width: 480px) {
                width: 100%;
                justify-content: center;
                padding: 12px 20px;
                font-size: 12px;
            }

            i { font-size: 14px; }

            &:hover {
                background: var(--color-text);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            &:active {
                transform: translateY(0);
            }
        }
    }
}
</style>
