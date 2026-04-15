<template lang="pug">
Dialog(
  v-model:visible="visible" 
  modal 
  :closable="false"
  :style="{ width: '320px' }"
  class="confirm-modal"
)
  .modal-content
    h3.title {{ title }}
    p.message {{ message }}
    
    .actions
      Button.btn-cancel(
        :label="cancelLabel" 
        severity="secondary" 
        text 
        @click="visible = false"
      )
      Button.btn-confirm(
        :label="confirmLabel" 
        severity="danger" 
        @click="$emit('confirm')"
      )
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}>(), {
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel'
})

const visible = defineModel<boolean>('visible')
defineEmits(['confirm'])
</script>

<style lang="scss" scoped>
.confirm-modal {
  :deep(.p-dialog-header) {
    display: none;
  }

  .modal-content {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text);
      margin: 0;
    }

    .message {
      font-size: 14px;
      color: var(--color-text-muted);
      line-height: 1.5;
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 12px;
      width: 100%;
      margin-top: 8px;

      :deep(.p-button) {
        flex: 1;
        font-weight: 600;
        font-size: 14px;
        padding: 10px 0;
        border-radius: var(--radius-md);
      }

      .btn-cancel {
        color: var(--color-text);
      }

      .btn-confirm {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
      }
    }
  }
}
</style>
