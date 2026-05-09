<template lang="pug">
.modal-wrapper(v-if="isTeamOpen")
    .modal-overlay(@click="closeModal")
    .modal-content
        .modal-header
            h2.modal-title СТВОРИТИ КОМАНДУ
            button.icon-btn(@click="closeModal" type="button")
                i.pi.pi-times
        
        VeeForm.modal-form(@submit="onSubmit" :initial-values="initialValues")
            .form-group
                label.form-label НАЗВА КОМАНДИ *
                VeeField(name="name" rules="required" v-slot="{ field, errorMessage }")
                    input.form-input(type="text" v-bind="field" placeholder="Введіть назву команди" :class="{ 'is-invalid': errorMessage }")
                    span.error-text(v-if="errorMessage") {{ errorMessage }}

            .form-group
                label.form-label ІМ'Я КАПІТАНА
                VeeField(name="captainName" v-slot="{ field }")
                    input.form-input(type="text" v-bind="field" placeholder="Введіть ім'я капітана")

            .form-group
                label.form-label МІСТО
                VeeField(name="city" v-slot="{ field }")
                    input.form-input(type="text" v-bind="field" placeholder="Місто")

            .form-row
                .form-group
                    label.form-label ОРГАНІЗАЦІЯ
                    VeeField(name="organization" v-slot="{ field }")
                        input.form-input(v-bind="field" placeholder="Організація")
                .form-group
                    label.form-label TELEGRAM
                    VeeField(name="telegram" v-slot="{ field }")
                        input.form-input(v-bind="field" placeholder="@telegram")

            .form-group
                label.form-label DISCORD
                VeeField(name="discord" v-slot="{ field }")
                    input.form-input(v-bind="field" placeholder="@discord")

            .members-note
                i.pi.pi-info-circle
                p Після створення команди поділіться її назвою з учасниками — вони зможуть знайти команду у списку та приєднатися самостійно.

            .modal-footer
                button.cancel-btn(type="button" @click="closeModal") СКАСУВАТИ
                button.submit-btn(type="submit" :disabled="isLoading") {{ isLoading ? 'СТВОРЕННЯ...' : 'СТВОРИТИ КОМАНДУ' }}
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useTeamsStore } from '~/stores/teams.store'

import type { CreateTeamPayload } from '~/types'

const props = defineProps<{ isTeamOpen: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success', payload: { teamId: string }): void
}>()

const store = useTeamsStore()

const initialValues = {
    name: '',
    captainName: '',
    city: '',
    organization: '',
    telegram: '',
    discord: '',
}

const isLoading = ref(false)
const memberQuery = ref('')
const selectedMembers = ref<string[]>([])
const showDropdown = ref(false)
const searchRequestId = ref(0)

const filteredSearchResults = computed(() =>
    store.searchResults.filter(user => !selectedMembers.value.includes(user.email))
)

const debouncedSearch = useDebounceFn(async (query: string) => {
    const reqId = ++searchRequestId.value
    const results = await store.searchMembers(query)
    if (reqId !== searchRequestId.value) return
    showDropdown.value = query.trim().length >= 2 && results.length > 0
}, 300)

function onMemberInput(val: string) {
    memberQuery.value = val
    const q = val.trim()
    if (q.length < 2) {
        showDropdown.value = false
        store.clearSearchResults()
        return
    }
    showDropdown.value = true
    debouncedSearch(q)
}

function selectMember(email: string) {
    if (!selectedMembers.value.includes(email)) {
        selectedMembers.value.push(email)
    }
    memberQuery.value = ''
    showDropdown.value = false
    store.clearSearchResults()
}

function removeMember(email: string) {
    selectedMembers.value = selectedMembers.value.filter(m => m !== email)
}

function onBlur() {
    setTimeout(() => { showDropdown.value = false }, 150)
}

watch(() => props.isTeamOpen, (opened) => {
    if (!opened) {
        memberQuery.value = ''
        selectedMembers.value = []
        showDropdown.value = false
        store.clearSearchResults()
    }
})


async function onSubmit(values: CreateTeamPayload) {
    try {
        isLoading.value = true
        const team = await store.createTeam(values)
        if (!team?.id) return
        store.currentTeam = team
        emit('success', { teamId: team.id })
        emit('close')
    } catch (e) {
        console.error('Помилка створення команди:', e)
    } finally {
        isLoading.value = false
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
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: grayscale(1);
}

.modal-content {
    position: relative;
    width: 600px;
    max-width: 95vw;
    background: #ffffff;
    border: 1px solid #000000;
    padding: 48px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-height: 95vh;
    overflow-y: auto;
    border-radius: 0;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
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
    font-size: 24px;
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
    }
}

.modal-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-row {
    display: flex;
    gap: 24px;
    
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
    background: #ffffff;
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
        box-shadow: 0 0 0 2px rgba(228, 35, 19, 0.1);
        transform: translateY(-1px);
    }

    &.is-invalid {
        border-color: var(--color-primary);
        background: rgba(228, 35, 19, 0.05);
    }
}

.error-text {
    font-size: 11px;
    color: var(--color-primary);
    font-weight: 600;
    margin-top: 4px;
}

.members-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-bottom: 8px;
}

.member-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f0f0f0;
    border: 1px solid #000000;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #000000;

    .tag-remove {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: #666;
        padding: 0;
        display: flex;
        align-items: center;

        &:hover {
            color: var(--color-primary);
        }
    }
}

.members-input-wrapper {
    position: relative;
}

.members-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ffffff;
    border: 2px solid #000000;
    border-top: none;
    z-index: 100;
    max-height: 200px;
    overflow-y: auto;
}

.dropdown-item {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    display: flex;
    gap: 8px;
    align-items: center;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: #f8f8f8;
    }

    .user-email {
        font-weight: 600;
        font-size: 14px;
    }
    .user-name {
        color: #666;
        font-size: 12px;
    }
}

.dropdown-empty, .members-searching {
    padding: 12px 16px;
    color: #666;
    font-size: 13px;
    text-align: center;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 16px;
    padding-top: 32px;
    border-top: 2px solid #000000;
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
