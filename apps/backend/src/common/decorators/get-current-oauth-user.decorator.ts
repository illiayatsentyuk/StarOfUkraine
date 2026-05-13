import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { GoogleOAuthCallbackUserDto } from '../../auth/dto/google-oauth-callback-user.dto';

export const GetCurrentOAuthUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{
      user?: GoogleOAuthCallbackUserDto;
    }>();
    if (!data) return request.user;
    return request.user?.[data as keyof GoogleOAuthCallbackUserDto];
  },
);
