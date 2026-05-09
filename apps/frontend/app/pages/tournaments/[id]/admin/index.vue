<template lang="pug">
section.judge-dashboard
    header.dashboard-header
        .nav-info
            NuxtLink.back-link(:to="`/tournaments/${tournamentId}`")
                i.pi.pi-arrow-left
                span НАЗАД ДО ТУРНІРУ
            h1.title ПАНЕЛЬ СУДДІВСТВА
        .tournament-info(v-if="tournament")
            span.tournament-name {{ tournament.name }}
            span.badge ADMIN MODE

    .loading-overlay(v-if="loading")
        i.pi.pi-spin.pi-spinner
        span Завантаження...

    .empty-tasks(v-else-if="!store.tasks.length")
        i.pi.pi-inbox
        h3 Завдань поки немає
        p Спочатку створіть завдання для турніру

    .dashboard-grid(v-else)
        aside.teams-sidebar
            .sidebar-search
                i.pi.pi-search
                input(type="text" v-model="searchQuery" placeholder="Пошук команди...")

            .teams-list
                .empty-teams(v-if="!filteredTeams.length")
                    span Команд ще немає

                button.team-item(
                    v-for="team in filteredTeams"
                    :key="team.id"
                    :class="{ 'is-active': selectedTeamId === team.id }"
                    @click="selectedTeamId = team.id"
                )
                    .team-avatar {{ team.name[0] }}
                    .team-info
                        span.name {{ team.name }}
                        span.meta {{ getSubmittedCount(team.id) }}/{{ store.tasks.length }} здано
                    i.pi.pi-chevron-right

        main.submissions-view
            template(v-if="selectedTeam")
                .view-header
                    h2 ОГЛЯД РОБІТ: {{ selectedTeam.name }}
                    .team-stats
                        .stat
                            span.val {{ getTeamTotalScore(selectedTeam.id) }}
                            span.lbl БАЛІВ

                .tasks-grid
                    .task-submission-card(v-for="task in store.tasks" :key="task.id")
                        .task-header
                            h3 {{ task.name }}
                            span.points-max {{ getTaskMaxPoints(task) }} pts max

                        template(v-if="getSubmission(selectedTeam.id, task.id)")
                            .submission-links
                                a.link-btn(
                                    :href="getSubmission(selectedTeam.id, task.id).githubUrl"
                                    target="_blank"
                                )
                                    i.pi.pi-github
                                    span Code
                                a.link-btn(
                                    v-if="getSubmission(selectedTeam.id, task.id).videoUrl"
                                    :href="getSubmission(selectedTeam.id, task.id).videoUrl"
                                    target="_blank"
                                )
                                    i.pi.pi-youtube
                                    span Demo

                            .graded-info(v-if="getSubmission(selectedTeam.id, task.id).status === 'EVALUATED'")
                                i.pi.pi-check-circle
                                span ОЦІНЕНО

                            .grading-form(v-else-if="authStore.isJury")
                                .criteria-list(v-if="task.criteria?.rubric?.length")
                                    .criterion-row(v-for="c in task.criteria.rubric" :key="c.id")
                                        span.c-label {{ c.label }}
                                        span.c-max max {{ c.maxPoints }}
                                        input.c-input(
                                            type="number"
                                            :min="0"
                                            :max="c.maxPoints"
                                            v-model.number="gradingData[`${getSubmission(selectedTeam.id, task.id).id}__${c.id}`]"
                                            placeholder="0"
                                        )

                                .comment-input
                                    Textarea(
                                        v-model="commentsData[getSubmission(selectedTeam.id, task.id).id]"
                                        placeholder="Коментар до роботи (обов'язково)..."
                                        autoResize
                                    )

                                Button.grade-btn(
                                    label="ЗБЕРЕГТИ ОЦІНКУ"
                                    @click="handleGrade(getSubmission(selectedTeam.id, task.id), task)"
                                    :loading="grading[getSubmission(selectedTeam.id, task.id).id]"
                                )
                            
                            .view-only-notice(v-else-if="authStore.isAdmin")
                                i.pi.pi-eye
                                span Тільки перегляд (Оцінювання доступне лише для Журі)

                        .no-submission(v-else)
                            i.pi.pi-clock
                            span Роботу ще не подано

            .empty-view(v-else)
                i.pi.pi-users
                h3 Оберіть команду для перевірки
                p Ви побачите всі подані роботи та зможете виставити бали
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const store = useTasksStore()
const tournamentStore = useTournamentsStore()
const api = useApi()
const toast = useServerSafeToast()

const tournamentId = route.params.id as string
const selectedTeamId = ref<string | null>(null)
const searchQuery = ref('')
const gradingData = ref<Record<string, number>>({})
const commentsData = ref<Record<string, string>>({})
const grading = ref<Record<string, boolean>>({})
const loading = ref(false)

// Real data
const teams = ref<Array<{ id: string; name: string; totalScore: number }>>([])
const leaderboardRows = ref<any[]>([])
// taskId → submission[]
const submissionsMap = ref<Map<string, any[]>>(new Map())

const tournament = computed(() =>
    tournamentStore.tournaments.find(t => t.id === tournamentId)
)

onMounted(async () => {
    loading.value = true
    try {
        if (!tournament.value) {
            await tournamentStore.fetchTournamentById(tournamentId)
        }

        // 1. Load tasks
        await store.fetchTasks(tournamentId)

        // 2. Real teams from leaderboard
        const lbRes = await api.get(`/tournaments/${tournamentId}/leaderboard`)
        leaderboardRows.value = Array.isArray(lbRes.data) ? lbRes.data : []
        teams.value = leaderboardRows.value.map((r: any) => ({
            id: r.team.id,
            name: r.team.name,
            totalScore: r.totalScore ?? 0,
        }))

        // 3. Submissions per task (requires JURY/ADMIN)
        await loadAllSubmissions()
    } catch (e) {
        console.error('Admin dashboard load error', e)
    } finally {
        loading.value = false
    }
})

async function loadAllSubmissions() {
    const results = await Promise.allSettled(
        store.tasks.map(async (task) => {
            try {
                const res = await api.get(`/tasks/${task.id}/submissions`)
                submissionsMap.value.set(
                    task.id,
                    Array.isArray(res.data) ? res.data : []
                )
            } catch {
                submissionsMap.value.set(task.id, [])
            }
        })
    )
    // trigger reactivity
    submissionsMap.value = new Map(submissionsMap.value)
}

const filteredTeams = computed(() =>
    teams.value.filter(t =>
        t.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
)

const selectedTeam = computed(() =>
    teams.value.find(t => t.id === selectedTeamId.value) ?? null
)

function getSubmission(teamId: string, taskId: string) {
    const subs = submissionsMap.value.get(taskId) ?? []
    return subs.find((s: any) => s.teamId === teamId) ?? null
}

function getSubmittedCount(teamId: string) {
    return store.tasks.filter(t => getSubmission(teamId, t.id)).length
}

function getTeamTotalScore(teamId: string) {
    const row = leaderboardRows.value.find((r: any) => r.team.id === teamId)
    return row?.totalScore ?? 0
}

function getTaskMaxPoints(task: any) {
    return (task.criteria?.rubric ?? []).reduce(
        (sum: number, c: any) => sum + (c.maxPoints ?? 0),
        0
    )
}

async function handleGrade(submission: any, task: any) {
    const rubric: any[] = task.criteria?.rubric ?? []
    const scores = rubric.map((c: any) => ({
        id: c.id,
        points: Number(gradingData.value[`${submission.id}__${c.id}`] ?? 0),
    }))
    const comment = commentsData.value[submission.id] || "Оцінено суддею"

    grading.value[submission.id] = true
    try {
        await store.gradeSubmission(submission.id, scores, comment)
        // Update local status
        const subs = submissionsMap.value.get(task.id) ?? []
        const idx = subs.findIndex((s: any) => s.id === submission.id)
        if (idx !== -1) {
            subs[idx] = { ...subs[idx], status: 'EVALUATED' }
            submissionsMap.value.set(task.id, [...subs])
            submissionsMap.value = new Map(submissionsMap.value)
        }
    } finally {
        grading.value[submission.id] = false
    }
}
</script>

<style scoped lang="scss">
.judge-dashboard {
    max-width: 1600px;
    margin: 0 auto;
    padding: 32px;
    background: var(--color-bg);
    min-height: 100vh;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-border);

    .back-link {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: var(--color-text-muted);
        font-size: 13px;
        margin-bottom: 8px;
        &:hover { color: var(--color-primary); }
    }

    .title {
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 800;
        margin: 0;
    }

    .tournament-info {
        text-align: right;
        .tournament-name {
            display: block;
            font-weight: 700;
            font-size: 14px;
            color: var(--color-text-muted);
        }
        .badge {
            font-size: 10px;
            font-weight: 800;
            background: var(--color-primary);
            color: white;
            padding: 2px 8px;
        }
    }
}

.loading-overlay, .empty-tasks {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120px 0;
    gap: 16px;
    color: var(--color-text-muted);
    i { font-size: 48px; }
    h3 { font-size: 20px; font-weight: 700; margin: 0; color: var(--color-text); }
    p { font-size: 14px; margin: 0; }
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 32px;
    align-items: start;
}

.teams-sidebar {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    overflow: hidden;
    height: calc(100vh - 200px);
    display: flex;
    flex-direction: column;

    .sidebar-search {
        padding: 16px;
        border-bottom: 1px solid var(--color-border);
        position: relative;
        i { position: absolute; left: 28px; top: 28px; color: var(--color-text-muted); }
        input {
            width: 100%;
            padding: 10px 12px 10px 36px;
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            color: var(--color-text);
            font-size: 14px;
            &:focus { outline: none; border-color: var(--color-primary); }
        }
    }

    .empty-teams {
        padding: 32px 16px;
        text-align: center;
        color: var(--color-text-muted);
        font-size: 13px;
    }

    .teams-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .team-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: none;
        background: none;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;

        &:hover { background: var(--color-bg); }
        &.is-active {
            background: var(--color-bg);
            border-left: 3px solid var(--color-primary);
            .team-avatar { background: var(--color-primary); color: #fff; }
        }

        .team-avatar {
            width: 40px;
            height: 40px;
            background: var(--color-border);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            color: var(--color-text);
            flex-shrink: 0;
        }

        .team-info {
            flex: 1;
            .name { display: block; font-weight: 700; font-size: 14px; color: var(--color-text); }
            .meta { font-size: 11px; color: var(--color-text-muted); font-weight: 600; }
        }

        i { font-size: 12px; color: var(--color-text-muted); }
    }
}

.submissions-view {
    .view-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        h2 { font-size: 20px; font-weight: 800; margin: 0; font-family: var(--font-display); }

        .team-stats .stat {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            .val { font-size: 28px; font-weight: 800; color: var(--color-primary); }
            .lbl { font-size: 10px; font-weight: 700; color: var(--color-text-muted); letter-spacing: 1px; }
        }
    }

    .tasks-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;

        @media (max-width: 1200px) { grid-template-columns: 1fr; }
    }

    .task-submission-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        padding: 24px;

        .task-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
            h3 { font-size: 15px; font-weight: 700; margin: 0; font-family: var(--font-display); }
            .points-max { font-size: 11px; font-weight: 700; color: var(--color-text-muted); white-space: nowrap; }
        }

        .submission-links {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            .link-btn {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: var(--color-bg);
                border: 1px solid var(--color-border);
                text-decoration: none;
                font-size: 12px;
                font-weight: 700;
                color: var(--color-text);
                transition: all 0.2s;
                &:hover { border-color: var(--color-primary); color: var(--color-primary); }
            }
        }

        .graded-info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #16a34a;
            font-size: 13px;
            font-weight: 700;
            i { font-size: 18px; }
        }

        .grading-form {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding-top: 16px;
            border-top: 1px dashed var(--color-border);

            .criteria-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .criterion-row {
                display: grid;
                grid-template-columns: 1fr auto 80px;
                align-items: center;
                gap: 8px;
                .c-label { font-size: 13px; font-weight: 600; }
                .c-max { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; }
                .c-input {
                    height: 36px;
                    border: 1px solid var(--color-border);
                    background: var(--color-bg);
                    color: var(--color-text);
                    padding: 0 8px;
                    font-size: 14px;
                    text-align: center;
                    width: 100%;
                    &:focus { outline: none; border-color: var(--color-primary); }
                }
            }

            .comment-input {
                :deep(textarea) {
                    width: 100%;
                    min-height: 80px;
                    background: var(--color-bg);
                    color: var(--color-text);
                    padding: 12px;
                    font-size: 13px;
                    resize: vertical;
                    font-family: inherit;
                    &:focus { outline: none; border-color: var(--color-primary); }
                }
            }

            :deep(.grade-btn) {
                width: 100%;
                background: var(--color-primary) !important;
                border: none !important;
                color: white !important;
                font-size: 12px !important;
                font-weight: 700 !important;
                padding: 12px !important;
                letter-spacing: 1px !important;
            }
        }

        .no-submission {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--color-text-muted);
            font-size: 13px;
            font-weight: 600;
            padding: 12px;
            background: var(--color-bg);
        }

        .view-only-notice {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 16px;
            padding: 12px;
            background: rgba(228, 35, 19, 0.05);
            border: 1px dashed var(--color-primary);
            color: var(--color-primary);
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            i { font-size: 16px; }
        }
    }
}

.empty-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    color: var(--color-text-muted);
    i { font-size: 64px; margin-bottom: 24px; }
    h3 { font-size: 20px; font-weight: 700; margin: 0 0 8px 0; color: var(--color-text); }
    p { font-size: 14px; }
}
</style>
