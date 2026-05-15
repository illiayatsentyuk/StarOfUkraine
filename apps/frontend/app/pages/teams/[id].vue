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
                    :label="$t('team.join_btn')"
                    :loading="joining"
                    @click="handleJoinTeam"
                )
                template(v-if="isCaptain || isAdmin")
                    Button.btn-edit(
                        type="button"
                        icon="pi pi-pencil"
                        :label="$t('team.edit_btn')"
                        outlined
                        @click="isEditModalOpen = true"
                    )
                    Button.btn-delete(
                        type="button"
                        icon="pi pi-trash"
                        :label="$t('team.delete_btn')"
                        outlined
                        severity="danger"
                        @click="handleDeleteTeam"
                    )

        .team-body
            .info-card
                h3.card-label {{ $t('team.info_title') }}

                .info-empty(v-if="!team.organization && !team.city && !team.telegram && !team.discord")
                    i.pi.pi-info-circle
                    span {{ $t('team.info_empty') }}

                .info-rows(v-else)
                    .info-row(v-if="team.organization")
                        span.info-key {{ $t('team.organization') }}
                        span.info-val {{ team.organization }}
                    .info-row(v-if="team.city")
                        span.info-key {{ $t('team.city') }}
                        span.info-val {{ team.city }}
                    .info-row(v-if="team.telegram")
                        span.info-key Telegram
                        span.info-val {{ team.telegram }}
                    .info-row(v-if="team.discord")
                        span.info-key Discord
                        span.info-val {{ team.discord }}

                .info-badge(v-if="team.isAcceptNewMembers")
                    i.pi.pi-check-circle
                    span {{ $t('team.accepting_members') }}

            .members-card
                h3.card-label
                    | {{ $t('team.members_title') }}
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
                            span.member-role {{ member.email === team.captainEmail ? $t('team.captain') : $t('team.member') }}

                .members-empty(v-else)
                    i.pi.pi-users
                    span {{ $t('team.no_members') }}

                .invite-block(v-if="(isCaptain || isAdmin) && team.isAcceptNewMembers")
                    .invite-divider
                    h4.invite-title
                        i.pi.pi-link
                        | &nbsp;{{ $t('team.invite_title') }}
                    p.invite-hint {{ $t('team.invite_hint') }}
                    .invite-row
                        InputText.invite-url(:value="inviteUrl" readonly)
                        Button.btn-copy(icon="pi pi-copy" @click="copyInviteLink")

            .tournaments-card
                h3.card-label
                    | {{ $t('team.tournaments_title') || 'Tournaments' }}
                    span.tournaments-count &nbsp;({{ team.tournaments?.length || 0 }})

                .tournaments-list(v-if="team.tournaments?.length")
                    .tournament-row(v-for="t in team.tournaments" :key="t.id")
                        NuxtLink.tournament-link(:to="localePath(`/tournaments/${t.id}`)")
                            span.tournament-name {{ t.name }}
                        .tournament-status(:class="`status--${t.status.toLowerCase()}`")
                            span {{ statusLabel(t.status) }}

                .tournaments-empty(v-else)
                    i.pi.pi-calendar-times
                    span {{ $t('team.no_tournaments') || 'No tournaments yet' }}

    //- Edit modal
    Dialog.edit-dialog(
        v-model:visible="isEditModalOpen"
        :header="$t('team.edit_title')"
        :style="{ width: 'min(calc(100vw - 2rem), 500px)' }"
        modal
        :draggable="false"
    )
        .edit-form
            .edit-field
                label.edit-label {{ $t('team.name_label') }} *
                InputText.edit-input(v-model="editForm.name" :placeholder="$t('team.name_label')")

            .edit-field
                label.edit-label {{ $t('team.organization') }}
                InputText.edit-input(v-model="editForm.organization" :placeholder="$t('team.organization')")

            .edit-field
                label.edit-label {{ $t('team.city') }}
                InputText.edit-input(v-model="editForm.city" :placeholder="$t('team.city_placeholder')")

            .edit-field
                label.edit-label Telegram
                InputText.edit-input(v-model="editForm.telegram" :placeholder="$t('team.telegram_placeholder')")

            .edit-field
                label.edit-label Discord
                InputText.edit-input(v-model="editForm.discord" :placeholder="$t('team.discord_placeholder')")

            label.edit-toggle(@click.prevent="editForm.isAcceptNewMembers = !editForm.isAcceptNewMembers")
                .toggle-track(:class="{ 'toggle-track--on': editForm.isAcceptNewMembers }")
                    .toggle-knob
                span.toggle-label {{ $t('team.accept_toggle') }}

        template(#footer)
            .edit-footer
                button.btn-cancel(type="button" @click="isEditModalOpen = false") {{ $t('common.cancel') }}
                button.btn-save(type="button" :disabled="saving" @click="handleUpdateTeam")
                    i.pi(:class="saving ? 'pi-spin pi-spinner' : 'pi-check'")
                    | &nbsp;{{ $t('team.save_btn') }}

</template>

<script setup lang="ts">
const { t } = useI18n()
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

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: t('tournament.status.draft'),
    REGISTRATION_OPEN: t('tournament.status.registration_open'),
    ONGOING: t('tournament.status.ongoing'),
    COMPLETED: t('tournament.status.completed'),
    CANCELLED: t('tournament.status.cancelled'),
  }
  return map[status] ?? status
}

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
    if (!confirm(t('team.delete_confirm'))) return
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
        toast.success(t('team.copy_success'))
    } catch {
        toast.error(t('team.copy_error'))
    }
}

onMounted(() => {
    loadTeam()
})
</script>

<style scoped lang="scss">
.team-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 64px 48px;

    @include media($md) {
        padding: 32px 24px;
    }
}

.team-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 64px;
    gap: 32px;

    @include media($md) {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 48px;
    }

    &__identity {
        display: flex;
        align-items: center;
        gap: 32px;

        @include media($s) {
            gap: 20px;
        }

        .team-avatar {
            width: 120px;
            height: 120px;
            background: var(--color-surface);
            border: 2px solid var(--color-text);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 64px;
            font-family: var(--font-display);
            font-weight: 800;

            @include media($s) {
                width: 80px;
                height: 80px;
                font-size: 40px;
            }
        }

        .team-meta {
            .team-name {
                font-family: var(--font-display);
                font-size: 56px;
                line-height: 1;
                margin: 0 0 12px 0;
                text-transform: uppercase;

                @include media($s) {
                    font-size: 32px;
                }
            }

            .team-captain {
                display: flex;
                align-items: center;
                color: var(--color-text-muted);
                font-size: 16px;
                font-weight: 600;
            }
        }
    }

    &__actions {
        display: flex;
        gap: 12px;

        @include media($s) {
            width: 100%;
            flex-direction: column;
        }

        .btn-join {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: white;
            font-weight: 800;
        }
    }
}

.team-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;

    @include media($md) {
        grid-template-columns: 1fr;
        gap: 32px;
    }

    .info-card, .members-card, .tournaments-card {
        background: var(--color-surface);
        padding: 40px;
        border: 1px solid var(--color-border);

        @include media($s) {
            padding: 24px;
        }

        .card-label {
            font-family: var(--font-display);
            font-size: 14px;
            font-weight: 800;
            color: var(--color-text-muted);
            letter-spacing: 2px;
            margin: 0 0 32px 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }
    }
}

.info-rows {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .info-row {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .info-key {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--color-text-muted);
            letter-spacing: 1px;
        }

        .info-val {
            font-size: 18px;
            font-weight: 600;
        }
    }
}

.info-badge {
    margin-top: 40px;
    padding-top: 32px;
    border-top: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--color-primary);
    font-weight: 700;
    font-size: 14px;
}

.members-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .member-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: var(--color-bg);
        border: 1px solid transparent;
        transition: all 0.2s ease;

        &--captain {
            border-color: var(--color-primary-soft);
            background: var(--color-primary-soft);
        }

        .member-avatar {
            width: 40px;
            height: 40px;
            background: var(--color-surface);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 16px;
            border: 1px solid var(--color-border);
        }

        .member-details {
            display: flex;
            flex-direction: column;

            .member-name {
                font-weight: 700;
                font-size: 16px;
            }

            .member-role {
                font-size: 11px;
                font-weight: 600;
                color: var(--color-text-muted);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
        }
    }
}

.invite-block {
    margin-top: 40px;

    .invite-divider {
        height: 1px;
        background: var(--color-border);
        margin-bottom: 32px;
    }

    .invite-title {
        font-size: 18px;
        font-weight: 800;
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
    }

    .invite-hint {
        font-size: 14px;
        color: var(--color-text-muted);
        margin: 0 0 20px 0;
    }

    .invite-row {
        display: flex;
        gap: 12px;

        .invite-url {
            flex: 1;
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            font-weight: 600;
            color: var(--color-text-muted);
        }

        .btn-copy {
            background: var(--color-text);
            border-color: var(--color-text);
            color: var(--color-bg);
        }
    }
}

.tournaments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .tournament-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px;
        background: var(--color-bg);
        border: 1px solid var(--color-border);

        .tournament-link {
            text-decoration: none;
            color: var(--color-text);
            font-weight: 700;
            font-size: 16px;
            transition: color 0.2s ease;
            &:hover { color: var(--color-primary); }
        }

        .tournament-status {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 4px 8px;

            &.status--ongoing { background: #e8f5e9; color: #2e7d32; }
            &.status--registration_open { background: #e3f2fd; color: #1565c0; }
            &.status--completed { background: #f3e5f5; color: #6a1b9a; }
            &.status--draft { background: var(--color-border); color: var(--color-text-muted); }
            &.status--cancelled { background: #fce4ec; color: #b71c1c; }
        }
    }
}

.tournaments-empty {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--color-text-muted);
    font-weight: 600;
    i { font-size: 20px; }
}

.edit-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-top: 12px;

    .edit-field {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .edit-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--color-text-muted);
        }

        .edit-input {
            width: 100%;
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            padding: 12px;
            font-weight: 600;
        }
    }

    .edit-toggle {
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: pointer;
        user-select: none;
        margin-top: 8px;

        .toggle-track {
            width: 44px;
            height: 24px;
            background: var(--color-border);
            padding: 4px;
            position: relative;
            transition: background 0.2s ease;

            &--on {
                background: var(--color-primary);
                .toggle-knob { transform: translateX(20px); }
            }

            input { display: none; }

            .toggle-knob {
                width: 16px;
                height: 16px;
                background: white;
                transition: transform 0.2s ease;
            }
        }

        .toggle-label {
            font-size: 14px;
            font-weight: 700;
        }
    }
}

.edit-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    width: 100%;

    button {
        padding: 12px 24px;
        font-weight: 800;
        font-size: 13px;
        letter-spacing: 1px;
        text-transform: uppercase;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-cancel {
        background: transparent;
        color: var(--color-text-muted);
        &:hover { color: var(--color-text); }
    }

    .btn-save {
        background: var(--color-primary);
        color: white;
        display: flex;
        align-items: center;
        gap: 8px;
        &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
}
</style>
