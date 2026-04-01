import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types';

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): string => {
    // With JWT strategies, `request.user` is a `JwtPayload` (uses `sub`).
    // With OAuth (e.g. Google), `request.user` can be the actual User entity (uses `id`).
    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtPayload | { id?: string; sub?: string } }>();

    const user = request.user;
    return user?.sub ?? (user as { id?: string } | undefined)?.id ?? '';
  },
);
