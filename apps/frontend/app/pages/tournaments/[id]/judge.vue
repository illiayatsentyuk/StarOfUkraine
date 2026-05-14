<template lang="pug">
.jury-container
    section.jury-dashboard
        aside.sidebar
            .sidebar__header
                NuxtLink.back-btn(:to="`/tournaments/${tournamentId}`")
                    i.pi.pi-arrow-left
                    span НАЗАД ДО ТУРНІРУ
                h2.title ПАНЕЛЬ СУДДІ
                .stats
                    .stat-item
                        span.label ВСЬОГО РОБІТ:
                        span.value {{ filteredAssignments.length }}
                    .stat-item
                        span.label ОЦІНЕНО:
                        span.value.success {{ evaluatedCount }}

            .teams-nav
                .empty-sidebar(v-if="!teams.length && !loading")
                    i.pi.pi-info-circle
                    p Призначених команд немає

                button.team-item(
                    v-for="team in teams"
                    :key="team.id"
                    :class="{ 'active': selectedTeamId === team.id, 'done': isTeamFullyEvaluated(team.id) }"
                    @click="selectedTeamId = team.id"
                )
                    .team-item__indicator
                        i.pi.pi-check-circle(v-if="isTeamFullyEvaluated(team.id)")
                        i.pi.pi-users(v-else)
                    .team-item__info
                        span.name {{ team.name }}
                        span.count {{ getPendingCount(team.id) }} очікує

        main.main-content
            .loading-state(v-if="loading")
                i.pi.pi-spin.pi-spinner
                span Завантаження...

            template(v-else-if="selectedTeam")
                header.main-header
                    .team-badge КОМАНДА
                    h1.team-name {{ selectedTeam.name }}
                    p.tournament-name {{ tournamentName }}

                .submissions-grid
                    .sub-card(
                        v-for="assign in selectedTeam.assignments"
                        :key="assign.id"
                        :class="{ 'evaluated': assign.submission.status === 'EVALUATED' }"
                    )
                        .sub-card__header
                            .task-info
                                span.task-round(v-if="assign.submission.task") РАУНД {{ assign.submission.task.order }}
                                h3.task-name {{ assign.submission.task?.name || 'Завдання' }}
                            .status-tag(:class="assign.submission.status") {{ assign.submission.status === 'EVALUATED' ? 'ОЦІНЕНО' : 'ОЧІКУЄ' }}

                        .sub-card__body
                            .links-grid
                                a.link-btn(v-if="assign.submission.githubUrl" :href="assign.submission.githubUrl" target="_blank" title="GitHub")
                                    i.pi.pi-github
                                a.link-btn(v-if="assign.submission.videoUrl" :href="assign.submission.videoUrl" target="_blank" title="Video")
                                    i.pi.pi-youtube
                                a.link-btn(v-if="assign.submission.liveUrl" :href="assign.submission.liveUrl" target="_blank" title="Live")
                                    i.pi.pi-external-link
                            
                            .grading-section
                                .rubric-items(v-if="getRubric(assign).length")
                                    .rubric-item(v-for="item in getRubric(assign)" :key="item.id")
                                        .r-head
                                            span.r-label {{ item.label }}
                                            span.r-max (макс. {{ item.maxPoints }})
                                        input.r-number-input(
                                            type="number"
                                            v-model.number="scores[assign.submission.id][item.id]"
                                            :min="0"
                                            :max="item.maxPoints"
                                            :class="{ 'invalid': scores[assign.submission.id][item.id] > item.maxPoints }"
                                            placeholder="0"
                                        )
                                
                                .no-rubric(v-else)
                                    i.pi.pi-exclamation-circle
                                    span Критерії відсутні

                        .sub-card__footer
                            .total-score
                                span БАЛ:
                                span.num {{ getTotal(assign.submission.id) }}
                            Button.save-btn(
                                :label="assign.submission.status === 'EVALUATED' ? 'ОНОВИТИ' : 'ЗБЕРЕГТИ'"
                                :loading="submitting[assign.submission.id]"
                                @click="submitGrade(assign.submission.id)"
                            )

            .empty-state(v-else)
                i.pi.pi-verified
                h2 ПАНЕЛЬ СУДДІ
                p Оберіть команду для перевірки робіт.
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const api = useApi()
const toast = useServerSafeToast()

const tournamentId = computed(() => route.params.id as string)
const loading = ref(true)
const assignments = ref<any[]>([])
const selectedTeamId = ref<string | null>(null)
const submitting = ref<Record<string, boolean>>({})
const scores = ref<Record<string, Record<string, number>>>({})

const filteredAssignments = computed(() => {
    if (!assignments.value.length) return []
    const hasTaskData = assignments.value.some(a => a.submission?.task)
    if (!hasTaskData) return assignments.value
    return assignments.value.filter(a => {
        const tid = a.submission?.task?.tournamentId
        return !tid || String(tid) === String(tournamentId.value)
    })
})

const tournamentName = computed(() => {
    return filteredAssignments.value[0]?.submission?.task?.tournament?.name || 'Турнір'
})

const teams = computed(() => {
    const map = new Map<string, { id: string; name: string; assignments: any[] }>()
    filteredAssignments.value.forEach(a => {
        const team = a.submission?.team
        if (!team) return
        if (!map.has(team.id)) {
            map.set(team.id, { id: team.id, name: team.name, assignments: [] })
        }
        map.get(team.id)!.assignments.push(a)
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const selectedTeam = computed(() => teams.value.find(t => t.id === selectedTeamId.value))

const evaluatedCount = computed(() => filteredAssignments.value.filter(a => a.submission?.status === 'EVALUATED').length)

function isTeamFullyEvaluated(teamId: string) {
    const team = teams.value.find(t => t.id === teamId)
    return team?.assignments.every(a => a.submission?.status === 'EVALUATED')
}

function getPendingCount(teamId: string) {
    const team = teams.value.find(t => t.id === teamId)
    return team?.assignments.filter(a => a.submission?.status === 'PENDING').length || 0
}

function getRubric(assign: any) {
    return assign.submission?.task?.criteria?.rubric || []
}

function getTotal(subId: string) {
    const entry = scores.value[subId]
    if (!entry) return 0
    return Object.values(entry).reduce((s, v) => s + (v || 0), 0)
}

function initGrading(sub: any) {
    if (!sub) return
    if (!scores.value[sub.id]) {
        const entry: Record<string, number> = {}
        const rubric = sub.task?.criteria?.rubric || []
        rubric.forEach((item: any) => { 
            const existingEval = sub.evaluations?.[0]?.scores?.find((s: any) => s.id === item.id)
            entry[item.id] = existingEval ? existingEval.points : 0
        })
        scores.value[sub.id] = entry
    }
}

async function submitGrade(subId: string) {
    const subScores = scores.value[subId] || {}
    const sub = filteredAssignments.value.find(a => a.submission?.id === subId)?.submission
    const rubric = sub?.task?.criteria?.rubric || []
    
    for (const item of rubric) {
        const val = subScores[item.id] || 0
        if (val > item.maxPoints) {
            toast.error(`Критерій "${item.label}" не може перевищувати ${item.maxPoints} балів`)
            return
        }
        if (val < 0) {
            toast.error(`Критерій "${item.label}" не може бути менше 0`)
            return
        }
    }

    const scoreEntries = rubric.map((item: any) => ({
        id: item.id,
        points: subScores[item.id] ?? 0
    }))

    submitting.value[subId] = true
    try {
        await api.post(`/submissions/${subId}/evaluate`, { scores: scoreEntries, comment: '' })
        toast.success('Збережено')
        
        const assignment = assignments.value.find(a => a.submission?.id === subId)
        if (assignment && assignment.submission) assignment.submission.status = 'EVALUATED'
    } catch (e: any) {
        toast.error(e.response?.data?.message || 'Помилка')
    } finally {
        submitting.value[subId] = false
    }
}

onMounted(async () => {
    try {
        const res = await api.get('/jury/my-assignments')
        assignments.value = Array.isArray(res.data) ? res.data : []
        assignments.value.forEach(a => {
            if (a.submission) initGrading(a.submission)
        })
        
        if (teams.value.length > 0) {
            const firstPendingTeam = teams.value.find(t => !isTeamFullyEvaluated(t.id))
            selectedTeamId.value = firstPendingTeam ? firstPendingTeam.id : teams.value[0].id
        }
    } catch (e) {
        toast.error('Помилка завантаження')
    } finally {
        loading.value = false
    }
})

definePageMeta({
    middleware: ['auth']
})
</script>

<style scoped lang="scss">
.jury-container {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 48px 60px 48px;
    @media (max-width: 768px) { padding: 0 24px 40px 24px; }
}

.jury-dashboard {
    display: flex;
    height: calc(100vh - 180px);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0;
    overflow: hidden;
    margin-top: 32px;
    color: var(--color-text);
    @media (max-width: 1024px) { flex-direction: column; height: auto; }
}

.sidebar {
    width: 320px;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    @media (max-width: 1024px) { width: 100%; border-right: none; border-bottom: 1px solid var(--color-border); }

    &__header {
        padding: 24px;
        border-bottom: 1px solid var(--color-border);
        .back-btn { display: flex; align-items: center; gap: 8px; color: var(--color-text-muted); text-decoration: none; font-size: 10px; font-weight: 700; margin-bottom: 16px; &:hover { color: var(--color-primary); } }
        .title { font-family: var(--font-display); font-size: 13px; font-weight: 800; margin-bottom: 16px; text-transform: uppercase; }
        .stats { display: flex; gap: 16px; .stat-item { display: flex; flex-direction: column; .label { font-size: 9px; color: var(--color-text-muted); font-weight: 700; } .value { font-size: 16px; font-weight: 800; &.success { color: var(--color-primary); } } } }
    }
}

.teams-nav { flex: 1; overflow-y: auto; padding: 12px; }

.team-item {
    width: 100%; padding: 12px; margin-bottom: 4px; background: transparent; border: 1px solid transparent; border-radius: 4px; display: flex; align-items: center; gap: 12px; cursor: pointer; text-align: left;
    &:hover { background: rgba(255,255,255,0.03); }
    &.active { background: var(--color-primary); border-color: var(--color-primary); .team-item__indicator { background: rgba(255,255,255,0.2); color: white; } .team-item__info { .name { color: white; } .count { color: rgba(255,255,255,0.8); } } }
    &.done:not(.active) { .team-item__indicator { color: var(--color-primary); } }
    &__indicator { width: 32px; height: 32px; border-radius: 4px; background: var(--color-bg); display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--color-text-muted); flex-shrink: 0; }
    &__info { display: flex; flex-direction: column; .name { font-size: 13px; font-weight: 700; } .count { font-size: 10px; color: var(--color-text-muted); } }
}

.main-content { flex: 1; background: var(--color-bg); display: flex; flex-direction: column; overflow-y: auto; }

.main-header {
    padding: 32px 48px; border-bottom: 1px solid var(--color-border);
    .team-badge { font-size: 9px; font-weight: 800; color: var(--color-primary); margin-bottom: 8px; letter-spacing: 1px; }
    .team-name { font-family: var(--font-display); font-size: 24px; font-weight: 900; margin: 0; color: var(--color-text); }
}

.submissions-grid {
    padding: 32px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
    align-items: start;
}

.sub-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    &.evaluated { border-color: var(--color-primary-soft); }

    &__header {
        padding: 20px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: flex-start;
        .task-info { .task-round { font-size: 9px; font-weight: 800; color: var(--color-text-muted); } .task-name { font-size: 16px; font-weight: 800; margin-top: 2px; color: var(--color-text); } }
        .status-tag { padding: 4px 8px; border-radius: 2px; font-size: 9px; font-weight: 800; background: var(--color-bg); &.EVALUATED { color: var(--color-primary); background: var(--color-primary-soft); } }
    }

    &__body {
        padding: 20px; flex: 1;
        .links-grid { display: flex; gap: 8px; margin-bottom: 16px; .link-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 4px; color: var(--color-text); transition: all 0.2s; &:hover { border-color: var(--color-primary); color: var(--color-primary); } } }
        .grading-section {
            .rubric-item { 
                margin-bottom: 16px; 
                .r-head { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 8px; .r-max { color: var(--color-text-muted); font-size: 10px; } } 
                .r-number-input { 
                    width: 100%; 
                    background: var(--color-bg); 
                    border: 1px solid var(--color-border); 
                    border-radius: 4px; 
                    padding: 8px 12px; 
                    color: var(--color-text); 
                    font-size: 14px; 
                    font-weight: 800;
                    outline: none;
                    &:focus { border-color: var(--color-primary); }
                    &.invalid { border-color: #ff4d4f; background: rgba(255, 77, 79, 0.05); }
                    &::-webkit-inner-spin-button { opacity: 1; }
                } 
            }
            .no-rubric { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #ffb700; background: rgba(255,183,0,0.05); padding: 10px; border-radius: 4px; }
        }
    }

    &__footer {
        padding: 20px; border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;
        .total-score { display: flex; align-items: baseline; gap: 4px; span:first-child { font-size: 9px; font-weight: 800; color: var(--color-text-muted); } .num { font-size: 20px; font-weight: 900; color: var(--color-primary); font-family: var(--font-display); } }
        .save-btn { background: var(--color-primary); border: none; padding: 10px 20px; border-radius: 2px; font-size: 11px; font-weight: 800; color: white !important; }
    }
}

.loading-state, .empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--color-text-muted); i { font-size: 32px; } h2 { color: var(--color-text); font-size: 18px; } }
</style>
