<template lang="pug">
header.tournament-hero
  .status-badge(v-if="status" :style="{ backgroundColor: status.color }") {{ status.label }}
  h1.title {{ tournament.name }}
  .tournament-hero__actions
    Button.home-btn( @click="$emit('update:isOpenBracket', false)" type="button" label="Опис турніру")
    Button.bracket-btn( @click="$emit('update:isOpenBracket', !isOpenBracket)" type="button" :label="isOpenBracket ? 'Сховати сітку' : 'Відкрити сітку'")
    Button.edit-btn(v-if="isAdmin" @click="navigateTo($route.path + '/edit')" type="button" label="РЕДАГУВАТИ" icon="pi pi-pencil")
</template>

<script setup lang="ts">
import { navigateTo } from '#app'

defineProps<{
  tournament: any
  status: any
  isOpenBracket: boolean
  isAdmin: boolean
}>()

defineEmits(['update:isOpenBracket'])
</script>

<style lang="scss" scoped>
.tournament-hero {
  margin-bottom: 64px;
  border-bottom: 2px solid var(--color-text);
  padding-bottom: 48px;

  .status-badge {
    display: inline-block;
    background: var(--color-primary);
    color: white;
    padding: 6px 14px;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 1.5px;
    margin-bottom: 24px;
  }

  .title {
    font-family: var(--font-display);
    font-size: 84px;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -2px;
    margin: 0;
    color: var(--color-text);

    @media (max-width: 768px) {
      font-size: 48px;
    }
  }

  &__actions {
    display: flex;
    gap: 16px;
    margin-top: 40px;

    button {
      min-width: 200px;
      height: 52px;
      border-radius: 0;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 2px;
      text-transform: uppercase;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid var(--color-text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      &.home-btn {
        background: transparent;
        color: var(--color-text);
        opacity: 1;

        &:hover {
          background: var(--color-text);
          color: white;
        }
      }

      &.bracket-btn {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;

        &:hover {
          background: var(--color-text);
          border-color: var(--color-text);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        &:active {
          transform: translateY(0);
        }
      }

      &.edit-btn {
        background: var(--color-surface);
        color: var(--color-text);
        
        &:hover {
          background: var(--color-text);
          color: white;
        }
      }
    }
  }
}
</style>
