<template lang="pug">
.content-section.admin-section
    h3.section-label СУДДІВСЬКА ПАНЕЛЬ (ПОДАНІ РОБОТИ)

    .loading-state(v-if="loading && submissions.length === 0")
        i.pi.pi-spin.pi-spinner
        span Завантаження робіт...

    .submissions-list(v-else)
        .submission-card(v-for="sub in submissions" :key="sub.id")
            .submission-header
                h4.team-name {{ sub.teamName }}
                span.status-badge(:class="`status-${sub.status}`")
                    template(v-if="sub.status === 'pending'") ОЧІКУЄ ОЦІНКИ
                    template(v-if="sub.status === 'graded'") ОЦІНЕНО ({{ sub.score }} БАЛІВ)
            .submission-links
                a.link-item(:href="sub.githubUrl" target="_blank" v-if="sub.githubUrl")
                    i.pi.pi-github
                    span GitHub
                a.link-item(:href="sub.youtubeUrl" target="_blank" v-if="sub.youtubeUrl")
                    i.pi.pi-youtube
                    span YouTube
            .submission-actions(v-if="sub.status === 'pending'")
                InputNumber.score-input(
                    v-model="gradingScores[sub.id]"
                    :min="0"
                    :max="task.points"
                    placeholder="Бали"
                    inputClass="custom-input p-inputtext-sm"
                )
                Button.approve-btn(
                    @click="handleGrade(sub.id)"
                    type="button"
                    label="ОЦІНИТИ"
                    :loading="loading"
                    :disabled="gradingScores[sub.id] === undefined || gradingScores[sub.id] === null"
                )
</template>

<script setup lang="ts">
const props = defineProps<{
    submissions: any[]
    task: any
    loading: boolean
}>()

const emit = defineEmits<{
    grade: [submissionId: string, score: number]
}>()

const gradingScores = ref<Record<string, number>>({})

function handleGrade(submissionId: string) {
    const score = gradingScores.value[submissionId]
    if (score === undefined || score === null) return
    emit('grade', submissionId, score)
}
</script>

<style scoped lang="scss">
.content-section {
    margin-bottom: 64px;

    .section-label {
        font-size: 12px;
        font-weight: 700;
        color: var(--color-text-muted);
        letter-spacing: 2px;
        margin: 0 0 24px 0;
    }
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    gap: 16px;
    color: var(--color-text-muted);
    font-weight: 500;
    font-size: 18px;

    i {
        font-size: 32px;
    }
}

.submissions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
}

.submission-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .submission-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .team-name {
            font-family: var(--font-display);
            font-size: 20px;
            margin: 0;
        }

        .status-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 4px 8px;
            letter-spacing: 1px;

            &.status-pending {
                background: #f59e0b;
                color: white;
            }

            &.status-graded {
                background: var(--color-primary);
                color: white;
            }
        }
    }

    .submission-links {
        display: flex;
        gap: 16px;

        .link-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--color-text);
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            padding: 8px 16px;
            border: 1px solid var(--color-border);
            transition: all 0.2s;

            &:hover {
                background: #f3f4f6;
                border-color: var(--color-text);
            }

            i {
                font-size: 18px;
            }
        }
    }

    .submission-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0;
        margin-top: 8px;

        .score-input {
            width: 100px;

            :deep(.p-inputtext) {
                border-radius: 0;
                border: 1px solid var(--color-text);
                border-right: none;
                padding: 12px 16px;
                font-size: 14px;
                text-align: center;
                font-family: var(--font-display);
                color: var(--color-text);
                background: #ffffff;
                box-shadow: none;

                &:focus {
                    border-color: var(--color-text);
                    outline: none;
                }
            }
        }

        :deep(.approve-btn) {
            background: var(--color-text);
            border: 1px solid var(--color-text);
            color: white;
            font-family: var(--font-display);
            font-size: 12px;
            font-weight: 700;
            padding: 12px 24px;
            border-radius: 0;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.2s;
            height: 44px;

            &:hover:not(:disabled) {
                background: var(--color-primary);
                border-color: var(--color-primary);
                transform: translateY(-2px);
            }

            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }
}
</style>
