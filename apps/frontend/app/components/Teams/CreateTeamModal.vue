<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useTeamsStore } from '~/stores/teams.store'

const props = defineProps<{
  isTeamOpen: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "success"): void
}>()

const store = useTeamsStore()


const initialState = {
    name: "",
    captainName: "",
    captainEmail: "",
    members:"",
    city:"",
    organization: "",
    telegram: "",
    discord: ""
}

const form = reactive({ ...initialState })

const isLoading = ref(false)

function formateMembers(members: string) {
  return members.split(",").map((member) => member.trim())
}

async function submitForm() {
    try {
        isLoading.value = true
        const payload = {
            ...form,
            members: formateMembers(form.members),
            organization: form.organization,
            telegram: form.telegram,
            discord: form.discord,
        }
        
        await store.createTeam(payload)
        Object.assign(form, initialState)
        emit("success")
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
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("uk-UA")
}

</script>

<template lang="pug">
Dialog(
    :visible="isTeamOpen"
    @update:visible="closeModal"
    modal
    :closable="true"
    :draggable="false"
    header="Створити команду"
    class="create-team-modal"
    :style="{ width: '600px' }"
    :pt="{ mask: { style: 'backdrop-filter: blur(8px); background: rgba(0,0,0,0.6)' } }"
)
    form.modal-form(@submit.prevent="submitForm")
        .form-group
            label.form-label Назва команди
            InputText.form-input(v-model="form.name" placeholder="Введіть назву команди" required)
        
        .form-group
            label.form-label Ім'я капітана
            InputText.form-input(v-model="form.captainName" placeholder="Введіть ім'я капітана")
        
        .form-row
            .form-group
                label.form-label Email капітана
                InputText.form-input(v-model="form.captainEmail" placeholder="Email")
            .form-group
                label.form-label Список гравців
                InputText.form-input(v-model="form.members" placeholder="Гравець 1, Гравець 2...")
        
        .form-row
            .form-group
                label.form-label Місто
                InputText.form-input(v-model="form.city" placeholder="Місто")
            .form-group
                label.form-label Організація
                InputText.form-input(v-model="form.organization" placeholder="Організація")
        
        .form-row
            .form-group
                label.form-label Telegram
                InputText.form-input(v-model="form.telegram" placeholder="@telegram")
            .form-group
                label.form-label Discord
                InputText.form-input(v-model="form.discord" placeholder="@discord")
        
        .modal-footer
            Button.cancel-btn(type="button" label="Скасувати" @click="closeModal")
            Button.submit-btn(
                type="submit" 
                :label="isLoading ? 'Створення...' : 'Створити команду'" 
                :loading="isLoading"
                :disabled="isLoading"
            )
</template>

<style lang="scss">
.create-team-modal {
    background: #ffffff !important;
    border: 2px solid var(--color-text);
    border-radius: 0;
    box-shadow: 0 40px 100px rgba(0,0,0,0.6);

    .p-dialog-header {
        background: #ffffff !important;
        border-bottom: 2px solid var(--color-text);
        padding: 24px 40px;
        border-radius: 0;
        color: var(--color-text);

        .p-dialog-title {
            font-family: var(--font-display);
            font-size: 24px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            color: var(--color-text);
        }

        .p-dialog-header-icon {
            color: var(--color-text);
            width: 32px;
            height: 32px;
            transition: all 0.3s ease;
            
            &:hover {
                background: var(--color-surface);
                transform: rotate(90deg);
                color: var(--color-primary);
            }

            .p-icon {
                width: 14px;
                height: 14px;
            }
        }
    }

    .p-dialog-content {
        background: var(--color-bg);
        padding: 32px 40px;
        border-radius: 0;
    }
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 28px;
}

.form-row {
    display: flex;
    gap: 24px;
    
    @media (max-width: 640px) {
        flex-direction: column;
        gap: 24px;
    }

    .form-group {
        flex: 1;
    }
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-label {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 800;
    color: var(--color-text);
    text-transform: uppercase;
    letter-spacing: 1.2px;
    opacity: 0.8;
}

.form-input {
    &.p-inputtext, .p-inputtext {
        width: 100%;
        padding: 16px;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        border-radius: 0;
        font-family: var(--font-sans);
        font-size: 15px;
        color: var(--color-text);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

        &::placeholder {
            color: var(--color-text-muted);
            opacity: 0.5;
        }

        &:focus {
            border-color: var(--color-text);
            background: white;
            box-shadow: 0 8px 20px rgba(0,0,0,0.06);
            transform: translateY(-1px);
        }
    }
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 12px;
    padding-top: 32px;
    border-top: 1px solid var(--color-border);
}

.cancel-btn {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    padding: 14px 28px;
    font-family: var(--font-display);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    border-radius: 0;
    transition: all 0.2s;
    font-size: 13px;

    &:hover {
        border-color: var(--color-text);
        color: var(--color-text);
        background: var(--color-surface);
    }
}

.submit-btn {
    background: var(--color-primary, #e42313);
    border: 1px solid var(--color-primary, #e42313);
    color: white;
    padding: 14px 36px;
    font-family: var(--font-display);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 2px;
    border-radius: 0;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    font-size: 13px;

    &:hover:not(:disabled) {
        background: var(--color-text);
        border-color: var(--color-text);
        transform: translateY(-3px);
        box-shadow: 0 12px 24px rgba(228, 35, 19, 0.3);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
</style>
