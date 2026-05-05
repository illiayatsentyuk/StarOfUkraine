<template lang="pug">
.content-section.submission-section(v-if="task.status === 'pending'")
    h3.section-title ВІДПРАВИТИ РЕЗУЛЬТАТ
    
    form.submission-form(@submit.prevent="handleSubmit")
        .field
            label(for="github") Посилання на GitHub
            .input-wrapper
                i.pi.pi-github
                InputText#github.custom-input(
                    v-model="submissionGithub"
                    placeholder="https://github.com/..."
                    required
                )
        
        .field
            label(for="youtube") Посилання на YouTube (Demo)
            .input-wrapper
                i.pi.pi-youtube
                InputText#youtube.custom-input(
                    v-model="submissionYoutube"
                    placeholder="https://youtube.com/..."
                )
        
        Button.submit-btn(
            type="submit"
            label="ВІДПРАВИТИ НА ПЕРЕВІРКУ"
            :loading="loading"
            :disabled="!submissionGithub.trim()"
        )

.content-section.submission-section(v-else-if="task.status === 'completed'")
    .success-banner
        i.pi.pi-check-circle
        .text
            h4 ЗАВДАННЯ ВИКОНАНО
            p Ваша відповідь прийнята.
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    task: any
    loading: boolean
}>()

const emit = defineEmits<{
    (e: 'submit', payload: { github: string; youtube: string }): void
}>()

const submissionGithub = ref('')
const submissionYoutube = ref('')

function handleSubmit() {
    if (!submissionGithub.value.trim()) return
    emit('submit', {
        github: submissionGithub.value,
        youtube: submissionYoutube.value,
    })
}
</script>

<style scoped lang="scss">
.submission-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 24px;
}

.section-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 1.5px;
    margin-bottom: 20px;
    text-transform: uppercase;
}

.submission-form {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .field {
        display: flex;
        flex-direction: column;
        gap: 8px;

        label {
            font-size: 12px;
            font-weight: 600;
            color: var(--color-text);
        }

        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;

            i {
                position: absolute;
                left: 12px;
                color: var(--color-text-muted);
                font-size: 14px;
            }

            :deep(.custom-input) {
                width: 100%;
                padding: 10px 12px 10px 36px !important;
                background: var(--color-bg-secondary) !important;
                border: 1px solid var(--color-border) !important;
                border-radius: 6px !important;
                font-size: 13px !important;
                color: var(--color-text) !important;
                transition: all 0.2s;

                &:focus {
                    border-color: var(--color-primary) !important;
                    background: white !important;
                    outline: none;
                }
            }
        }
    }

    :deep(.submit-btn) {
        width: 100%;
        background: var(--color-primary) !important;
        border: none !important;
        color: white !important;
        font-family: inherit !important;
        font-weight: 700 !important;
        font-size: 12px !important;
        padding: 14px !important;
        border-radius: 6px !important;
        letter-spacing: 1px !important;
        transition: all 0.2s;
        margin-top: 8px;

        &:hover:not(:disabled) {
            background: #00897b !important;
            transform: translateY(-1px);
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }
}

.success-banner {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #10b981;

    i { font-size: 32px; }
    h4 { margin: 0; font-size: 16px; font-weight: 700; }
    p { margin: 0; font-size: 13px; color: var(--color-text-muted); }
}
</style>
