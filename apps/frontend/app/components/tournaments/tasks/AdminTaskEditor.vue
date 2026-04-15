<template lang="pug">
.admin-task-editor
  header.admin-header
    .header-info
      h2.title УПРАВЛІННЯ ЗАВДАННЯМИ
      p.subtitle Додавайте раунди, описи задач та критериї оцінювання

    Button.add-btn(
      label="ДОДАТИ ЗАВДАННЯ"
      icon="pi pi-plus"
      @click="openCreateDialog"
    )

  .tasks-table-wrapper
    DataTable.brutal-table(:value="tasks" responsiveLayout="stack" breakpoint="960px")
      Column(field="order" header="#" :sortable="true")
      Column(field="name" header="НАЗВА ЗАВДАННЯ")
      Column(header="КРИТЕРІЇ")
        template(#body="{ data }")
          .criteria-badges
            span.badge(v-for="c in data.criteria" :key="c.id") {{ c.label }}
      Column(header="ДІЇ" :exportable="false" style="min-width:12rem")
        template(#body="{ data }")
          .action-btns
            Button.edit-btn(icon="pi pi-pencil" @click="$emit('edit', data)")
            Button.delete-btn(icon="pi pi-trash" @click="$emit('delete', data.id)")

  // Task Dialog
  Dialog.brutal-dialog(
    v-model:visible="isDialogVisible"
    :header="editingTask ? 'РЕДАГУВАННЯ ЗАВДАННЯ' : 'НОВЕ ЗАВДАННЯ'"
    :style="{ width: '50vw' }"
    :modal="true"
  )
    .task-form
      .form-group
        label.label НАЗВА
        InputText.brutal-input(v-model="form.name" placeholder="напр: Round 1: Setup")
      
      .form-group
        label.label ОПИС (MARKDOWN)
        Textarea.brutal-input(v-model="form.description" rows="5" placeholder="Детальний опис завдання...")

      .criteria-section
        .section-header
          h4.label КРИТЕРІЇ ОЦІНЮВАННЯ
          Button.add-criterion-btn(
            icon="pi pi-plus"
            label="ДОДАТИ ПУНКТ"
            @click="addCriterion"
          )
        
        .criteria-list
          .criterion-row(v-for="(c, idx) in form.criteria" :key="idx")
            InputText.brutal-input(v-model="c.label" placeholder="Критерій (напр. Чистота коду)")
            InputNumber.brutal-input(v-model="c.maxPoints" :min="1" placeholder="Max")
            Button.remove-btn(icon="pi pi-times" @click="form.criteria.splice(idx, 1)")

    template(#footer)
      .dialog-footer
        Button.cancel-btn(label="СКАСУВАТИ" @click="isDialogVisible = false")
        Button.save-btn(label="ЗБЕРЕГТИ" icon="pi pi-check" @click="handleSave")
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Task, TaskCriterion } from '~/types/tournament-tasks.types'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  (e: 'save', task: Partial<Task>): void
  (e: 'edit', task: Task): void
  (e: 'delete', id: string): void
}>()

const isDialogVisible = ref(false)
const editingTask = ref<Task | null>(null)

const form = reactive<Omit<Task, 'id' | 'tournamentId'>>({
  letter: 'A',
  name: '',
  description: '',
  order: 1,
  criteria: [] as TaskCriterion[]
})

const openCreateDialog = () => {
  editingTask.value = null
  Object.assign(form, { 
    letter: 'A', 
    name: '', 
    description: '', 
    order: props.tasks.length + 1, 
    criteria: [
      { id: '1', label: 'Логіка', maxPoints: 50 },
      { id: '2', label: 'Дизайн', maxPoints: 30 },
      { id: '3', label: 'Чистота коду', maxPoints: 20 }
    ] 
  })
  isDialogVisible.value = true
}

const addCriterion = () => {
  form.criteria.push({ 
    id: Math.random().toString(36).substring(2, 9), 
    label: '', 
    maxPoints: 10 
  })
}

const handleSave = () => {
  emit('save', { ...form, id: editingTask.value?.id })
  isDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.admin-task-editor {
  padding: 64px;

  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .add-btn {
    background: var(--color-primary) !important;
    border: 3px solid var(--color-text) !important;
    border-radius: 0 !important;
    color: var(--color-text) !important;
    font-family: var(--font-display);
    font-weight: 900;
    padding: 16px 32px !important;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      background: var(--color-text) !important;
      color: var(--color-primary) !important;
      transform: translate(-4px, -4px);
      box-shadow: 8px 8px 0 var(--color-primary);
    }
  }

  .tasks-table-wrapper {
    background: white;
    border: 3px solid var(--color-text);
  }

  .criteria-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .badge {
      background: #F1F5F9;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 800;
      border: 2px solid var(--color-text);
      text-transform: uppercase;
    }
  }

  .action-btns {
    display: flex;
    gap: 12px;

    button {
      background: white !important;
      border: 2px solid var(--color-text) !important;
      color: var(--color-text) !important;
      border-radius: 0 !important;
      transition: all 0.2s;

      &:hover {
        background: var(--color-text) !important;
        color: white !important;
        transform: translate(-2px, -2px);
        box-shadow: 4px 4px 0 var(--color-primary);
      }

      &.delete-btn:hover {
        background: var(--color-primary) !important;
        color: var(--color-text) !important;
        border-color: var(--color-text) !important;
      }
    }
  }
}

.brutal-dialog {
  :deep(.p-dialog-header) {
    background: var(--color-text);
    color: white;
    border-radius: 0;
    border-bottom: 4px solid var(--color-primary);
    
    .p-dialog-title {
      font-family: var(--font-display);
      font-weight: 900;
      font-size: 20px;
      letter-spacing: 1px;
    }

    .p-dialog-header-icons .p-dialog-header-icon {
      color: white;
      &:hover { background: rgba(255, 255, 255, 0.1); }
    }
  }

  :deep(.p-dialog-content) {
    padding: 40px;
    background: #FAFAFA;
  }

  .form-group {
    margin-bottom: 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .label {
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 2px;
      color: var(--color-text);
      opacity: 0.8;
    }
  }

  .brutal-input {
    border-radius: 0 !important;
    border: 3px solid var(--color-text) !important;
    padding: 16px !important;
    font-weight: 700;
    background: white !important;
    transition: all 0.2s;

    &:focus {
      border-color: var(--color-primary) !important;
      box-shadow: 6px 6px 0 var(--color-primary) !important;
      transform: translate(-3px, -3px);
    }
  }

  .criteria-section {
    margin-top: 40px;
    padding-top: 32px;
    border-top: 2px dashed #CBD5E1;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .label {
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 1px;
    }

    .add-criterion-btn {
      padding: 10px 20px !important;
      border-radius: 0 !important;
      background: var(--color-text) !important;
      border: 3px solid var(--color-text) !important;
      color: white !important;
      font-weight: 800;
      font-size: 12px !important;

      &:hover {
        background: var(--color-primary) !important;
        color: var(--color-text) !important;
      }
    }

    .criteria-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .criterion-row {
      display: flex;
      gap: 16px;
      align-items: center;

      .remove-btn {
        background: transparent !important;
        border: none !important;
        color: var(--color-primary) !important;
        font-size: 20px !important;
        
        &:hover { transform: scale(1.2); }
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 20px;
    padding-top: 40px;

    .cancel-btn {
      background: white !important;
      border: 3px solid var(--color-text) !important;
      color: var(--color-text) !important;
      border-radius: 0 !important;
      font-weight: 800;
      padding: 12px 24px !important;

      &:hover { background: #F1F5F9 !important; }
    }

    .save-btn {
      background: var(--color-primary) !important;
      border: 3px solid var(--color-text) !important;
      color: var(--color-text) !important;
      border-radius: 0 !important;
      font-weight: 900;
      padding: 12px 32px !important;

      &:hover {
        background: var(--color-text) !important;
        color: var(--color-primary) !important;
        transform: translate(-4px, -4px);
        box-shadow: 6px 6px 0 var(--color-primary);
      }
    }
  }
}
</style>
