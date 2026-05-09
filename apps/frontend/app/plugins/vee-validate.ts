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

  defineRule('min_date_future', (value: string, [days]: [number]) => {
    if (!value) return true
    const date = new Date(value)
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + Number(days))
    // Reset hours to compare only dates
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