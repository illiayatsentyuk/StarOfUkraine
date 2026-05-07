<template lang="pug">
.leaderboard(v-if="!loading")
  h3.section-label ТАБЛИЦЯ ЛІДЕРІВ

  p.description(v-if="!rows || rows.length === 0") Нікого немає. Після реєстрації команд тут зʼявиться таблиця лідерів.

  .leaderboard__card(v-else)
    .leaderboard__table-wrap
      table.leaderboard__table
        thead
          tr
            th.leaderboard__th #
            th.leaderboard__th Команда
            th.leaderboard__th Очки
            th.leaderboard__th(
              v-for="(task, idx) in taskColumns"
              :key="task.taskId || idx"
            ) Раунд {{ idx + 1 }}
        tbody
          tr.leaderboard__row(v-for="(row, index) in rows" :key="row?.team?.id || index")
            td.leaderboard__num {{ index + 1 }}
            td.leaderboard__team {{ row?.team?.name || 'Без назви' }}
            td.leaderboard__pts {{ formatPoints(row?.totalScore) }}
            td.leaderboard__task(
              v-for="(task, idx) in taskColumns"
              :key="task.taskId || idx"
            )
              span {{ formatPoints(getTaskScore(row, task.taskId)) }}

.leaderboard(v-else)
  h3.section-label ТАБЛИЦЯ ЛІДЕРІВ
  p.description Завантаження...
</template>

<script setup lang="ts">
import { computed } from 'vue'

type LeaderboardTaskScore = { taskId: string; avgScore: number }
type LeaderboardRow = {
  team: { id: string; name: string }
  totalScore: number
  tasks: LeaderboardTaskScore[]
}

const props = defineProps<{
  rows: LeaderboardRow[]
  loading: boolean
}>()

const taskColumns = computed(() => {
  const first = props.rows?.[0]
  const list = Array.isArray(first?.tasks) ? first.tasks : []
  return list
})

function getTaskScore(row: LeaderboardRow, taskId: string) {
  const task = row.tasks?.find(t => t.taskId === taskId)
  return task?.avgScore ?? 0
}

function formatPoints(val: unknown) {
  const n = typeof val === 'number' ? val : Number(val)
  if (!Number.isFinite(n)) return '—'
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}
</script>

<style scoped lang="scss">
.leaderboard {
  margin-top: var(--space-10);

  .section-label {
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-muted);
    letter-spacing: 2px;
    margin: 0;
  }

  .description {
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
    margin: 24px 0 0 0;
    max-width: 900px;
    font-weight: 400;
  }

  &__card {
    margin-top: var(--space-6);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: var(--space-6);
  }

  &__table-wrap {
    overflow-x: auto;
    border: 1px solid var(--color-border);
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  &__th {
    padding: var(--space-4);
    text-align: left;
    border-bottom: 2px solid var(--color-border);
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    color: var(--color-text-muted);
    background: var(--color-bg);
    white-space: nowrap;
  }

  &__row {
    transition: background 0.15s;

    &:nth-child(even) {
      background: rgba(0, 0, 0, 0.02);
    }

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    td {
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border);
      vertical-align: middle;
      white-space: nowrap;
    }
  }

  &__num {
    font-family: var(--font-display);
    font-weight: 700;
    color: var(--color-text-muted);
    width: 3rem;
  }

  &__team {
    font-weight: 600;
    color: var(--color-text);
    min-width: 14rem;
  }

  &__pts {
    font-variant-numeric: tabular-nums;
    color: var(--color-text-muted);
    width: 5rem;
  }

  &__task {
    font-variant-numeric: tabular-nums;
    color: var(--color-text-muted);
    width: 5rem;
    text-align: left;
  }
}
</style>

