<template lang="pug">
.admin-controls
    .status-management
        .status-info
            span.status-label СТАТУС ЗАВДАННЯ:
            span.status-value(:class="task.status") {{ formatStatus(task.status) }}
        
        .buttons
            button.admin-btn.activate(
                v-if="task.status === 'DRAFT'"
                @click="handleActivate"
                :disabled="loading"
            )
                i.pi.pi-spin.pi-spinner(v-if="loading")
                i.pi.pi-play(v-else)
                span АКТИВУВАТИ ПРИЙОМ

            button.admin-btn.close(
                v-if="task.status === 'ACTIVE'"
                @click="handleClose"
                :disabled="loading"
            )
                i.pi.pi-spin.pi-spinner(v-if="loading")
                i.pi.pi-lock(v-else)
                span ЗАКРИТИ ПРИЙОМ

            button.admin-btn.distribute(
                v-if="task.status === 'SUBMISSION_CLOSED'"
                @click="showAssignDialog = true"
                :disabled="loading"
            )
                i.pi.pi-users
                span РОЗПОДІЛИТИ ЖУРІ

            button.admin-btn.redistribute(
                v-if="task.status === 'EVALUATED'"
                @click="showAssignDialog = true"
                :disabled="loading"
            )
                i.pi.pi-sync
                span ПЕРЕРОЗПОДІЛИТИ

    .distribution-info(v-if="task.status === 'SUBMISSION_CLOSED'")
        i.pi.pi-exclamation-triangle
        p
            b Увага: 
            | Прийом закрито. Натисніть "Розподілити журі", щоб призначити роботи суддям.

    .distribution-info.done(v-if="task.status === 'EVALUATED'")
        i.pi.pi-check-circle
        p Роботи розподілені. Журі бачать їх у своїх кабінетах.

    //- Custom Modal: Assign Jury
    .modal-wrapper(v-if="showAssignDialog")
        .modal-overlay(@click="showAssignDialog = false")
        .modal-content
            .modal-header
                h2.modal-title РОЗПОДІЛ ЖУРІ
                button.icon-btn(@click="showAssignDialog = false")
                    i.pi.pi-times
            
            .modal-body
                .info-block
                    i.pi.pi-info-circle
                    span Система рандомно призначить кожному судді вказану кількість робіт. Мінімальна кількість журі на роботу — встановлюється у налаштуваннях турніру.

                .field-group
                    label.field-label РОБІТ НА ОДНЕ ЖУРІ (МАКС.)
                    input.field-input(
                        type="number"
                        v-model.number="submissionsPerJury"
                        min="1"
                        max="50"
                    )
                    p.field-hint Скільки максимально робіт може отримати один суддя.
                
                .modal-actions
                    button.cancel-btn(@click="showAssignDialog = false") СКАСУВАТИ
                    button.confirm-btn(@click="handleAssign" :disabled="assigning")
                        i.pi.pi-spin.pi-spinner(v-if="assigning")
                        span {{ assigning ? 'РОЗПОДІЛ...' : 'РОЗПОДІЛИТИ ЗАРАЗ' }}
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTasksStore } from '~/stores/tasks.store'
import type { TournamentTask } from '~/types'

const props = defineProps<{
    task: TournamentTask
}>()

const tasksStore = useTasksStore()
const loading = ref(false)
const assigning = ref(false)
const showAssignDialog = ref(false)
const submissionsPerJury = ref(5)

function formatStatus(status: string) {
    const map: Record<string, string> = {
        'DRAFT': 'ЧЕРНЕТКА',
        'ACTIVE': 'ПРИЙОМ ВІДКРИТО',
        'SUBMISSION_CLOSED': 'ПРИЙОМ ЗАКРИТО',
        'EVALUATED': 'ОЦІНЮВАННЯ',
    }
    return map[status] || status
}

async function handleActivate() {
    loading.value = true
    try {
        await tasksStore.activateTask(props.task.id)
    } finally {
        loading.value = false
    }
}

async function handleClose() {
    loading.value = true
    try {
        await tasksStore.closeSubmissions(props.task.id)
    } finally {
        loading.value = false
    }
}

async function handleAssign() {
    assigning.value = true
    try {
        await tasksStore.assignJury(props.task.tournamentId, submissionsPerJury.value)
        showAssignDialog.value = false
    } finally {
        assigning.value = false
    }
}
</script>

<style scoped lang="scss">
.admin-controls {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 32px;
    margin-bottom: 32px;
}

.status-management {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--color-border);

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
}

.status-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .status-label {
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-muted);
        letter-spacing: 1px;
        text-transform: uppercase;
    }

    .status-value {
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: 800;
        padding: 6px 16px;
        color: white;
        letter-spacing: 1px;
        
        &.DRAFT { background: #64748b; }
        &.ACTIVE { background: #16a34a; }
        &.SUBMISSION_CLOSED { background: #dc2626; }
        &.EVALUATED { background: #2563eb; }
    }
}

.buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.admin-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 1px;

    &.activate { background: #16a34a; color: white; &:hover:not(:disabled) { background: #15803d; } }
    &.close { background: #dc2626; color: white; &:hover:not(:disabled) { background: #b91c1c; } }
    &.distribute { background: #2563eb; color: white; &:hover:not(:disabled) { background: #1d4ed8; } }
    &.redistribute { background: var(--color-text); color: white; &:hover:not(:disabled) { opacity: 0.8; } }

    &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.distribution-info {
    padding: 16px;
    background: rgba(251, 191, 36, 0.05);
    border: 1px dashed #fbbf24;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: #92400e;
    margin-top: 20px;

    p { margin: 0; }
    i { font-size: 18px; flex-shrink: 0; }

    &.done {
        background: rgba(22, 163, 74, 0.05);
        border-color: #16a34a;
        color: #166534;
    }
}

/* Custom Modal */
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
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(4px);
}

.modal-content {
    position: relative;
    background: white;
    width: 480px;
    max-width: 90vw;
    border: 1px solid black;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    border-bottom: 2px solid var(--color-primary);

    .modal-title {
        font-family: var(--font-display);
        font-size: 18px;
        font-weight: 800;
        margin: 0;
    }

    .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 20px;
        transition: transform 0.2s;
        &:hover { transform: rotate(90deg); }
    }
}

.modal-body {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.info-block {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    font-size: 13px;
    color: var(--color-text-muted);
    line-height: 1.5;
    i { font-size: 16px; flex-shrink: 0; margin-top: 2px; }
}

.field-group {
    .field-label {
        display: block;
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        color: var(--color-primary);
        letter-spacing: 1px;
        margin-bottom: 8px;
    }

    .field-input {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--color-border);
        font-size: 16px;
        font-weight: 700;
        &:focus { outline: none; border-color: var(--color-primary); }
    }

    .field-hint {
        font-size: 12px;
        color: var(--color-text-muted);
        margin: 6px 0 0 0;
    }
}

.modal-actions {
    display: flex;
    gap: 16px;

    button {
        flex: 1;
        padding: 16px;
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: 800;
        border: none;
        cursor: pointer;
        letter-spacing: 1px;
    }

    .cancel-btn { background: var(--color-bg); border: 1px solid var(--color-border); }
    .confirm-btn {
        background: var(--color-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        &:hover:not(:disabled) { background: black; }
        &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
}
</style>
