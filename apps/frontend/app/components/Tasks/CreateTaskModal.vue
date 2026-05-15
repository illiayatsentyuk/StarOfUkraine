<template lang="pug">
.modal-wrapper(v-if="isOpen")
    .modal-overlay(@click="$emit('close')")
    .modal-content
        .modal-header
            h2.modal-title СТВОРИТИ ЗАВДАННЯ
            button.icon-btn(@click="$emit('close')" type="button")
                i.pi.pi-times
        
        form.modal-form(@submit.prevent="handleSubmit")
            .form-group
                label.form-label НАЗВА ЗАВДАННЯ *
                input.form-input(v-model="form.title" placeholder="Наприклад: Розробка API" required)
            
            .form-group
                label.form-label ОПИС ТА ДЕТАЛІ
                textarea.form-input.form-textarea(v-model="form.description" rows="3" placeholder="Вимоги та деталі..." @input="autoGrow")

            .form-group
                label.form-label КІНЦЕВИЙ ТЕРМІН (ДЕДЛАЙН) *
                input.form-input(type="date" v-model="deadlineStr" required)

            .divider-clean

            //- Система оцінювання
            .form-group(v-if="false")
                label.form-label ТИП ОЦІНЮВАННЯ
                .grading-toggle-clean
                    button.toggle-btn.active(type="button")
                        i.pi.pi-list
                        span БАЛИ

            //- Критерії
            .form-group
                .criteria-header
                    label.form-label КРИТЕРІЇ ОЦІНКИ
                    button.add-link(type="button" @click="addCriterion")
                        i.pi.pi-plus
                        span ДОДАТИ КРИТЕРІЙ
                
                .criteria-list-clean
                    .criterion-row(v-for="(c, i) in form.criteria" :key="i")
                        input.form-input.flex-1(v-model="c.name" placeholder="Назва критерію")
                        .value-box
                            input.form-input.value-input(
                                type="number"
                                v-model="c.max" 
                                min="1" 
                                placeholder="Max"
                            )
                        button.remove-btn(type="button" @click="removeCriterion(i)")
                            i.pi.pi-trash

            .modal-footer
                button.cancel-btn(type="button" @click="$emit('close')") СКАСУВАТИ
                button.submit-btn(
                    type="submit" 
                    :disabled="loading"
                ) {{ loading ? 'СТВОРЕННЯ...' : 'СТВОРИТИ ЗАВДАННЯ' }}
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
    isOpen: boolean
    loading: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'submit', payload: any): void
}>()

const deadlineStr = ref('')

const form = ref({
    title: '',
    description: '',
    deadlineDate: null as Date | null,
    gradingMode: 'points',
    criteria: [
        { name: 'Технічна реалізація', max: 40 },
        { name: 'Якість коду', max: 30 }
    ]
})

watch(deadlineStr, (val) => {
    if (val) {
        form.value.deadlineDate = new Date(val)
    } else {
        form.value.deadlineDate = null
    }
})

function addCriterion() {
    form.value.criteria.push({ name: '', max: 10 })
}

function removeCriterion(index: number) {
    form.value.criteria.splice(index, 1)
}

function autoGrow(event: Event) {
    const element = event.target as HTMLTextAreaElement
    if (!element) return
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
}

function handleSubmit() {
    const payload = {
        ...form.value,
        points: form.value.criteria.reduce((acc, c) => acc + (Number(c.max) || 0), 0),
        deadline: form.value.deadlineDate ? form.value.deadlineDate.toLocaleDateString('uk-UA') : '',
        criteria: form.value.criteria.map(c => ({
            ...c,
            type: form.value.gradingMode
        }))
    }
    emit('submit', payload)
}
</script>

<style lang="scss" scoped>
.modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1100;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
    position: relative;
    width: 540px;
    max-width: 95vw;
    background: #ffffff;
    border: 1px solid #000000;
    padding: 48px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-height: 95vh;
    overflow-y: auto;
    border-radius: 0;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);

    @media (max-width: 600px) {
        padding: 24px;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--color-primary);
    padding-bottom: 16px;
}

.modal-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #000000;
    margin: 0;
    text-transform: uppercase;
}

.icon-btn {
    background: transparent;
    border: none;
    color: #000000;
    font-size: 20px;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;

    &:hover {
        transform: rotate(90deg);
    }
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    color: var(--color-primary);
    letter-spacing: 1px;
    text-transform: uppercase;
}

.form-input {
    width: 100%;
    padding: 14px;
    border: 1px solid #e0e0e0;
    background: #ffffff;
    border-radius: 0;
    font-family: var(--font-sans);
    font-size: 14px;
    color: #000000;
    outline: none;
    transition: all 0.2s;

    &::placeholder {
        color: #aaaaaa;
    }

    &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(228, 35, 19, 0.1);
    }
}

.form-textarea {
    min-height: 100px;
    resize: none;
    overflow-y: hidden;
}

.divider-clean {
    height: 1px;
    background: #f0f0f0;
    margin: 8px 0;
}

.grading-toggle-clean {
    display: flex;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 4px;

    .toggle-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px;
        border: none;
        background: transparent;
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;

        &.active {
            background: #ffffff;
            color: #000000;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
    }
}

.criteria-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.add-link {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: var(--color-primary);
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    padding: 4px 0;
    
    &:hover {
        text-decoration: underline;
    }
}

.criteria-list-clean {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .criterion-row {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .value-box {
            width: 80px;
            
            .value-input {
                padding: 10px !important;
                text-align: center;
            }

            .stars-label {
                font-family: var(--font-display);
                font-size: 11px;
                font-weight: 700;
                color: #eab308;
                text-align: center;
            }
        }

        .remove-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            padding: 8px;
            cursor: pointer;
            transition: color 0.2s;

            &:hover {
                color: var(--color-primary);
            }
        }
    }
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 16px;
    padding-top: 32px;
    border-top: 2px solid #000000;
}

.cancel-btn {
    background: transparent;
    border: 2px solid #000000;
    color: #000000;
    padding: 14px 28px;
    font-family: var(--font-display);
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.2s;

    &:hover {
        background: #f0f0f0;
    }
}

.submit-btn {
    background-color: var(--color-primary);
    color: #ffffff;
    border: 2px solid var(--color-primary);
    padding: 14px 36px;
    font-family: var(--font-display);
    font-weight: 800;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.2s;

    &:hover:not(:disabled) {
        background-color: #000000;
        border-color: #000000;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.flex-1 { flex: 1; }
</style>
