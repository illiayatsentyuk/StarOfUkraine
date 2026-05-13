import { configure, defineRule } from 'vee-validate'
import { required, email, min, confirmed, numeric, min_value, max_value } from '@vee-validate/rules'

export default defineNuxtPlugin(() => {
  defineRule('required', required)
  defineRule('email', email)
  defineRule('min', min)
  defineRule('confirmed', confirmed)
  defineRule('numeric', numeric)
  defineRule('min_value', min_value)
  defineRule('max_value', max_value)

  defineRule('min_date_future', (value: unknown, [days]: [number]) => {
    if (value == null || value === '') return true
    let date: Date
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return 'Некоректна дата'
      date = new Date(value.getFullYear(), value.getMonth(), value.getDate())
    } else {
      const s = String(value)
      const head = s.slice(0, 10)
      const m = head.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      if (m) {
        date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
      } else {
        const parsed = new Date(s)
        if (Number.isNaN(parsed.getTime())) return 'Некоректна дата'
        date = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
      }
    }
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + Number(days))
    minDate.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)

    return date.getTime() >= minDate.getTime()
  })

  configure({
    validateOnBlur: true,
    generateMessage: (ctx) => {
      const params = ctx.rule?.params as unknown
      const param0 =
        Array.isArray(params) ? params[0] : undefined
      const minLimit =
        param0 ??
        (params && typeof params === 'object' && params !== null && 'min' in params
          ? (params as { min?: unknown }).min
          : undefined)
      const maxLimit =
        param0 ??
        (params && typeof params === 'object' && params !== null && 'max' in params
          ? (params as { max?: unknown }).max
          : undefined)

      const messages: Record<string, string> = {
        required: 'Це поле обов\'язкове',
        email: 'Введіть правильну електронну адресу',
        min: `Мінімальна довжина ${param0 ?? ''} символів`,
        confirmed: 'Паролі не збігаються',
        numeric: 'Введіть число',
        min_value: `Мінімальне значення ${minLimit ?? ''}`,
        max_value: `Максимальне значення ${maxLimit ?? ''}`,
        min_date_future: `Дата повинна бути не раніше ніж через ${param0 ?? '3'} дні(в) від сьогодні`,
      }
      return messages[ctx.rule?.name || ''] || `${ctx.field} is invalid`
    },
    validateOnInput: true,
  })
})