<template lang="pug">
section.judge-dashboard
    header.dashboard-header
        .nav-info
            NuxtLink.back-link(:to="`/tournaments/${route.params.id}`")
                i.pi.pi-arrow-left
                span НАЗАД ДО ТУРНІРУ
            h1.title ПАНЕЛЬ СУДДІВСТВА
        .tournament-info(v-if="tournament")
            span.tournament-name {{ tournament.name }}
            span.badge ADMIN MODE

    .dashboard-grid
        // Left: Teams List
        aside.teams-sidebar
            .sidebar-search
                i.pi.pi-search
                input(type="text" v-model="searchQuery" placeholder="Пошук команди...")
            
            .teams-list
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

        // Main: Team's Tasks & Submissions
        main.submissions-view
            template(v-if="selectedTeam")
                .view-header
                    h2 ОГЛЯД РОБІТ: {{ selectedTeam.name }}
                    .team-stats
                        .stat
                            span.val {{ getTeamTotalPoints(selectedTeam.id) }}
                            span.lbl БАЛІВ
                
                .tasks-grid
                    .task-submission-card(v-for="task in store.tasks" :key="task.id")
                        .task-info
                            .task-header
                                h3 {{ task.name }}
                                span.points-max {{ task.criteria?.rubric?.reduce((sum, item) => sum + item.maxPoints, 0) || 0 }} pts max
                            
                            .submission-status(v-if="getSubmission(selectedTeam.id, task.id)")
                                .links
                                    a.link-btn(:href="getSubmission(selectedTeam.id, task.id).githubUrl" target="_blank")
                                        i.pi.pi-github
                                        span Code
                                    a.link-btn(v-if="getSubmission(selectedTeam.id, task.id).youtubeUrl" :href="getSubmission(selectedTeam.id, task.id).youtubeUrl" target="_blank")
                                        i.pi.pi-youtube
                                        span Demo
                                
                                .grading-form(v-if="getSubmission(selectedTeam.id, task.id).status === 'PENDING'")
                                    InputText.score-input(
                                        v-model="gradingScores[`${selectedTeam.id}-${task.id}`]"
                                        type="number"
                                        placeholder="0"
                                    )
                                    Button.grade-btn(
                                        label="ОЦІНИТИ"
                                        @click="handleGrade(selectedTeam.id, task.id)"
                                        :loading="store.loading"
                                    )
                                .graded-info(v-else)
                                    i.pi.pi-check-circle
                                    span ОЦІНЕНО: 
                                    strong ОЦІНЕНО
                            
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
const teamsStore = useTeamsStore()

const tournamentId = route.params.id as string
const selectedTeamId = ref<string | null>(null)
const searchQuery = ref('')
const gradingScores = ref<Record<string, string>>({})

const tournament = computed(() => tournamentStore.tournaments.find(t => t.id === tournamentId))
const teams = ref<any[]>([])

onMounted(async () => {
    if (tournamentStore.tournaments.length === 0) {
        await tournamentStore.loadFromDatabase(true)
    }
    
    // Ensure we have the specific tournament data
    if (!tournament.value) {
        await tournamentStore.fetchTournamentById(tournamentId)
    }

    await store.fetchTasks(tournamentId)
    // Mocking teams fetch for judge dashboard
    teams.value = [
        { id: 't1', name: 'CyberCossacks' },
        { id: 't2', name: 'Digital Nomads' },
        { id: 't3', name: 'Frontend Wizards' },
        { id: 't4', name: 'Bug Hunters' }
    ]
    // Mock submissions for multiple teams
    await store.fetchSubmissions('1') // Just to populate store with some data
})

const filteredTeams = computed(() => {
    return teams.value.filter(t => t.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const selectedTeam = computed(() => teams.value.find(t => t.id === selectedTeamId.value))

function getSubmission(teamId: string, taskId: string) {
    // In real app, store would hold submissions mapped by team/task
    // For mock, we return data if it exists in store.submissions
    return store.submissions.find(s => s.taskId === taskId)
}

function getSubmittedCount(teamId: string) {
    return store.tasks.filter(t => getSubmission(teamId, t.id)).length
}

function getTeamTotalPoints(teamId: string) {
    return store.tasks.reduce((acc, t) => {
        const sub = getSubmission(teamId, t.id)
        return acc + (sub?.score || 0)
    }, 0)
}

async function handleGrade(teamId: string, taskId: string) {
    const score = Number(gradingScores.value[`${teamId}-${taskId}`])
    if (isNaN(score)) return
    
    // In real app, we need submissionId
    const sub = getSubmission(teamId, taskId)
    if (sub) {
        await store.gradeSubmission(sub.id, [{ id: 'total', points: score }])
    }
}
</script>

<style scoped lang="scss">
.judge-dashboard {
    max-width: 1600px;
    margin: 0 auto;
    padding: 32px;
    background: #f8fafc;
    min-height: 100vh;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e2e8f0;

    .back-link {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: #64748b;
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
            color: #64748b;
        }
        .badge {
            font-size: 10px;
            font-weight: 800;
            background: #ef4444;
            color: white;
            padding: 2px 8px;
        }
    }
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 32px;
    align-items: start;
}

.teams-sidebar {
    background: white;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    height: calc(100vh - 200px);
    display: flex;
    flex-direction: column;

    .sidebar-search {
        padding: 16px;
        border-bottom: 1px solid #e2e8f0;
        position: relative;
        i { position: absolute; left: 28px; top: 28px; color: #94a3b8; }
        input {
            width: 100%;
            padding: 10px 12px 10px 36px;
            background: #f1f5f9;
            border: none;
            font-size: 14px;
            &:focus { outline: none; background: #e2e8f0; }
        }
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

        &:hover { background: #f1f5f9; }
        &.is-active {
            background: #e2e8f0;
            .team-avatar { background: var(--color-primary); color: white; }
        }

        .team-avatar {
            width: 40px;
            height: 40px;
            background: #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            color: #475569;
        }

        .team-info {
            flex: 1;
            .name { display: block; font-weight: 700; font-size: 14px; }
            .meta { font-size: 11px; color: #64748b; font-weight: 600; }
        }

        i { font-size: 12px; color: #94a3b8; }
    }
}

.submissions-view {
    .view-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        h2 { font-size: 20px; font-weight: 800; }
        
        .team-stats {
            .stat {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                .val { font-size: 24px; font-weight: 800; color: var(--color-primary); }
                .lbl { font-size: 10px; font-weight: 700; color: #64748b; }
            }
        }
    }

    .tasks-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .task-submission-card {
        background: white;
        border: 1px solid #e2e8f0;
            padding: 20px;

        .task-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
            h3 { font-size: 15px; font-weight: 700; margin: 0; }
            .points-max { font-size: 11px; font-weight: 700; color: #94a3b8; }
        }

        .submission-status {
            .links {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                .link-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: #f1f5f9;
                    text-decoration: none;
                    font-size: 12px;
                    font-weight: 700;
                    color: #475569;
                    &:hover { background: #e2e8f0; }
                }
            }

            .grading-form {
                display: flex;
                gap: 8px;
                .score-input {
                    flex: 1;
                    height: 38px;
                            border: 1px solid #e2e8f0;
                    padding: 0 12px;
                    font-size: 14px;
                    background: #f8fafc;
                }
                :deep(.grade-btn) {
                    background: var(--color-primary);
                    border: none;
                    color: white;
                    padding: 0 16px;
                    font-size: 12px;
                    font-weight: 700;
                        }
            }

            .graded-info {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #10b981;
                font-size: 13px;
                font-weight: 700;
                i { font-size: 16px; }
            }
        }

        .no-submission {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #94a3b8;
            font-size: 13px;
            font-weight: 600;
            padding: 12px;
            background: #f8fafc;
        }
    }
}

.empty-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    color: #94a3b8;
    i { font-size: 64px; margin-bottom: 24px; }
    h3 { font-size: 20px; font-weight: 700; margin: 0 0 8px 0; color: #64748b; }
    p { font-size: 14px; }
}
</style>
