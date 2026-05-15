<template lang="pug">
.jury-manager
    .manager-content
        .search-section
            label.field-label {{ $t('tournament.jury_manager.add_label') }}
            .search-box
                i.pi.pi-search
                input(
                    type="text"
                    v-model="searchQuery"
                    :placeholder="$t('tournament.jury_manager.search_placeholder')"
                    @input="handleSearch"
                )

            .search-results(v-if="searchResults.length")
                .user-row(v-for="user in searchResults" :key="user.id")
                    .user-info
                        span.name {{ user.nameId }}
                        span.email {{ user.email }}
                    Button.add-btn(
                        icon="pi pi-plus"
                        :label="$t('common.add').toUpperCase()"
                        size="small"
                        :loading="addingId === user.id"
                        @click="addJuryMember(user.id)"
                    )
                .results-footer
                    span {{ $t('tournament.jury_manager.found_count', { count: searchResults.length }) }}

        .jury-list-section
            label.field-label {{ $t('tournament.jury_manager.current_list') }} ({{ juryMembers.length }})
            .empty-list(v-if="!juryMembers.length && !loading")
                span {{ $t('tournament.jury_manager.empty_list') }}

            .jury-grid(v-else)
                .jury-card(v-for="member in juryMembers" :key="member.id")
                    .member-avatar {{ (member.user?.nameId || 'J')[0].toUpperCase() }}
                    .member-info
                        span.name {{ member.user?.nameId }}
                        span.email {{ member.user?.email }}
                    button.remove-btn(
                        type="button"
                        @click="removeJuryMember(member.id)"
                        :disabled="removingId === member.id"
                    )
                        i.pi.pi-trash(v-if="removingId !== member.id")
                        i.pi.pi-spin.pi-spinner(v-else)
</template>

<script setup lang="ts">
const { t } = useI18n()
import { ref, onMounted } from 'vue'

const props = defineProps<{
    tournamentId: string
}>()

const api = useApi()
const toast = useServerSafeToast()

const juryMembers = ref<any[]>([])
const searchResults = ref<any[]>([])
const searchQuery = ref('')
const loading = ref(false)
const addingId = ref<string | null>(null)
const removingId = ref<string | null>(null)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function fetchJuryMembers() {
    loading.value = true
    try {
        const res = await api.get('/jury', {
            params: { tournamentId: props.tournamentId },
        })
        juryMembers.value = Array.isArray(res.data) ? res.data : []
    } catch (e) {
        console.error('Failed to fetch jury', e)
    } finally {
        loading.value = false
    }
}

function handleSearch() {
    if (searchTimeout) clearTimeout(searchTimeout)
    if (!searchQuery.value.trim()) {
        searchResults.value = []
        return
    }

    searchTimeout = setTimeout(async () => {
        try {
            const res = await api.get('/users/search', {
                params: { query: searchQuery.value },
            })
            searchResults.value = Array.isArray(res.data) ? res.data : []
        } catch (e) {
            console.error('Search failed', e)
        }
    }, 400)
}

async function addJuryMember(userId: string) {
    addingId.value = userId
    try {
        await api.post('/jury', {
            tournamentId: props.tournamentId,
            userId,
        })
        toast.success(t('tournament.jury_manager.add_success'))
        searchQuery.value = ''
        searchResults.value = []
        await fetchJuryMembers()
    } catch (e: any) {
        toast.error(e.response?.data?.message || 'Помилка додавання')
    } finally {
        addingId.value = null
    }
}

async function removeJuryMember(juryId: string) {
    if (!confirm(t('tournament.jury_manager.remove_confirm'))) return
    removingId.value = juryId
    try {
        await api.delete(`/jury/${juryId}`, {
            params: { tournamentId: props.tournamentId },
        })
        toast.success(t('tournament.jury_manager.remove_success'))
        await fetchJuryMembers()
    } catch (e: any) {
        toast.error(e.response?.data?.message || 'Помилка видалення')
    } finally {
        removingId.value = null
    }
}

onMounted(() => {
    fetchJuryMembers()
})
</script>

<style scoped lang="scss">
.jury-manager {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 32px;

    @media (max-width: 768px) {
        padding: 20px 16px;
    }
}

.field-label {
    display: block;
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    color: var(--color-primary);
    letter-spacing: 1px;
    margin-bottom: 12px;
    text-transform: uppercase;
}

.search-section {
    margin-bottom: 32px;
    position: relative;

    .search-box {
        position: relative;
        i {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--color-text-muted);
        }
        input {
            width: 100%;
            padding: 14px 14px 14px 44px;
            background: var(--color-bg);
            border: 1px solid var(--color-border);
            font-size: 14px;
            &:focus {
                outline: none;
                border-color: var(--color-primary);
            }
        }
    }

    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        z-index: 10;
        max-height: 300px;
        overflow-y: auto;
    }

    .user-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--color-border);
        gap: 12px;
        flex-wrap: wrap;

        @media (max-width: 520px) {
            flex-direction: column;
            align-items: stretch;
        }

        &:hover {
            background: var(--color-bg);
        }

        .user-info {
            display: flex;
            flex-direction: column;
            .name {
                font-weight: 700;
                font-size: 14px;
            }
            .email {
                font-size: 12px;
                color: var(--color-text-muted);
            }
        }
    }

    .results-footer {
        padding: 8px 16px;
        font-size: 10px;
        color: var(--color-text-muted);
        text-transform: uppercase;
        font-weight: 700;
        background: var(--color-bg);
    }
}

.jury-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
    gap: 20px;
}

.jury-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #fff;
    border: 1px solid var(--color-border);
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--color-primary);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .member-avatar {
        width: 48px;
        height: 48px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 18px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .member-info {
        flex: 1;
        overflow: hidden;
        .name {
            display: block;
            font-weight: 700;
            font-size: 15px;
            color: var(--color-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .email {
            display: block;
            font-size: 12px;
            color: var(--color-text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .remove-btn {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        color: var(--color-text-muted);
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
        &:hover {
            background: var(--color-error);
            border-color: var(--color-error);
            color: white;
        }
    }
}

.empty-list {
    padding: 40px;
    text-align: center;
    border: 1px dashed var(--color-border);
    color: var(--color-text-muted);
    font-size: 14px;
}
</style>
