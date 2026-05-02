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
      const messages: Record<string, string> = {
        required: 'Це поле обов\'язкове',
        email: 'Введіть правильну електронну адресу',
        min: `Мінімальна довжина ${(ctx.rule?.params as any[])?.[0] || ''} символів`,
        confirmed: 'Паролі не збігаються',
        numeric: 'Введіть число',
        min_value: `Мінімальне значення ${(ctx.rule?.params as any[])?.[0] || ''}`,
        max_value: `Максимальне значення ${(ctx.rule?.params as any[])?.[0] || ''}`,
        min_date_future: `Дата повинна бути не раніше ніж через ${(ctx.rule?.params as any[])?.[0] || '3'} дні(в) від сьогодні`,
      }
      return messages[ctx.rule?.name || ''] || `${ctx.field} is invalid`
    },
    validateOnInput: true,
  })
})