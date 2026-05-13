<template lang="pug">
.search-bar
    .search-bar__icon
        svg(xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
            circle(cx="11" cy="11" r="8")
            line(x1="21" y1="21" x2="16.65" y2="16.65")
    input.search-bar__input(
        v-model="model"
        type="text"
        placeholder="Пошук турніру..."
        aria-label="Пошук"
        :disabled="loading"
    )
    button.search-bar__clear(
        v-if="model"
        @click="model = ''"
        aria-label="Очистити"
        type="button"
    )
        svg(xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round")
            line(x1="18" y1="6" x2="6" y2="18")
            line(x1="6" y1="6" x2="18" y2="18")
    .search-bar__spinner(v-if="loading")
        span
</template>

<script lang="ts" setup>
defineProps<{ loading?: boolean }>()
const model = defineModel<string>({ default: '' })
</script>

<style lang="scss" scoped>
.search-bar {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;

    &__icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-muted);
        display: flex;
        align-items: center;
        pointer-events: none;
        transition: color 0.2s ease;
    }

    &__input {
        width: 100%;
        padding: 10px 40px 10px 40px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        font-family: var(--font-sans);
        font-size: 13px;
        color: var(--color-text);
        transition: border-color 0.2s ease, background 0.2s ease;
        outline: none;

        // Hide native browser clear button (x) on type="search"
        &::-webkit-search-cancel-button {
            display: none;
        }

        &::placeholder {
            color: var(--color-text-muted);
        }

        &:focus {
            border-color: var(--color-text);
            background: var(--color-bg);

            ~ .search-bar__icon {
                color: var(--color-text);
            }
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    &:focus-within &__icon {
        color: var(--color-text);
    }

    &__clear {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        background: var(--color-border);
        border: none;
        border-radius: 50%;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 0;
        transition: background 0.15s ease, color 0.15s ease;

        &:hover {
            background: var(--color-text);
            color: var(--color-bg);
        }
    }

    &__spinner {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 14px;
        height: 14px;

        span {
            display: block;
            width: 14px;
            height: 14px;
            border: 2px solid var(--color-border);
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
