<template lang="pug">
section.tasks-page
    .tasks-page__nav
        NuxtLink.back-link(:to="`/tournaments/${route.params.id}`")
            span.icon ←
            span.text НАЗАД ДО ТУРНІРУ

    TasksHero(
        :loading="store.loading"
        :taskCount="store.tasks.length"
        :isAdmin="authStore.isAdmin"
        @create="isModalOpen = true"
    )

    .loading-state(v-if="store.loading")
        i.pi.pi-spin.pi-spinner
        span Завантаження завдань...

    .tasks-grid(v-else-if="store.tasks.length > 0")
        TaskCard(
            v-for="task in store.tasks"
            :key="task.id"
            :task="task"
            :tournamentId="route.params.id"
        )

    .empty-state(v-else)
        i.pi.pi-inbox.empty-icon
        h2 Завдань поки немає
        p Слідкуйте за оновленнями турніру.

    CreateTaskModal(
        :isOpen="isModalOpen"
        :loading="store.loading"
        @close="isModalOpen = false"
        @submit="handleCreateTask"
    )
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CreateTaskModal from '~/components/Tasks/CreateTaskModal.vue'

const route = useRoute()
const store = useTasksStore()
const authStore = useLoginStore()

const isModalOpen = ref(false)

onMounted(() => {
    store.fetchTasks(route.params.id as string)
})

async function handleCreateTask(payload: any) {
    const derivedName = String(payload?.name ?? payload?.title ?? '').trim()
    const derivedDescription = String(payload?.description ?? '').trim()
    const parsedOrder = Number(payload?.order)
    const safeOrder = Number.isInteger(parsedOrder) && parsedOrder >= 0
        ? parsedOrder
        : store.tasks.length
    const parsedMaxPoints = Number(payload?.maxPoints ?? payload?.points)
    const safeMaxPoints = Number.isFinite(parsedMaxPoints) && parsedMaxPoints > 0
        ? parsedMaxPoints
        : 100
    const normalizedCriteria = Array.isArray(payload?.criteria)
        ? payload.criteria
            .map((criterion: any, index: number) => {
                const label = String(criterion?.label ?? criterion?.name ?? '').trim()
                if (!label) return null
                const explicitMax = Number(criterion?.maxPoints ?? criterion?.max)
                const isStars = criterion?.type === 'stars' || payload?.gradingMode === 'stars'
                const maxPoints = isStars
                    ? 5
                    : Number.isFinite(explicitMax) && explicitMax > 0
                        ? explicitMax
                        : 1

                return {
                    id: `criterion_${index + 1}`,
                    label,
                    maxPoints,
                }
            })
            .filter(Boolean)
        : []

    await store.createTask({
        tournamentId: route.params.id as string,
        name: derivedName,
        description: derivedDescription,
        order: safeOrder,
        maxPoints: safeMaxPoints,
        criteria: normalizedCriteria.length ? normalizedCriteria : undefined,
    })
    isModalOpen.value = false
}
</script>

<style lang="scss" scoped>
.tasks-page {
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
    font-weight: 500;
    font-size: 18px;

    i {
        font-size: 32px;
    }

    .empty-icon {
        font-size: 48px;
        color: var(--color-border);
        margin-bottom: 16px;
    }

    h2 {
        font-family: var(--font-display);
        color: var(--color-text);
        margin: 0;
    }
}

.tasks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
