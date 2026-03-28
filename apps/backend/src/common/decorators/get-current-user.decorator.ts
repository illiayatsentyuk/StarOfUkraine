import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!data) return request.user;
    return request.user?.[data as keyof JwtPayload];
  },
);
