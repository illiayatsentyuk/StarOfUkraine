<template lang="pug">
section.evaluate-page
    .evaluate-page__nav
        NuxtLink.back-link(:to="localePath(`/tournaments/${route.params.id}/tasks/${route.params.taskId}`)")
            span.icon ←
            span.text НАЗАД ДО ЗАВДАННЯ

    .loading-state(v-if="loading && !task")
        i.pi.pi-spin.pi-spinner
        span Завантаження...

    template(v-else-if="task")
        header.evaluate-page__hero
            h1.title ОЦІНЮВАННЯ
            p.subtitle {{ task.name }}

        .empty-state(v-if="!submissions.length")
            i.pi.pi-inbox.empty-icon
            h2 Відповідей ще немає

        .submissions(v-else)
            .submission-card(
                v-for="sub in submissions"
                :key="sub.id"
                :class="{ 'submission-card--evaluated': sub.status === 'EVALUATED' }"
            )
                .submission-card__header
                    .team-info
                        .team-avatar {{ sub.team.name[0].toUpperCase() }}
                        .team-details
                            h3.team-name {{ sub.team.name }}
                            span.sub-date Відправлено {{ formatDate(sub.updatedAt) }}
                    .status-tag(:class="sub.status") {{ sub.status === 'EVALUATED' ? 'ОЦІНЕНО' : 'ОЧІКУЄ' }}

                .submission-card__body
                    .links
                        a.link-item(v-if="sub.githubUrl" :href="sub.githubUrl" target="_blank")
                            i.pi.pi-github
                            span GitHub
                        a.link-item(v-if="sub.videoUrl" :href="sub.videoUrl" target="_blank")
                            i.pi.pi-youtube
                            span Video
                        a.link-item(v-if="sub.liveUrl" :href="sub.liveUrl" target="_blank")
                            i.pi.pi-external-link
                            span Live

                    .grading(v-if="task.criteria?.rubric?.length")
                        .criteria-item(v-for="item in task.criteria.rubric" :key="item.id")
                            .criteria-info
                                span.label {{ item.label }}
                                span.max (макс. {{ item.maxPoints }})
                            input.score-input(
                                type="number" :min="0" :max="item.maxPoints"
                                v-model.number="scores[sub.id][item.id]"
                                :class="{ 'error': scores[sub.id][item.id] > item.maxPoints }"
                            )

                    .no-criteria(v-else)
                        i.pi.pi-exclamation-circle
                        span Критерії не встановлені

                .submission-card__footer
                    .total
                        span СУМА:
                        span.points {{ calculateTotal(sub.id) }}
                    Button.save-btn(
                        :label="sub.status === 'EVALUATED' ? 'ОНОВИТИ' : 'ЗБЕРЕГТИ'"
                        :loading="submitting[sub.id]"
                        @click="submitGrade(sub.id)"
                    )

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const localePath = useLocalePath()
const route = useRoute()
const api = useApi()
const toast = useServerSafeToast()

const loading = ref(true)
const task = ref<any>(null)
const submissions = ref<any[]>([])
const scores = ref<Record<string, Record<string, number>>>({})
const submitting = ref<Record<string, boolean>>({})

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('uk-UA')
}

function calculateTotal(subId: string) {
    const subScores = scores.value[subId]
    if (!subScores) return 0
    return Object.values(subScores).reduce((acc, val) => acc + (Number(val) || 0), 0)
}

function initScores(sub: any) {
    if (!scores.value[sub.id]) {
        const entry: Record<string, number> = {}
        const rubric = task.value?.criteria?.rubric || []
        rubric.forEach((item: any) => {
            const existing = sub.evaluations?.[0]?.scores?.find((s: any) => s.id === item.id)
            entry[item.id] = existing ? existing.points : 0
        })
        scores.value[sub.id] = entry
    }
}

async function submitGrade(subId: string) {
    const subScores = scores.value[subId]
    const rubric = task.value?.criteria?.rubric || []

    for (const item of rubric) {
        if (subScores[item.id] > item.maxPoints) {
            toast.error(`Максимум для "${item.label}" - ${item.maxPoints}`)
            return
        }
    }

    const scoreEntries = rubric.map((item: any) => ({
        id: item.id,
        points: subScores[item.id] || 0
    }))

    submitting.value[subId] = true
    try {
        await api.post(`/submissions/${subId}/evaluate`, { scores: scoreEntries })
        toast.success('Оцінку збережено')
        const sub = submissions.value.find(s => s.id === subId)
        if (sub) sub.status = 'EVALUATED'
    } catch (e: any) {
        toast.error(e.response?.data?.message || 'Помилка')
    } finally {
        submitting.value[subId] = false
    }
}

onMounted(async () => {
    try {
        const [taskRes, subRes] = await Promise.all([
            api.get(`/tasks/${route.params.taskId}`),
            api.get(`/submissions/task/${route.params.taskId}`)
        ])
        task.value = taskRes.data
        submissions.value = subRes.data
        submissions.value.forEach(s => initScores(s))
    } catch {
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
.evaluate-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 64px 48px;

    @include media($md) {
        padding: 32px 24px;
    }

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
            &:hover { color: var(--color-primary); }
        }
    }

    &__hero {
        margin-bottom: 48px;
        border-bottom: 2px solid var(--color-text);
        padding-bottom: 32px;
        .title { font-family: var(--font-display); font-size: 48px; font-weight: 800; margin: 0; }
        .subtitle { font-size: 18px; color: var(--color-text-muted); margin-top: 8px; }
    }
}

.submissions {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 32px;
}

.submission-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;

    &--evaluated { border-color: var(--color-primary); }

    &__header {
        padding: 24px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between;
        .team-info { display: flex; gap: 16px; .team-avatar { width: 48px; height: 48px; background: var(--color-bg); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; } .team-name { margin: 0; font-size: 18px; } .sub-date { font-size: 12px; color: var(--color-text-muted); } }
        .status-tag { padding: 4px 8px; font-size: 10px; font-weight: 800; background: var(--color-bg); &.EVALUATED { color: var(--color-primary); background: var(--color-primary-soft); } }
    }

    &__body {
        padding: 24px; flex: 1;
        .links { display: flex; gap: 16px; margin-bottom: 24px; .link-item { display: flex; align-items: center; gap: 8px; color: var(--color-text); text-decoration: none; font-size: 13px; font-weight: 600; &:hover { color: var(--color-primary); } } }
        .grading { .criteria-item { margin-bottom: 16px; .criteria-info { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 8px; .max { color: var(--color-text-muted); } } .score-input { width: 100%; padding: 10px; background: var(--color-bg); border: 1px solid var(--color-border); color: white; font-weight: 800; &.error { border-color: #ef4444; } } } }
    }

    &__footer {
        padding: 24px; border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;
        .total { display: flex; align-items: baseline; gap: 8px; span { font-size: 12px; font-weight: 800; color: var(--color-text-muted); } .points { font-size: 24px; font-weight: 900; color: var(--color-primary); } }
        .save-btn { background: var(--color-primary); border: none; padding: 12px 24px; font-weight: 800; color: white !important; }
    }
}

.loading-state, .empty-state { padding: 100px 0; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 24px; .empty-icon { font-size: 48px; color: var(--color-text-muted); } }
</style>
