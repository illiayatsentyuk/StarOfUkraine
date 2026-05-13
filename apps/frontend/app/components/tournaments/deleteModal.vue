<template lang="pug">
Dialog(
    :visible="isOpen" 
    @update:visible="closeModal"
    modal 
    :closable="true" 
    :draggable="false"
    header="Видалення турніру"
    class="delete-modal"
    :style="{ background: '#ffffff', border: '1px solid var(--color-border)' }"
    :pt="{ mask: { style: 'backdrop-filter: blur(4px); background: rgba(0,0,0,0.3)' } }"
)
    .delete-content
        p.warning Ви намагаєтесь видалити турнір #[strong {{ tournament?.name }}]. Ця дія є незворотною!
        
        .form-field
            label(for="confirmInput") Щоб підтвердити, введіть назву турніру ПОВНІСТЮ ВЕЛИКИМИ ЛІТЕРАМИ:
            InputText#confirmInput(
                v-model="inputText" 
                :placeholder="tournament?.name?.toUpperCase() || 'НАЗВА ТУРНІРУ'" 
                class="w-full"
                autocomplete="off"
            )

    template(#footer)
        .footer-actions
            Button.cancel-btn(
                type="button" 
                label="СКАСУВАТИ" 
                @click="closeModal"
            )
            Button.delete-btn-confirm(
                type="button" 
                label="ВИДАЛИТИ" 
                icon="pi pi-trash"
                :disabled="!isConfirmed"
                @click="handleDelete"
                :loading="isDeleting"
            )
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useTournamentsStore } from '../../stores/tournaments.store'

const store = useTournamentsStore()
const props = defineProps({
    isOpen: Boolean,
    tournament: Object
})
const emit = defineEmits(['close', 'delete'])

const inputText = ref('')
const isDeleting = ref(false)

const isConfirmed = computed(() => {
    if (!props.tournament || !props.tournament.name) return false
    return inputText.value === props.tournament.name.toUpperCase()
})

const handleDelete = async () => {
    if (!isConfirmed.value) return
    isDeleting.value = true
    try {
        await store.deleteTournament(props.tournament?.id)
        emit('delete')
        closeModal()
    } catch (e) {
        console.error('Failed to delete tournament', e)
    } finally {
        isDeleting.value = false
    }
}

const closeModal = () => {
    emit('close')
}

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        inputText.value = ''
        isDeleting.value = false
    }
})
</script>

<style lang="scss">
.delete-modal {
    background: #ffffff;
    min-width: 450px;

    .p-dialog-header {
        background: #ffffff;
        border-bottom: 2px solid var(--color-error, #ef4444);
        padding: 24px;
        
        .p-dialog-title {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 600;
            color: var(--color-error, #ef4444);
            letter-spacing: -0.5px;
        }
    }

    .p-dialog-content {
        background: #ffffff;
        padding: 24px 24px 0;
    }

    .p-dialog-footer {
        background: #ffffff;
        padding: 0 24px 24px;
    }
}

.delete-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 24px;

    .warning {
        font-family: var(--font-sans);
        font-size: 15px;
        line-height: 1.5;
        color: var(--color-text);
        margin: 0;

        strong {
            font-weight: 700;
        }
    }
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
        font-family: var(--font-sans);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--color-text-muted);
        letter-spacing: 0.5px;
        line-height: 1.4;
    }

    .p-inputtext {
        font-family: var(--font-sans);
        border: 1px solid var(--color-border);
        border-radius: 0;
        padding: 12px;
        transition: all 0.2s ease;

        &:focus {
            border-color: var(--color-error, #ef4444);
            box-shadow: none;
        }
    }
}

.footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.cancel-btn {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 0;
    font-family: var(--font-display);
    font-weight: 600;
    padding: 10px 20px;
    letter-spacing: 1px;
    transition: all 0.2s;

    &:hover {
        background: var(--color-surface);
        border-color: var(--color-text);
    }
}

.delete-btn-confirm {
    background: var(--color-error, #ef4444);
    border: 1px solid var(--color-error, #ef4444);
    color: white;
    border-radius: 0;
    font-family: var(--font-display);
    font-weight: 600;
    padding: 10px 20px;
    letter-spacing: 1px;
    transition: all 0.2s;

    &:not(:disabled):hover {
        background: #dc2626;
        border-color: #dc2626;
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
}

.w-full {
    width: 100%;
}
</style>
