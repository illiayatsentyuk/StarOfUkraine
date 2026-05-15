<template lang="pug">
.jury-page
    .jury-page__nav
        NuxtLink.back-link(:to="localePath(`/tournaments/${tournamentId}`)")
            i.pi.pi-arrow-left.icon
            span.text НАЗАД ДО ТУРНІРУ
    
    .jury-page__header
        h1 КЕРУВАННЯ ЖУРІ
        p.desc Додавайте суддів, які будуть перевіряти роботи в цьому турнірі.

    .jury-page__content
        TournamentJuryManager.jury-page__manager(:tournamentId="tournamentId")
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const route = useRoute()
const tournamentId = computed(() => route.params.id as string)

definePageMeta({
    middleware: ['auth']
})
</script>

<style scoped lang="scss">
.jury-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 60px 48px;

    @media (max-width: 768px) {
        padding: 32px 16px 48px;
    }

    &__nav {
        margin-bottom: 32px;
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: var(--color-text-muted);
            font-weight: 600;
            font-size: 12px;
            &:hover { color: var(--color-primary); }

            .icon {
                font-size: 14px;
            }
        }
    }

    &__header {
        margin-bottom: 40px;
        h1 {
            font-size: clamp(24px, 5vw, 32px);
            font-weight: 800;
            margin: 0 0 8px 0;
            font-family: var(--font-display);
        }
        .desc {
            color: var(--color-text-muted);
            font-size: clamp(14px, 3vw, 16px);
        }
    }

    &__content {
        .jury-page__manager {
            border: 1px solid var(--color-border);
        }
    }
}
</style>
