<template lang="pug">
.modal-wrapper(v-if="isOpen")
    .modal-overlay(@click="closeModal")
    .modal-content
        .modal-header
            h2.modal-title НОВИЙ ТУРНІР
            button.icon-btn(@click="closeModal" type="button")
                i.pi.pi-times
        
        VeeForm.modal-form(@submit="onSubmit" :initial-values="initialValues")
            .form-group
                label.form-label НАЗВА ТУРНІРУ *
                VeeField(name="name" rules="required" v-slot="{ field, errorMessage }")
                    input.form-input(type="text" v-bind="field" placeholder="Введіть назву турніру" :class="{ 'is-invalid': errorMessage }")
                    span.error-text(v-if="errorMessage") {{ errorMessage }}
            
            .form-group
                label.form-label ОПИС ТА ПРАВИЛА
                VeeField(name="description" v-slot="{ field }")
                    textarea.form-input.form-textarea(v-bind="field" placeholder="Введіть опис та правила")
            
            .form-row
                    VeeField(name="startDate" rules="required|min_date_future:3" v-slot="{ field, errorMessage, handleChange }")
                        DatePicker(v-model="field.value" @update:modelValue="handleChange" dateFormat="dd.mm.yy" showIcon fluid :class="{ 'p-invalid': errorMessage }" appendTo="body")
                        span.error-text(v-if="errorMessage") {{ errorMessage }}
                .form-group
                    label.form-label ПОЧАТОК РЕЄСТРАЦІЇ
                    VeeField(name="registrationStart" rules="required|min_date_future:3" v-slot="{ field, errorMessage, handleChange }")
                        DatePicker(v-model="field.value" @update:modelValue="handleChange" dateFormat="dd.mm.yy" showIcon fluid appendTo="body")
            
            .form-row
                .form-group
                    label.form-label КІЛЬКІСТЬ РАУНДІВ
                    VeeField(name="rounds" rules="numeric" v-slot="{ field, errorMessage }")
                        input.form-input(type="number" v-bind="field" placeholder="6" :class="{ 'is-invalid': errorMessage }")
                .form-group
                    label.form-label МАКС. КОМАНД
                    VeeField(name="maxTeams" rules="numeric" v-slot="{ field, errorMessage }")
                        input.form-input(type="number" v-bind="field" placeholder="16" :class="{ 'is-invalid': errorMessage }")
            
            .form-row
                .form-group
                    label.form-label МІН. ГРАВЦІВ
                    VeeField(name="teamSizeMin" rules="required|numeric|min_value:1" v-slot="{ field, errorMessage }")
                        input.form-input(type="number" v-bind="field" :class="{ 'is-invalid': errorMessage }")
                .form-group
                    label.form-label МАКС. ГРАВЦІВ
                    VeeField(name="teamSizeMax" rules="required|numeric|min_value:1" v-slot="{ field, errorMessage }")
                        input.form-input(type="number" v-bind="field" :class="{ 'is-invalid': errorMessage }")
            
            .form-group
                label.form-label КІНЕЦЬ РЕЄСТРАЦІЇ
                VeeField(name="registrationEnd" v-slot="{ field, handleChange }")
                    DatePicker(v-model="field.value" @update:modelValue="handleChange" dateFormat="dd.mm.yy" showIcon fluid appendTo="body")
            
            .checkbox-group
                VeeField(name="hideTeamsUntilRegistrationEnds" type="checkbox" :value="true" v-slot="{ field }")
                    input.form-checkbox(type="checkbox" v-bind="field" id="hideTeams" :value="true")
                    label.form-label.checkbox-label(for="hideTeams") СХОВАТИ КОМАНДИ ДО КІНЦЯ РЕЄСТРАЦІЇ
            
            button.submit-btn(type="submit" :disabled="isLoading") {{ isLoading ? 'СТВОРЕННЯ...' : 'СТВОРИТИ ТУРНІР' }}
</template>

<script lang="ts" setup>
import type { Tournament } from '~/types'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const store = useTournamentsStore()

const initialValues = {
    name: "",
    description: "",
    startDate: null,
    registrationStart: null,
    registrationEnd: null,
    rounds: null,
    maxTeams: null,
    teamSizeMin: 2,
    teamSizeMax: 5,
    hideTeamsUntilRegistrationEnds: false,
}

const isLoading = ref(false)

async function onSubmit(values: Tournament) {
    try {
        isLoading.value = true
        const payload = {
            ...values,
            startDate: values.startDate ? new Date(values.startDate).toISOString() : "",
            registrationStart: values.registrationStart ? new Date(values.registrationStart).toISOString() : "",
            registrationEnd: values.registrationEnd ? new Date(values.registrationEnd).toISOString() : "",
            status: "DRAFT"
        }
        
        await store.addTournament(payload)
        emit("close")
    } catch (e) {
        console.error("Виникла помилка під час створення турніру.", e)
    } finally {
        isLoading.value = false
    }
}

function closeModal() {
  emit("close")
}
</script>

<style lang="scss" scoped>
.modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
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
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: grayscale(1);
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

.form-row {
    display: flex;
    gap: 24px;
    
    .form-group {
        flex: 1;
    }

    @media (max-width: 600px) {
        flex-direction: column;
        gap: 24px;
    }
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

    &.is-invalid {
        border-color: var(--color-primary);
        background: rgba(228, 35, 19, 0.05);
    }
}

.form-textarea {
    min-height: 100px;
    resize: vertical;
}

.error-text {
    font-size: 11px;
    color: var(--color-primary);
    font-weight: 600;
    margin-top: 4px;
}

.checkbox-group {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;

    .form-checkbox {
        width: 18px;
        height: 18px;
        border: 2px solid #000000;
        border-radius: 0;
        appearance: none;
        cursor: pointer;
        position: relative;
        background: #ffffff;

        &:checked {
            background: #000000;
            
            &::after {
                content: '✓';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #ffffff;
                font-size: 12px;
            }
        }
    }

    .checkbox-label {
        font-size: 12px;
        cursor: pointer;
        font-weight: 600;
    }
}

.submit-btn {
    margin-top: 16px;
    background-color: var(--color-primary);
    color: #ffffff;
    border: 2px solid var(--color-primary);
    padding: 20px;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 800;
    text-align: center;
    border-radius: 0;
    cursor: pointer;
    letter-spacing: 2px;
    text-transform: uppercase;
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
</style>
