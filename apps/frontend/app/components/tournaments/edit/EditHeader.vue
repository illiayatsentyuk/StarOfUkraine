<template lang="pug">
header.edit-header
  .edit-header__left
    .title-group
      h1.title {{ tournamentName }}
      .unsaved-indicator(v-if="hasUnsavedChanges")
      span.last-saved {{ lastSavedText }}
    .status-group
      .badge DRAFT
  
  .edit-header__actions
    Button.btn-secondary(
      label="Publish" 
      icon="pi pi-chevron-down" 
      iconPos="right"
    )
    Button.btn-primary(
      label="Save Changes" 
      @click="$emit('save')"
    )
</template>

<script setup lang="ts">
defineProps<{
  tournamentName: string
  hasUnsavedChanges: boolean
  lastSavedText: string
}>()

defineEmits(['save'])
</script>

<style lang="scss" scoped>
.edit-header {
  height: 72px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: sticky;
  top: 0;
  z-index: 100;

  &__left {
    display: flex;
    align-items: center;
    gap: 24px;

    .title-group {
      display: flex;
      align-items: center;
      gap: 12px;

      .title {
        font-family: var(--font-display);
        font-size: 20px;
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin: 0;
      }

      .unsaved-indicator {
        width: 8px;
        height: 8px;
        background: var(--color-primary);
        border-radius: 50%;
      }

      .last-saved {
        font-size: 13px;
        color: var(--color-text-muted);
      }
    }

    .badge {
      background: #F3F4F6;
      color: #6B7280;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      font-size: 12px;
      font-weight: var(--font-weight-semibold);
      letter-spacing: 0.5px;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 16px;

    :deep(.p-button) {
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: var(--font-weight-semibold);
      padding: 10px 20px;
      font-family: var(--font-sans);
      
      &.btn-primary {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
      }

      &.btn-secondary {
        background: white;
        border: 1px solid var(--color-border);
        color: var(--color-text);

        &:hover {
          background: var(--color-surface);
        }
      }
    }
  }
}
</style>
