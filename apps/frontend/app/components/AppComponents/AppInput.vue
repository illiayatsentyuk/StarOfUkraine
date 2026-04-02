<template lang="pug">
.input-group
  label(v-if="label" :class="{ 'mini-label': isMini }") {{ label }}
  
  .pass-wrapper(v-if="isPasswordField")
    input(
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :type="isPasswordVisible ? 'text' : 'password'"
      :placeholder="placeholder"
      :required="required"
    )
    button.eye-btn(type="button" @click.prevent="isPasswordVisible = !isPasswordVisible")
      i(:class="isPasswordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'")
  
  select(
    v-else-if="type === 'select'"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :required="required"
  )
    slot
  
  input(
    v-else
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :type="type"
    :placeholder="placeholder"
    :required="required"
  )
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number | boolean
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  isMini?: boolean
  isPasswordField?: boolean
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string | number | boolean]
}>()

const isPasswordVisible = ref(false)
</script>

<style scoped lang="scss">
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  label {
    font-weight: var(--font-weight-medium);
    color: var(--color-text);

    &.mini-label {
      font-size: var(--font-size-sm);
    }
  }

  input,
  select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background-color: var(--color-bg);
    color: var(--color-text);
    font-size: var(--font-size-base);
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    &::placeholder {
      color: var(--color-text-muted);
    }
  }
}

.pass-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  input {
    flex: 1;
  }
}

.eye-btn {
  position: absolute;
  right: var(--space-3);
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-text);
  }

  i {
    font-size: 18px;
  }
}
</style>