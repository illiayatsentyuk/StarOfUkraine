<template lang="pug">
.modal-wrapper(v-if="isOpen")
    .modal-overlay(@click="closeModal")
    .modal-content
        .modal-header
            h2.modal-title РЕДАГУВАТИ КОМАНДУ
            button.icon-btn(@click="closeModal" type="button")
                i.pi.pi-times
        
        VeeForm.modal-form(@submit="onSubmit" :initial-values="initialValues")
            .form-group
                label.form-label НАЗВА КОМАНДИ *
                VeeField(name="name" rules="required" v-slot="{ field, errorMessage }")
                    input.form-input(type="text" v-bind="field" placeholder="Введіть назву команди" :class="{ 'is-invalid': errorMessage }")
                    span.error-text(v-if="errorMessage") {{ errorMessage }}

            .form-row
                .form-group
                    label.form-label ОРГАНІЗАЦІЯ
                    VeeField(name="organization" v-slot="{ field }")
                        input.form-input(v-bind="field" placeholder="Організація")
                .form-group
                    label.form-label МІСТО
                    VeeField(name="city" v-slot="{ field }")
                        input.form-input(v-bind="field" placeholder="Місто")

            .form-row
                .form-group
                    label.form-label TELEGRAM
                    VeeField(name="telegram" v-slot="{ field }")
                        input.form-input(v-bind="field" placeholder="@telegram")
                .form-group
                    label.form-label DISCORD
                    VeeField(name="discord" v-slot="{ field }")
                        input.form-input(v-bind="field" placeholder="@discord")

            .form-group.checkbox-group
                label.checkbox-container
                    VeeField(name="isAcceptNewMembers" type="checkbox" :value="true" v-slot="{ field }")
                        input(type="checkbox" v-bind="field" :checked="field.value")
                        span.checkmark
                    span.checkbox-label Приймати нових учасників

            .modal-footer
                button.cancel-btn(type="button" @click="closeModal") СКАСУВАТИ
                button.submit-btn(type="submit" :disabled="isLoading") {{ isLoading ? 'ЗБЕРЕЖЕННЯ...' : 'ЗБЕРЕГТИ ЗМІНИ' }}
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useTeamsStore } from '~/stores/teams.store'

const props = defineProps<{
    isOpen: boolean
    team: any
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'success'): void
}>()

const store = useTeamsStore()
const isLoading = computed(() => store.loading)

const initialValues = computed(() => ({
    name: props.team?.name || '',
    organization: props.team?.organization || '',
    city: props.team?.city || '',
    telegram: props.team?.telegram || '',
    discord: props.team?.discord || '',
    isAcceptNewMembers: props.team?.isAcceptNewMembers ?? true,
}))

async function onSubmit(values: any) {
    try {
        await store.updateTeam(props.team.id, values)
        emit('success')
        emit('close')
    } catch (e) {
        console.error('Помилка оновлення команди:', e)
    }
}

function closeModal() { emit('close') }
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
    background-color: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
}

.modal-content {
    position: relative;
    width: 550px;
    max-width: 95vw;
    background: #ffffff;
    border: 1px solid #000000;
    padding: 40px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-height: 95vh;
    overflow-y: auto;
    border-radius: 0;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
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
    font-size: 22px;
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
        color: var(--color-primary);
    }
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-row {
    display: flex;
    gap: 20px;
    
    .form-group {
        flex: 1;
    }

    @media (max-width: 640px) {
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
    background: #fcfcfc;
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
        background: #ffffff;
        box-shadow: 0 4px 12px rgba(228, 35, 19, 0.08);
    }

    &.is-invalid {
        border-color: var(--color-primary);
        background: rgba(228, 35, 19, 0.02);
    }
}

.error-text {
    font-size: 11px;
    color: var(--color-primary);
    font-weight: 600;
    margin-top: 4px;
}

.checkbox-group {
    margin-top: 8px;
}

.checkbox-container {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
    
    input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
    }

    .checkmark {
        height: 20px;
        width: 20px;
        background-color: #eee;
        border: 1px solid #000000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:after {
            content: "";
            display: none;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
    }

    input:checked ~ .checkmark {
        background-color: var(--color-primary);
        border-color: var(--color-primary);
        
        &:after {
            display: block;
        }
    }

    .checkbox-label {
        font-size: 14px;
        font-weight: 600;
        color: #333;
    }
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 16px;
    padding-top: 32px;
    border-top: 2px solid #f0f0f0;
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
</style>
