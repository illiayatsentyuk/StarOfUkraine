<template lang="pug">
section.task-detail
    .task-detail__nav
        NuxtLink.back-link(:to="`/tournaments/${route.params.id}/tasks`")
            i.pi.pi-arrow-left
            span НАЗАД ДО ЗАВДАНЬ

    .loading-state(v-if="store.loading && !task")
        i.pi.pi-spin.pi-spinner
        span Завантаження...

    template(v-else-if="task")
        .task-detail__grid
            // Left Sidebar: Tasks List
            aside.task-sidebar-left
                TaskSidebar(
                    :tasks="store.tasks"
                    :currentTaskId="task?.id || ''"
                )

            // Main content: Task Description
            main.task-main
                TaskDetailHero(:task="task")
                
                .content-card
                    .content-section
                        h3.section-title ОПИС ЗАВДАННЯ
                        .description-text {{ task.description }}
                    
                    .content-section.examples(v-if="task.examples")
                        h3.section-title ПРИКЛАДИ
                        .example-box(v-for="(ex, i) in task.examples" :key="i")
                            .example-header ПРИКЛАД # {{ i + 1 }}
                            .example-content
                                .input
                                    span ВХІДНІ ДАНІ
                                    pre {{ ex.input }}
                                .output
                                    span ВИХІДНІ ДАНІ
                                    pre {{ ex.output }}

            // Right sidebar: Submission Form + Admin Link
            aside.task-side-right
                .side-sticky-wrapper
                    TaskSubmissionForm(
                        v-if="authStore.isAuthenticated && !authStore.isAdmin && !authStore.isJury"
                        :task="task"
                        :loading="store.loading"
                        :mySubmission="store.mySubmissions[task.id] ?? null"
                        @submit="handleSubmit"
                    )

                    NuxtLink.admin-link(
                        v-if="authStore.isJury"
                        :to="`/tournaments/${route.params.id}/tasks/${task.id}/admin`"
                    )
                        i.pi.pi-cog
                        span ПАНЕЛЬ ПЕРЕВІРКИ

    .error-state(v-else)
        p Завдання не знайдено
        NuxtLink.retry-link(:to="`/tournaments/${route.params.id}/tasks`") Повернутися до списку
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const route = useRoute()
const store = useTasksStore()
const authStore = useLoginStore()
const teamsStore = useTeamsStore()

const taskId = computed(() => route.params.taskId as string)
const tournamentId = computed(() => route.params.id as string)
const task = computed(() => store.tasks.find(t => t.id === taskId.value))

onMounted(async () => {
    await teamsStore.initActiveTeam()
    const hasCurrentTournamentTasks = store.tasks.some(t => t.tournamentId === tournamentId.value)
    const hasCurrentTask = store.tasks.some(t => t.id === taskId.value)

    if (!hasCurrentTournamentTasks || !hasCurrentTask) {
        await store.fetchTasks(tournamentId.value)
    }

    // Fetch my submission by teamId (new API)
    if (authStore.isAuthenticated && !authStore.isAdmin && !authStore.isJury) {
        const teamId = teamsStore.activeTeamId || teamsStore.currentTeam?.id
        if (teamId) {
            await store.fetchMySubmission(taskId.value, teamId)
        }
    }
})

async function handleSubmit(payload: { github: string; youtube: string; liveUrl?: string; summary?: string }) {
    if (!task.value) return

    const teamId = (route.query.teamId as string) || teamsStore.activeTeamId || teamsStore.currentTeam?.id
    if (!teamId) {
        useServerSafeToast().error('Щоб відправити роботу, потрібно мати команду та бути зареєстрованим у турнірі')
        return
    }

    await store.submitTask(task.value.id, {
        teamId,
        githubUrl: payload.github,
        videoUrl: payload.youtube,
        liveUrl: payload.liveUrl,
        summary: payload.summary,
    })
}
</script>

<style lang="scss" scoped>
.task-detail {
    max-width: 1800px;
    margin: 0 auto;
    padding: 32px;
    background: var(--color-bg);
    min-height: 100vh;

    @media (max-width: 768px) {
        padding: 16px;
    }

    &__nav {
        margin-bottom: 24px;
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: var(--color-text-muted);
            font-size: 13px;
            &:hover { color: var(--color-primary); }
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: 300px 1fr 360px;
        gap: 32px;
        align-items: start;

        @media (max-width: 1440px) {
            grid-template-columns: 280px 1fr 320px;
            gap: 24px;
        }

        @media (max-width: 1200px) {
            grid-template-columns: 250px 1fr;
            .task-side-right { grid-column: span 2; }
        }

        @media (max-width: 900px) {
            grid-template-columns: 1fr;
            .task-sidebar-left, .task-side-right { grid-column: auto; }
        }
    }
}

.task-main {
    .content-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        padding: 40px;
    }

    .content-section {
        margin-bottom: 40px;
        &:last-child { margin-bottom: 0; }
    }

    .section-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--color-primary);
        letter-spacing: 1px;
        margin-bottom: 20px;
        border-left: 3px solid var(--color-primary);
        padding-left: 12px;
    }

    .description-text {
        font-size: 16px;
        line-height: 1.7;
        color: var(--color-text);
        white-space: pre-line;
    }
}

.task-side-right {
    .side-sticky-wrapper {
        display: flex;
        flex-direction: column;
        gap: 20px;
        position: sticky;
        top: 24px;
    }

    .admin-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 16px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        color: var(--color-text);
        text-decoration: none;
        font-weight: 700;
        font-size: 13px;
        transition: all 0.2s;

        i { color: var(--color-primary); }

        &:hover {
            border-color: var(--color-primary);
            background: white;
            transform: translateY(-2px);
        }
    }
}

.example-box {
    background: #1e1e1e;
    overflow: hidden;
    margin-bottom: 16px;

    .example-header {
        background: #2d2d2d;
        padding: 8px 16px;
        font-size: 11px;
        font-weight: 700;
        color: #888;
    }

    .example-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        
        .input, .output {
            padding: 16px;
            span {
                display: block;
                font-size: 10px;
                color: #555;
                margin-bottom: 8px;
            }
            pre {
                margin: 0;
                color: #00ff00;
                font-family: 'Fira Code', monospace;
                font-size: 14px;
            }
        }
        .input { border-right: 1px solid #2d2d2d; }
    }
}

.loading-state, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px 0;
    gap: 16px;
    color: var(--color-text-muted);
}
</style>
