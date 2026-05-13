<template>
  <input
    type="date"
    class="form-date-input"
    lang="uk"
    :class="{ 'is-invalid': invalid }"
    :value="inputValue"
    @change="onChange"
  />
</template>

<script lang="ts" setup>
const props = defineProps<{
  modelValue: Date | string | null | undefined
  invalid?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void
}>()

const inputValue = computed(() => toYmd(props.modelValue))

function toYmd(v: typeof props.modelValue): string {
  if (v == null || v === '') return ''
  const d = v instanceof Date ? v : new Date(v as string)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fromYmd(iso: string): Date | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function onChange(e: Event) {
  const el = e.target as HTMLInputElement
  emit('update:modelValue', fromYmd(el.value))
}
</script>

<style scoped lang="scss">
.form-date-input {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border: 1px solid #e0e0e0;
  background: #ffffff;
  border-radius: 0;
  font-family: var(--font-sans);
  font-size: 14px;
  color: #000000;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(228, 35, 19, 0.12);
  }

  &.is-invalid {
    border-color: var(--color-primary);
    background: rgba(228, 35, 19, 0.05);
  }
}
</style>
