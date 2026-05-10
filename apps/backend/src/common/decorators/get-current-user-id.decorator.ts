import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types';

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): string => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtPayload | { id?: string; sub?: string } }>();

    const user = request.user;
    return user?.sub ?? (user as { id?: string } | undefined)?.id ?? '';
  },
);
