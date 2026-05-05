<template lang="pug">
section.task-admin-page
    .admin-nav
        NuxtLink.back-link(:to="`/tournaments/${route.params.id}/tasks/${route.params.taskId}`")
            i.pi.pi-arrow-left
            span НАЗАД ДО ЗАВДАННЯ

    header.admin-header
        .info
            h1.title Перевірка робіт
            p.subtitle {{ task?.title }}
        .stats(v-if="store.submissions.length")
            .stat-item
                span.val {{ store.submissions.length }}
                span.lbl ПОДАНО
            .stat-item
                span.val {{ store.submissions.filter(s => s.status === 'graded').length }}
                span.lbl ОЦІНЕНО

    .admin-content
        TaskAdminPanel(
            :task="task"
            :submissions="store.submissions"
            :loading="store.loading"
            @grade="handleGrade"
        )
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const route = useRoute()
const store = useTasksStore()

const task = computed(() => store.tasks.find(t => t.id === route.params.taskId))

onMounted(async () => {
    const tournamentId = route.params.id as string
    const taskId = route.params.taskId as string
    
    if (store.tasks.length === 0) {
        await store.fetchTasks(tournamentId)
    }
    await store.fetchSubmissions(taskId)
})

async function handleGrade(submissionId: string, grades: Record<string, number>) {
    await store.gradeSubmission(submissionId, grades)
}
</script>

<style scoped lang="scss">
.task-admin-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 48px;

    @media (max-width: 768px) {
        padding: 24px;
    }
}

.admin-nav {
    margin-bottom: 32px;
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

.admin-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 48px;
    padding-bottom: 32px;
    border-bottom: 1px solid var(--color-border);

    .title {
        font-family: var(--font-display);
        font-size: 32px;
        font-weight: 800;
        margin: 0 0 8px 0;
    }

    .subtitle {
        color: var(--color-text-muted);
        font-size: 16px;
        margin: 0;
    }

    .stats {
        display: flex;
        gap: 32px;

        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: flex-end;

            .val {
                font-size: 24px;
                font-weight: 800;
                color: var(--color-primary);
                font-family: var(--font-display);
            }

            .lbl {
                font-size: 10px;
                font-weight: 700;
                color: var(--color-text-muted);
                letter-spacing: 1px;
            }
        }
    }
}
</style>
