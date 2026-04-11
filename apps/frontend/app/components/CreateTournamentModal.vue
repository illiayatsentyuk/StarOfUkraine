<script lang="ts" setup>
const { t } = useI18n()
const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
}>()

const store = useTournamentsStore()


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
        console.error(t('modals.create.error_creating'), e)
    } finally {
        isLoading.value = false
    }
}

function closeModal() {
  emit("close")
}
function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}
</script>

<template lang="pug">
.modal-wrapper(v-if="isOpen")
    .modal-overlay(@click="closeModal")
    .modal-content
        .modal-header
            h2.modal-title {{ $t('modals.create.title') }}
            button.icon-btn(@click="closeModal" type="button")
                i.pi.pi-times
        form.modal-form(@submit.prevent="submitForm")
            .form-group
                label.form-label {{ $t('modals.create.name_label') }}
                input.form-input(type="text" v-model="form.name" :placeholder="$t('modals.create.name_placeholder')" required)
            
            .form-group
                label.form-label {{ $t('modals.create.desc_label') }}
                input.form-input(type="text" v-model="form.description" :placeholder="$t('modals.create.desc_placeholder')")
            
            .form-row
                .form-group
                    label.form-label {{ $t('modals.create.start_date') }}
                    input.form-input(type="date" v-model="form.startDate")
                .form-group
                    label.form-label {{ $t('modals.create.reg_start') }}
                    input.form-input(type="date" v-model="form.registrationStart")
            
            .form-row
                .form-group
                    label.form-label {{ $t('modals.create.rounds_label') }}
                    input.form-input(type="number" v-model.number="form.rounds" :placeholder="$t('modals.create.rounds_placeholder')")
                .form-group
                    label.form-label {{ $t('modals.create.max_teams_label') }}
                    input.form-input(type="number" v-model.number="form.maxTeams" :placeholder="$t('modals.create.max_teams_placeholder')")
            
            .form-row
                .form-group
                    label.form-label {{ $t('modals.create.min_players') }}
                    input.form-input(type="number" v-model.number="form.teamSizeMin" :placeholder="$t('modals.create.min_placeholder')")
                .form-group
                    label.form-label {{ $t('modals.create.max_players') }}
                    input.form-input(type="number" v-model.number="form.teamSizeMax" :placeholder="$t('modals.create.max_placeholder')")
            
            .form-group
                label.form-label {{ $t('modals.create.reg_end') }}
                input.form-input(type="date" v-model="form.registrationEnd")
            
            .checkbox-group
                input(type="checkbox" v-model="form.hideTeamsUntilRegistrationEnds" id="hideTeams")
                label.form-label.checkbox-label(for="hideTeams") {{ $t('modals.create.hide_teams') }}
            
            button.submit-btn(type="submit" :disabled="isLoading") {{ isLoading ? $t('modals.create.creating') : $t('modals.create.create_btn') }}
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
