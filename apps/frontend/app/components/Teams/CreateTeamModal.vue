<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useTeamsStore } from '~/stores/teams.store'

const props = defineProps<{ isTeamOpen: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const store = useTeamsStore()

const initialState = {
    name: '',
    captainName: '',
    city: '',
    organization: '',
    telegram: '',
    discord: '',
}

const form = reactive({ ...initialState })

const isLoading = ref(false)
// Тимчасово вимкнено логіку додавання учасників у команду.
// Повернемо після узгодження API/UX пошуку користувачів.
/*
const memberQuery = ref('')
const selectedMembers = ref<string[]>([])
const showDropdown = ref(false)
const searchRequestId = ref(0)
*/

async function submitForm() {
    try {
        isLoading.value = true
        const payload = {
            ...form,
        }
        await store.createTeam(payload)
        Object.assign(form, initialState)
        emit('success')
        emit('close')
    } catch (e) {
        console.error('Помилка створення команди:', e)
    } finally {
        isLoading.value = false
    }
}

function closeModal() { emit('close') }
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
            InputText.form-input(
                v-model="form.name"
                placeholder="Введіть назву команди"
                required
            )

        .form-group
            label.form-label Ім'я капітана
            InputText.form-input(
                v-model="form.captainName"
                placeholder="Введіть ім'я капітана"
            )

        .form-group
            label.form-label Місто
            InputText.form-input(
                v-model="form.city"
                placeholder="Місто"
            )

        //- ── Members autocomplete (тимчасово вимкнено) ───────────────────
        //- .form-group
        //-     label.form-label Список гравців
        //-     .members-input-wrapper
        //-         InputText.form-input(
        //-             placeholder="Введіть email гравця..."
        //-             autocomplete="off"
        //-             disabled
        //-         )

        //- ────────────────────────────────────────────────────────────────

        .form-row
            .form-group
                label.form-label Організація
                InputText.form-input(
                    v-model="form.organization"
                    placeholder="Організація"
                )
            .form-group
                label.form-label Telegram
                InputText.form-input(
                    v-model="form.telegram"
                    placeholder="@telegram"
                )

        .form-group
            label.form-label Discord
            InputText.form-input(
                v-model="form.discord"
                placeholder="@discord"
            )

        .modal-footer
            Button.cancel-btn(
                type="button"
                label="Скасувати"
                @click="closeModal"
            )
            Button.submit-btn(
                type="submit"
                :label="isLoading ? 'Створення...' : 'Створити команду'"
                :loading="isLoading"
                :disabled="isLoading"
            )
</template>

<style lang="scss">
// ─── Modal shell ───────────────────────────────────────────────────────────────

.create-team-modal {
    background: #ffffff !important;
    border: 2px solid var(--color-text);
    border-radius: 0;
    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);

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

// ─── Form layout ───────────────────────────────────────────────────────────────

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

// ─── Inputs ────────────────────────────────────────────────────────────────────

.form-input {
    &.p-inputtext,
    .p-inputtext {
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
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
            transform: translateY(-1px);
        }
    }
}

// ─── Members — теги ────────────────────────────────────────────────────────────

.members-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0;
}

.member-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 5px 10px 5px 12px;
    font-size: 13px;
    font-family: var(--font-sans);
    color: var(--color-text);
    line-height: 1.4;

    .tag-remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        color: var(--color-text-muted);
        padding: 0;
        transition: color 0.15s;

        &:hover {
            color: var(--color-primary);
        }
    }
}

// ─── Members — dropdown ────────────────────────────────────────────────────────

.members-input-wrapper {
    position: relative;
}

.members-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #ffffff;
    border: 1px solid var(--color-border);
    border-top: none;
    z-index: 200;
    max-height: 220px;
    overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    // Тонкий скролбар
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;

    &--empty {
        border-top: 1px solid var(--color-border);
    }
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.15s;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: var(--color-surface);
    }

    .user-email {
        font-size: 14px;
        color: var(--color-text);
        font-family: var(--font-sans);
    }

    .user-name {
        font-size: 12px;
        color: var(--color-text-muted);
        font-family: var(--font-sans);
    }
}

.dropdown-empty {
    padding: 14px 16px;
    font-size: 13px;
    color: var(--color-text-muted);
    text-align: center;
    font-family: var(--font-sans);
}

.members-searching {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: #ffffff;
    border: 1px solid var(--color-border);
    font-size: 13px;
    color: var(--color-text-muted);
    font-family: var(--font-sans);
    z-index: 200;
}

// ─── Footer ────────────────────────────────────────────────────────────────────

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