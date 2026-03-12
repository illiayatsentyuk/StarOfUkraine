import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  // Override to align with AuthGuard's generic signature and avoid type errors
  handleRequest<TUser = any>(
    err: any,
    user: TUser,
    info: any,
    _context: ExecutionContext,
    _status?: any,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

