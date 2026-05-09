<template lang="pug">
.content-section.admin-section
    h3.section-title ПАНЕЛЬ ПЕРЕВІРКИ
    
    .loading-state(v-if="loading && submissions.length === 0")
        i.pi.pi-spin.pi-spinner
        span Завантаження...

    .submissions-list(v-else)
        .submission-card(v-for="sub in submissions" :key="sub.id")
            .submission-header
                span.team-name {{ sub.team?.name || sub.teamId }}
                .status-badge(:class="sub.status")
                    span {{ sub.status === 'PENDING' ? 'Очікує' : 'Оцінено' }}
            
            .submission-links
                a.link-icon(:href="sub.githubUrl" target="_blank" v-if="sub.githubUrl")
                    i.pi.pi-github
                a.link-icon(:href="sub.videoUrl" target="_blank" v-if="sub.videoUrl")
                    i.pi.pi-youtube
            
            .grading-area(v-if="sub.status === 'PENDING'")
                .criterion-grading(v-for="c in task?.criteria?.rubric || []" :key="c.id")
                    .c-info
                        span.c-name {{ c.label }}
                        span.c-max max {{ c.maxPoints }}
                    
                    .c-input
                        InputText(v-model="gradingData[sub.id][c.id]" type="number" :max="c.maxPoints" placeholder="0")
                
                .comment-area
                    Textarea(v-model="commentsData[sub.id]" placeholder="Коментар до роботи..." rows="2" autoResize)

                Button.grade-btn(
                    label="ЗБЕРЕГТИ ОЦІНКУ"
                    @click="submitGrade(sub.id)"
                    :loading="loading"
                )
            
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
    submissions: any[]
    task: any
    loading: boolean
}>()

const emit = defineEmits<{
    (e: 'grade', submissionId: string, scores: Array<{ id: string; points: number }>, comment: string): void
}>()

const gradingData = ref<Record<string, Record<string, number>>>({})
const commentsData = ref<Record<string, string>>({})

// Initialize grading data for each submission
watch(() => props.submissions, (newSubs) => {
    newSubs.forEach(sub => {
        if (!gradingData.value[sub.id]) {
            const initial: Record<string, number> = {}
            props.task?.criteria?.rubric?.forEach((c: any) => {
                initial[c.id] = 0
            })
            gradingData.value[sub.id] = initial
        }
    })
}, { immediate: true })

function submitGrade(submissionId: string) {
    const grades = gradingData.value[submissionId] || {}
    const scores = Object.entries(grades).map(([id, points]) => ({
        id,
        points: Number(points),
    }))
    const comment = commentsData.value[submissionId] || 'Оцінено суддею'
    emit('grade', submissionId, scores, comment)
}
</script>

<style scoped lang="scss">
.admin-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 24px;
}

.section-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 1.5px;
    margin-bottom: 20px;
}

.submissions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.submission-card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    padding: 20px;

    .submission-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        .team-name { font-weight: 700; font-size: 15px; }
    }

    .status-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 4px 8px;
        &.PENDING { background: #fef3c7; color: #92400e; }
        &.EVALUATED { background: #d1fae5; color: #065f46; }
    }

    .submission-links {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        .link-icon { color: #64748b; font-size: 18px; &:hover { color: var(--color-primary); } }
    }

    .grading-area {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 16px;
        border-top: 1px dashed var(--color-border);
    }

    .criterion-grading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .c-info {
            display: flex;
            flex-direction: column;
            .c-name { font-size: 13px; font-weight: 600; }
            .c-max { font-size: 10px; color: #94a3b8; }
        }

        .c-input {
            :deep(.p-inputtext) { width: 80px; height: 32px; font-size: 13px; text-align: center; }
            :deep(.p-rating) { gap: 4px; .p-rating-item .p-rating-icon { font-size: 14px; color: #f59e0b; } }
        }
    }

    .comment-area {
        margin-top: 8px;
        :deep(.p-inputtextarea) {
            width: 100%;
            font-size: 13px;
            border-color: var(--color-border);
            background: var(--color-bg);
            color: var(--color-text);
        }
    }

    .grade-btn {
        width: 100%;
        margin-top: 8px;
        background: var(--color-primary);
        border: none;
        color: white;
        font-size: 12px;
        font-weight: 700;
        padding: 12px;
    }

    .graded-summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid var(--color-border);
        
        .g-item {
            font-size: 12px;
            .n { color: #64748b; margin-right: 4px; }
            .v { font-weight: 700; color: var(--color-primary); }
        }
    }
}
</style>
