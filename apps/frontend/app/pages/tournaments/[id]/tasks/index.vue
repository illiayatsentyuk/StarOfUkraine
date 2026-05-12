<template lang="pug">
section.tasks-page
    .tasks-page__nav
        NuxtLink.back-link(:to="`/tournaments/${route.params.id}`")
            span.icon ←
            span.text НАЗАД ДО ТУРНІРУ

    header.tasks-page__hero
        .hero-content
            h1.title ЗАВДАННЯ ТУРНІРУ
            p.subtitle(v-if="!store.loading") Доступно завдань: {{ store.tasks.length }}
        Button.create-btn(
            v-if="authStore.isAdmin"
            type="button"
            label="СТВОРИТИ ЗАВДАННЯ"
            icon="pi pi-plus"
            @click="isModalOpen = true"
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
const route = useRoute()
const store = useTasksStore()
const authStore = useLoginStore()

const isModalOpen = ref(false)

onMounted(() => {
    store.fetchTasks(route.params.id as string)
})

async function handleCreateTask(payload: { title: string; description: string; points: number; deadline: string }) {
    await store.createTask({
        tournamentId: route.params.id as string,
        name: payload.title,
        description: payload.description,
        maxPoints: payload.points,
        deadline: payload.deadline,
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

    &__hero {
        margin-bottom: 48px;
        border-bottom: 2px solid var(--color-text);
        padding-bottom: 32px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .title {
            font-family: var(--font-display);
            font-size: 64px;
            font-weight: 700;
            line-height: 0.95;
            letter-spacing: -2px;
            margin: 0 0 16px 0;
            color: var(--color-text);
            text-transform: uppercase;
        }

        .subtitle {
            font-size: 18px;
            color: var(--color-text-muted);
            margin: 0;
            font-weight: 500;
        }

        :deep(.create-btn) {
            background: var(--color-primary);
            border: 1px solid var(--color-primary);
            color: white;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 12px;
            padding: 16px 32px;
            border-radius: 0;
            letter-spacing: 1.5px;
            transition: all 0.2s;

            &:hover {
                background: var(--color-text);
                border-color: var(--color-text);
                transform: translateY(-2px);
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
