<template lang="pug">
section.evaluate-dashboard
    aside.sidebar
        .sidebar__header
            NuxtLink.back-btn(:to="`/tournaments/${route.params.id}/tasks/${route.params.taskId}`")
                i.pi.pi-arrow-left
                span НАЗАД
            h2.title СПИСОК РОБІТ
            .progress-container
                .progress-bar
                    .progress-fill(:style="{ width: `${progressPercentage}%` }")
                span.progress-text {{ evaluatedCount }} / {{ submissions.length }} ОЦІНЕНО

        .submissions-nav
            button.sub-item(
                v-for="sub in submissions"
                :key="sub.id"
                :class="{ 'active': selectedSubId === sub.id, 'done': sub.status === 'EVALUATED' }"
                @click="selectedSubId = sub.id"
            )
                .sub-item__indicator
                    i.pi.pi-check(v-if="sub.status === 'EVALUATED'")
                    i.pi.pi-circle(v-else)
                .sub-item__info
                    span.team-name {{ sub.team?.name || sub.teamId }}
                    span.status-label {{ sub.status === 'EVALUATED' ? 'ОЦІНЕНО' : 'ОЧІКУЄ' }}

    main.main-content
        .loading-state(v-if="loading && !task")
            i.pi.pi-spin.pi-spinner
            span Завантаження...

        template(v-else-if="selectedSub")
            header.main-header
                .header-top
                    h1.task-name {{ task?.name }}
                    .status-badge(:class="selectedSub.status") {{ selectedSub.status === 'EVALUATED' ? 'ОЦІНЕНО' : 'ОЧІКУЄ ОЦІНКИ' }}
                .team-hero
                    span.label КОМАНДА:
                    h2.team-display {{ selectedSub.team?.name || selectedSub.teamId }}

            .evaluation-grid
                .content-column
                    .info-card
                        h3.card-title МАТЕРІАЛИ РОБОТИ
                        .links-grid
                            a.material-link(v-if="selectedSub.githubUrl" :href="selectedSub.githubUrl" target="_blank")
                                i.pi.pi-github
                                span GITHUB REPO
                            a.material-link(v-if="selectedSub.videoUrl" :href="selectedSub.videoUrl" target="_blank")
                                i.pi.pi-youtube
                                span VIDEO PRESENTATION
                            a.material-link(v-if="selectedSub.liveUrl" :href="selectedSub.liveUrl" target="_blank")
                                i.pi.pi-external-link
                                span LIVE DEMO
                        
                        .summary-box(v-if="selectedSub.summary")
                            h4.box-label КОРОТКИЙ ОПИС
                            p.box-content {{ selectedSub.summary }}

                .grading-column
                    .grading-card
                        h3.card-title ОЦІНЮВАННЯ ЗА КРИТЕРІЯМИ
                        
                        .rubric-list
                            .rubric-item(v-for="item in rubric" :key="item.id")
                                .rubric-info
                                    span.label {{ item.label }}
                                    span.max-points Макс: {{ item.maxPoints }}
                                .rubric-control
                                    input.points-input(
                                        type="number"
                                        v-model.number="scores[selectedSubId][item.id]"
                                        :min="0"
                                        :max="item.maxPoints"
                                    )
                                    .points-slider
                                        .slider-track
                                            .slider-fill(:style="{ width: `${(scores[selectedSubId][item.id] / item.maxPoints) * 100}%` }")
                        
                        .total-score
                            span ЗАГАЛЬНИЙ БАЛ:
                            span.score-value {{ getTotal(selectedSubId) }}
                        
                        .comment-section
                            label.field-label КОМЕНТАР ЖУРІ *
                            textarea.comment-input(
                                v-model="comments[selectedSubId]"
                                rows="4"
                                placeholder="Напишіть конструктивний відгук для команди..."
                            )

                        .actions
                            button.save-btn(
                                :disabled="submitting[selectedSubId]"
                                @click="submit(selectedSubId)"
                            )
                                i.pi(:class="submitting[selectedSubId] ? 'pi-spin pi-spinner' : 'pi-check'")
                                span {{ submitting[selectedSubId] ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ ТА ПЕРЕЙТИ ДАЛІ' }}

        .empty-state(v-else-if="!loading")
            i.pi.pi-inbox
            h2 Оберіть роботу для оцінювання
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const api = useApi()
const toast = useServerSafeToast()

const loading = ref(true)
const task = ref<any>(null)
const submissions = ref<any[]>([])
const selectedSubId = ref<string | null>(null)
const submitting = ref<Record<string, boolean>>({})
const scores = ref<Record<string, Record<string, number>>>({})
const comments = ref<Record<string, string>>({})

const selectedSub = computed(() => 
    submissions.value.find(s => s.id === selectedSubId.value)
)

const rubric = computed<Array<{ id: string; label: string; maxPoints: number }>>(() => {
    const c = task.value?.criteria
    if (!c || !Array.isArray(c.rubric)) return []
    return c.rubric
})

const evaluatedCount = computed(() => 
    submissions.value.filter(s => s.status === 'EVALUATED').length
)

const progressPercentage = computed(() => 
    submissions.value.length ? (evaluatedCount.value / submissions.value.length) * 100 : 0
)

function initSubmission(sub: any) {
    if (!scores.value[sub.id]) {
        const entry: Record<string, number> = {}
        for (const item of rubric.value) entry[item.id] = 0
        scores.value[sub.id] = entry
    }
    if (!comments.value[sub.id]) comments.value[sub.id] = ''
}

function getTotal(subId: string): number {
    const entry = scores.value[subId]
    if (!entry) return 0
    return Object.values(entry).reduce((s, v) => s + (v || 0), 0)
}

async function submit(subId: string) {
    const scoreMap = scores.value[subId] || {}
    const comment = comments.value[subId]?.trim()
    if (!comment) {
        toast.warning('Додайте коментар перед збереженням')
        return
    }

    const scoreEntries = rubric.value.map((item) => ({
        id: item.id,
        points: scoreMap[item.id] ?? 0,
    }))

    submitting.value[subId] = true
    try {
        await api.post(`/submissions/${subId}/evaluate`, {
            scores: scoreEntries,
            comment,
        })
        const sub = submissions.value.find((s) => s.id === subId)
        if (sub) sub.status = 'EVALUATED'
        toast.success('Оцінку збережено!')
        
        // Auto-select next pending submission
        const nextPending = submissions.value.find(s => s.status === 'PENDING')
        if (nextPending) {
            selectedSubId.value = nextPending.id
        }
    } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Помилка збереження')
    } finally {
        submitting.value[subId] = false
    }
}

onMounted(async () => {
    const taskId = route.params.taskId as string
    try {
        const [taskRes, subsRes] = await Promise.all([
            api.get(`/tasks/${taskId}`),
            api.get(`/tasks/${taskId}/submissions`),
        ])
        task.value = taskRes.data
        submissions.value = subsRes.data
        for (const sub of submissions.value) initSubmission(sub)
        
        if (submissions.value.length > 0) {
            const firstPending = submissions.value.find(s => s.status === 'PENDING')
            selectedSubId.value = firstPending ? firstPending.id : submissions.value[0].id
        }
    } catch {
        toast.error('Не вдалося завантажити дані')
    } finally {
        loading.value = false
    }
})
</script>

<style scoped lang="scss">
.evaluate-dashboard {
    display: flex;
    height: 100vh;
    background: #000;
    color: #fff;
    overflow: hidden;

    @media (max-width: 1024px) {
        flex-direction: column;
        height: auto;
        overflow: visible;
    }
}

.sidebar {
    width: 380px;
    background: #0d0d0d;
    border-right: 1px solid #222;
    display: flex;
    flex-direction: column;

    @media (max-width: 1024px) {
        width: 100%;
        height: auto;
    }

    &__header {
        padding: 32px;
        border-bottom: 1px solid #222;

        .back-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--color-primary);
            text-decoration: none;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
            margin-bottom: 24px;
            &:hover { opacity: 0.8; }
        }

        .title {
            font-family: var(--font-display);
            font-size: 14px;
            letter-spacing: 2px;
            font-weight: 800;
            margin: 0 0 20px 0;
            color: #fff;
        }
    }
}

.progress-container {
    .progress-bar {
        height: 4px;
        background: #222;
        margin-bottom: 8px;
        .progress-fill {
            height: 100%;
            background: var(--color-primary);
            transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
    }
    .progress-text {
        font-size: 10px;
        font-weight: 700;
        color: #666;
    }
}

.submissions-nav {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .sub-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: transparent;
        border: 1px solid transparent;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
        margin-bottom: 8px;

        &:hover { background: #1a1a1a; }
        &.active {
            background: #222;
            border-color: #444;
        }

        &.done {
            opacity: 0.6;
            .sub-item__indicator { color: #16a34a; }
        }

        &__indicator {
            font-size: 18px;
            color: #444;
        }

        &__info {
            display: flex;
            flex-direction: column;
            .team-name {
                font-family: var(--font-display);
                font-weight: 700;
                font-size: 14px;
                color: #fff;
            }
            .status-label {
                font-size: 10px;
                font-weight: 600;
                color: #666;
                text-transform: uppercase;
                margin-top: 4px;
            }
        }
    }
}

.main-content {
    flex: 1;
    overflow-y: auto;
    padding: 60px;
    background: #000;

    @media (max-width: 1024px) {
        padding: 32px 16px;
    }
}

.main-header {
    margin-bottom: 48px;

    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 12px;
    }

    .task-name {
        font-size: 14px;
        font-weight: 800;
        color: var(--color-primary);
        letter-spacing: 2px;
    }

    .status-badge {
        font-size: 10px;
        font-weight: 800;
        padding: 4px 12px;
        border: 1px solid;
        &.PENDING { border-color: #666; color: #666; }
        &.EVALUATED { border-color: #16a34a; color: #16a34a; }
    }

    .team-hero {
        .label {
            font-size: 11px;
            font-weight: 700;
            color: #444;
            display: block;
            margin-bottom: 8px;
        }
        .team-display {
            font-family: var(--font-display);
            font-size: 48px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -1px;
        }
    }
}

.evaluation-grid {
    display: grid;
    grid-template-columns: 1fr 450px;
    gap: 48px;
    align-items: start;

    @media (max-width: 1280px) {
        grid-template-columns: 1fr;
    }
}

.card-title {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #fff;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid #222;
}

.info-card {
    .links-grid {
        display: flex;
        gap: 16px;
        margin-bottom: 32px;
        flex-wrap: wrap;
    }

    .material-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 24px;
        background: #111;
        border: 1px solid #222;
        color: #fff;
        text-decoration: none;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1px;
        transition: all 0.2s;

        &:hover {
            border-color: var(--color-primary);
            background: #1a1a1a;
        }
    }

    .summary-box {
        background: #0d0d0d;
        padding: 32px;
        border: 1px solid #222;
        .box-label {
            font-size: 10px;
            font-weight: 800;
            color: #444;
            margin-bottom: 16px;
        }
        .box-content {
            font-size: 15px;
            line-height: 1.6;
            color: #ccc;
        }
    }
}

.grading-card {
    background: #0d0d0d;
    padding: 32px;
    border: 1px solid #222;
    position: sticky;
    top: 0;
}

.rubric-list {
    display: flex;
    flex-direction: column;
    gap: 32px;
    margin-bottom: 40px;
}

.rubric-item {
    .rubric-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        .label { font-size: 13px; font-weight: 700; }
        .max-points { font-size: 11px; color: #666; }
    }

    .rubric-control {
        display: flex;
        align-items: center;
        gap: 16px;

        .points-input {
            width: 70px;
            padding: 12px;
            background: #1a1a1a;
            border: 1px solid #333;
            color: #fff;
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 800;
            text-align: center;
            &:focus { border-color: var(--color-primary); outline: none; }
        }

        .points-slider {
            flex: 1;
            .slider-track {
                height: 4px;
                background: #222;
                .slider-fill {
                    height: 100%;
                    background: var(--color-primary);
                    transition: width 0.2s;
                }
            }
        }
    }
}

.total-score {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 0;
    border-top: 1px solid #222;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #666;

    .score-value {
        font-family: var(--font-display);
        font-size: 32px;
        color: var(--color-primary);
    }
}

.field-label {
    display: block;
    font-size: 10px;
    font-weight: 800;
    color: #444;
    margin-bottom: 12px;
}

.comment-input {
    width: 100%;
    background: #1a1a1a;
    border: 1px solid #333;
    padding: 16px;
    color: #fff;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 32px;
    &:focus { border-color: var(--color-primary); outline: none; }
}

.save-btn {
    width: 100%;
    padding: 20px;
    background: var(--color-primary);
    border: none;
    color: #fff;
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 2px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.2s;

    &:hover:not(:disabled) { background: #fff; color: #000; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.empty-state {
    height: 60vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #444;
    i { font-size: 64px; margin-bottom: 24px; }
    h2 { font-family: var(--font-display); font-size: 18px; letter-spacing: 2px; }
}

.loading-state {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #666;
}
</style>
