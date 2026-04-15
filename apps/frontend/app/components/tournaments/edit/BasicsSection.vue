<template lang="pug">
.basics-section
  h2.section-title Tournament Information
  
  .fields-grid
    .field-group
      label Tournament Title
      InputText(v-model="model.name" placeholder="Enter tournament name")
    
    .field-group
      label Description
      Textarea(v-model="model.description" rows="4" autoResize placeholder="Describe the tournament...")
      
    .field-group.date-group
      .date-field
        label Start Date
        DatePicker(v-model="model.startDate" showIcon fluid iconDisplay="input")
      .date-field
        label Registration End
        DatePicker(v-model="model.registrationEnd" showIcon fluid iconDisplay="input")
</template>

<script setup lang="ts">
const model = defineModel<{
  name: string
  description: string
  startDate: Date | null
  registrationEnd: Date | null
}>({ required: true })
</script>

<style lang="scss" scoped>
.basics-section {
  display: flex;
  flex-direction: column;
  gap: 24px;

  .section-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: var(--font-weight-semibold);
    color: var(--color-text);
    margin: 0;
  }

  .fields-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-size: 14px;
        font-weight: var(--font-weight-medium);
        color: var(--color-text-muted);
      }

      :deep(.p-inputtext), :deep(.p-textarea) {
        width: 100%;
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: 10px 16px;
        font-size: 15px;
        color: var(--color-text);
        transition: border-color 0.2s;

        &:focus {
          border-color: var(--color-primary);
          box-shadow: none;
        }
      }
    }

    .date-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
      
      .date-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
}
</style>
