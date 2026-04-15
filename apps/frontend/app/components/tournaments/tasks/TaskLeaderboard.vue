<template lang="pug">
.task-leaderboard
  header.leaderboard-header
    h2.title ТАБЛИЦЯ ЛІДЕРІВ
    p.subtitle Оновлення в реальному часі за результатами оцінювання журі

  .table-container
    DataTable.brutal-table(
      :value="teams"
      responsiveLayout="scroll"
      scrollable
      scrollHeight="700px"
    )
      Column(header="#" style="width: 80px")
        template(#body="{ index }")
          span.rank {{ index + 1 }}
      
      Column(header="КОМАНДА" style="min-width: 300px")
        template(#body="{ data }")
          .team-cell
            .team-logo(v-if="data.logo" :style="{ backgroundImage: `url(${data.logo})` }")
            .team-logo-placeholder(v-else) {{ data.name[0] }}
            span.team-name {{ data.name }}

      // Dynamic task columns
      Column(
        v-for="task in tasks"
        :key="task.id"
        :header="task.letter"
        style="width: 120px; text-align: center"
      )
        template(#body="{ data }")
          .score-cell(:class="{ 'has-score': getTaskScore(data.id, task.id) > 0 }")
            span.score {{ getTaskScore(data.id, task.id) || '—' }}
      
      Column(header="ПРОГРЕС" style="width: 200px")
        template(#body="{ data }")
          .progress-cell
            ProgressBar.brutal-progress(:value="data.progress" :showValue="false")
            span.progress-text {{ data.progress }}%

      Column(header="УСЬОГО" style="width: 150px; text-align: right")
        template(#body="{ data }")
          span.total-points {{ data.totalScore }}
</template>

<script setup lang="ts">
import type { Task, TeamTaskStanding as Team } from '~/types/tournament-tasks.types'

const props = defineProps<{
  teams: Team[]
  tasks: Task[]
}>()

const getTaskScore = (teamId: string, taskId: string) => {
  const team = props.teams.find(t => t.id === teamId)
  return team?.taskScores[taskId] || 0
}
</script>

<style lang="scss" scoped>
.task-leaderboard {
  padding: 64px;

  .leaderboard-header {
    margin-bottom: 48px;
    .title {
      font-family: var(--font-display);
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .subtitle {
      opacity: 0.6;
      font-weight: 600;
      font-size: 14px;
    }
  }

  .table-container {
    background: white;
    border: 3px solid var(--color-text);
  }

  :deep(.brutal-table) {
    .p-datatable-thead > tr > th {
      background: #FAFAFA;
      border-bottom: 2px solid var(--color-text);
      color: var(--color-text);
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 2px;
      padding: 20px 32px;
    }

    .p-datatable-tbody > tr {
      background: white;
      transition: all 0.2s;
      
      &:hover {
        background: #F8FAFC;
      }

      > td {
        border-bottom: 1px solid #E2E8F0;
        padding: 24px 32px;
        color: var(--color-text);
      }
    }
  }

  .rank {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 900;
    color: var(--color-primary);
  }

  .team-cell {
    display: flex;
    align-items: center;
    gap: 16px;

    .team-logo, .team-logo-placeholder {
      width: 40px;
      height: 40px;
      border: 2px solid var(--color-text);
      background-size: cover;
      background-position: center;
    }

    .team-logo-placeholder {
      background: #0D0D0D;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 18px;
    }

    .team-name {
      font-weight: 700;
      font-size: 16px;
    }
  }

  .score-cell {
    text-align: center;
    .score {
      font-weight: 700;
      font-size: 14px;
      opacity: 0.4;
    }
    &.has-score .score {
      opacity: 1;
      color: var(--color-text);
    }
  }

  .progress-cell {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .progress-text {
      font-size: 11px;
      font-weight: 700;
      opacity: 0.6;
    }
  }

  .brutal-progress {
    height: 8px;
    border-radius: 0;
    background: #F1F5F9;
    border: 1px solid #E2E8F0;

    :deep(.p-progressbar-value) {
      background: #10B981;
      border-radius: 0;
    }
  }

  .total-points {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 900;
    color: var(--color-text);
  }
}
</style>
