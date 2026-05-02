<template lang="pug">
section.task-detail
    .task-detail__nav
        NuxtLink.back-link(:to="`/tournaments/${route.params.id}/tasks`")
            span.icon ←
            span.text НАЗАД ДО ЗАВДАНЬ
            
    .loading-state(v-if="store.loading && !task")
        i.pi.pi-spin.pi-spinner
        span Завантаження...
        
    template(v-else-if="task")
        header.task-detail__hero
            .status-wrapper
                .status-badge(:class="`status-${task.status}`") 
                    template(v-if="task.status === 'completed'") ВИКОНАНО
                    template(v-else-if="task.status === 'pending'") В ОЧІКУВАННІ
                    template(v-else) НЕ ВИКОНАНО
                .points {{ task.points }} БАЛІВ
            
            h1.title {{ task.title }}
            .meta-info
                span.deadline ДЕДЛАЙН: {{ formatDate(task.deadline) }}
                
        .task-detail__layout
            main.main-content
                .content-section
                    h3.section-label ОПИС ЗАВДАННЯ
                    p.description {{ task.description }}
                
                .content-section(v-if="task.status === 'pending'")
                    h3.section-label ВІДПРАВИТИ РЕЗУЛЬТАТ
                    .submission-form
                        .field-group
                            label.field-label ПОСИЛАННЯ НА GITHUB
                            InputText.form-input(
                                v-model="submissionGithub" 
                                placeholder="https://github.com/..."
                            )
                        .field-group
                            label.field-label ПОСИЛАННЯ НА YOUTUBE (ОПЦІОНАЛЬНО)
                            InputText.form-input(
                                v-model="submissionYoutube" 
                                placeholder="https://youtube.com/watch?v=..."
                            )
                        Button.submit-btn(
                            @click="handleSubmit" 
                            type="button" 
                            label="ВІДПРАВИТИ" 
                            :loading="store.loading"
                            :disabled="!submissionGithub.trim()"
                        )
                
                .content-section(v-else-if="task.status === 'completed'")
                    .success-banner
                        i.pi.pi-check-circle
                        .text
                            h4 ЗАВДАННЯ ВИКОНАНО
                            p Ваша відповідь прийнята та зарахована.
                            
                .content-section.admin-section(v-if="authStore.isAdmin")
                    h3.section-label СУДДІВСЬКА ПАНЕЛЬ (ПОДАНІ РОБОТИ)
                    .loading-state(v-if="store.loading && store.submissions.length === 0")
                        i.pi.pi-spin.pi-spinner
                        span Завантаження робіт...
                        
                    .submissions-list(v-else)
                        .submission-card(v-for="sub in store.submissions" :key="sub.id")
                            .submission-header
                                h4.team-name {{ sub.teamName }}
                                span.status-badge(:class="`status-${sub.status}`") 
                                    template(v-if="sub.status === 'pending'") ОЧІКУЄ ОЦІНКИ
                                    template(v-if="sub.status === 'graded'") ОЦІНЕНО ({{ sub.score }} БАЛІВ)
                            .submission-links
                                a.link-item(:href="sub.githubUrl" target="_blank" v-if="sub.githubUrl")
                                    i.pi.pi-github
                                    span GitHub
                                a.link-item(:href="sub.youtubeUrl" target="_blank" v-if="sub.youtubeUrl")
                                    i.pi.pi-youtube
                                    span YouTube
                            .submission-actions(v-if="sub.status === 'pending'")
                                InputNumber.score-input(
                                    v-model="gradingScores[sub.id]"
                                    :min="0"
                                    :max="task.points"
                                    placeholder="Бали"
                                    inputClass="custom-input p-inputtext-sm"
                                )
                                Button.approve-btn(
                                    @click="handleGrade(sub.id)" 
                                    type="button" 
                                    label="ОЦІНИТИ" 
                                    :loading="store.loading"
                                    :disabled="gradingScores[sub.id] === undefined || gradingScores[sub.id] === null"
                                )
                            
    .error-state(v-else)
        p Завдання не знайдено
        NuxtLink(:to="`/tournaments/${route.params.id}/tasks`") Повернутися до списку
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#app'
import { useTasksStore } from '../../../../stores/tasks.store'
import { useLoginStore } from '../../../../stores/auth.store'

const route = useRoute()
const store = useTasksStore()
const authStore = useLoginStore()

const submissionGithub = ref('')
const submissionYoutube = ref('')
const gradingScores = ref<Record<string, number>>({})

const task = computed(() => {
    return store.tasks.find(t => t.id === route.params.taskId)
})

const formatDate = (dateString: string) => {
    if (!dateString) return "ТВА"
    const date = new Date(dateString)
    return date.toLocaleDateString("uk-UA", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).replace('р.', '').toUpperCase()
}

onMounted(async () => {
    const tournamentId = route.params.id as string
    if (store.tasks.length === 0) {
        await store.fetchTasks(tournamentId)
    }
    
    if (authStore.isAdmin) {
        await store.fetchSubmissions(route.params.taskId as string)
    }
})

const handleSubmit = async () => {
    if (!submissionGithub.value.trim() || !task.value) return
    await store.submitTask(task.value.id, { 
        github: submissionGithub.value,
        youtube: submissionYoutube.value 
    })
}

const handleGrade = async (submissionId: string) => {
    const score = gradingScores.value[submissionId]
    if (score === undefined || score === null) return
    await store.gradeSubmission(submissionId, score)
}
</script>

<style lang="scss" scoped>
.task-detail {
    max-width: 1440px;
    margin: 0 auto;
    padding: 60px 48px 60px 48px;

    @media (max-width: 768px) {
        padding: 0 24px 40px 24px;
    }

    padding-bottom: 80px;
    animation: fadeIn 0.4s ease-out;

    &__nav {
        margin-bottom: 48px;
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            color: var(--color-text-muted);
            font-weight: 600;
            font-size: 11px;
            letter-spacing: 1.5px;
            transition: all 0.2s ease;

            &:hover {
                color: var(--color-primary);
                transform: translateX(-4px);
            }
        }
    }

    &__hero {
        margin-bottom: 64px;
        border-bottom: 2px solid var(--color-text);
        padding-bottom: 48px;
        
        .status-wrapper {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            
            .status-badge {
                font-size: 11px;
                font-weight: 700;
                padding: 6px 14px;
                letter-spacing: 1.5px;
                
                &.status-completed {
                    background: var(--color-primary);
                    color: white;
                }
                &.status-pending {
                    background: var(--color-text);
                    color: white;
                }
                &.status-failed {
                    background: var(--color-error, #ef4444);
                    color: white;
                }
            }
            
            .points {
                font-family: var(--font-display);
                font-weight: 700;
                font-size: 20px;
                color: var(--color-primary);
            }
        }

        .title {
            font-family: var(--font-display);
            font-size: 64px;
            font-weight: 700;
            line-height: 0.95;
            letter-spacing: -2px;
            margin: 0 0 24px 0;
            color: var(--color-text);
            
            @media (max-width: 768px) {
                font-size: 48px;
            }
        }
        
        .meta-info {
            .deadline {
                font-size: 14px;
                font-weight: 600;
                color: var(--color-text-muted);
                letter-spacing: 1px;
            }
        }
    }

    &__layout {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 80px;

        @media (max-width: 1024px) {
            grid-template-columns: 1fr;
            gap: 48px;
        }
    }
}

.main-content {
    .content-section {
        margin-bottom: 64px;
        
        .section-label {
            font-size: 12px;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 2px;
            margin: 0 0 24px 0;
        }

        .description {
            font-size: 22px;
            line-height: 1.5;
            color: var(--color-text);
            margin: 0;
            max-width: 800px;
            font-weight: 400;
        }
    }
}

.submission-form {
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    padding: 32px;
    
    .field-group {
        margin-bottom: 24px;
        
        .field-label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: var(--color-text-muted);
            letter-spacing: 1.5px;
            margin-bottom: 12px;
        }
        
        .form-input {
            width: 100%;
            background: transparent;
            border: 1px solid var(--color-border);
            padding: 16px;
            font-family: inherit;
            font-size: 16px;
            color: var(--color-text);
            resize: vertical;
            transition: border-color 0.2s;
            
            &:focus {
                outline: none;
                border-color: var(--color-primary);
            }
        }
    }
}

:deep(.submit-btn) {
    width: 100%;
    height: 52px;
    background: var(--color-primary);
    border: 1px solid var(--color-primary);
    color: white;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    border-radius: 0;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
        background: var(--color-text);
        border-color: var(--color-text);
        transform: translateY(-2px);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.success-banner {
    display: flex;
    align-items: center;
    gap: 24px;
    background: rgba(46, 204, 113, 0.1);
    border: 1px solid #2ecc71;
    padding: 32px;
    
    i {
        font-size: 48px;
        color: #2ecc71;
    }
    
    h4 {
        margin: 0 0 8px 0;
        font-family: var(--font-display);
        font-size: 24px;
        color: #2ecc71;
    }
    
    p {
        margin: 0;
        color: var(--color-text);
        font-size: 16px;
    }
}

.loading-state, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    gap: 16px;
    color: var(--color-text-muted);
    font-weight: 500;
    font-size: 18px;
}

.submissions-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
}

.submission-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .submission-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .team-name {
            font-family: var(--font-display);
            font-size: 20px;
            margin: 0;
        }
        
        .status-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 4px 8px;
            letter-spacing: 1px;
            
            &.status-pending {
                background: #f59e0b;
                color: white;
            }
            
            &.status-graded {
                background: var(--color-primary);
                color: white;
            }
        }
    }
    
    .submission-links {
        display: flex;
        gap: 16px;
        
        .link-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--color-text);
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            padding: 8px 16px;
            border: 1px solid var(--color-border);
            transition: all 0.2s;
            
            &:hover {
                background: #f3f4f6;
                border-color: var(--color-text);
            }
            
            i {
                font-size: 18px;
            }
        }
    }
    
    .submission-actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0;
        margin-top: 8px;
        
        .score-input {
            width: 100px;
            
            :deep(.p-inputtext) {
                border-radius: 0;
                border: 1px solid var(--color-text);
                border-right: none;
                padding: 12px 16px;
                font-size: 14px;
                text-align: center;
                font-family: var(--font-display);
                color: var(--color-text);
                background: #ffffff;
                box-shadow: none;
                
                &:focus {
                    border-color: var(--color-text);
                    outline: none;
                }
            }
        }
        
        :deep(.approve-btn) {
            background: var(--color-text);
            border: 1px solid var(--color-text);
            color: white;
            font-family: var(--font-display);
            font-size: 12px;
            font-weight: 700;
            padding: 12px 24px;
            border-radius: 0;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.2s;
            height: 44px; /* Match input height roughly */
            
            &:hover:not(:disabled) {
                background: var(--color-primary);
                border-color: var(--color-primary);
                transform: translateY(-2px);
            }
            
            &:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
