<template lang="pug">
section.task-detail
    .task-detail__nav
        NuxtLink.back-link(:to="`/tournaments/${route.params.id}/tasks`")
            span.icon ←
            span.text НАЗАД ДО ЗАВДАНЬ

    .loading-state(v-if="store.loading && !task")
        i.pi.pi-spin.pi-spinner
        span Завантаження...

    template(v-else-if="task")
        header.task-detail__hero
            .status-wrapper
                .status-badge(:class="`status-${task.status}`")
                    template(v-if="task.status === 'completed'") ВИКОНАНО
                    template(v-else-if="task.status === 'pending'") В ОЧІКУВАННІ
                    template(v-else) НЕ ВИКОНАНО
                .points {{ task.points }} БАЛІВ

            h1.title {{ task.title }}
            .meta-info
                span.deadline ДЕДЛАЙН: {{ formatDate(task.deadline) }}

        .task-detail__layout
            main.main-content
                .content-section
                    h3.section-label ОПИС ЗАВДАННЯ
                    p.description {{ task.description }}

                TaskSubmissionForm(
                    :task="task"
                    :loading="store.loading"
                    @submit="handleSubmit"
                )

                TaskAdminPanel(
                    v-if="authStore.isAdmin"
                    :task="task"
                    :submissions="store.submissions"
                    :loading="store.loading"
                    @grade="handleGrade"
                )

    .error-state(v-else)
        p Завдання не знайдено
        NuxtLink(:to="`/tournaments/${route.params.id}/tasks`") Повернутися до списку
</template>

<script setup lang="ts">
const route = useRoute()
const store = useTasksStore()
const authStore = useLoginStore()

const task = computed(() => store.tasks.find(t => t.id === route.params.taskId))

const tournamentId = computed(() => route.params.id as string)
const taskId = computed(() => route.params.taskId as string)

onMounted(async () => {
    const tid = route.params.id as string
    if (store.tasks.length === 0) {
        await store.fetchTasks(tid)
    }
    if (authStore.isAdmin) {
        await store.fetchSubmissions(taskId.value)
    }
})

async function handleSubmit(payload: { github: string; youtube: string }) {
    if (!task.value) return
    await store.submitTask(task.value.id, {
        github: payload.github,
        youtube: payload.youtube,
    })
}

async function handleGrade(submissionId: string, score: number) {
    await store.gradeSubmission(submissionId, score)
}
</script>

<style lang="scss" scoped>
.task-detail {
    max-width: 1440px;
    margin: 0 auto;
    padding: 60px 48px 80px;
    animation: fadeIn 0.4s ease-out;

    @media (max-width: 768px) {
        padding: 0 24px 40px;
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
            transition: all 0.2s ease;

            &:hover {
                color: var(--color-primary);
                transform: translateX(-4px);
            }
        }
    }

    &__hero {
        margin-bottom: 64px;
        border-bottom: 2px solid var(--color-text);
        padding-bottom: 48px;

        .status-wrapper {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;

            .status-badge {
                font-size: 11px;
                font-weight: 700;
                padding: 6px 14px;
                letter-spacing: 1.5px;

                &.status-completed {
                    background: var(--color-primary);
                    color: white;
                }

                &.status-pending {
                    background: var(--color-text);
                    color: white;
                }

                &.status-failed {
                    background: var(--color-error, #ef4444);
                    color: white;
                }
            }

            .points {
                font-family: var(--font-display);
                font-weight: 700;
                font-size: 20px;
                color: var(--color-primary);
            }
        }

        .title {
            font-family: var(--font-display);
            font-size: 64px;
            font-weight: 700;
            line-height: 0.95;
            letter-spacing: -2px;
            margin: 0 0 24px 0;
            color: var(--color-text);

            @media (max-width: 768px) {
                font-size: 48px;
            }
        }

        .meta-info {
            .deadline {
                font-size: 14px;
                font-weight: 600;
                color: var(--color-text-muted);
                letter-spacing: 1px;
            }
        }
    }

    &__layout {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 80px;

        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
            gap: 48px;
        }
    }
}

.main-content {
    .content-section {
        margin-bottom: 64px;

        .section-label {
            font-size: 12px;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 2px;
            margin: 0 0 24px 0;
        }

        .description {
            font-size: 22px;
            line-height: 1.5;
            color: var(--color-text);
            margin: 0;
            max-width: 800px;
            font-weight: 400;
        }
    }
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    gap: 16px;
    color: var(--color-text-muted);
    font-weight: 500;
    font-size: 18px;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
