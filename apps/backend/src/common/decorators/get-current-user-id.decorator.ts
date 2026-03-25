import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtPayload } from '../types'

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>()
    return request.user?.sub ?? ''
  },
)
