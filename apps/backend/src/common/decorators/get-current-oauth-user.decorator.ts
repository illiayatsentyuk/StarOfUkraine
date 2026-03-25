import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { OAuthUserPayload } from '../types'

export const GetCurrentOAuthUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{
      user?: OAuthUserPayload
    }>()
    if (!data) return request.user
    return request.user?.[data as keyof OAuthUserPayload]
  },
)
