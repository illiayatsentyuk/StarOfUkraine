<template lang="pug">
.tournament-editor
  EditHeader(
    :tournamentName="tournament.name"
    :hasUnsavedChanges="hasUnsavedChanges"
    :lastSavedText="'Saved: 2m ago'"
    @save="saveTournament"
  )
  
  .editor-layout
    main.editor-content
      section.editor-section
        BasicsSection(v-model="tournament")
      
      section.editor-section
        .section-header
          h2.section-title Tournament Rounds
          span.section-count {{ tournament.rounds.length }}
        
        .rounds-list
          RoundCard(
            v-for="round in tournament.rounds"
            :key="round.id"
            :round="round"
            @add-task="openTaskModal(round.id)"
            @edit-task="(task) => openTaskModal(round.id, task)"
            @delete-task="confirmDeleteTask"
          )
          
          Button.btn-add-round(
            label="Add New Round" 
            icon="pi pi-plus" 
            @click="addRound"
          )

    aside.editor-sidebar
      EditSummary(
        :stats="summaryStats"
        @discard="discardChanges"
      )

  TaskModal(
    v-model:visible="isTaskModalVisible"
    :initialData="currentTask"
    :isExistingTask="!!currentTask.id"
    @save="handleTaskSave"
    @delete="confirmDeleteTask"
  )

  ConfirmModal(
    v-model:visible="isConfirmVisible"
    title="Delete this task?"
    message="This action cannot be undone. All task data will be permanently removed."
    @confirm="deleteTask"
  )
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import EditHeader from '@/components/tournaments/edit/EditHeader.vue'
import BasicsSection from '@/components/tournaments/edit/BasicsSection.vue'
import RoundCard from '@/components/tournaments/edit/RoundCard.vue'
import EditSummary from '@/components/tournaments/edit/EditSummary.vue'
import TaskModal from '@/components/tournaments/edit/TaskModal.vue'
import ConfirmModal from '@/components/tournaments/edit/ConfirmModal.vue'

// Basic Reactive State - User will hook this up to stores/API
const tournament = ref({
  name: 'Star of Ukraine 2026',
  description: 'Annual championship for professional players across all regions.',
  startDate: null,
  registrationEnd: null,
  rounds: [
    {
      id: 'r1',
      name: 'Round 1: Foundation',
      tasks: [
        { id: 't1', name: 'Complete technical setup', duration: '60', type: 'Submission' },
        { id: 't2', name: 'Team profile verification', duration: '30', type: 'Admin Check' }
      ]
    }
  ]
})

const hasUnsavedChanges = ref(true)
const isTaskModalVisible = ref(false)
const isConfirmVisible = ref(false)
const currentTask = ref<any>({})
const activeRoundId = ref<string | null>(null)
const taskToDeleteId = ref<string | null>(null)

const summaryStats = computed(() => {
  const totalRounds = tournament.value.rounds.length
  const totalTasks = tournament.value.rounds.reduce((acc, r) => acc + (r.tasks?.length || 0), 0)
  return { totalRounds, totalTasks }
})

// UI Actions - Logic to be filled by the user
function saveTournament() {
  console.log('Saving tournament...', tournament.value)
  hasUnsavedChanges.value = false
}

function addRound() {
  const nextId = `r${tournament.value.rounds.length + 1}`
  tournament.value.rounds.push({
    id: nextId,
    name: `New Round ${tournament.value.rounds.length + 1}`,
    tasks: []
  })
}

function openTaskModal(roundId: string, task?: any) {
  activeRoundId.value = roundId
  currentTask.value = task ? { ...task } : { name: '', type: 'Submission', points: 100 }
  isTaskModalVisible.value = true
}

function handleTaskSave(taskData: any) {
  console.log('Task saved:', taskData)
  isTaskModalVisible.value = false
  // Logic to update round.tasks goes here
}

function confirmDeleteTask(taskId: string) {
  taskToDeleteId.value = taskId
  isConfirmVisible.value = true
}

function deleteTask() {
  console.log('Deleting task:', taskToDeleteId.value)
  isConfirmVisible.value = false
  isTaskModalVisible.value = false
  // Logic to remove task from tournament.value goes here
}

function discardChanges() {
  if (confirm('Are you sure you want to discard all unsaved changes?')) {
    // Logic to revert state
  }
}
</script>

<style lang="scss" scoped>
.tournament-editor {
  min-height: 100vh;
  background: #FAFAFA;
  display: flex;
  flex-direction: column;

  .editor-layout {
    display: grid;
    grid-template-columns: minmax(0, 640px) 280px;
    justify-content: center;
    gap: 48px;
    padding: 64px 40px;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      padding: 32px 20px;
    }
  }

  .editor-content {
    display: flex;
    flex-direction: column;
    gap: 64px;
  }

  .editor-section {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;

      .section-title {
        font-family: var(--font-display);
        font-size: 18px;
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin: 0;
      }

      .section-count {
        font-size: 12px;
        font-weight: 700;
        background: var(--color-border);
        color: var(--color-text-muted);
        padding: 2px 8px;
        border-radius: 12px;
      }
    }

    .rounds-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .btn-add-round {
        margin-top: 8px;
        background: transparent;
        border: 1px solid var(--color-primary);
        color: var(--color-primary);
        font-weight: 600;
        padding: 12px;
        border-radius: var(--radius-md);

        &:hover {
          background: rgba(228, 35, 19, 0.05);
        }
      }
    }
  }

  .editor-sidebar {
    position: sticky;
    top: 120px;
    height: fit-content;
  }
}
</style>
