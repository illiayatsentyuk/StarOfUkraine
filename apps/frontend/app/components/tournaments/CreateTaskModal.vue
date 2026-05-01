<template lang="pug">
Dialog(
    :visible="isOpen"
    @update:visible="$emit('close')"
    modal
    class="create-task-modal"
    :style="{ width: '500px' }"
    :pt="{ mask: { style: 'backdrop-filter: blur(8px); background: rgba(0,0,0,0.4)' } }"
)
    .modal-content
        header.modal-header
            h2.title СТВОРИТИ ЗАВДАННЯ
            p.subtitle Заповніть форму для додавання нового завдання до турніру
            
        .form-body
            .field-group
                label.field-label НАЗВА ЗАВДАННЯ
                InputText.form-input(
                    v-model="form.title"
                    placeholder="Наприклад: Створити вебсайт"
                )
                
            .field-group
                label.field-label ОПИС
                Textarea.form-input(
                    v-model="form.description"
                    rows="4"
                    placeholder="Опишіть вимоги до завдання..."
                )
                
            .grid-row
                .field-group
                    label.field-label МАКСИМУМ БАЛІВ
                    InputNumber.form-input(
                        v-model="form.points"
                        :min="1"
                        :max="1000"
                        placeholder="100"
                    )
                    
                .field-group
                    label.field-label ДЕДЛАЙН
                    Calendar.form-input(
                        v-model="form.deadline"
                        dateFormat="dd.mm.yy"
                        placeholder="Оберіть дату"
                    )
                    
        .modal-footer
            Button.cancel-btn(label="СКАСУВАТИ" @click="$emit('close')" :disabled="loading")
            Button.submit-btn(
                label="СТВОРИТИ" 
                @click="handleSubmit" 
                :loading="loading"
                :disabled="!isValid"
            )
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
    isOpen: boolean
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'submit', payload: { title: string, description: string, points: number, deadline: string }): void
}>()

const form = ref({
    title: '',
    description: '',
    points: null as number | null,
    deadline: null as Date | null
})

const isValid = computed(() => {
    return form.value.title.trim() && 
           form.value.description.trim() && 
           form.value.points !== null && form.value.points > 0 &&
           form.value.deadline !== null
})

const handleSubmit = () => {
    if (!isValid.value) return
    emit('submit', {
        title: form.value.title,
        description: form.value.description,
        points: form.value.points as number,
        deadline: (form.value.deadline as Date).toISOString()
    })
    // Reset form after submit
    form.value = {
        title: '',
        description: '',
        points: null,
        deadline: null
    }
}
</script>

<style lang="scss" scoped>
.create-task-modal {
    border-radius: 0;
    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
    border: 2px solid var(--color-text);
    background: var(--color-surface, #ffffff);
    
    :deep(.p-dialog-header) {
        display: none;
    }
    
    :deep(.p-dialog-content) {
        padding: 0;
        border-radius: 0;
        background: var(--color-surface, #ffffff);
    }
}

.modal-content {
    display: flex;
    flex-direction: column;
    background: var(--color-surface, #ffffff);
}

.modal-header {
    padding: 32px 32px 24px 32px;
    border-bottom: 2px solid var(--color-border);
    
    .title {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 8px 0;
        letter-spacing: -0.5px;
    }
    
    .subtitle {
        color: var(--color-text-muted);
        font-size: 14px;
        margin: 0;
    }
}

.form-body {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    
    .field-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .field-label {
            font-family: var(--font-display);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 2px;
            color: var(--color-text-muted);
        }
        
        :deep(.form-input) {
            width: 100%;
            
            &.p-inputtext, .p-inputtext {
                width: 100%;
                border: 1px solid var(--color-border);
                border-radius: 0;
                padding: 12px 16px;
                font-family: inherit;
                font-size: 14px;
                background: #ffffff;
                color: var(--color-text);
                transition: all 0.2s;
                box-shadow: none;
                
                &:focus, &:focus-within {
                    border-color: var(--color-text);
                    outline: none;
                }
            }
        }
    }
    
    .grid-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }
}

.modal-footer {
    padding: 24px 32px;
    background: #fdfdfd;
    border-top: 1px solid var(--color-border);
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    
    .cancel-btn {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text);
        border-radius: 0;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 12px;
        padding: 12px 24px;
        letter-spacing: 1px;
        transition: all 0.2s;

        &:hover {
            background: #f3f4f6;
            border-color: var(--color-text);
        }
    }

    .submit-btn {
        background: var(--color-text);
        border: 1px solid var(--color-text);
        color: white;
        border-radius: 0;
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 12px;
        padding: 12px 24px;
        letter-spacing: 1px;
        transition: all 0.2s;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
}
</style>
