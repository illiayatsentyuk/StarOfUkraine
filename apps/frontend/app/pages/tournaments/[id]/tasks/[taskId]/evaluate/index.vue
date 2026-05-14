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
                    .team-name {{ sub.team?.name || sub.teamId }}
                    .submission-card__status(
                        :class="sub.status === 'EVALUATED' ? 'status--done' : 'status--pending'"
                    ) {{ sub.status === 'EVALUATED' ? 'ОЦІНЕНО' : 'ОЧІКУЄ' }}

                .submission-card__links
                    a.link(
                        v-if="sub.githubUrl"
                        :href="sub.githubUrl"
                        target="_blank"
                        rel="noopener"
                    )
                        i.pi.pi-github
                        span GitHub
                    a.link(
                        v-if="sub.videoUrl"
                        :href="sub.videoUrl"
                        target="_blank"
                        rel="noopener"
                    )
                        i.pi.pi-youtube
                        span Відео
                    a.link(
                        v-if="sub.liveUrl"
                        :href="sub.liveUrl"
                        target="_blank"
                        rel="noopener"
                    )
                        i.pi.pi-external-link
                        span Демо

                p.submission-card__summary(v-if="sub.summary") {{ sub.summary }}

                .rubric(v-if="rubric.length")
                    h4.rubric__title КРИТЕРІЇ ОЦІНЮВАННЯ
                    .rubric__item(v-for="item in rubric" :key="item.id")
                        .rubric__label
                            span {{ item.label }}
                            span.rubric__max / {{ item.maxPoints }}
                        input.rubric__input(
                            type="number"
                            :min="0"
                            :max="item.maxPoints"
                            v-model.number="scores[sub.id][item.id]"
                            :placeholder="`0–${item.maxPoints}`"
                        )
                    .rubric__total
                        span ЗАГАЛОМ
                        span.rubric__total-value {{ getTotal(sub.id) }}

                .comment-wrap
                    label.comment-label КОМЕНТАР
                    textarea.comment-input(
                        v-model="comments[sub.id]"
                        rows="3"
                        placeholder="Обов'язковий коментар журі..."
                    )

                .submission-card__footer
                    button.btn-submit(
                        :disabled="submitting[sub.id]"
                        @click="submit(sub.id)"
                    )
                        i.pi(
                            :class="submitting[sub.id] ? 'pi-spin pi-spinner' : 'pi-check'"
                        )
                        span {{ submitting[sub.id] ? 'Збереження...' : 'Зберегти оцінку' }}
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const route = useRoute()
const api = useApi()
const toast = useServerSafeToast()

const loading = ref(true)
const task = ref<any>(null)
const submissions = ref<any[]>([])
const submitting = ref<Record<string, boolean>>({})
const scores = ref<Record<string, Record<string, number>>>({})
const comments = ref<Record<string, string>>({})

const rubric = computed<Array<{ id: string; label: string; maxPoints: number }>>(() => {
    const c = task.value?.criteria
    if (!c || !Array.isArray(c.rubric)) return []
    return c.rubric
})

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
    } catch {
        toast.error('Не вдалося завантажити дані')
    } finally {
        loading.value = false
    }
})
</script>

<style scoped lang="scss">
.evaluate-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 60px 48px 80px;
    animation: fadeIn 0.4s ease-out;

    @include media($md) {
        padding: 32px 24px 40px;
    }

    &__nav {
        margin-bottom: 48px;

        @include media($md) {
            margin-bottom: 32px;
        }

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
        margin-bottom: 48px;
        border-bottom: 2px solid var(--color-text);
        padding-bottom: 32px;

        @include media($md) {
            margin-bottom: 32px;
            padding-bottom: 24px;
        }

        .title {
            font-family: var(--font-display);
            font-size: clamp(32px, 6vw, 56px);
            font-weight: 700;
            line-height: 0.95;
            letter-spacing: -2px;
            margin: 0 0 12px 0;
            color: var(--color-text);
            text-transform: uppercase;
        }

        .subtitle {
            font-size: var(--font-size-lg);
            color: var(--color-text-muted);
            margin: 0;
        }
    }
}

.submissions {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
}

.submission-card {
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: var(--space-6);

    &--evaluated {
        border-color: #22c55e;
        opacity: 0.75;
    }

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-5);
    }

    .team-name {
        font-family: var(--font-display);
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--color-text);
    }

    &__status {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        padding: 4px 10px;
        border: 1px solid;

        &.status--done {
            color: #22c55e;
            border-color: #22c55e;
        }

        &.status--pending {
            color: var(--color-text-muted);
            border-color: var(--color-border);
        }
    }

    &__links {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
        margin-bottom: var(--space-5);

        .link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            border: 1px solid var(--color-border);
            color: var(--color-text);
            text-decoration: none;
            font-size: var(--font-size-sm);
            font-weight: 600;
            transition: border-color 0.2s, color 0.2s;

            &:hover {
                border-color: var(--color-primary);
                color: var(--color-primary);
            }
        }
    }

    &__summary {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        line-height: 1.6;
        margin: 0 0 var(--space-6);
        padding: var(--space-4);
        border-left: 3px solid var(--color-border);
    }

    &__footer {
        margin-top: var(--space-6);
        display: flex;
        justify-content: flex-end;
    }
}

.rubric {
    margin-bottom: var(--space-5);

    &__title {
        font-family: var(--font-display);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: var(--color-text-muted);
        margin: 0 0 var(--space-4);
    }

    &__item {
        display: grid;
        grid-template-columns: 1fr 100px;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-3) 0;
        border-bottom: 1px solid var(--color-border);

        &:last-of-type { border-bottom: none; }
    }

    &__label {
        display: flex;
        align-items: baseline;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--color-text);
    }

    &__max {
        font-size: 11px;
        color: var(--color-text-muted);
        font-weight: 400;
    }

    &__input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--color-border);
        background: var(--color-bg);
        color: var(--color-text);
        font-size: var(--font-size-base);
        font-family: var(--font-display);
        font-weight: 700;
        text-align: center;

        &:focus {
            outline: none;
            border-color: var(--color-primary);
        }

        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button { opacity: 1; }
    }

    &__total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: var(--space-4);
        padding-top: var(--space-3);
        border-top: 2px solid var(--color-text);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 2px;
        color: var(--color-text-muted);
    }

    &__total-value {
        font-family: var(--font-display);
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--color-primary);
    }
}

.comment-wrap {
    margin-top: var(--space-5);
}

.comment-label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--color-text-muted);
    margin-bottom: var(--space-2);
}

.comment-input {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: var(--font-size-sm);
    font-family: inherit;
    line-height: 1.6;
    resize: vertical;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: var(--color-primary);
    }
}

.btn-submit {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 14px 28px;
    background: var(--color-primary);
    border: 2px solid var(--color-primary);
    color: #fff;
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;

    &:hover:not(:disabled) {
        background: #000;
        border-color: #000;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    gap: 16px;
    color: var(--color-text-muted);
    font-size: 18px;

    .empty-icon {
        font-size: 48px;
        color: var(--color-border);
    }

    h2 {
        font-family: var(--font-display);
        color: var(--color-text);
        margin: 0;
    }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
