<template lang="pug">
.content-section(v-if="task.status === 'pending'")
    h3.section-label ВІДПРАВИТИ РЕЗУЛЬТАТ
    .submission-form
        .field-group
            label.field-label ПОСИЛАННЯ НА GITHUB
            InputText.form-input(
                v-model="submissionGithub"
                placeholder="https://github.com/..."
            )
        .field-group
            label.field-label ПОСИЛАННЯ НА YOUTUBE (ОПЦІОНАЛЬНО)
            InputText.form-input(
                v-model="submissionYoutube"
                placeholder="https://youtube.com/watch?v=..."
            )
        Button.submit-btn(
            @click="handleSubmit"
            type="button"
            label="ВІДПРАВИТИ"
            :loading="loading"
            :disabled="!submissionGithub.trim()"
        )
.content-section(v-else-if="task.status === 'completed'")
    .success-banner
        i.pi.pi-check-circle
        .text
            h4 ЗАВДАННЯ ВИКОНАНО
            p Ваша відповідь прийнята та зарахована.
</template>

<script setup lang="ts">
const props = defineProps<{
    task: any
    loading: boolean
}>()

const emit = defineEmits<{
    submit: [payload: { github: string; youtube: string }]
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

.submission-form {
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    padding: 32px;

    .field-group {
        margin-bottom: 24px;

        .field-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 1.5px;
            margin-bottom: 12px;
        }

        .form-input {
            width: 100%;
            background: transparent;
            border: 1px solid var(--color-border);
            padding: 16px;
            font-family: inherit;
            font-size: 16px;
            color: var(--color-text);
            resize: vertical;
            transition: border-color 0.2s;

            &:focus {
                outline: none;
                border-color: var(--color-primary);
            }
        }
    }
}

:deep(.submit-btn) {
    width: 100%;
    height: 52px;
    background: var(--color-primary);
    border: 1px solid var(--color-primary);
    color: white;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    border-radius: 0;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: var(--color-text);
        border-color: var(--color-text);
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.success-banner {
    display: flex;
    align-items: center;
    gap: 24px;
    background: rgba(46, 204, 113, 0.1);
    border: 1px solid #2ecc71;
    padding: 32px;

    i {
        font-size: 48px;
        color: #2ecc71;
    }

    h4 {
        margin: 0 0 8px 0;
        font-family: var(--font-display);
        font-size: 24px;
        color: #2ecc71;
    }

    p {
        margin: 0;
        color: var(--color-text);
        font-size: 16px;
    }
}
</style>
