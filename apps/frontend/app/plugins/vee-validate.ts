import { configure, defineRule } from 'vee-validate'
import { required, email, min, confirmed } from '@vee-validate/rules'

export default defineNuxtPlugin(() => {
  defineRule('required', required)
  defineRule('email', email)
  defineRule('min', min)
  defineRule('confirmed', confirmed)

  configure({
    generateMessage: (ctx) => {
      const messages: Record<string, string> = {
        required: 'Це поле обов\'язкове',
        email: 'Введіть правильну електронну адресу',
        min: `Мінімальна довжина ${(ctx.rule?.params as any[])?.[0] || ''} символів`,
        confirmed: 'Паролі не збігаються',
      }
      return messages[ctx.rule?.name || ''] || `${ctx.field} is invalid`
    },
    validateOnInput: true,
  })
})