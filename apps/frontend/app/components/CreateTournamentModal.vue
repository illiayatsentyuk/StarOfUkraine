<script lang="ts" setup>
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const store = useTournamentsStore()

// Redundant load removed to avoid double fetching


const initialState = {
    name: "",
    description: "",
    startDate: "",
    registrationStart:"",
    registrationEnd:"",
    rounds: "",
    maxTeams: "",
    teamSizeMin: "",
    teamSizeMax: "",
    hideTeamsUntilRegistrationEnds: false,
    status: "DRAFT"
}

const form = reactive({ ...initialState })

const isLoading = ref(false)

async function submitForm() {
    try {
        isLoading.value = true
        const payload = {
            ...form,
            startDate: form.startDate ? new Date(form.startDate).toISOString() : "",
            registrationStart: form.registrationStart ? new Date(form.registrationStart).toISOString() : "",
            registrationEnd: form.registrationEnd ? new Date(form.registrationEnd).toISOString() : "",
        }
        
        await store.addTournament(payload)
        Object.assign(form, initialState)
        emit("close")
    } catch (e) {
        alert("Виникла помилка під час створення турніру.")
    } finally {
        isLoading.value = false
    }
}

function closeModal() {
  emit("close")
}
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("uk-UA")
}
</script>

<template lang="pug">
.modal-wrapper(v-if="isOpen")
    .modal-overlay(@click="closeModal")
    .modal-content
        .modal-header
            h2.modal-title Створити турнір
            button.icon-btn(@click="closeModal" type="button")
                i.pi.pi-times
        form.modal-form(@submit.prevent="submitForm")
            .form-group
                label.form-label Назва турніру
                input.form-input(type="text" v-model="form.name" placeholder="Введіть назву турніру" required)
            
            .form-group
                label.form-label Опис та Правила
                input.form-input(type="text" v-model="form.description" placeholder="Введіть опис та правила")
            
            .form-row
                .form-group
                    label.form-label Дата старту турніру
                    input.form-input(type="date" v-model="form.startDate")
                .form-group
                    label.form-label Початок реєстрації
                    input.form-input(type="date" v-model="form.registrationStart")
            
            .form-row
                .form-group
                    label.form-label Кількість раундів
                    input.form-input(type="number" v-model.number="form.rounds" placeholder="Раунди")
                .form-group
                    label.form-label Макс.команд (опційно)
                    input.form-input(type="number" v-model.number="form.maxTeams" placeholder="Команди")
            
            .form-row
                .form-group
                    label.form-label Мін. гравців
                    input.form-input(type="number" v-model.number="form.teamSizeMin" placeholder="Мін.")
                .form-group
                    label.form-label Макс. гравців
                    input.form-input(type="number" v-model.number="form.teamSizeMax" placeholder="Макс.")
            
            .form-group
                label.form-label Кінець реєстрації
                input.form-input(type="date" v-model="form.registrationEnd")
            
            .checkbox-group
                input(type="checkbox" v-model="form.hideTeamsUntilRegistrationEnds" id="hideTeams")
                label.form-label.checkbox-label(for="hideTeams") Сховати команди до кінця реєстрації
            
            button.submit-btn(type="submit" :disabled="isLoading") {{ isLoading ? 'Створення...' : 'Створити турнір' }}
</template>

<style lang="scss" scoped>
.modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
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
    background-color: rgba(13, 13, 13, 0.5);
    backdrop-filter: blur(4px);
}

.modal-content {
    position: relative;
    width: 500px;
    max-width: 90vw;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
}

.icon-btn {
    background: transparent;
    color: var(--color-text-muted);
    font-size: 18px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: var(--color-text);
    }
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-row {
    display: flex;
    gap: 16px;
    
    .form-group {
        flex: 1;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-family: var(--font-sans);
    font-size: 12px;
    color: var(--color-text-muted);
}

.form-input {
    width: 100%;
    padding: 12px;
    border: 1px solid var(--color-border);
    background: transparent;
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--color-text);
    outline: none;

    &::placeholder {
        color: var(--color-text-muted);
    }

    &:focus {
        border-color: var(--color-primary);
    }
}

.checkbox-group {
    display: flex;
    align-items: center;
    gap: 8px;

    input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: var(--color-primary);
    }

    .checkbox-label {
        color: var(--color-text);
        cursor: pointer;
    }
}

.submit-btn {
    margin-top: 8px;
    background-color: var(--color-primary);
    color: var(--color-bg);
    padding: 16px;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    transition: background-color 0.2s, opacity 0.2s;

    &:hover:not(:disabled) {
        background-color: var(--color-primary-hover);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
}
</style>
