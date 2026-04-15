<template lang="pug">
.jury-evaluator
  .evaluator-layout
    // Left: Submission Details
    .submission-info
      header.info-header
        h2.team-name {{ submission.teamName }}
        p.task-name {{ task.name }}
      
      .links-grid
        a.link-card(v-if="submission.githubUrl" :href="submission.githubUrl" target="_blank")
          i.pi.pi-github
          .link-text
            span.label GITHUB РЕПОЗИТОРІЙ
            span.url {{ submission.githubUrl }}
        
        a.link-card(v-if="submission.videoUrl" :href="submission.videoUrl" target="_blank")
          i.pi.pi-video
          .link-text
            span.label ДЕМО / ВІДЕО
            span.url {{ submission.videoUrl }}

    // Right: Evaluation Form
    .evaluation-form
      h3.section-title ОЦІНЮВАННЯ РОБОТИ
      
      .criteria-scoring
        .scoring-item(v-for="c in task.criteria" :key="c.id")
          .scoring-info
            span.label {{ c.label }}
            span.max-hint Макс: {{ c.maxPoints }}
          .input-container
            InputNumber.brutal-input-num(
              v-model="scores[c.id]"
              :min="0"
              :max="c.maxPoints"
              showButtons
              buttonLayout="horizontal"
            )
            span.slash /
            span.max {{ c.maxPoints }}

      .comment-section
        label.section-label ВІДГУК ДЛЯ КОМАНДИ
        Textarea.brutal-textarea(v-model="comment" rows="4" placeholder="Напишіть ваші зауваження або поради...")

      footer.evaluation-footer
        .total-score
          span.label СУМАРНИЙ БАЛ
          span.value {{ totalScore }} / {{ maxTotalScore }}
        
        Button.submit-btn(
          label="ЗБЕРЕГТИ ОЦІНКУ"
          icon="pi pi-verified"
          :loading="loading"
          @click="handleSubmit"
        )
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { Task, TaskSubmission as Submission } from '~/types/tournament-tasks.types'

const props = defineProps<{
  submission: Submission & { teamName?: string }
  task: Task
  loading?: boolean
}>()

const emit = defineEmits(['submit'])

const scores = reactive<Record<string, number>>({})
const comment = ref('')

// Initialize scores
props.task.criteria.forEach((c: any) => {
  scores[c.id] = scores[c.id] ?? 0
})

const totalScore = computed(() => {
  return Object.values(scores).reduce((sum, s) => sum + s, 0)
})

const maxTotalScore = computed(() => {
  return props.task.criteria.reduce((sum: number, c: any) => sum + c.maxPoints, 0)
})

const handleSubmit = () => {
  emit('submit', {
    scores: { ...scores },
    comment: comment.value,
    totalScore: totalScore.value
  })
}
</script>

<style lang="scss" scoped>
.jury-evaluator {
  padding: 64px;

  .evaluator-layout {
    display: grid;
    grid-template-columns: 1fr 480px;
    gap: 64px;
    align-items: start;
  }

  .info-header {
    margin-bottom: 48px;
    .team-name {
      font-family: var(--font-display);
      font-size: 48px;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 8px;
    }
    .task-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 2px;
    }
  }

  .links-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .link-card {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 32px;
    background: white;
    border: 3px solid var(--color-text);
    text-decoration: none;
    color: var(--color-text);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    i { font-size: 32px; }
    
    .link-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;

      .label {
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 2px;
        opacity: 0.6;
      }
      .url {
        font-weight: 800;
        font-size: 14px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }

    &:hover {
      background: var(--color-text);
      color: var(--color-primary);
      transform: translate(-4px, -4px);
      box-shadow: 12px 12px 0 var(--color-primary);
    }
  }

  .evaluation-form {
    background: white;
    border: 4px solid var(--color-text);
    padding: 48px;
    box-shadow: 16px 16px 0 rgba(0,0,0,0.05);

    .section-title {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 40px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  }

  .criteria-scoring {
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin-bottom: 48px;
  }

  .scoring-item {
    .scoring-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      .label { font-weight: 800; font-size: 15px; }
      .max-hint { 
        font-size: 11px; 
        opacity: 0.8; 
        font-weight: 900;
        background: var(--color-text);
        color: white;
        padding: 2px 8px;
      }
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: 20px;

      .slash { font-size: 24px; font-weight: 900; opacity: 0.2; }
      .max { 
        font-family: var(--font-display); 
        font-size: 28px; 
        font-weight: 900; 
        opacity: 0.3; 
        color: var(--color-text);
      }
    }
  }

  .brutal-input-num {
    :deep(.p-inputtext) {
      border-radius: 0 !important;
      border: 3px solid var(--color-text) !important;
      font-family: var(--font-display);
      font-weight: 900;
      font-size: 28px;
      padding: 16px !important;
      width: 140px;
      text-align: center;
      background: #FAFAFA !important;
      transition: all 0.2s;

      &:focus {
        background: white !important;
        border-color: var(--color-primary) !important;
        box-shadow: 6px 6px 0 var(--color-primary) !important;
        transform: translate(-3px, -3px);
      }
    }
    :deep(.p-button) {
      background: var(--color-text);
      border-radius: 0;
      border: none;
      width: 40px;
      &:hover { background: var(--color-primary); color: var(--color-text); }
    }
  }

  .comment-section {
    margin-bottom: 48px;
    padding-top: 32px;
    border-top: 2px dashed #E2E8F0;

    .section-label {
      display: block;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 2px;
      margin-bottom: 16px;
      color: var(--color-text);
    }
    .brutal-textarea {
      width: 100%;
      border-radius: 0 !important;
      border: 3px solid var(--color-text) !important;
      padding: 20px !important;
      font-weight: 700;
      font-size: 15px;
      background: #FAFAFA;
      transition: all 0.2s;

      &:focus {
        background: white;
        border-color: var(--color-primary) !important;
        box-shadow: 8px 8px 0 var(--color-primary) !important;
        transform: translate(-4px, -4px);
      }
    }
  }

  .evaluation-footer {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding-top: 40px;
    border-top: 3px solid var(--color-text);

    .total-score {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      .label { font-size: 13px; font-weight: 900; letter-spacing: 1px; }
      .value { 
        font-family: var(--font-display); 
        font-size: 56px; 
        font-weight: 900; 
        color: var(--color-primary);
        line-height: 1;
        text-shadow: 4px 4px 0 var(--color-text);
      }
    }

    .submit-btn {
      width: 100%;
      height: 72px;
      background: var(--color-primary) !important;
      border: 3px solid var(--color-text) !important;
      border-radius: 0 !important;
      color: var(--color-text) !important;
      font-family: var(--font-display);
      font-weight: 900;
      font-size: 18px;
      letter-spacing: 2px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;

      &:hover {
        background: var(--color-text) !important;
        color: var(--color-primary) !important;
        transform: translate(-6px, -6px);
        box-shadow: 10px 10px 0 var(--color-primary);
      }
    }
  }
}
</style>
