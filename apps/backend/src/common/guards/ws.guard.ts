import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import { AuthenticatedSocket } from '../../middleware';

export const Roles = (...roles: string[]) => Reflect.metadata('roles', roles);

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectPinoLogger(WsAuthGuard.name)
    private readonly logger: PinoLogger,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const user = client.data?.user;

    if (!user) {
      this.logger.warn(
        { socketId: client.id },
        'WS event rejected — no user on socket',
      );
      throw new WsException('Unauthorized');
    }

    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((r) => user.roles.includes(r));
      if (!hasRole) {
        this.logger.warn(
          { userId: user.id, requiredRoles },
          'WS event rejected — insufficient role',
        );
        throw new WsException('Forbidden');
      }
    }

    return true;
  }
}
