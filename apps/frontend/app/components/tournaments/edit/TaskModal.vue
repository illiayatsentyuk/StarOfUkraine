<template lang="pug">
Dialog(
  v-model:visible="visible" 
  modal 
  header="Task Details" 
  :style="{ width: '600px' }"
  class="task-modal"
)
  template(#header)
    .modal-header
      span.title Task Details
      .actions
        Button.btn-cancel(label="Cancel" text @click="visible = false")
        Button.btn-save(label="Save Task" @click="$emit('save', model)")
  
  .modal-body
    .field-group
      label Task Name
      InputText(
        v-model="model.name" 
        placeholder="e.g., Complete technical setup"
        :class="{ 'p-invalid': errors.name }"
      )
      small.p-error(v-if="errors.name") Name is required
    
    .grid-row
      .field-group.flex-1
        label Task Type
        Select(
          v-model="model.type" 
          :options="taskTypes" 
          placeholder="Select type"
          class="w-full"
        )
      
      .field-group.width-fixed
        label Max Points
        InputNumber(v-model="model.points" placeholder="100")
    
    .field-group
      label Instructions
      Textarea(v-model="model.instructions" rows="5" placeholder="Provide relevant documentation and links...")

    .danger-zone(v-if="isExistingTask")
      Button.btn-delete(
        label="Delete Task" 
        icon="pi pi-trash" 
        text 
        severity="danger" 
        @click="$emit('delete')"
      )
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  initialData?: any
  isExistingTask?: boolean
}>()

const visible = defineModel<boolean>('visible')
const emit = defineEmits(['save', 'delete'])

const model = ref({
  name: '',
  type: 'Submission',
  points: 100,
  instructions: ''
})

const errors = ref({
  name: false
})

const taskTypes = ['Submission', 'Match result', 'Quiz', 'Admin Check']

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    model.value = { ...model.value, ...newVal }
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  
  .title {
    font-size: 18px;
    font-weight: 600;
    font-family: var(--font-display);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;

    .btn-cancel {
      color: var(--color-text);
      font-weight: 500;
    }

    .btn-save {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
      padding: 8px 16px;
      border-radius: var(--radius-md);
    }
  }
}

.modal-body {
  padding: 24px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 24px;

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-muted);
    }

    &.flex-1 { flex: 1; }
    &.width-fixed { width: 120px; }
  }

  .grid-row {
    display: flex;
    gap: 20px;
  }

  .danger-zone {
    margin-top: 8px;
    
    .btn-delete {
      padding: 0;
      font-weight: 600;
      font-size: 14px;
    }
  }

  :deep(.p-inputtext), :deep(.p-textarea), :deep(.p-inputnumber-input), :deep(.p-select) {
    border-color: var(--color-border);
    &:focus {
      border-color: var(--color-primary);
      box-shadow: none;
    }
  }
}

:deep(.p-error) {
  font-size: 12px;
  color: var(--color-primary);
}
</style>
