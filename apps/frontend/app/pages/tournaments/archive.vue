<template lang="pug">
section.tournaments-archive
    header.archive-header
        .nav-back
            NuxtLink.back-link(to="/tournaments")
                i.pi.pi-arrow-left
                span НАЗАД ДО АКТИВНИХ
        h1.title Архів турнірів
        p.subtitle Історія перемог та завершених змагань

    .archive-filters
        .search-box
            i.pi.pi-search
            input(type="text" v-model="store.search" placeholder="Пошук в архіві...")
        .results-count(v-if="completedTournaments.length") Знайдено: {{ completedTournaments.length }}

    .archive-grid(v-if="completedTournaments.length")
        TournamentCard(
            v-for="tournament in completedTournaments"
            :key="tournament.id"
            :tournament="tournament"
            class="archive-card"
        )
    
    .loading-state(v-else-if="store.loading")
        i.pi.pi-spin.pi-spinner
        span Завантаження історії...

    .empty-state(v-else)
        i.pi.pi-box
        h3 Архів порожній
        p Поки що немає завершених турнірів
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const store = useTournamentsStore()

onMounted(async () => {
    // We can filter by completed status if API supports it
    // For now, we load all and filter in computed
    if (store.tournaments.length === 0) {
        await store.loadFromDatabase(true)
    }
})

const completedTournaments = computed(() => {
    // Mock: filtering by date or status if available
    // In real app, we'd pass { status: 'COMPLETED' } to API
    return store.tournaments.filter(t => {
        const endDate = new Date(t.registrationEnd)
        return endDate < new Date() || t.status === 'completed'
    })
})
</script>

<style scoped lang="scss">
.tournaments-archive {
    max-width: 1400px;
    margin: 0 auto;
    padding: 64px 32px;
}

.archive-header {
    margin-bottom: 48px;
    text-align: center;

    .nav-back {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
        .back-link {
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: var(--color-text-muted);
            font-size: 13px;
            font-weight: 700;
            &:hover { color: var(--color-primary); }
        }
    }

    .title {
        font-family: var(--font-display);
        font-size: 48px;
        font-weight: 800;
        margin: 0 0 12px 0;
        color: var(--color-text);
    }

    .subtitle {
        font-size: 18px;
        color: var(--color-text-muted);
        margin: 0;
    }
}

.archive-filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-border);

    .search-box {
        position: relative;
        width: 400px;
        i { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        input {
            width: 100%;
            padding: 12px 16px 12px 44px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            font-size: 14px;
            &:focus { outline: none; border-color: var(--color-primary); }
        }
    }

    .results-count {
        font-size: 12px;
        font-weight: 700;
        color: var(--color-text-muted);
        letter-spacing: 1px;
    }
}

.archive-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 32px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.archive-card {
    opacity: 0.85;
    filter: grayscale(0.2);
    transition: all 0.3s ease;
    &:hover {
        opacity: 1;
        filter: grayscale(0);
        transform: translateY(-4px);
    }
}

.loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    gap: 20px;
    color: var(--color-text-muted);
    
    i { font-size: 48px; }
    h3 { font-size: 24px; font-weight: 700; margin: 0; }
}
</style>
