<template lang="pug">
Dialog(
  v-model:visible="visible"
  modal
  class="dota-match-modal"
  :style="{ width: '450px' }"
  :pt="{ mask: { style: 'backdrop-filter: blur(8px); background: rgba(0,0,0,0.4)' } }"
)
  .dota-modal-content
    p.info Вкажіть ID матчу з OpenDota для автоматичного розрахунку результатів та просування по сітці.
    
    .field-group
      label.field-label MATCH ID
      InputText#dotaMatchId(
        v-model="matchIdInput"
        placeholder="Наприклад: 7678123456"
        class="dota-input"
        :disabled="isMatching"
        @keyup.enter="$emit('confirm', matchIdInput)"
      )
    
    .preview-area
      transition(name="fade" mode="out-in")
        .dota-loading(v-if="bracketStore.loading")
          i.pi.pi-spin.pi-spinner
          span ЗАВАНТАЖЕННЯ ДАНИХ...
        
        .dota-preview(v-else-if="bracketStore.matchData")
          .preview-score
            .score-item.radiant(:class="{ 'is-winner': bracketStore.matchData.radiant_win }")
              span.team-name RADIANT
              span.score-val {{ bracketStore.matchData.radiant_score }}
            
            .score-vs :
            
            .score-item.dire(:class="{ 'is-winner': !bracketStore.matchData.radiant_win }")
              span.score-val {{ bracketStore.matchData.dire_score }}
              span.team-name DIRE
          
          .preview-meta
            span.meta-item ТРИВАЛІСТЬ: {{ Math.floor(bracketStore.matchData.duration / 60) }}:{{ (bracketStore.matchData.duration % 60).toString().padStart(2, '0') }}
            span.meta-item.winner ПЕРЕМОЖЕЦЬ: {{ bracketStore.matchData.radiant_win ? 'RADIANT' : 'DIRE' }}
        
        .dota-empty(v-else)
          span ВВЕДІТЬ ID МАТЧУ ДЛЯ ПЕРЕВІРКИ
    
    .footer-actions
      Button.cancel-btn(label="СКАСУВАТИ" @click="visible = false" :disabled="isMatching")
      Button.confirm-btn(
        label="ПІДТВЕРДИТИ РЕЗУЛЬТАТ" 
        @click="$emit('confirm', matchIdInput)" 
        :loading="isMatching"
        :disabled="!matchIdInput || !bracketStore.matchData"
      )
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTournamentBracket } from '../../../stores/tournamentBrackets.store'

const props = defineProps<{
  isMatching: boolean
}>()

const visible = defineModel<boolean>()
const emit = defineEmits(['confirm'])

const bracketStore = useTournamentBracket()
const matchIdInput = ref('')

watch(matchIdInput, async (newId) => {
  if (newId.length > 8) {
    await bracketStore.fetchMatchData(newId)
  } else {
    bracketStore.reset()
  }
})

// Reset input when closed
watch(visible, (newVal) => {
  if (!newVal) {
    matchIdInput.value = ''
    bracketStore.reset()
  }
})
</script>

<style lang="scss" scoped>
.dota-modal-content {
  padding: 10px;

  .info {
    font-size: 14px;
    color: var(--color-text-muted);
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;

    .field-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: var(--color-text-muted);
    }

    :deep(.dota-input) {
      background: rgba(var(--color-text-rgb), 0.03);
      border: 1px solid var(--color-border);
      border-radius: 0;
      padding: 12px;
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 600;
      
      &:focus {
        border-color: var(--color-primary);
        box-shadow: none;
      }
    }
  }

  .preview-area {
    background: #0a0a0a;
    border: 1px solid #1a1a1a;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;

    .dota-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--color-primary);
      
      i { font-size: 24px; }
      span { font-size: 10px; font-weight: 700; letter-spacing: 1px; }
    }

    .dota-empty {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #333;
    }

    .dota-preview {
      width: 100%;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .preview-score {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;

        .score-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;

          &.radiant .team-name { color: #52b141; }
          &.dire .team-name { color: #b14141; }

          .team-name { 
            font-size: 9px; 
            font-weight: 800; 
            letter-spacing: 1px;
            opacity: 0.5;
          }

          .score-val {
            font-family: var(--font-display);
            font-size: 32px;
            font-weight: 800;
            color: white;
          }

          &.is-winner .score-val {
            color: var(--color-primary);
            text-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.5);
          }
        }

        .score-vs {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 800;
          color: #333;
        }
      }

      .preview-meta {
        display: flex;
        justify-content: center;
        gap: 20px;
        border-top: 1px solid #1a1a1a;
        padding-top: 12px;

        .meta-item {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #666;

          &.winner { color: #999; }
        }
      }
    }
  }

  .footer-actions {
    display: flex;
    gap: 12px;

    :deep(button) {
      flex: 1;
      height: 48px;
      border-radius: 0;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 1.5px;
      
      &.cancel-btn {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text-muted);
        
        &:hover {
          background: rgba(var(--color-text-rgb), 0.05);
          color: var(--color-text);
        }
      }

      &.confirm-btn {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        color: white;
        
        &:hover:not(:disabled) {
          background: #d41f11;
          transform: translateY(-2px);
        }
      }
    }
  }
}
</style>
