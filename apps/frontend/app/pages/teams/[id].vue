<template lang="pug">
.team-page
    .loading-overlay(v-if="loading")
        Loader

    template(v-else-if="team")
        header.team-header
            .team-header__main
                .team-avatar {{ team.name[0].toUpperCase() }}
                .team-info
                    h1 {{ team.name }}
                    span.captain Капітан: {{ team.captainName }}
            
            .team-header__actions
                Button.team-header__join(
                    v-if="authStore.isAuthenticated && !isMember && team.isAcceptNewMembers"
                    type="button"
                    icon="pi pi-user-plus"
                    label="ПРИЄДНАТИСЯ"
                    :loading="joining"
                    @click="handleJoinTeam"
                )

                template(v-if="isCaptain || isAdmin")
                    Button.team-header__edit(
                        type="button"
                        icon="pi pi-pencil"
                        label="РЕДАГУВАТИ"
                        outlined
                        @click="isEditModalOpen = true"
                    )
                    Button.team-header__delete(
                        type="button"
                        icon="pi pi-trash"
                        label="ВИДАЛИТИ"
                        outlined
                        severity="danger"
                        @click="handleDeleteTeam"
                    )

        .team-content
            .content-grid
                //- Details
                .content-card
                    h3.card-title ІНФОРМАЦІЯ
                    .details-list
                        .detail-item(v-if="team.organization")
                            span.label Організація
                            span.value {{ team.organization }}
                        .detail-item(v-if="team.city")
                            span.label Місто
                            span.value {{ team.city }}
                        .detail-item
                            span.label Telegram
                            span.value {{ team.telegram || '—' }}
                        .detail-item
                            span.label Discord
                            span.value {{ team.discord || '—' }}
                
                //- Members
                .content-card
                    h3.card-title УЧАСНИКИ ({{ team.members?.length || 0 }})
                    .members-list
                        .member-item(v-for="member in team.members" :key="member.id")
                            .member-info
                                span.name {{ member.nameId || member.name }}
                                span.role {{ member.email === team.captainEmail ? 'Капітан' : 'Учасник' }}
                    
                    .invite-section(v-if="(isCaptain || isAdmin) && team.isAcceptNewMembers")
                        .divider
                        h4 Запросити учасників
                        p Надішліть це посилання, щоб людина могла приєднатися до вашої команди:
                        .invite-box
                            InputText.invite-url(:value="inviteUrl" readonly)
                            Button(icon="pi pi-copy" @click="copyInviteLink")

    //- Edit Modal
    Dialog(
        v-model:visible="isEditModalOpen"
        header="Редагувати команду"
        :style="{ width: 'min(calc(100vw - 2rem), 450px)' }"
        modal
    )
        .p-fluid
            .field
                label Назва команди
                InputText(v-model="editForm.name")
            .field
                label Організація
                InputText(v-model="editForm.organization")
            .field
                label Місто
                InputText(v-model="editForm.city")
            .field
                label Telegram
                InputText(v-model="editForm.telegram")
            .field
                label Discord
                InputText(v-model="editForm.discord")
            
            .field-checkbox
                Checkbox(v-model="editForm.isAcceptNewMembers" :binary="true")
                label Приймати нових учасників
        
        template(#footer)
            Button(label="Скасувати" icon="pi pi-times" text @click="isEditModalOpen = false")
            Button(label="Зберегти" icon="pi pi-check" @click="handleUpdateTeam" :loading="saving")
</template>

<script setup lang="ts">
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
    isAcceptNewMembers: true
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
                isAcceptNewMembers: team.value.isAcceptNewMembers
            }
        }
    } catch (e) {
        router.push('/')
    }
}

async function handleJoinTeam() {
    joining.value = true
    try {
        await teamsStore.joinTeam(teamId)
        await loadTeam()
    } catch (e) {}
    finally { joining.value = false }
}

async function handleUpdateTeam() {
    saving.value = true
    try {
        await teamsStore.updateTeam(teamId, editForm.value)
        isEditModalOpen.value = false
    } catch (e) {}
    finally { saving.value = false }
}

async function handleDeleteTeam() {
    if (!confirm('Ви впевнені, що хочете видалити команду?')) return
    try {
        await teamsStore.deleteTeam(teamId)
        router.push('/')
    } catch (e) {}
}


const inviteUrl = computed(() => {
    if (typeof window === 'undefined') return ''
    return window.location.href
})

async function copyInviteLink() {
    try {
        await navigator.clipboard.writeText(inviteUrl.value)
        toast.success('Посилання скопійовано')
    } catch (e) {
        toast.error('Не вдалося скопіювати посилання')
    }
}

onMounted(loadTeam)
</script>

<style scoped lang="scss">
.team-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 60px 20px;

    @media (max-width: 768px) {
        padding: 32px 16px 48px;
    }
}

.team-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 48px;
    gap: 24px;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        margin-bottom: 32px;
    }

    &__main {
        display: flex;
        gap: 24px;
        align-items: center;
        min-width: 0;

        .team-avatar {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
            background: var(--color-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 800;

            @media (max-width: 480px) {
                width: 64px;
                height: 64px;
                font-size: 26px;
            }
        }

        h1 {
            font-size: clamp(26px, 6vw, 40px);
            font-weight: 900;
            margin: 0;
            word-break: break-word;
        }

        .captain {
            color: var(--color-text-muted);
            font-size: 15px;
        }
    }

    &__actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: center;

        @media (max-width: 768px) {
            width: 100%;
        }
    }
}

:deep(.team-header__join.p-button) {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 14px 20px;
    border-radius: 0;
    background: var(--color-primary) !important;
    border: 2px solid var(--color-primary) !important;
    color: #fff !important;
    gap: 10px;

    &:not(:disabled):hover {
        background: var(--color-text) !important;
        border-color: var(--color-text) !important;
        color: #fff !important;
    }
}

:deep(.team-header__edit.p-button) {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 12px 18px;
    border-radius: 0;
    border: 1px solid var(--color-border) !important;
    color: var(--color-text) !important;
    background: transparent !important;
    gap: 8px;

    &:hover {
        background: var(--color-surface) !important;
        border-color: var(--color-text) !important;
    }
}

:deep(.team-header__delete.p-button) {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 12px 18px;
    border-radius: 0;
    border: 1px solid var(--color-error) !important;
    color: var(--color-error) !important;
    background: transparent !important;
    gap: 8px;

    &:hover {
        background: var(--color-error) !important;
        border-color: var(--color-error) !important;
        color: #fff !important;
    }
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
}

.content-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 32px;

    @media (max-width: 768px) {
        padding: 20px;
    }

    .card-title {
        font-family: var(--font-display);
        font-size: 14px;
        font-weight: 800;
        margin-bottom: 24px;
        color: var(--color-primary);
        letter-spacing: 1px;
    }
}

.details-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .detail-item {
        display: flex;
        flex-direction: column;
        .label { font-size: 11px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; }
        .value { font-size: 16px; font-weight: 500; }
    }
}

.members-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .member-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);

        .member-info {
            .name { display: block; font-weight: 700; }
            .role { font-size: 11px; color: var(--color-text-muted); }
        }
    }
}

.invite-section {
    margin-top: 24px;
    .divider { height: 1px; background: var(--color-border); margin: 24px 0; }
    h4 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 12px; color: var(--color-text-muted); margin-bottom: 12px; }
    .invite-box {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .invite-url {
            flex: 1;
            min-width: 0;
            font-family: monospace;
            font-size: 13px;
            background: var(--color-bg);
        }
    }
}

.field { margin-bottom: 1.5rem; label { display: block; margin-bottom: 0.5rem; font-weight: 600; } }
</style>
