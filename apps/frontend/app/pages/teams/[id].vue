<template lang="pug">
.team-page
    .loading-overlay(v-if="loading")
        Loader

    template(v-else-if="team")
        header.team-header
            .team-header__identity
                .team-avatar {{ team.name[0].toUpperCase() }}
                .team-meta
                    h1.team-name {{ team.name }}
                    span.team-captain
                        i.pi.pi-user
                        | &nbsp;{{ team.captainName }}

            .team-header__actions
                Button.btn-join(
                    v-if="authStore.isAuthenticated && !isMember && team.isAcceptNewMembers"
                    type="button"
                    icon="pi pi-user-plus"
                    label="ПРИЄДНАТИСЯ"
                    :loading="joining"
                    @click="handleJoinTeam"
                )
                template(v-if="isCaptain || isAdmin")
                    Button.btn-edit(
                        type="button"
                        icon="pi pi-pencil"
                        label="РЕДАГУВАТИ"
                        outlined
                        @click="isEditModalOpen = true"
                    )
                    Button.btn-delete(
                        type="button"
                        icon="pi pi-trash"
                        label="ВИДАЛИТИ"
                        outlined
                        severity="danger"
                        @click="handleDeleteTeam"
                    )

        .team-body
            .info-card
                h3.card-label ІНФОРМАЦІЯ

                .info-empty(v-if="!team.organization && !team.city && !team.telegram && !team.discord")
                    i.pi.pi-info-circle
                    span Інформація не вказана

                .info-rows(v-else)
                    .info-row(v-if="team.organization")
                        span.info-key Організація
                        span.info-val {{ team.organization }}
                    .info-row(v-if="team.city")
                        span.info-key Місто
                        span.info-val {{ team.city }}
                    .info-row(v-if="team.telegram")
                        span.info-key Telegram
                        span.info-val {{ team.telegram }}
                    .info-row(v-if="team.discord")
                        span.info-key Discord
                        span.info-val {{ team.discord }}

                .info-badge(v-if="team.isAcceptNewMembers")
                    i.pi.pi-check-circle
                    span Команда приймає нових учасників

            .members-card
                h3.card-label
                    | УЧАСНИКИ
                    span.members-count &nbsp;({{ team.members?.length || 0 }})

                .members-list(v-if="team.members?.length")
                    .member-row(
                        v-for="member in team.members"
                        :key="member.id"
                        :class="{ 'member-row--captain': member.email === team.captainEmail }"
                    )
                        .member-avatar {{ (member.nameId || member.name || '?')[0].toUpperCase() }}
                        .member-details
                            span.member-name {{ member.nameId || member.name }}
                            span.member-role {{ member.email === team.captainEmail ? 'Капітан' : 'Учасник' }}

                .members-empty(v-else)
                    i.pi.pi-users
                    span Учасників поки немає

                .invite-block(v-if="(isCaptain || isAdmin) && team.isAcceptNewMembers")
                    .invite-divider
                    h4.invite-title
                        i.pi.pi-link
                        | &nbsp;Запросити учасників
                    p.invite-hint Надішліть посилання, щоб людина могла приєднатися:
                    .invite-row
                        InputText.invite-url(:value="inviteUrl" readonly)
                        Button.btn-copy(icon="pi pi-copy" @click="copyInviteLink")

    //- Edit modal
    Dialog.edit-dialog(
        v-model:visible="isEditModalOpen"
        header="РЕДАГУВАННЯ КОМАНДИ"
        :style="{ width: 'min(calc(100vw - 2rem), 500px)' }"
        modal
        :draggable="false"
    )
        .edit-form
            .edit-field
                label.edit-label Назва команди *
                InputText.edit-input(v-model="editForm.name" placeholder="Назва команди")

            .edit-field
                label.edit-label Організація
                InputText.edit-input(v-model="editForm.organization" placeholder="Назва організації")

            .edit-field
                label.edit-label Місто
                InputText.edit-input(v-model="editForm.city" placeholder="Київ")

            .edit-field
                label.edit-label Telegram
                InputText.edit-input(v-model="editForm.telegram" placeholder="@username або посилання")

            .edit-field
                label.edit-label Discord
                InputText.edit-input(v-model="editForm.discord" placeholder="username#0000 або посилання")

            label.edit-toggle
                .toggle-track(:class="{ 'toggle-track--on': editForm.isAcceptNewMembers }")
                    input(
                        type="checkbox"
                        :checked="editForm.isAcceptNewMembers"
                        @change="editForm.isAcceptNewMembers = $event.target.checked"
                    )
                    .toggle-knob
                span.toggle-label Приймати нових учасників

        template(#footer)
            .edit-footer
                button.btn-cancel(type="button" @click="isEditModalOpen = false") Скасувати
                button.btn-save(type="button" :disabled="saving" @click="handleUpdateTeam")
                    i.pi(:class="saving ? 'pi-spin pi-spinner' : 'pi-check'")
                    | &nbsp;Зберегти
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()
const teamsStore = useTeamsStore()
const authStore = useLoginStore()
const toast = useServerSafeToast()

const teamId = route.params.id as string
const team = computed(() => teamsStore.currentTeam)
const loading = computed(() => teamsStore.loading)
const isCaptain = computed(() => authStore.user?.email === team.value?.captainEmail)
const isAdmin = computed(() => authStore.isAdmin)
const isMember = computed(() => team.value?.members?.some(m => m.email === authStore.user?.email))
const joining = ref(false)

const isEditModalOpen = ref(false)
const saving = ref(false)
const editForm = ref({
    name: '',
    organization: '',
    city: '',
    telegram: '',
    discord: '',
    isAcceptNewMembers: true,
})

async function loadTeam() {
    try {
        await teamsStore.fetchTeamById(teamId)
        if (team.value) {
            editForm.value = {
                name: team.value.name,
                organization: team.value.organization || '',
                city: team.value.city || '',
                telegram: team.value.telegram || '',
                discord: team.value.discord || '',
                isAcceptNewMembers: team.value.isAcceptNewMembers,
            }
        }
    } catch {
        router.push(localePath('/'))
    }
}

async function handleJoinTeam() {
    joining.value = true
    try {
        await teamsStore.joinTeam(teamId)
        await loadTeam()
    } catch {}
    finally { joining.value = false }
}

async function handleUpdateTeam() {
    saving.value = true
    try {
        await teamsStore.updateTeam(teamId, editForm.value)
        isEditModalOpen.value = false
    } catch {}
    finally { saving.value = false }
}

async function handleDeleteTeam() {
    if (!confirm('Ви впевнені, що хочете видалити команду?')) return
    try {
        await teamsStore.deleteTeam(teamId)
        router.push(localePath('/'))
    } catch {}
}

const inviteUrl = computed(() => {
    if (typeof window === 'undefined') return ''
    return window.location.href
})

async function copyInviteLink() {
    try {
        await navigator.clipboard.writeText(inviteUrl.value)
        toast.success('Посилання скопійовано')
    } catch {
        toast.error('Не вдалося скопіювати посилання')
    }
}

onMounted(loadTeam)
</script>

<style scoped lang="scss">
/* ─── Page shell ─────────────────────────────────────────── */
.team-page {
    max-width: 1040px;
    margin: 0 auto;
    padding: var(--space-10) var(--space-5);

    @media (max-width: 768px) {
        padding: var(--space-7) var(--space-4) var(--space-10);
    }
}

/* ─── Header ─────────────────────────────────────────────── */
.team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-6);
    padding-bottom: var(--space-7);
    margin-bottom: var(--space-7);
    border-bottom: 2px solid var(--color-text);
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        padding-bottom: var(--space-5);
        margin-bottom: var(--space-5);
    }

    &__identity {
        display: flex;
        align-items: center;
        gap: var(--space-5);
        min-width: 0;
    }

    &__actions {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
        align-items: center;

        @media (max-width: 768px) {
            width: 100%;
        }
    }
}

.team-avatar {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
    background: var(--color-primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -1px;

    @media (max-width: 480px) {
        width: 56px;
        height: 56px;
        font-size: 22px;
    }
}

.team-meta {
    min-width: 0;
}

.team-name {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 5vw, 2.5rem);
    font-weight: 900;
    line-height: 1.05;
    margin: 0 0 var(--space-1);
    word-break: break-word;
}

.team-captain {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-family: var(--font-sans);

    .pi { font-size: 0.8rem; }
}

/* ─── Header buttons ─────────────────────────────────────── */
:deep(.btn-join.p-button) {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 13px 20px;
    border-radius: 0;
    gap: 8px;
    background: var(--color-primary) !important;
    border: 2px solid var(--color-primary) !important;
    color: #fff !important;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;

    &:not(:disabled):hover {
        background: var(--color-text) !important;
        border-color: var(--color-text) !important;
        transform: translateY(-2px);
    }
}

:deep(.btn-edit.p-button) {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 11px 18px;
    border-radius: 0;
    gap: 8px;
    border: 1px solid var(--color-border) !important;
    color: var(--color-text) !important;
    background: transparent !important;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;

    &:hover {
        background: var(--color-surface) !important;
        border-color: var(--color-text) !important;
        transform: translateY(-2px);
    }
}

:deep(.btn-delete.p-button) {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 11px 18px;
    border-radius: 0;
    gap: 8px;
    border: 1px solid var(--color-error, #e53935) !important;
    color: var(--color-error, #e53935) !important;
    background: transparent !important;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;

    &:hover {
        background: var(--color-error, #e53935) !important;
        border-color: var(--color-error, #e53935) !important;
        color: #fff !important;
        transform: translateY(-2px);
    }
}

/* ─── Body grid ──────────────────────────────────────────── */
.team-body {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: var(--space-5);
    align-items: start;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
}

/* ─── Cards ──────────────────────────────────────────────── */
.info-card,
.members-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: var(--space-7);

    @media (max-width: 768px) {
        padding: var(--space-5);
    }
}

.card-label {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--color-primary);
    margin: 0 0 var(--space-5);
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--color-border);

    .members-count {
        color: var(--color-text-muted);
        font-weight: 700;
    }
}

/* ─── Info card ──────────────────────────────────────────── */
.info-rows {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.info-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.info-key {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--color-text-muted);
    font-family: var(--font-sans);
}

.info-val {
    font-size: var(--font-size-base);
    font-weight: 500;
    color: var(--color-text);
    word-break: break-all;
}

.info-empty,
.members-empty {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-family: var(--font-sans);
    padding: var(--space-4) 0;

    .pi { font-size: 1rem; }
}

.info-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: var(--space-5);
    padding: 6px 12px;
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    font-family: var(--font-sans);

    .pi { font-size: 0.85rem; }
}

/* ─── Members card ───────────────────────────────────────── */
.members-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.member-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    transition: border-color 0.2s;

    &--captain {
        border-color: var(--color-primary);
    }

    &:hover {
        border-color: var(--color-text);
    }
}

.member-avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    background: var(--color-border);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 800;

    .member-row--captain & {
        background: var(--color-primary);
        color: #fff;
    }
}

.member-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.member-name {
    font-weight: 700;
    font-size: var(--font-size-sm);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.member-role {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--color-text-muted);

    .member-row--captain & {
        color: var(--color-primary);
    }
}

/* ─── Invite block ───────────────────────────────────────── */
.invite-block {
    margin-top: var(--space-5);
}

.invite-divider {
    height: 1px;
    background: var(--color-border);
    margin-bottom: var(--space-5);
}

.invite-title {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin: 0 0 var(--space-2);
    display: flex;
    align-items: center;

    .pi { color: var(--color-primary); }
}

.invite-hint {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin: 0 0 var(--space-3);
    font-family: var(--font-sans);
}

.invite-row {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
}

:deep(.invite-url.p-inputtext) {
    flex: 1;
    min-width: 0;
    font-family: monospace;
    font-size: 12px;
    border-radius: 0;
    border: 1px solid var(--color-border);
    background: var(--color-bg);
    padding: 10px 12px;
    color: var(--color-text-muted);
}

:deep(.btn-copy.p-button) {
    border-radius: 0;
    border: 1px solid var(--color-border) !important;
    background: var(--color-surface) !important;
    color: var(--color-text) !important;
    transition: background 0.2s, border-color 0.2s;

    &:hover {
        background: var(--color-text) !important;
        border-color: var(--color-text) !important;
        color: var(--color-bg) !important;
    }
}

/* ─── Edit dialog ────────────────────────────────────────── */
:deep(.edit-dialog.p-dialog) {
    border-radius: 0;
    border: 1px solid var(--color-border);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
    overflow: hidden;
}

:deep(.edit-dialog .p-dialog-header) {
    background: var(--color-text);
    color: var(--color-bg);
    padding: var(--space-5) var(--space-6);
    border-bottom: none;

    .p-dialog-title {
        font-family: var(--font-display);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 2px;
    }

    .p-dialog-header-icon {
        color: var(--color-bg);
        border-radius: 0;
        opacity: 0.7;
        transition: opacity 0.2s;

        &:hover { opacity: 1; background: transparent; }
    }
}

:deep(.edit-dialog .p-dialog-content) {
    background: var(--color-bg);
    padding: var(--space-6);
}

:deep(.edit-dialog .p-dialog-footer) {
    background: var(--color-bg);
    padding: 0 var(--space-6) var(--space-6);
    border-top: none;
}

.edit-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.edit-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.edit-label {
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--color-text-muted);
}

:deep(.edit-input.p-inputtext) {
    border-radius: 0;
    border: 1px solid var(--color-border);
    padding: 12px var(--space-4);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    background: var(--color-surface);
    color: var(--color-text);
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;

    &:focus {
        outline: none;
        border-color: var(--color-text);
        box-shadow: 0 0 0 1px var(--color-text);
    }

    &::placeholder { color: var(--color-text-muted); opacity: 0.6; }
}

/* ─── Toggle switch ──────────────────────────────────────── */
.edit-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    user-select: none;
    margin-top: var(--space-2);
}

.toggle-track {
    position: relative;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
    background: var(--color-border);
    border-radius: 12px;
    transition: background 0.2s;

    &--on {
        background: var(--color-primary);
    }

    input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
    }
}

.toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);

    .toggle-track--on & {
        transform: translateX(20px);
    }
}

.toggle-label {
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    color: var(--color-text);
    font-weight: 500;
}

/* ─── Dialog footer buttons ──────────────────────────────── */
.edit-footer {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
}

.btn-cancel {
    padding: 12px 20px;
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;

    &:hover {
        border-color: var(--color-text);
        color: var(--color-text);
    }
}

.btn-save {
    display: inline-flex;
    align-items: center;
    padding: 12px 24px;
    background: var(--color-primary);
    border: 1px solid var(--color-primary);
    color: #fff;
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.15s;

    &:not(:disabled):hover {
        background: var(--color-text);
        border-color: var(--color-text);
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }
}
</style>
