<template lang="pug">
.input-group(
  :class="{ 'input-group--invalid': Boolean(errorMessage) }"
)
  label(v-if="label" :class="{ 'mini-label': isMini }") {{ label }}
  .input-group__error(v-if="errorMessage") {{ errorMessage }}

  .pass-wrapper(v-if="isPasswordField")
    input(
      :value="modelValue"
      :name="name"
      :type="isPasswordVisible ? 'text' : 'password'"
      :placeholder="placeholder"
      :required="required"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
    )
    button.eye-btn(type="button" @click.prevent="isPasswordVisible = !isPasswordVisible")
      i(:class="isPasswordVisible ? 'pi pi-eye-slash' : 'pi pi-eye'")
  
  select(
    v-else-if="type === 'select'"
    :value="modelValue"
    :name="name"
    :required="required"
    @input="$emit('update:modelValue', $event.target.value)"
    @blur="$emit('blur', $event)"
  )
    slot
  
  input(
    v-else
    :value="modelValue"
    :name="name"
    :type="type"
    :placeholder="placeholder"
    :required="required"
    @input="$emit('update:modelValue', $event.target.value)"
    @blur="$emit('blur', $event)"
  )
</template>

<script setup lang="ts">
import type { AppInputProps } from '@/types'

defineProps<AppInputProps>()
defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  blur: [event: FocusEvent]
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

  &__error {
    color: var(--color-error);
    font-size: var(--font-size-sm);
    font-family: var(--font-sans);
    line-height: 1.35;
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

  &--invalid {
    input,
    select {
      border-color: var(--color-error);

      &:focus {
        outline: none;
        border-color: var(--color-error);
        box-shadow: 0 0 0 1px var(--color-error);
      }
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