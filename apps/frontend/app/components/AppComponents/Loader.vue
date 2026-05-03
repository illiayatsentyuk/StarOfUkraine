<template lang="pug">
.loader
    .loader__spinner
        ProgressSpinner(style="width: 50px; height: 50px" strokeWidth="4" fill="transparent" animationDuration=".5s" aria-label="Loading")
        span.loading-text ЗАВАНТАЖЕННЯ
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
.loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    height: 100%;
    width: 100%;
    .loader__spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        .loading-text {
            font-size: 1rem;
            font-weight: 600;
            color: #333;
        }
    }
}
</style>
