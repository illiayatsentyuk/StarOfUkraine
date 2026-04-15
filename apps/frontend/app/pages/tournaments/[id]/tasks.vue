<template lang="pug">
.tournament-tasks-page
  // Role Switcher (For Prototype Testing)
  nav.role-switcher
    .role-label ТЕСТОВИЙ РЕЖИМ (ПОТОЧНА РОЛЬ):
    .role-btns
      button(
        v-for="role in roles"
        :key="role"
        :class="{ active: currentRole === role }"
        @click="currentRole = role"
      ) {{ role.toUpperCase() }}
    .tournament-info
      span {{ tournament?.name }}

  // Main Layout
  .contest-layout(v-if="currentRole === 'team'")
    TaskNavigation(
      :tasks="computedTasks"
      :activeTaskId="activeTaskId"
      @select="activeTaskId = $event"
    )
    main.contest-view(v-if="activeTask")
      TaskContent(
        :letter="activeTask.letter"
        :task="activeTask"
      )
      TaskSubmission(
        v-if="!activeTask.isLocked"
        :loading="isSubmitting"
        :lastSubmittedAt="lastSubmission?.createdAt"
        @submit="handleSubmission"
      )
      .locked-overlay(v-else)
        i.pi.pi-lock
        h2 ЗАВДАННЯ ЗАБЛОКОВАНО
        p Виконайте та отримайте оцінку за попереднє завдання, щоб відкрити це.

  .admin-layout(v-else-if="currentRole === 'admin'")
    AdminTaskEditor(
      :tasks="tasksList"
      @save="handleSaveTask"
      @delete="handleDeleteTask"
    )

  .jury-layout(v-else-if="currentRole === 'jury'")
    .jury-queue(v-if="!evaluatingSubmission")
      header.queue-header
        h2 ЧЕРГА НА ПЕРЕВІРКУ
        p Виберіть роботу для оцінювання
      .submissions-list
        .submission-item(v-for="sub in pendingSubmissions" :key="sub.id" @click="evaluatingSubmission = sub")
          .sub-info
            span.team {{ getTeamName(sub.teamId) }}
            span.task {{ getTaskName(sub.taskId) }}
          .sub-meta
            span.date {{ sub.createdAt }}
            i.pi.pi-chevron-right
    
    JuryEvaluator(
      v-else
      :submission="{ ...evaluatingSubmission, teamName: getTeamName(evaluatingSubmission.teamId) }"
      :task="getTaskById(evaluatingSubmission.taskId)"
      @submit="handleEvaluation"
    )
    Button.back-btn(v-if="evaluatingSubmission" icon="pi pi-arrow-left" label="НАЗАД ДО ЧЕРГИ" @click="evaluatingSubmission = null")

  .leaderboard-view(v-else-if="currentRole === 'leaderboard'")
    TaskLeaderboard(
      :teams="leaderboardData"
      :tasks="tasksList"
    )
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTournamentTasksStore } from '~/stores/tournamentTasks.store'
import { useTournamentsStore } from '~/stores/tournaments.store'

const route = useRoute()
const tournamentId = route.params.id as string
const taskStore = useTournamentTasksStore()
const tournamentStore = useTournamentsStore()

const roles = ['team', 'admin', 'jury', 'leaderboard']
const currentRole = ref('team')
const activeTaskId = ref('')
const evaluatingSubmission = ref(null)
const isSubmitting = ref(false)
const tournament = ref<any>(null)

// Current Team ID (Mocked for now since we are in localStorage mode)
const myTeamId = 'team-1' 

onMounted(async () => {
  try {
    tournament.value = await tournamentStore.fetchTournamentById(tournamentId)
    
    // Set first task as active by default
    const tournamentTasks = taskStore.getTournamentTasks(tournamentId).value
    if (tournamentTasks.length > 0) {
      activeTaskId.value = tournamentTasks[0].id
    }
  } catch (err) {
    console.error('Failed to load tournament:', err)
  }
})

const tasksList = computed(() => taskStore.getTournamentTasks(tournamentId).value)

const computedTasks = computed(() => {
  const list = tasksList.value
  return list.map((task, index) => {
    // Logic for sequential unlocking
    let isLocked = false
    if (index > 0) {
      const prevTask = list[index - 1]
      const prevSub = taskStore.submissions.find(s => s.taskId === prevTask.id && s.teamId === myTeamId)
      if (!prevSub || prevSub.status !== 'EVALUATED') {
        isLocked = true
      }
    }

    const mySub = taskStore.submissions.find(s => s.taskId === task.id && s.teamId === myTeamId)
    const isCompleted = mySub?.status === 'EVALUATED'

    return { ...task, isLocked, isCompleted }
  })
})

const activeTask = computed(() => computedTasks.value.find(t => t.id === activeTaskId.value))
const lastSubmission = computed(() => taskStore.submissions.find(s => s.taskId === activeTaskId.value && s.teamId === myTeamId))

const pendingSubmissions = computed(() => taskStore.submissions.filter(s => s.status === 'PENDING'))
const leaderboardData = computed(() => {
  const teams = tournament.value?.teams || [{ id: 'team-1', name: 'CyberKnights' }, { id: 'team-2', name: 'DevMinds' }]
  return taskStore.getLeaderboard(tournamentId, teams).value
})

// -- Handlers --

const handleSubmission = (data: any) => {
  isSubmitting.value = true
  setTimeout(() => {
    taskStore.submitWork(activeTaskId.value, myTeamId, data)
    isSubmitting.value = false
  }, 800)
}

const handleSaveTask = (data: any) => {
  taskStore.addTask(tournamentId, data)
}

const handleDeleteTask = (id: string) => {
  taskStore.deleteTask(id)
}

const handleEvaluation = (data: any) => {
  if (evaluatingSubmission.value) {
    taskStore.evaluateSubmission(evaluatingSubmission.value.id, 'jury-1', data)
    evaluatingSubmission.value = null
  }
}

// -- Helpers --
const getTeamName = (id: string) => tournament.value?.teams?.find(t => t.id === id)?.name || id
const getTaskName = (id: string) => tasksList.value.find(t => t.id === id)?.name || id
const getTaskById = (id: string) => tasksList.value.find(t => t.id === id)
</script>

<style lang="scss" scoped>
.tournament-tasks-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;

  .role-switcher {
    background: #0D0D0D;
    padding: 12px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
    z-index: 100;
    border-bottom: 3px solid var(--color-primary);

    .role-btns {
      display: flex;
      gap: 8px;

      button {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 6px 16px;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
        text-transform: uppercase;

        &.active, &:hover {
          background: var(--color-primary);
          color: black;
          border-color: var(--color-primary);
        }
      }
    }

    .role-label {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 2px;
      color: var(--color-primary);
    }

    .tournament-info {
      font-weight: 800;
      font-size: 12px;
      opacity: 0.6;
    }
  }

  .contest-layout {
    display: flex;
    flex: 1;
    height: calc(100vh - 54px);
  }

  .contest-view {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .locked-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
    z-index: 10;

    i { font-size: 64px; color: var(--color-text); margin-bottom: 24px; }
    h2 { font-family: var(--font-display); font-size: 32px; font-weight: 900; margin-bottom: 16px; }
    p { max-width: 400px; font-weight: 600; opacity: 0.6; }
  }

  .jury-queue {
    padding: 64px;
    max-width: 800px;
    margin: 0 auto;

    .queue-header {
      margin-bottom: 48px;
      h2 { font-family: var(--font-display); font-size: 32px; font-weight: 900; }
      p { opacity: 0.6; font-weight: 600; }
    }

    .submission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32px;
      background: white;
      border: 3px solid var(--color-text);
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      .team { display: block; font-family: var(--font-display); font-size: 20px; font-weight: 900; }
      .task { font-size: 13px; font-weight: 700; color: var(--color-primary); text-transform: uppercase; }
      .date { font-size: 11px; opacity: 0.5; font-weight: 600; margin-right: 24px; }

      &:hover {
        transform: translate(-4px, -4px);
        box-shadow: 8px 8px 0 var(--color-primary);
        background: var(--color-text);
        color: white;
      }
    }
  }

  .back-btn {
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: var(--color-text) !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 16px 32px !important;
    font-weight: 800 !important;
  }
}
</style>
